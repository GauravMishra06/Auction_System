import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';

const UserProfile = () => {
  const { auth, getAuthorizedHeaders } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const headers = await getAuthorizedHeaders();
        const res = await axios.get(`${API_BASE_URL}/api/users/${auth.userId}`, { headers });
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile.');
      }
    };

    if (auth?.userId) {
      loadProfile();
    }
  }, [auth?.userId, getAuthorizedHeaders]);

  return (
    <div className="page-container fade-in">
      <div className="breadcrumb">Home / Profile</div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 className="section-title" style={{ borderBottom: '1px solid var(--color-gray-lightest)', paddingBottom: '10px' }}>
          My Profile
        </h3>
        <p className="page-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
          Review your access role and account details.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {profile && (
          <>
            <div className="profile-avatar">
              {profile.username?.charAt(0).toUpperCase()}
            </div>

            <div className="stats-grid">
              <div className="stat-card stagger-item">
                <span className="stat-label">User ID</span>
                <span className="stat-value">{profile.id}</span>
              </div>
              <div className="stat-card stagger-item">
                <span className="stat-label">Username</span>
                <span className="stat-value" style={{ fontSize: '1.3rem' }}>{profile.username}</span>
              </div>
              <div className="stat-card stagger-item">
                <span className="stat-label">Email</span>
                <span className="stat-value" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>{profile.email}</span>
              </div>
              <div className="stat-card stagger-item">
                <span className="stat-label">System Role</span>
                <span className="stat-value" style={{ fontSize: '1.1rem' }}>
                  <span className={`badge ${profile.role === 'ROLE_ADMIN' ? 'badge-cancelled' : profile.role === 'ROLE_AUCTIONEER' ? 'badge-completed' : 'badge-active'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    {profile.role?.replace('ROLE_', '')}
                  </span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
