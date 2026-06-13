import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';
import { Link } from 'react-router-dom';

const BidderDashboard = () => {
  const { auth, getAuthorizedHeaders } = useAuth();
  const [myBids, setMyBids] = useState([]);
  const [wonOrders, setWonOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setError('');
      const headers = await getAuthorizedHeaders();
      const [bidsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/bids/my`, { headers }),
        axios.get(`${API_BASE_URL}/api/orders/winner/${auth.username}`, { headers })
      ]);
      setMyBids(bidsRes.data);
      setWonOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [auth?.username, getAuthorizedHeaders]);

  useEffect(() => {
    if (auth?.token) {
      loadDashboardData();
    }
  }, [auth, loadDashboardData]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Retrieving your bid status...</p>
      </div>
    );
  }

  const uniqueAuctionsBidded = new Set(myBids.map(b => b.auctionId)).size;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome Back, {auth?.username}!</h2>
          <p className="page-subtitle">Here is the status of your live bids and won items.</p>
        </div>
        <Link to="/" className="btn btn-primary">Browse Live Auctions</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Bids Placed</span>
          <span className="stat-value">{myBids.length}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Auctions Participated</span>
          <span className="stat-value">{uniqueAuctionsBidded}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Won Auctions</span>
          <span className="stat-value">{wonOrders.length}</span>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 className="section-title">Your Won Auctions</h3>
        {wonOrders.length === 0 ? (
          <div className="empty-state">
            <p>You haven't won any auctions yet. Keep bidding!</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item Name</th>
                  <th>Winning Bid</th>
                  <th>Status</th>
                  <th>Closed Date</th>
                </tr>
              </thead>
              <tbody>
                {wonOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td style={{ fontWeight: 'bold' }}>{order.itemName}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>${order.finalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-pending'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 className="section-title">Active & Past Bids Log</h3>
        {myBids.length === 0 ? (
          <div className="empty-state">
            <p>You have not placed any bids yet. Explore the gallery to place your first bid!</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bid ID</th>
                  <th>Auction Link</th>
                  <th>Your Bid Amount</th>
                  <th>Bid Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {myBids.map((bid) => (
                  <tr key={bid.bidId}>
                    <td>#{bid.bidId}</td>
                    <td>
                      <Link to={`/auctions/${bid.auctionId}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' }}>
                        View Auction #{bid.auctionId} →
                      </Link>
                    </td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>${bid.bidAmount.toFixed(2)}</td>
                    <td>{new Date(bid.bidTime).toLocaleString()}</td>
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

export default BidderDashboard;
