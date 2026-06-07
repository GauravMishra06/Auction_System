import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../auth/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setStatus(res.data.message || 'If the email is registered, reset instructions are sent.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Unable to process request.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={submit} style={styles.card}>
        <h2>Forgot Password</h2>
        <p style={styles.text}>Enter your registered email address.</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send Reset Link</button>
        {status && <p style={styles.status}>{status}</p>}
      </form>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  text: { margin: 0, color: '#666', fontSize: 14 },
  input: { padding: '10px 12px', border: '1px solid #cfcfcf', borderRadius: 6 },
  button: { background: '#114fbf', color: '#fff', border: 0, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontWeight: 700 },
  status: { margin: 0, color: '#333' }
};

export default ForgotPassword;
