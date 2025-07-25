const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const session = require('cookie-session');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './variables.env' });

// In-memory session store (for production, use Redis or a database)
const sessionStore = {};
const passwordResetTokens = {}; // { email: { token, expiry } }

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.18.7:3000',
    'https://notes-app-1-c8z1.onrender.com'
  ], // Allow both local development, mobile access, and production
  credentials: true
}));
app.use(cookieParser());
app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET], // <-- use env variable
  maxAge: 24 * 60 * 60 * 1000
}));

// Authorization middleware
function requireAuth(req, res, next) {
  const sessionId = req.cookies.sessionId;
  if (sessionId && sessionStore[sessionId]) {
    req.userEmail = sessionStore[sessionId];
    console.log('enter');
    next();
  } else {
    res.status(401).json({ message: 'Not Authorized' });
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Check PostgreSQL connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database successfully.');
    release();
  }
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const row = await pool.query(
      'INSERT INTO USERS (EMAIL, PASSWORD, NAME) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, name]
    );
    console.log(row.rows[0]);
    res.status(201).json({ user: row.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email
    const response = await pool.query('SELECT * FROM USERS WHERE EMAIL = $1', [email]);
    if (response.rows.length === 0) {
      return res.status(404).json('Incorrect Email or Password');
    }
    const user = response.rows[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json('Incorrect Email or Password');
    }

    // 3. Success - Set session cookie
    const sessionId = generateSessionId();
    sessionStore[sessionId] = user.email;
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({ message: 'login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/', requireAuth, async(req,res)=>{
  const email = req.userEmail;
  const response = await pool.query('SELECT * FROM NOTES WHERE USER_EMAIL = ($1) ORDER BY id',[email]);
  console.log(response.rows);
  res.status(200).json({'Notes':response.rows});
})

app.delete('/', requireAuth, async(req,res)=>{
  console.log('DELETE / route hit', req.body, req.cookies);
  const email = req.userEmail;
  const id = req.body.id;
  console.log('Deleting note for:', email, id);
  const response = await pool.query('DELETE FROM NOTES WHERE USER_EMAIL = ($1) AND ID = ($2) RETURNING *', [email, id]);
  console.log('Deleted rows:', response.rows);
  if (response.rows.length > 0) {
    res.status(200).json({'Notes':response.rows});
  } else {
    res.status(404).json({ error: 'Note not found or not deleted' });
  }
})

app.patch('/', requireAuth, async(req,res)=>{
  console.log('enter');
  const email = req.userEmail;
  const id = req.body.id;
  const title = req.body.title;
  const content = req.body.content;
  const color = req.body.color;
  console.log(color);
  try {
    const response = await pool.query(
      'UPDATE NOTES SET TITLE = $1, CONTENT = $2, COLOR = $3 WHERE USER_EMAIL = $4 AND ID = $5 RETURNING *',
      [title, content, color, email, id]
    );
    console.log('Updated rows:', response.rows);
    if (response.rows.length > 0) {
      res.status(200).json({'Notes':response.rows});
    } else {
      res.status(404).json({ error: 'Note not found or not updated' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
})

app.get('/auth', requireAuth, (req, res) => {
  console.log('enter');
  res.status(200).json({ message: "Authorized" });
})

app.post('/addnote', requireAuth, async(req,res)=>{
  const email = req.userEmail;
  const response = await pool.query('INSERT INTO NOTES (USER_EMAIL,TITLE, CONTENT) VALUES ($1,$2,$3) RETURNING *',[email,req.body.title,req.body.content]);
  res.status(201).json({'Inserted':response});
})

app.get('/logout', async(req,res)=>{
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    delete sessionStore[sessionId];
  }
  res.clearCookie('sessionId', { 
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.status(200).json({ message: 'Logged out successfully' });
})

app.post('/forgot-password', async (req, res) => {
  const email = req.body.email;
  // 1. Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 3600000; // 1 hour from now

  // 2. Store token and expiry in local object
  passwordResetTokens[email] = { token, expiry };

  // 3. Send email with reset link
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const resetUrl = `https://notes-app-1-c8z1.onrender.com/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const mailOptions = {
    from: 'khanrayyan.chakra@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click this link to reset your password: ${resetUrl}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    res.status(200).json({ message: 'Password reset email sent' });
  });
});

app.post('/reset-password', async (req, res) => {
  const email = req.body.email;
  const tokenn = req.body.token;
  const password = req.body.password;
  const record = passwordResetTokens[email];
  if (!record) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  const { token, expiry } = record;
  if (tokenn !== token) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  if (Date.now() > expiry) {
    delete passwordResetTokens[email];
    return res.status(400).json({ message: 'Token expired' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE USERS SET PASSWORD = $1 WHERE EMAIL = $2 RETURNING *',
      [hashedPassword, email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    delete passwordResetTokens[email];
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is also accessible on your network at http://192.168.18.7:${PORT}`);
});
