import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div style={styles.sidebarWrapper}>
      <div style={styles.sidebarHeader}>Navigation Core</div>
      <div style={styles.linkList}>
        {/* NavLink automatically injects design changes when its path becomes active */}
        <NavLink to="/" style={({ isActive }) => isActive ? styles.activeLinkItem : styles.baseLinkItem}>
          🗂️ Live Auction Gallery
        </NavLink>
        <NavLink to="/create-auction" style={({ isActive }) => isActive ? styles.activeLinkItem : styles.baseLinkItem}>
          ➕ Publish New Listing
        </NavLink>
        <NavLink to="/profile" style={({ isActive }) => isActive ? styles.activeLinkItem : styles.baseLinkItem}>
          👤 User Dashboard Log
        </NavLink>
        <NavLink to="/register" style={({ isActive }) => isActive ? styles.activeLinkItem : styles.baseLinkItem}>
          🔑 Enroll New Participant
        </NavLink>
      </div>
      
      <div style={styles.sidebarFooter}>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Secure Environment</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ffc107' }}>v1.09.12 Active</div>
      </div>
    </div>
  );
};

const styles = {
  sidebarWrapper: { width: '260px', backgroundColor: '#1f242d', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)' },
  sidebarHeader: { padding: '24px 20px', borderBottom: '1px solid #2a313d', color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' },
  linkList: { display: 'flex', flexDirection: 'column', padding: '15px 0', flex: 1 },
  baseLinkItem: { padding: '14px 20px', color: '#a0aec0', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', transition: 'all 0.2s' },
  activeLinkItem: { padding: '14px 20px', color: '#ffffff', backgroundColor: '#3182ce', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', borderLeft: '4px solid #fff' },
  sidebarFooter: { padding: '20px', backgroundColor: '#171a21', borderTop: '1px solid #2a313d', color: '#ffffff' }
};

export default Sidebar;