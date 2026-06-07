import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../auth/auth';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const initialToken = useMemo(() => params.get('token') || '', [params]);

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, newPassword });
      setStatus(res.data.message || 'Password reset successful.');
      setNewPassword('');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Unable to reset password.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={submit} style={styles.card}>
        <h2>Reset Password</h2>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Reset token"
          style={styles.input}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          placeholder="New password"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Reset Password</button>
        {status && <p style={styles.status}>{status}</p>}
      </form>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 12px', border: '1px solid #cfcfcf', borderRadius: 6 },
  button: { background: '#114fbf', color: '#fff', border: 0, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontWeight: 700 },
  status: { margin: 0, color: '#333' }
};

export default ResetPassword;
