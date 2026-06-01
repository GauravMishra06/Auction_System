import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Card component designed to render an option snippet inside our dashboard grid.
 * It receives an 'auction' object parameter bundle from its parent container view page.
 */
const AuctionCard = ({ auction }) => {
  return (
    <div style={styles.card}>
      {/* Fallback pattern preventing UI breakages if a user inputs an invalid link string */}
      <img src={auction.imageUrl || 'https://via.placeholder.com/150'} alt={auction.itemName} style={styles.image} />
      <h3>{auction.itemName}</h3>
      <p style={styles.desc}>{auction.itemDescription}</p>
      <p><strong>Category:</strong> {auction.category}</p>
      <p style={styles.price}>Current Price: ${auction.currentHighestBid}</p>
      
      {/* React Router Link handles navigation smoothly without full browser page refreshes */}
      <Link to={`/auctions/${auction.auctionId}`} style={styles.button}>
        View Listing & Bid
      </Link>
    </div>
  );
};

// Simple object styling blueprint to keep the project clean without external CSS libraries
const styles = {
  card: { border: '1px solid #ddd', padding: '16px', borderRadius: '8px', margin: '12px', width: '260px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  image: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px' },
  desc: { fontSize: '0.9rem', color: '#555', height: '40px', overflow: 'hidden' },
  price: { color: '#28a745', fontWeight: 'bold', fontSize: '1.2rem' },
  button: { display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '12px', padding: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontWeight: 'bold' }
};

export default AuctionCard;