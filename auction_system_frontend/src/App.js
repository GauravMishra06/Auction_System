import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BackgroundManager } from './components/BackgroundManager';
import HomePage from './pages/HomePage';
import ActiveAuctions from './pages/ActiveAuctions';
import AuctionDetails from './pages/AuctionDetails';
import Register from './pages/Register';
import CreateAuction from './pages/CreateAuction';
import UserProfile from './pages/UserProfile';
import Sidebar from './components/Sidebar';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BidderDashboard from './pages/BidderDashboard';
import AuctioneerDashboard from './pages/AuctioneerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './auth/auth';

const PAGE_TITLES = {
  '/': 'eAuction — Premium Electronic Auction Platform',
  '/auctions': 'Active Auctions — eAuction',
  '/signin': 'Sign In — eAuction',
  '/register': 'Create Account — eAuction',
  '/forgot-password': 'Forgot Password — eAuction',
  '/reset-password': 'Reset Password — eAuction',
  '/create-auction': 'Create Auction — eAuction',
  '/profile': 'My Profile — eAuction',
  '/dashboard/bidder': 'Bidder Dashboard — eAuction',
  '/dashboard/auctioneer': 'Auctioneer Portal — eAuction',
  '/dashboard/admin': 'Admin Control Panel — eAuction',
};

function AppContent() {
  const { auth, logoutSession } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = ['/signin', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Dynamic page title for SEO
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'eAuction';
    document.title = title;
  }, [location.pathname]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logoutSession();
    window.location.href = '/signin';
  };

  return (
    <div className="app-root">
      <BackgroundManager />
      
      {/* Top Header */}
      <header className="app-header">
        <div className="header-brand">
          {auth?.token && !isAuthPage && (
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation menu">
              {sidebarOpen ? '✕' : '☰'}
            </button>
          )}
          <Link to="/" className="header-logo">E-AUCTION</Link>
          <div className="header-text">
            <p>Premium Electronic Auction Platform</p>
          </div>
        </div>
        <div className="header-actions">
          {!auth?.token ? (
            <>
              <Link to="/signin" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          ) : (
            <>
              <span className="header-user">Welcome, {auth.username}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="app-body">
        {!isAuthPage && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        
        <main className="app-main" style={isAuthPage ? { marginLeft: 0 } : {}}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auctions" element={<ActiveAuctions />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/create-auction"
              element={
                <ProtectedRoute roles={['ROLE_AUCTIONEER', 'ROLE_ADMIN']}>
                  <CreateAuction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/bidder"
              element={
                <ProtectedRoute roles={['ROLE_BIDDER']}>
                  <BidderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/auctioneer"
              element={
                <ProtectedRoute roles={['ROLE_AUCTIONEER']}>
                  <AuctioneerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute roles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      {!isAuthPage && (
        <footer className="app-footer">
          eAuction — Secure Electronic Auction Platform v2.0
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
