'use client'
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { MdEmail, MdLock } from 'react-icons/md';
import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [display, setdisplay] = useState('flex');
  const [message, setmessage] = useState('');

  const handleSubmit = async (e) => {
    setdisplay('none');
    e.preventDefault();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      credentials: 'include', // <--- this is required
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      router.push('/')
    }
    if(response.status === 404)
    {
      console.log(data);
      setmessage(<p style={{color:'red', margin:'0'}}>{data}</p>);
      setdisplay('flex');
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.form}>
          <form className={styles.formContent} style={{ display: display }} onSubmit={handleSubmit}>
            <h2 className={styles.loginHeading}>Login</h2>
            <div className={styles.inputWrapper}>
              <MdEmail className={styles.inputIcon} />
              <input
                className={styles.input}
                placeholder='Email'
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.inputWrapper}>
              <MdLock className={styles.inputIcon} />
              <input
                className={styles.input}
                type="password"
                placeholder='Password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type='submit'>Submit</button>
            <p className={styles.signupText}>
              Don't have an account? <Link href="/signup" className={styles.signupLink}>Sign up</Link>
            </p>
            <Link href="/forgot-password" className={styles.signupLink}>Forgot Password?</Link>
            {message}
          </form>
          <FontAwesomeIcon className={styles.loading} style={{ display: display === 'flex' ? 'none' : 'flex' }} icon={faSpinner} />
        </div>
      </div>
    </div>
  );
}   