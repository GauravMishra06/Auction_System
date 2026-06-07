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
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p>Retrieving platform data...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalValue = activeAuctions.reduce((sum, a) => sum + a.currentHighestBid, 0);
  const avgBid = activeAuctions.length > 0 ? totalValue / activeAuctions.length : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>System Control & Moderation</h2>
          <p style={styles.subtitle}>Supervise active auctions, enforce compliance, and manage listings.</p>
        </div>
        <span style={styles.adminBadge}>👑 Platform Admin Mode</span>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {actionStatus && <div style={styles.actionAlert}>{actionStatus}</div>}

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #dc2626' }}>
          <span style={styles.statLabel}>Active Platform Listings</span>
          <span style={styles.statValue}>{activeAuctions.length}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #d97706' }}>
          <span style={styles.statLabel}>Total Bid Volume</span>
          <span style={styles.statValue}>${totalValue.toFixed(2)}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '5px solid #2563eb' }}>
          <span style={styles.statLabel}>Average Bid Value</span>
          <span style={styles.statValue}>${avgBid.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.dashboardSection}>
        <h3 style={styles.sectionTitle}>🛡️ Active Listing Moderation Control</h3>
        {activeAuctions.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>No active auctions currently running on the platform.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Item Name</th>
                  <th style={styles.th}>Seller Username</th>
                  <th style={styles.th}>Current Price</th>
                  <th style={styles.th}>Closes At</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAuctions.map((item) => (
                  <tr key={item.auctionId} style={styles.tr}>
                    <td style={styles.td}>#{item.auctionId}</td>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{item.itemName}</td>
                    <td style={styles.td}>{item.sellerUsername}</td>
                    <td style={{ ...styles.td, color: '#2563eb', fontWeight: 'bold' }}>${item.currentHighestBid.toFixed(2)}</td>
                    <td style={styles.td}>{new Date(item.endTime).toLocaleString()}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/auctions/${item.auctionId}`} style={styles.viewLink}>
                          View
                        </Link>
                        <button
                          onClick={() => handleModerateCancel(item.auctionId)}
                          style={styles.cancelButton}
                        >
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

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Outfit", sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '1.8rem', color: '#1e293b', fontWeight: '800' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem' },
  adminBadge: { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #fca5a5' },
  loadingWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorAlert: { padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' },
  actionAlert: { padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' },
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
  viewLink: { display: 'inline-block', padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  cancelButton: { padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }
};

export default AdminDashboard;
