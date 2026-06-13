import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { getAuthorizedHeaders } = useAuth();
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  const loadAuctions = useCallback(async () => {
    try {
      setError('');
      const res = await axios.get(`${API_BASE_URL}/api/auctions/active`);
      setActiveAuctions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch active auctions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleModerateCancel = async (auctionId) => {
    if (!window.confirm(`ADMIN WARN: Are you sure you want to force-cancel Auction #${auctionId}? This will terminate the auction immediately.`)) {
      return;
    }
    setActionStatus('');
    try {
      const headers = await getAuthorizedHeaders();
      await axios.patch(`${API_BASE_URL}/api/auctions/${auctionId}/cancel`, {}, { headers });
      setActionStatus(`Auction #${auctionId} was force-cancelled by admin.`);
      loadAuctions();
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to cancel the auction.');
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

  const totalValue = activeAuctions.reduce((sum, a) => sum + a.currentHighestBid, 0);
  const avgBid = activeAuctions.length > 0 ? totalValue / activeAuctions.length : 0;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">System Control & Moderation</h2>
          <p className="page-subtitle">Supervise active auctions, enforce compliance, and manage listings.</p>
        </div>
        <span className="badge badge-cancelled" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          Platform Admin Mode
        </span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionStatus && <div className="alert alert-warning">{actionStatus}</div>}

      <div className="stats-grid">
        <div className="stat-card stagger-item">
          <span className="stat-label">Active Platform Listings</span>
          <span className="stat-value">{activeAuctions.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Bid Volume</span>
          <span className="stat-value">${totalValue.toFixed(2)}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Average Bid Value</span>
          <span className="stat-value">${avgBid.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 className="section-title">Active Listing Moderation Control</h3>
        {activeAuctions.length === 0 ? (
          <div className="empty-state">
            <p>No active auctions currently running on the platform.</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Seller Username</th>
                  <th>Current Price</th>
                  <th>Closes At</th>
                  <th>Actions</th>
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
                        <button onClick={() => handleModerateCancel(item.auctionId)} className="btn btn-danger btn-sm">
                          Force Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
