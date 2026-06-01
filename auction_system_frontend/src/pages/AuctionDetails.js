import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AuctionDetails = () => {
  const { id } = useParams(); // Extracts the route variable id parameter value string directly from path urls
  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Hardcoded tracking ID placeholder mimicking user profile data state values 
  // until Spring Security is fully integrated
  const MOCK_CURRENT_USER_ID = 2;

  useEffect(() => {
    // Query item profiles and pull history tables side-by-side using variable route extensions
    axios.get(`http://localhost:8080/api/auctions/${id}`).then(res => setAuction(res.data));
    axios.get(`http://localhost:8080/api/bids/history/${id}`).then(res => setBidHistory(res.data));
  }, [id]);

  const executeBidSubmission = (e) => {
    e.preventDefault(); // Lock form submission actions from triggering default browser page refreshes

    const payload = {
      auctionId: id,
      bidderId: MOCK_CURRENT_USER_ID,
      bidAmount: parseFloat(bidAmount) // Converts form text input content into floating value numbers
    };

    // Forward JSON parameters over to the backend destination targets
    axios.post('http://localhost:8080/api/bids/place', payload)
      .then(response => {
        setStatusMessage('Bid logged and confirmed successfully!');
        // Update local views inside component structures instantly by patching state nodes
        setAuction({ ...auction, currentHighestBid: response.data.bidAmount });
        setBidHistory([response.data, ...bidHistory]); // Add your new bid to the top of the history list
        setBidAmount(''); // Flush out form element contents
      })
      .catch(error => {
        // Catches and shows business rule errors thrown by Spring Boot (e.g., bid too low)
        setStatusMessage(`Rejected: ${error.response?.data?.message || 'Transaction submission error'}`);
      });
  };

  if (!auction) return <h2 style={{ textAlign: 'center' }}>Extracting specific item context tables...</h2>;

  return (
    <div style={{ padding: '30px', display: 'flex', gap: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Left Column Section: Context Breakdown Details View Panel */}
      <div style={{ flex: 2 }}>
        <h1>{auction.itemName}</h1>
        <img src={auction.imageUrl} alt={auction.itemName} style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', background: '#f8f9fa' }} />
        <p style={{ fontSize: '1.1rem', marginTop: '20px', lineHeight: '1.6' }}>{auction.itemDescription}</p>
        <hr/>
        <h3>Current Valuation: <span style={{ color: '#28a745' }}>${auction.currentHighestBid}</span></h3>
        <p><strong>Seller/Auctioneer ID:</strong> {auction.sellerUsername}</p>
        <p><strong>Closing Window Date/Time:</strong> {new Date(auction.endTime).toLocaleString()}</p>
        
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
            Submit Bid Entry
          </button>
        </form>
        {statusMessage && <p style={{ fontWeight: 'bold', marginTop: '12px', color: '#dc3545' }}>{statusMessage}</p>}
      </div>

      {/* Right Column Section: Real-time Live History Display Log Ledger List */}
      <div style={{ flex: 1, borderLeft: '1px solid #dee2e6', paddingLeft: '30px' }}>
        <h2>Active Bidding Log</h2>
        <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
          {bidHistory.length === 0 ? (
            <p style={{ color: '#777' }}>No bids placed yet. Be the first to start!</p>
          ) : (
            bidHistory.map((log) => (
              <div key={log.bidId} style={{ padding: '10px', borderBottom: '1px solid #f1f3f5' }}>
                <strong>{log.bidderUsername}</strong> offered <span style={{ color: '#28a745', fontWeight: 'bold' }}>${log.bidAmount}</span>
                <div style={{ fontSize: '0.75rem', color: '#868e96', marginTop: '3px' }}>{new Date(log.bidTime).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;