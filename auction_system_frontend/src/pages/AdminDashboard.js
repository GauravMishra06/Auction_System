import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { getAuthorizedHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past', 'users'
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [pastAuctions, setPastAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'ROLE_BIDDER' });

  const loadData = useCallback(async () => {
    try {
      setError('');
      const headers = await getAuthorizedHeaders();
      
      const [activeRes, pastRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/auctions/active`),
        axios.get(`${API_BASE_URL}/api/auctions/completed`),
        axios.get(`${API_BASE_URL}/api/users`, { headers })
      ]);
      
      setActiveAuctions(activeRes.data);
      setPastAuctions(pastRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [getAuthorizedHeaders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleModerateCancel = async (auctionId) => {
    if (!window.confirm(`ADMIN WARN: Are you sure you want to force-cancel Auction #${auctionId}? This will terminate the auction immediately.`)) {
      return;
    }
    setActionStatus('');
    try {
      const headers = await getAuthorizedHeaders();
      await axios.patch(`${API_BASE_URL}/api/auctions/${auctionId}/cancel`, {}, { headers });
      setActionStatus(`Auction #${auctionId} was force-cancelled by admin.`);
      loadData();
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to cancel the auction.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${username}?`)) {
      return;
    }
    setActionStatus('');
    try {
      const headers = await getAuthorizedHeaders();
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, { headers });
      setActionStatus(`User ${username} was successfully deleted.`);
      loadData();
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to delete the user.');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setActionStatus('');
    try {
      const headers = await getAuthorizedHeaders();
      await axios.post(`${API_BASE_URL}/api/users/register`, newUser, { headers });
      setActionStatus(`User ${newUser.username} was successfully added.`);
      setNewUser({ username: '', email: '', password: '', role: 'ROLE_BIDDER' });
      loadData();
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to add the user.');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Retrieving platform data...</p>
      </div>
    );
  }


  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">System Control & Moderation</h2>
          <p className="page-subtitle">Supervise auctions, enforce compliance, and manage users.</p>
        </div>
        <span className="badge badge-cancelled" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          Platform Admin Mode
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionStatus && <div className="alert alert-warning">{actionStatus}</div>}

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stagger-item">
          <span className="stat-label">Active Listings</span>
          <span className="stat-value">{activeAuctions.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Completed Auctions</span>
          <span className="stat-value">{pastAuctions.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Platform Users</span>
          <span className="stat-value">{users.length}</span>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Auctions
        </button>
        <button 
          className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('past')}
        >
          Completed Auctions
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="tab-content fade-in">
          <h3 className="section-title">Active Listing Moderation Control</h3>
          {activeAuctions.length === 0 ? (
            <div className="empty-state"><p>No active auctions currently running on the platform.</p></div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Item Name</th><th>Seller</th><th>Current Price</th><th>Closes At</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAuctions.map((item) => (
                    <tr key={item.auctionId}>
                      <td>#{item.auctionId}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.itemName}</td>
                      <td>{item.sellerUsername}</td>
                      <td style={{ color: 'var(--color-info)', fontWeight: 'bold' }}>${item.currentHighestBid.toFixed(2)}</td>
                      <td>{new Date(item.endTime).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/auctions/${item.auctionId}`} className="btn btn-primary btn-sm">View</Link>
                          <button onClick={() => handleModerateCancel(item.auctionId)} className="btn btn-danger btn-sm">Force Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="tab-content fade-in">
          <h3 className="section-title">Completed Auctions Archive</h3>
          {pastAuctions.length === 0 ? (
            <div className="empty-state"><p>No past auctions found.</p></div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Item Name</th><th>Seller</th><th>Winning Bid</th><th>Closed At</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAuctions.map((item) => (
                    <tr key={item.auctionId}>
                      <td>#{item.auctionId}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.itemName}</td>
                      <td>{item.sellerUsername}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>${item.currentHighestBid.toFixed(2)}</td>
                      <td>{new Date(item.endTime).toLocaleString()}</td>
                      <td><span className={`badge badge-${item.status?.toLowerCase() || 'completed'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="tab-content fade-in">
          <h3 className="section-title">Register New User</h3>
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Username</label>
                <input type="text" className="form-input" required value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Password</label>
                <input type="password" className="form-input" required minLength="8" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label className="form-label">Role</label>
                <select className="form-select" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="ROLE_BIDDER">Bidder</option>
                  <option value="ROLE_AUCTIONEER">Auctioneer</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', height: '100%' }}>Add User</button>
            </form>
          </div>

          <h3 className="section-title">Platform Users by Category</h3>
          {['ROLE_ADMIN', 'ROLE_AUCTIONEER', 'ROLE_BIDDER'].map(roleType => {
            const roleUsers = users.filter(u => u.role === roleType);
            if (roleUsers.length === 0) return null;
            return (
              <div key={roleType} style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontSize: '1.2rem' }}>{roleType.replace('ROLE_', '')}S</h4>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th><th>Username</th><th>Email</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleUsers.map((user) => (
                        <tr key={user.id}>
                          <td>#{user.id}</td>
                          <td style={{ fontWeight: 'bold' }}>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            {user.role !== 'ROLE_ADMIN' && (
                              <button onClick={() => handleDeleteUser(user.id, user.username)} className="btn btn-danger btn-sm">Delete User</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
