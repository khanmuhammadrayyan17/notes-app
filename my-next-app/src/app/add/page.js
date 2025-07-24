'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './add.module.css';
import App from '../../components/sidebar.js';

export default function AddNote() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [access, setAccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
          credentials: 'include',
        });
        console.log('sent');
        if (response.status === 401) {
          router.push('/login');
        } else {
          console.log('enter');
          setAccess(true); // <-- Add this line
        }
      } catch (error) {
        // Optionally handle network errors
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addnote`, {
        method: 'POST',
        credentials: 'include', // <--- this is required
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        router.push('/');
      } else {
        setMessage(<p style={{ color: 'red', margin: '0' }}>{data.message || 'Failed to create note'}</p>);
      }
    } catch (error) {
      setMessage(<p style={{ color: 'red', margin: '0' }}>Network error. Please try again.</p>);
    } finally {
      setIsLoading(false);
    }
  };

  if (!access) {
    return (
      <div className={styles.loading_screen}>
        <FontAwesomeIcon className={styles.spinner} icon={faSpinner} />
        <p>Authenticating your session...</p>
      </div>
    );
  }

  else
  {
    return (
      <div className={styles.container}>
        <App />
        <div className={styles.mainContent}>
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <Link href="/" className={styles.backButton}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Notes
              </Link>
              <h1 className={styles.title}>Add New Note</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Title</label>
                <input
                  id="title"
                  type="text"
                  className={styles.input}
                  placeholder="Enter note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="content" className={styles.label}>Content</label>
                <textarea
                  id="content"
                  className={styles.textarea}
                  placeholder="Enter note content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Save Note
                    </>
                  )}
                </button>

                <Link href="/" className={styles.cancelButton}>
                  Cancel
                </Link>
              </div>

              {message}
            </form>
          </div>
        </div>
      </div>
    );
  }
}
