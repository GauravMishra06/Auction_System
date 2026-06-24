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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingAddress: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const handleOpenCheckout = (order) => {
    setSelectedOrder(order);
    setPaymentForm({ cardNumber: '', expiry: '', cvv: '', billingAddress: '' });
    setPaymentError('');
    setPaymentSuccessMsg('');
    setShowModal(true);
  };

  const handleCloseCheckout = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({ ...paymentForm, [name]: value });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError('');

    try {
      const headers = await getAuthorizedHeaders();
      await axios.post(`${API_BASE_URL}/api/orders/${selectedOrder.orderId}/pay`, {}, { headers });
      setWonOrders(prev => prev.map(o => o.orderId === selectedOrder.orderId ? { ...o, paymentStatus: 'PAID' } : o));
      setPaymentSuccessMsg('Payment processed successfully! Your receipt has been generated.');
      setTimeout(() => {
        handleCloseCheckout();
      }, 2000);
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || 'Failed to process payment. Please verify card details.');
    } finally {
      setSubmittingPayment(false);
    }
  };

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
                  <th>Action</th>
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
                    <td>
                      {order.paymentStatus === 'PENDING' ? (
                        <button 
                          onClick={() => handleOpenCheckout(order)} 
                          className="btn btn-primary btn-sm"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ color: 'var(--color-success)', fontWeight: '600', fontSize: '0.85rem' }}>✓ Paid</span>
                      )}
                    </td>
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
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="glass-card modal-card" style={{
            width: '95%',
            maxWidth: '500px',
            position: 'relative',
            color: 'var(--color-white)'
          }}>
            <button 
              onClick={handleCloseCheckout} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--color-gray-light)',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-white)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-gray-light)'}
            >
              &times;
            </button>
            <h3 className="section-title" style={{ borderBottom: '1px solid var(--color-gray-lighter)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Secure Checkout
            </h3>
            
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              backgroundColor: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--color-primary)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>Item:</span>
                <span>{selectedOrder.itemName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: '600' }}>Lot ID:</span>
                <span>#{selectedOrder.auctionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                <span>Amount Due:</span>
                <span>${selectedOrder.finalPrice.toFixed(2)}</span>
              </div>
            </div>

            {paymentSuccessMsg ? (
              <div className="alert alert-success" style={{ margin: '20px 0' }}>
                {paymentSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handleFormChange}
                    placeholder="1234 5678 1234 5678"
                    pattern="[0-9]{13,19}"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={paymentForm.expiry}
                      onChange={handleFormChange}
                      placeholder="MM/YY"
                      pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={handleFormChange}
                      placeholder="•••"
                      pattern="[0-9]{3,4}"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={paymentForm.billingAddress}
                    onChange={handleFormChange}
                    placeholder="e.g. 123 Luxury Lane, NY"
                    required
                    className="form-input"
                  />
                </div>

                {paymentError && <div className="alert alert-danger" style={{ margin: '8px 0 0 0' }}>{paymentError}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={handleCloseCheckout} className="btn btn-secondary" disabled={submittingPayment}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingPayment}>
                    {submittingPayment ? 'Processing...' : `Pay $${selectedOrder.finalPrice.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BidderDashboard;
