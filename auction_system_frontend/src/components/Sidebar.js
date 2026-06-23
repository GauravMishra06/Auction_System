import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';

/* Inline SVG icons — elegant line-art, no dependency needed */
const icons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  gavel: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 3.5l6 6M4 20l4-4" />
      <rect x="8.5" y="5.5" width="7" height="7" rx="1" transform="rotate(45 12 9)" />
      <path d="M2 22h8" />
    </svg>
  ),
  plusCircle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  store: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9h18v12H3V9z" />
      <path d="M9 21V14h6v7" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 10-16 0" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const Sidebar = ({ isOpen, onClose }) => {
  const { auth, logoutSession } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutSession();
    if (onClose) onClose();
    navigate('/');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  if (!auth?.token) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-menu">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick} end>
            <span className="nav-icon">{icons.home}</span> Home
          </NavLink>
          <NavLink to="/auctions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
            <span className="nav-icon">{icons.gavel}</span> Active Auctions
          </NavLink>

          {(auth.role === 'ROLE_AUCTIONEER' || auth.role === 'ROLE_ADMIN') && (
            <NavLink to="/create-auction" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon">{icons.plusCircle}</span> Create Auction
            </NavLink>
          )}

          {auth.role === 'ROLE_BIDDER' && (
            <NavLink to="/dashboard/bidder" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon">{icons.chart}</span> Bidder Dashboard
            </NavLink>
          )}

          {auth.role === 'ROLE_AUCTIONEER' && (
            <NavLink to="/dashboard/auctioneer" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon">{icons.store}</span> Seller Dashboard
            </NavLink>
          )}

          {auth.role === 'ROLE_ADMIN' && (
            <NavLink to="/dashboard/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon">{icons.shield}</span> Admin Panel
            </NavLink>
          )}

          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
            <span className="nav-icon">{icons.user}</span> My Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn" style={{ justifyContent: 'center' }}>
            <span className="nav-icon">{icons.logout}</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
