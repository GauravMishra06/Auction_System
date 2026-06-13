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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, formData);
      saveAuth(res.data);

      if (res.data.role === 'ROLE_ADMIN') navigate('/dashboard/admin');
      else if (res.data.role === 'ROLE_AUCTIONEER') navigate('/dashboard/auctioneer');
      else navigate('/dashboard/bidder');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Sign in failed.');
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-bg-auth fade-in">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="page-title" style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Sign in to your auction account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="captcha-box">
            <div className="captcha-display">{captchaHint || 'Loading...'}</div>
            <button type="button" onClick={loadCaptcha} className="btn btn-secondary btn-sm" style={{ height: '100%', padding: '12px' }}>Refresh</button>
          </div>

          <div className="form-group">
            <label className="form-label">Captcha Answer</label>
            <input
              name="captchaAnswer"
              placeholder="Type the characters without spaces"
              value={formData.captchaAnswer}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/register">Don't have an account? Register</Link>
          </div>

          {status && (
            <div className={`alert ${status.includes('failed') || status.includes('Unable') ? 'alert-danger' : 'alert-success'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignIn;
