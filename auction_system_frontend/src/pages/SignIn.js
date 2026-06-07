import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../auth/auth';

const SignIn = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '', captchaId: '', captchaAnswer: '' });
  const [captchaHint, setCaptchaHint] = useState('');
  const [status, setStatus] = useState('');

  const loadCaptcha = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/captcha`);
      setCaptchaHint(res.data.challengeHint);
      setFormData((prev) => ({ ...prev, captchaId: res.data.challengeId, captchaAnswer: '' }));
    } catch {
      setStatus('Unable to load captcha.');
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, formData);
      saveAuth(res.data);

      if (res.data.role === 'ROLE_ADMIN') navigate('/dashboard/admin');
      else if (res.data.role === 'ROLE_AUCTIONEER') navigate('/dashboard/auctioneer');
      else navigate('/dashboard/bidder');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Sign in failed.');
      await loadCaptcha();
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Secure Sign In</h2>

        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required style={styles.input} />
        <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required style={styles.input} />

        <div style={styles.captchaRow}>
          <div style={styles.captchaDisplay}>{captchaHint || 'Loading...'}</div>
          <button type="button" onClick={loadCaptcha} style={styles.secondaryButton}>🔄 Refresh</button>
        </div>

        <input
          name="captchaAnswer"
          placeholder="Type the characters without spaces"
          value={formData.captchaAnswer}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.primaryButton}>Sign In</button>
        <Link to="/forgot-password" style={styles.link}>Forgot password?</Link>
        {status && <p style={styles.error}>{status}</p>}
      </form>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 12px', border: '1px solid #cfcfcf', borderRadius: 6 },
  captchaRow: { display: 'flex', alignItems: 'center', gap: 12 },
  captchaDisplay: { letterSpacing: 6, fontWeight: 700, padding: '10px 16px', border: '2px dashed #4e73df', borderRadius: 6, background: '#f0f4ff', fontSize: '1.2rem', color: '#333', fontFamily: 'monospace', minWidth: 140, textAlign: 'center', userSelect: 'none' },
  primaryButton: { background: '#114fbf', color: '#fff', border: 0, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontWeight: 700 },
  secondaryButton: { background: '#eef2ff', border: '1px solid #b8c5ff', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', fontWeight: 600 },
  link: { color: '#114fbf', textDecoration: 'none', fontSize: 14 },
  error: { color: '#a30000', margin: 0 }
};

export default SignIn;
