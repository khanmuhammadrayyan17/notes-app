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
  const [loading, setLoading] = useState(false);
  const [message, setmessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.brandingOverlay}>
          <div className={styles.brandingContent}>
            <h1 className={styles.appName}>NotesKeeper</h1>
            <p className={styles.tagline}>Organize your thoughts</p>
          </div>
        </div>
        <div className={styles.form}>
          <form className={styles.formContent} onSubmit={handleSubmit}>
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button type='submit' disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} className={styles.loading} /> : 'Submit'}
            </button>
            <p className={styles.signupText}>
              Don&apos;t have an account? <Link href="/signup" className={styles.signupLink}>Sign up</Link>
            </p>
            <Link href="/forgot-password" className={styles.signupLink}>Forgot Password?</Link>
            {message}
          </form>
        </div>
      </div>
    </div>
  );
}   