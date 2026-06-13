import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../auth/auth';
import AuctionCard from '../components/AuctionCard';

// Animated counter hook
const useCountUp = (end, duration = 1200) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration]);

  return count;
};

const HomePage = () => {
  const { auth } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeAuctions: 0, totalItems: 0, totalBids: 0 });

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/api/auctions/active`),
      axios.get(`${API_BASE_URL}/api/auctions/completed`).catch(() => ({ data: [] }))
    ])
      .then(([activeRes, completedRes]) => {
        setAuctions(activeRes.data);
        setCompletedAuctions(completedRes.data);
        
        // Sum total bids from both active and completed lots
        const activeBidsCount = activeRes.data.reduce((sum, a) => sum + (a.bidCount || 0), 0);
        const completedBidsCount = completedRes.data.reduce((sum, a) => sum + (a.bidCount || 0), 0);
        
        setStats({
          activeAuctions: activeRes.data.length,
          totalItems: activeRes.data.length + completedRes.data.length,
          totalBids: activeBidsCount + completedBidsCount
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const animatedActive = useCountUp(stats.activeAuctions);
  const animatedItems = useCountUp(stats.totalItems);
  const animatedBids = useCountUp(stats.totalBids);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="page-container page-bg-home fade-in">
      {/* Hero Section */}
      <section style={{ padding: '4rem 0', marginBottom: '3rem', textAlign: 'center', borderBottom: '1px solid var(--color-gray-lighter)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '3rem', fontWeight: '400', fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>
            The Fine Art of Collecting
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', lineHeight: '1.8', marginBottom: '2.5rem', color: 'var(--color-gray)' }}>
            Discover and bid on rare timepieces, modern art, and luxury collectibles.
            {auth?.token && ` Welcome back, ${auth.username}.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {!auth?.token ? (
              <>
                <Link to="/signin" className="btn btn-primary btn-lg">Sign In</Link>
                <Link to="/register" className="btn btn-ghost btn-lg">Create Account</Link>
              </>
            ) : (
              <>
                <Link to="/auctions" className="btn btn-primary btn-lg">Explore Collections</Link>
                {auth.role === 'ROLE_AUCTIONEER' && (
                  <Link to="/create-auction" className="btn btn-secondary btn-lg">List An Item</Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="stats-grid" style={{ marginBottom: '4rem' }}>
        <div className="stat-card stagger-item">
          <span className="stat-label">Active Listings</span>
          <span className="stat-value">{animatedActive}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Lots Catalogued</span>
          <span className="stat-value">{animatedItems}</span>
        </div>
        <div className="stat-card stagger-item">
          <span className="stat-label">Total Placed Bids</span>
          <span className="stat-value">{animatedBids}</span>
        </div>
      </div>

      {/* Featured Auctions (Active) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Current Exhibitions</h2>
        <Link to="/auctions" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>View Full Catalogue →</Link>
      </div>

      {auctions.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: '4rem' }}>
          <p>No lots currently open for bidding. Check back soon for our next curated auction.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '1.5rem',
          marginBottom: '4rem'
        }}>
          {auctions.slice(0, 8).map(auction => (
            <AuctionCard key={auction.auctionId} auction={auction} />
          ))}
        </div>
      )}

      {/* Completed Auctions (Past) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '5rem', marginBottom: '2rem', borderTop: '1px solid var(--color-gray-lighter)', paddingTop: '3rem' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Past Catalogue / Completed Lots</h2>
        <span style={{ color: 'var(--color-gray-light)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Closed Auctions</span>
      </div>

      {completedAuctions.length === 0 ? (
        <div className="empty-state">
          <p>No completed lots to display at the moment.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '1.5rem',
          opacity: 0.85 /* Classy muted look for past archives */
        }}>
          {completedAuctions.slice(0, 8).map(auction => (
            <AuctionCard key={auction.auctionId} auction={auction} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '2rem' }}>
        <Link to="/auctions" className="btn btn-ghost btn-lg">Browse All Curated Lots</Link>
      </div>
    </div>
  );
};

export default HomePage;
