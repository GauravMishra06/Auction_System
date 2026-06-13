import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../auth/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: false, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setStatus({ success: true, message: res.data.message || 'If that email exists, a reset link has been sent.' });
      setEmail('');
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || 'Unable to process request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-bg-auth fade-in">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="page-title" style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '8px' }}>Forgot Password</h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <Link to="/signin">← Back to Sign In</Link>
          </div>

          {status.message && (
            <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
