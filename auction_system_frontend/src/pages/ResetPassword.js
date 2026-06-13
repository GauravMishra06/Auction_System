import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../auth/auth';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const initialToken = useMemo(() => params.get('token') || '', [params]);

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState({ success: false, message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, newPassword });
      setStatus({ success: true, message: res.data.message || 'Password reset successful.' });
      setNewPassword('');
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || 'Unable to reset password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-bg-auth fade-in">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2 className="page-title" style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '8px' }}>Reset Password</h2>
          <p className="page-subtitle" style={{ textAlign: 'center' }}>Enter your reset token and new password</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Reset Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              placeholder="Paste your reset token"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
