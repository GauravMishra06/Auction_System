import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="auth-page fade-in">
      <div className="glass-card" style={{ textAlign: 'center', maxWidth: 500, padding: '3rem' }}>
        <div style={{
          fontSize: '5rem',
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: '0.5rem'
        }} className="gradient-text">
          404
        </div>
        <h2 style={{ color: 'var(--color-dark)', marginTop: 12, marginBottom: 8 }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">← Back to Auctions</Link>
      </div>
    </div>
  );
};

export default NotFound;
