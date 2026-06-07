import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.code}>404</div>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.text}>The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" style={styles.button}>← Back to Auctions</a>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 },
  card: { textAlign: 'center', maxWidth: 500, padding: 40 },
  code: { fontSize: '5rem', fontWeight: 900, color: '#4e73df', lineHeight: 1 },
  title: { color: '#343a40', marginTop: 12, marginBottom: 8 },
  text: { color: '#6c757d', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 },
  button: { display: 'inline-block', padding: '10px 24px', backgroundColor: '#4e73df', color: '#fff', textDecoration: 'none', borderRadius: 6, fontWeight: 600 }
};

export default NotFound;
