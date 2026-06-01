import React from 'react';

const UserProfile = () => {
  return (
    <div style={styles.workspaceContainer}>
      <div style={styles.breadcrumbBar}>Home / Operational Dashboard</div>
      
      <div style={styles.formCardWrapper}>
        <h3 style={styles.cardHeaderTitle}>Active Profile Parameters</h3>
        <p style={styles.instructionText}>Review your current security clearances and active bidding statistics below.</p>
        
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>System Role</span>
            <span style={styles.statValue}>ROLE_BIDDER</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Active Bids</span>
            <span style={styles.statValue}>0</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Assets Won</span>
            <span style={styles.statValue}>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  workspaceContainer: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  breadcrumbBar: { backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e3e6f0', fontSize: '0.9rem', color: '#4e73df', fontWeight: '500' },
  formCardWrapper: { backgroundColor: '#ffffff', border: '1px solid #e3e6f0', borderRadius: '6px', padding: '30px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 120, 0.05)' },
  cardHeaderTitle: { margin: '0 0 10px 0', borderBottom: '1px solid #e3e6f0', paddingBottom: '10px', color: '#4e73df', fontSize: '1.25rem', fontWeight: '700' },
  instructionText: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.5' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' },
  statBox: { padding: '20px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #4e73df', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 0.1rem 0.5rem 0 rgba(58, 59, 120, 0.05)' },
  statLabel: { fontSize: '0.8rem', fontWeight: '700', color: '#4e73df', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { fontSize: '1.5rem', fontWeight: 'bold', color: '#5a5c69' }
};

export default UserProfile;