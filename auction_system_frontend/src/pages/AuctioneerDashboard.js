import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';
import { Link } from 'react-router-dom';

const AuctioneerDashboard = () => {
  const { auth, getAuthorizedHeaders } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  const loadListings = useCallback(async () => {
    try {
      setError('');
      const headers = await getAuthorizedHeaders();
      const res = await axios.get(`${API_BASE_URL}/api/auctions/seller/${auth.username}`, { headers });
      setListings(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your listings. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [auth?.username, getAuthorizedHeaders]);

  useEffect(() => {
    if (auth?.token) {
      loadListings();
    }
  }, [auth, loadListings]);

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to cancel this auction listing? This action is irreversible.')) {
      return;
    }
    setActionStatus('');
    try {
      const headers = await getAuthorizedHeaders();
      await axios.patch(`${API_BASE_URL}/api/auctions/${auctionId}/cancel`, {}, { headers });
      setActionStatus(`Auction #${auctionId} successfully cancelled.`);
      loadListings();
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to cancel the auction.');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Retrieving your listings...</p>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const completedListings = listings.filter(l => l.status === 'COMPLETED');
  const totalRevenue = completedListings.reduce((sum, l) => sum + l.currentHighestBid, 0);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Auctioneer Portal</h2>
          <p className="page-subtitle">Create, manage, and monitor your listed asset sales.</p>
        </div>
        <Link to="/create-auction" className="btn btn-success">Create New Listing</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionStatus && <div className="alert alert-info">{actionStatus}</div>}

      <div className="stats-grid">
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Listings</span>
          <span className="stat-value">{listings.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Active Auctions</span>
          <span className="stat-value">{activeListings.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 className="section-title">Your Published Listings</h3>
        {listings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't listed any items yet. Click the button above to publish your first asset!</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Start Price</th>
                  <th>Current Bid</th>
                  <th>Closes At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => (
                  <tr key={item.auctionId}>
                    <td>#{item.auctionId}</td>
                    <td style={{ fontWeight: 'bold' }}>{item.itemName}</td>
                    <td>${item.startPrice.toFixed(2)}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>${item.currentHighestBid.toFixed(2)}</td>
                    <td>{new Date(item.endTime).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${item.status === 'ACTIVE' ? 'badge-active' : item.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-completed'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/auctions/${item.auctionId}`} className="btn btn-primary btn-sm">View</Link>
                        {item.status === 'ACTIVE' && (
                          <button onClick={() => handleCancelAuction(item.auctionId)} className="btn btn-danger btn-sm">
                            Cancel
                          </button>
                        )}
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

export default AuctioneerDashboard;
