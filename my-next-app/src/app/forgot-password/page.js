"use client";
import React, { useState } from "react";
import styles from "../login/login.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // For now, just show an alert. Replace with actual logic later.
    alert(`Password reset link sent to: ${email}`);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`,{
        method : 'POST',
        headers : {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            email : email
        })
    });
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
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.loginHeading}>Forgot Password</h2>
          <div className={styles.formContent}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 01-8 0m8 0V8a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0m8 0v4a4 4 0 01-8 0v-4" /></svg>
              </span>
              <input
                type="email"
                className={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>
              Send Reset Link
            </button>
            {submitted && (
              <p style={{ color: "#192a56", marginTop: 10 }}>
                If this email is registered, a reset link will be sent.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
