"use client";
import { useState } from "react";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // You may want to get a token from the URL (e.g., /reset-password?token=...)
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const email = params.get("email"); // Extract email from URL
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }), // Include email in request
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password reset successful! You can now log in.");
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.container}>
        <div className={styles.brandingOverlay}>
          <div className={styles.brandingContent}>
            <h1 className={styles.appName}>NotesKeeper</h1>
            <p className={styles.tagline}>Organize your thoughts</p>
          </div>
        </div>
        <div className={styles.formContainer}>
        <h2 className={styles.title}>Reset Password</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>New Password:</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
          {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
