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
      loadListings(); // reload listings to update status
    } catch (err) {
      console.error(err);
      setActionStatus(err.response?.data?.message || 'Failed to cancel the auction.');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p>Retrieving your listings...</p>
      </div>
    );
  }

  // Calculate statistics
  const activeListings = listings.filter(l => l.status === 'ACTIVE');
  const completedListings = listings.filter(l => l.status === 'COMPLETED');
  const totalRevenue = completedListings.reduce((sum, l) => sum + l.currentHighestBid, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Auctioneer Portal</h2>
          <p style={styles.subtitle}>Create, manage, and monitor your listed asset sales.</p>
        </div>
        <Link to="/create-auction" style={styles.createButton}>➕ Create New Listing</Link>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {actionStatus && <div style={styles.actionAlert}>{actionStatus}</div>}

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #3b82f6' }}>
          <span style={styles.statLabel}>Total Listings</span>
          <span style={styles.statValue}>{listings.length}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #10b981' }}>
          <span style={styles.statLabel}>Active Auctions</span>
          <span style={styles.statValue}>{activeListings.length}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #8b5cf6' }}>
          <span style={styles.statLabel}>Total Revenue</span>
          <span style={styles.statValue}>${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.dashboardSection}>
        <h3 style={styles.sectionTitle}>📋 Your Published Listings</h3>
        {listings.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>You haven't listed any items yet. Click the button above to publish your first asset!</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Start Price</th>
                  <th style={styles.th}>Current Bid</th>
                  <th style={styles.th}>Closes At</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((item) => (
                  <tr key={item.auctionId} style={styles.tr}>
                    <td style={styles.td}>#{item.auctionId}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{item.itemName}</td>
                    <td style={styles.td}>${item.startPrice.toFixed(2)}</td>
                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>${item.currentHighestBid.toFixed(2)}</td>
                    <td style={styles.td}>{new Date(item.endTime).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: item.status === 'ACTIVE' ? '#d1fae5' : item.status === 'CANCELLED' ? '#fee2fee' : '#f1f5f9',
                        color: item.status === 'ACTIVE' ? '#065f46' : item.status === 'CANCELLED' ? '#991b1b' : '#334155'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/auctions/${item.auctionId}`} style={styles.actionLink}>
                          View
                        </Link>
                        {item.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleCancelAuction(item.auctionId)}
                            style={styles.cancelButton}
                          >
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

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Outfit", sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '1.8rem', color: '#1e293b', fontWeight: '800' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem' },
  createButton: { padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', border: 'none', cursor: 'pointer' },
  loadingWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorAlert: { padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' },
  actionAlert: { padding: '15px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' },
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
  actionLink: { display: 'inline-block', padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  cancelButton: { padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' }
};

export default AuctioneerDashboard;
