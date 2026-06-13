import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../auth/auth';

const Register = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ROLE_BIDDER',
    captchaId: '',
    captchaAnswer: ''
  });
  const [captchaHint, setCaptchaHint] = useState('');
  const [status, setStatus] = useState({ success: false, message: '' });

  const loadCaptcha = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/captcha`);
      setCaptchaHint(res.data.challengeHint);
      setFormData((prev) => ({ ...prev, captchaId: res.data.challengeId, captchaAnswer: '' }));
    } catch {
      setStatus({ success: false, message: 'Unable to load captcha.' });
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeRegistration = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      saveAuth(res.data);
      setStatus({ success: true, message: 'Registration complete. Redirecting...' });

      if (res.data.role === 'ROLE_ADMIN') navigate('/dashboard/admin');
      else if (res.data.role === 'ROLE_AUCTIONEER') navigate('/dashboard/auctioneer');
      else navigate('/dashboard/bidder');
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || 'Registration failed.' });
      await loadCaptcha();
    }
  };

  return (
    <div className="auth-page page-bg-auth fade-in">
      <div className="glass-card auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <h2 className="page-title" style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '8px' }}>Create Account</h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Join the auction platform to start bidding or selling</p>
        </div>

        <form onSubmit={executeRegistration} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} required placeholder="Choose a username" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="your@email.com" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="At least 8 characters" minLength={8} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
              <option value="ROLE_BIDDER">Bidder - Browse and bid on items</option>
              <option value="ROLE_AUCTIONEER">Auctioneer - Create and manage auctions</option>
            </select>
          </div>

          <div className="captcha-box">
            <div className="captcha-display">{captchaHint || 'Loading...'}</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadCaptcha} style={{ height: '100%', padding: '12px' }}>Refresh</button>
          </div>

          <div className="form-group">
            <label className="form-label">Captcha Answer</label>
            <input type="text" name="captchaAnswer" value={formData.captchaAnswer} onChange={handleInputChange} required placeholder="Type the characters without spaces" className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}>
            Create Account
          </button>

          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <Link to="/signin">Already have an account? Sign In</Link>
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

export default Register;
