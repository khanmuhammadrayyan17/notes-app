"use client"
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import { MdEmail, MdLock, MdPerson, MdPhone } from 'react-icons/md';
import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


export default function Signup() {
  const router = useRouter();
  const [form, setform] = useState({ name: '', email: '', pass: '', confirmpass: '' });
  const [same, setsame] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.pass !== form.confirmpass) {
      setsame(<p style={{ color: 'red', margin: '0' }}>Both passwords should be same to sign up</p>);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.pass
        })
      });
      if(response.ok)
      {
        router.push('/login');
      } else {
        setLoading(false);
      }
    } catch {
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
            <h2 className={styles.signupHeading}>Sign Up</h2>
            <div className={styles.inputWrapper}>
              <MdPerson className={styles.inputIcon} />
              <input className={styles.input} placeholder='Full Name' required value={form.name} onChange={e => (setform(curr => ({ ...curr, name: e.target.value })))} disabled={loading} />
            </div>
            <div className={styles.inputWrapper}>
              <MdEmail className={styles.inputIcon} />
              <input className={styles.input} placeholder='Email' required value={form.email} onChange={e => setform(curr => ({ ...curr, email: e.target.value }))} disabled={loading} />
            </div>
            <div className={styles.inputWrapper}>
              <MdLock className={styles.inputIcon} />
              <input className={styles.input} type="password" placeholder='Password' required value={form.pass} onChange={e => {
                setform(curr => ({ ...curr, pass: e.target.value }));
                setsame(e.target.value === form.confirmpass ? '' : <p style={{ color: 'red', margin: '0' }}>Both passwords should be same</p>);
              }} disabled={loading} />
            </div>
            <div className={styles.inputWrapper}>
              <MdLock className={styles.inputIcon} />
              <input className={styles.input} type="password" placeholder='Confirm Password' required value={form.confirmpass} onChange={(e) => {
                setform(curr => ({ ...curr, confirmpass: e.target.value }));
                setsame(form.pass === e.target.value ? '' : <p style={{ color: 'red', margin: '0' }}>Both passwords should be same</p>);
              }} disabled={loading} />
            </div>
            {same}
            <button type='submit' disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} className={styles.loading} /> : 'Create Account'}
            </button>
          </form>
          <p className={styles.loginText}>
            Already have an account? <Link href="/login" className={styles.loginLink}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 