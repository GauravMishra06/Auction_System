import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Auction Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours}h ${minutes}m ${seconds}s`);
      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div style={{
      padding: '12px 20px',
      borderRadius: '8px',
      background: isExpired ? '#f8d7da' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: isExpired ? '#721c24' : '#fff',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      textAlign: 'center',
      letterSpacing: '1px',
      marginBottom: '16px'
    }}>
      {isExpired ? '⏰ Auction Ended' : `⏱️ ${timeLeft}`}
    </div>
  );
};

const AuctionDetails = () => {
  const { id } = useParams();
  const { auth, getAuthorizedHeaders } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('error');

  const loadData = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/auctions/${id}`).then(res => setAuction(res.data)).catch(() => {});
    axios.get(`${API_BASE_URL}/api/bids/history/${id}`).then(res => setBidHistory(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const executeBidSubmission = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!auth?.token) {
      setStatusMessage('Please sign in before placing a bid.');
      setStatusType('error');
      return;
    }

    const payload = {
      auctionId: parseInt(id),
      bidAmount: parseFloat(bidAmount)
    };

    const headers = await getAuthorizedHeaders();

    axios.post(`${API_BASE_URL}/api/bids/place`, payload, {
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
      .then(response => {
        setStatusMessage('Bid placed successfully!');
        setStatusType('success');
        setAuction({ ...auction, currentHighestBid: response.data.bidAmount });
        setBidHistory([response.data, ...bidHistory]);
        setBidAmount('');
      })
      .catch(error => {
        setStatusMessage(error.response?.data?.message || 'Unable to place bid.');
        setStatusType('error');
      });
  };

  if (!auction) return <h2 style={{ textAlign: 'center', padding: '50px' }}>Loading auction details...</h2>;

  return (
    <div style={{ padding: '30px', display: 'flex', gap: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Left Column: Details */}
      <div style={{ flex: 2 }}>
        <h1>{auction.itemName}</h1>
        <CountdownTimer endTime={auction.endTime} />
        {auction.imageUrl && (
          <img src={auction.imageUrl} alt={auction.itemName} style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '6px' }} />
        )}
        <p style={{ fontSize: '1.1rem', marginTop: '20px', lineHeight: '1.6' }}>{auction.itemDescription}</p>
        <hr/>
        <h3>Current Valuation: <span style={{ color: '#28a745' }}>${auction.currentHighestBid}</span></h3>
        <p><strong>Seller:</strong> {auction.sellerUsername}</p>
        <p><strong>Closes:</strong> {new Date(auction.endTime).toLocaleString()}</p>
        <p><strong>Status:</strong> <span style={{
          padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600,
          background: auction.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
          color: auction.status === 'ACTIVE' ? '#155724' : '#721c24'
        }}>{auction.status}</span></p>
        
        {auction.status === 'ACTIVE' && (
          <form onSubmit={executeBidSubmission} style={{ marginTop: '25px', padding: '15px', background: '#f1f3f5', borderRadius: '6px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Place Your Bid ($):</label>
            <input 
              type="number" 
              step="0.01"
              value={bidAmount} 
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Must exceed $${auction.currentHighestBid}`}
              required
              style={{ padding: '10px', width: '220px', fontSize: '1rem', marginRight: '15px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <button type="submit" style={{ padding: '10px 22px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Submit Bid
            </button>
            {!auth?.token && (
              <p style={{ color: '#a30000', marginTop: '10px' }}>You must sign in as a bidder to place a bid.</p>
            )}
          </form>
        )}
        {statusMessage && (
          <p style={{ fontWeight: 'bold', marginTop: '12px', color: statusType === 'success' ? '#155724' : '#dc3545' }}>
            {statusMessage}
          </p>
        )}
      </div>

      {/* Right Column: Bid History */}
      <div style={{ flex: 1, borderLeft: '1px solid #dee2e6', paddingLeft: '30px' }}>
        <h2>Bidding Log ({bidHistory.length})</h2>
        <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
          {bidHistory.length === 0 ? (
            <p style={{ color: '#777' }}>No bids placed yet. Be the first!</p>
          ) : (
            bidHistory.map((log) => (
              <div key={log.bidId} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5' }}>
                <strong>{log.bidderUsername}</strong> bid <span style={{ color: '#28a745', fontWeight: 'bold' }}>${log.bidAmount}</span>
                <div style={{ fontSize: '0.75rem', color: '#868e96', marginTop: '3px' }}>{new Date(log.bidTime).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;