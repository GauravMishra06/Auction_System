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
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p>Retrieving your bid status...</p>
      </div>
    );
  }

  // Calculate stats
  const uniqueAuctionsBidded = new Set(myBids.map(b => b.auctionId)).size;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Welcome Back, {auth?.username}!</h2>
          <p style={styles.subtitle}>Here is the status of your live bids and won items.</p>
        </div>
        <Link to="/" style={styles.browseButton}>🌐 Browse Live Auctions</Link>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #4f46e5' }}>
          <span style={styles.statLabel}>Total Bids Placed</span>
          <span style={styles.statValue}>{myBids.length}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #06b6d4' }}>
          <span style={styles.statLabel}>Auctions Participated</span>
          <span style={styles.statValue}>{uniqueAuctionsBidded}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #10b981' }}>
          <span style={styles.statLabel}>Won Auctions</span>
          <span style={styles.statValue}>{wonOrders.length}</span>
        </div>
      </div>

      <div style={styles.dashboardSection}>
        <h3 style={styles.sectionTitle}>🏆 Your Won Auctions</h3>
        {wonOrders.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>You haven't won any auctions yet. Keep bidding!</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Winning Bid</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Closed Date</th>
                </tr>
              </thead>
              <tbody>
                {wonOrders.map((order) => (
                  <tr key={order.orderId} style={styles.tr}>
                    <td style={styles.td}>#{order.orderId}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{order.itemName}</td>
                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>${order.finalPrice.toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: order.paymentStatus === 'PAID' ? '#d1fae5' : '#fef3c7',
                        color: order.paymentStatus === 'PAID' ? '#065f46' : '#92400e'
                      }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.dashboardSection}>
        <h3 style={styles.sectionTitle}>⏱️ Active & Past Bids Log</h3>
        {myBids.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>You have not placed any bids yet. Explore the gallery to place your first bid!</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Bid ID</th>
                  <th style={styles.th}>Auction Link</th>
                  <th style={styles.th}>Your Bid Amount</th>
                  <th style={styles.th}>Bid Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {myBids.map((bid) => (
                  <tr key={bid.bidId} style={styles.tr}>
                    <td style={styles.td}>#{bid.bidId}</td>
                    <td style={styles.td}>
                      <Link to={`/auctions/${bid.auctionId}`} style={styles.tableLink}>
                        View Auction #{bid.auctionId} →
                      </Link>
                    </td>
                    <td style={{ ...styles.td, color: '#4f46e5', fontWeight: 'bold' }}>${bid.bidAmount.toFixed(2)}</td>
                    <td style={styles.td}>{new Date(bid.bidTime).toLocaleString()}</td>
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

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Outfit", sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '1.8rem', color: '#1e293b', fontWeight: '800' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem' },
  browseButton: { padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)' },
  loadingWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorAlert: { padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '35px' },
  statCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', gap: '6px' },
  statLabel: { fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1e293b' },
  dashboardSection: { marginBottom: '35px' },
  sectionTitle: { fontSize: '1.25rem', color: '#1e293b', marginBottom: '15px', fontWeight: '700' },
  emptyCard: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', textAlign: 'center', color: '#64748b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  tableWrapper: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '14px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '14px 20px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '0.9rem' },
  tr: { transition: 'background-color 0.2s', '&:hover': { backgroundColor: '#f8fafc' } },
  tableLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: '600' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' }
};

export default BidderDashboard;
