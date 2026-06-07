import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

function AppContent() {
  const { auth, logoutSession } = useAuth();

  const handleLogout = async () => {
    await logoutSession();
    window.location.href = '/signin';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Branding Portal Header Banner */}
      <header style={styles.topHeaderBanner}>
        <div style={styles.headerIdentityBlock}>
          <div style={styles.governmentEmblemSymbol}>🏛️</div>
          <div>
            <h1 style={styles.portalMainTitle}>eAuction Portal Management System</h1>
            <p style={styles.portalSubtitleLabel}>A secure, transparent platform for conducting Electronic Auctions</p>
          </div>
        </div>
        <div style={styles.authControlContainer}>
          {!auth?.token ? (
            <Link to="/signin" style={styles.portalLoginButton}>Secure Access Login</Link>
          ) : (
            <button onClick={handleLogout} style={styles.portalLoginButton}>Logout ({auth.username})</button>
          )}
        </div>
      </header>

      {/* Core Layout split: Left fixed Navigation Drawer, Right dynamic Content Window */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        
        <main style={{ flex: 1, backgroundColor: '#f4f6f9', minWidth: '0' }}>
          <Routes>
            <Route path="/" element={<ActiveAuctions />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/register" element={<Register />} />
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

      {/* Global Footer */}
      <footer style={styles.platformFooter}>
        eAuction Portal Management System — Secure Electronic Auction Platform v2.0
      </footer>
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

const styles = {
  topHeaderBanner: { backgroundColor: '#4a154b', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', borderBottom: '3px solid #ffc107' },
  headerIdentityBlock: { display: 'flex', alignItems: 'center', gap: '18px' },
  governmentEmblemSymbol: { fontSize: '2.2rem', backgroundColor: '#ffffff', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  portalMainTitle: { margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.3px' },
  portalSubtitleLabel: { margin: '2px 0 0 0', fontSize: '0.8rem', color: '#e2d3e4', fontWeight: '400' },
  authControlContainer: { display: 'flex', alignItems: 'center' },
  portalLoginButton: { padding: '8px 18px', backgroundColor: '#e01e5a', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(224,30,90,0.3)', border: 'none', cursor: 'pointer' },
  platformFooter: { backgroundColor: '#1e242e', padding: '12px 30px', color: '#a0aec0', fontSize: '0.8rem', textAlign: 'center', borderTop: '1px solid #2d3748' }
};

export default App;