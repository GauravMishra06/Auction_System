import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    <div style={styles.workspaceContainer}>
      <div style={styles.breadcrumbBar}>Home / Sign Up</div>

      <div style={styles.formCardWrapper}>
        <h3 style={styles.cardHeaderTitle}>Create Account</h3>
        <p style={styles.instructionText}>Create a secure account to access bidder or auctioneer features.</p>

        <form onSubmit={executeRegistration} style={styles.formLayout}>
          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} required style={styles.textInputField} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={styles.textInputField} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required style={styles.textInputField} minLength={8} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Role</label>
            <select name="role" value={formData.role} onChange={handleInputChange} style={styles.selectInputField}>
              <option value="ROLE_BIDDER">Bidder</option>
              <option value="ROLE_AUCTIONEER">Auctioneer</option>
            </select>
          </div>

          <div style={styles.captchaRow}>
            <div style={styles.captchaDisplay}>{captchaHint || 'Loading...'}</div>
            <button type="button" style={styles.refreshButton} onClick={loadCaptcha}>🔄 Refresh</button>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Enter Captcha (type the characters shown above)</label>
            <input type="text" name="captchaAnswer" value={formData.captchaAnswer} onChange={handleInputChange} required style={styles.textInputField} placeholder="Type the characters without spaces" />
          </div>

          <button type="submit" style={styles.submitFormButton}>Create Account</button>
        </form>

        {status.message && (
          <div style={status.success ? styles.successAlertBanner : styles.dangerAlertBanner}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  workspaceContainer: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  breadcrumbBar: { backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e3e6f0', fontSize: '0.9rem', color: '#4e73df', fontWeight: '500' },
  formCardWrapper: { backgroundColor: '#ffffff', border: '1px solid #e3e6f0', borderRadius: '6px', padding: '30px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 120, 0.05)' },
  cardHeaderTitle: { margin: '0 0 10px 0', borderBottom: '1px solid #e3e6f0', paddingBottom: '10px', color: '#4e73df', fontSize: '1.25rem', fontWeight: '700' },
  instructionText: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.5' },
  formLayout: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  inputLabelElement: { fontWeight: '600', marginBottom: '8px', color: '#495057', fontSize: '0.9rem' },
  textInputField: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d1d3e2', fontSize: '0.95rem', outline: 'none' },
  selectInputField: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d1d3e2', fontSize: '0.95rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
  captchaRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  captchaDisplay: { letterSpacing: 6, fontWeight: 700, padding: '10px 16px', border: '2px dashed #4e73df', borderRadius: 6, background: '#f0f4ff', fontSize: '1.2rem', color: '#333', fontFamily: 'monospace', userSelect: 'none' },
  refreshButton: { border: '1px solid #c6d0ff', background: '#edf1ff', borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontWeight: 600 },
  submitFormButton: { padding: '12px 24px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', marginTop: '10px', boxShadow: '0 2px 4px rgba(78,115,223,0.25)' },
  successAlertBanner: { padding: '12px', backgroundColor: '#d4edda', color: '#155724', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #c3e6cb', marginTop: '20px', fontWeight: '500', lineHeight: '1.4' },
  dangerAlertBanner: { padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #f5c6cb', marginTop: '20px', fontWeight: '500' }
};

export default Register;
