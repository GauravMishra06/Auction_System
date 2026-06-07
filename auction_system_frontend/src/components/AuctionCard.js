import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Card component designed to render an auction snippet inside our dashboard grid.
 */
const AuctionCard = ({ auction }) => {
  return (
    <div style={styles.card}>
      <img
        src={auction.imageUrl || ''}
        alt={auction.itemName}
        style={styles.image}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      {!auction.imageUrl && (
        <div style={styles.placeholderImage}>
          <span style={{ fontSize: '2rem' }}>📦</span>
          <span style={{ fontSize: '0.8rem', color: '#999' }}>No Image</span>
        </div>
      )}
      <h3>{auction.itemName}</h3>
      <p style={styles.desc}>{auction.itemDescription}</p>
      <p><strong>Category:</strong> {auction.category}</p>
      <p style={styles.price}>Current Price: ${auction.currentHighestBid}</p>
      
      <Link to={`/auctions/${auction.auctionId}`} style={styles.button}>
        View Listing & Bid
      </Link>
    </div>
  );
};

const styles = {
  card: { border: '1px solid #ddd', padding: '16px', borderRadius: '8px', margin: '12px', width: '260px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  image: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' },
  placeholderImage: { width: '100%', height: '160px', borderRadius: '4px', backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' },
  desc: { fontSize: '0.9rem', color: '#555', height: '40px', overflow: 'hidden' },
  price: { color: '#28a745', fontWeight: 'bold', fontSize: '1.2rem' },
  button: { display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '12px', padding: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontWeight: 'bold' }
};

export default AuctionCard;