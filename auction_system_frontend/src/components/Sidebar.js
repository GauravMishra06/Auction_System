import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';

const Sidebar = ({ isOpen, onClose }) => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
            <span className="nav-icon icon-placeholder"></span> Home
          </NavLink>
          <NavLink to="/auctions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
            <span className="nav-icon icon-placeholder"></span> Active Auctions
          </NavLink>

          {(auth.role === 'ROLE_AUCTIONEER' || auth.role === 'ROLE_ADMIN') && (
            <NavLink to="/create-auction" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon icon-placeholder"></span> Create Auction
            </NavLink>
          )}

          {auth.role === 'ROLE_BIDDER' && (
            <NavLink to="/dashboard/bidder" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon icon-placeholder"></span> Bidder Dashboard
            </NavLink>
          )}

          {auth.role === 'ROLE_AUCTIONEER' && (
            <NavLink to="/dashboard/auctioneer" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon icon-placeholder"></span> Seller Dashboard
            </NavLink>
          )}

          {auth.role === 'ROLE_ADMIN' && (
            <NavLink to="/dashboard/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
              <span className="nav-icon icon-placeholder"></span> Admin Panel
            </NavLink>
          )}

          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
            <span className="nav-icon icon-placeholder"></span> My Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn" style={{ justifyContent: 'center' }}>
            <span className="nav-icon icon-placeholder"></span> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
