import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_BASE_URL } from '../auth/auth';
import SoldAnimation from '../components/SoldAnimation';
import UnsoldAnimation from '../components/UnsoldAnimation';
import WinnerCelebration from '../components/WinnerCelebration';

const AuctionDetails = () => {
  const { id } = useParams();
  const { auth, getAuthorizedHeaders } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bidHistory, setBidHistory] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('error');

  // Animation states
  const [showSold, setShowSold] = useState(false);
  const [showUnsold, setShowUnsold] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [showBidFlash, setShowBidFlash] = useState(false);
  const [showBidToast, setShowBidToast] = useState(false);
  const animationShownRef = useRef(false);

  const loadData = useCallback(() => {
    axios.get(`${API_BASE_URL}/api/auctions/${id}`).then(res => setAuction(res.data)).catch(() => { });
    axios.get(`${API_BASE_URL}/api/bids/history/${id}`).then(res => setBidHistory(res.data)).catch(() => { });
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Trigger appropriate animation when auction is COMPLETED
  useEffect(() => {
    if (auction?.status === 'COMPLETED' && !animationShownRef.current && bidHistory !== null) {

      const hasBids = bidHistory.length > 0;
      const isCurrentUserWinner = hasBids && auth?.username && bidHistory[0]?.bidderUsername === auth.username;

      const timer = setTimeout(() => {
        animationShownRef.current = true;
        if (!hasBids) {
          // No bids were placed — show UNSOLD animation
          setShowUnsold(true);
        } else if (isCurrentUserWinner) {
          // Current user is the winner — show Winner Celebration
          setShowWinner(true);
        } else {
          // Auction sold to someone else — show SOLD stamp
          setShowSold(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [auction?.status, bidHistory, auth?.username]);

  const triggerBidCelebration = () => {

    setShowBidFlash(true);
    setTimeout(() => setShowBidFlash(false), 900);

    setShowBidToast(true);
    setTimeout(() => setShowBidToast(false), 3200);

    if (window.triggerSparkBurst) {
      window.triggerSparkBurst(window.innerWidth / 2, window.innerHeight / 2, 50);

      setTimeout(() => {
        window.triggerSparkBurst?.(window.innerWidth * 0.3, window.innerHeight * 0.4, 20);
        window.triggerSparkBurst?.(window.innerWidth * 0.7, window.innerHeight * 0.4, 20);
      }, 200);
    }
  };

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
        setBidHistory([response.data, ...(bidHistory || [])]);
        setBidAmount('');

        // 🎉 Trigger celebration
        triggerBidCelebration();
      })
      .catch(error => {
        setStatusMessage(error.response?.data?.message || 'Unable to place bid.');
        setStatusType('error');
      });
  };

  if (!auction) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading lot details...</p>
      </div>
    );
  }

  return (
    <div className="page-container page-bg-details fade-in" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
      {/* SOLD Overlay Animation */}
      <SoldAnimation
        show={showSold}
        onComplete={() => setShowSold(false)}
        finalPrice={auction.currentHighestBid}
        winnerName={(bidHistory && bidHistory.length > 0) ? bidHistory[0]?.bidderUsername : null}
      />

      {/* UNSOLD Overlay — shown when auction closes with zero bids */}
      <UnsoldAnimation
        show={showUnsold}
        onComplete={() => setShowUnsold(false)}
        itemName={auction.itemName}
      />

      {/* Winner Celebration — shown to the winning bidder */}
      <WinnerCelebration
        show={showWinner}
        onComplete={() => setShowWinner(false)}
        itemName={auction.itemName}
        finalPrice={auction.currentHighestBid}
        username={auth?.username}
      />

      {/* Bid Success Flash */}
      {showBidFlash && <div className="bid-success-flash" />}

      {/* Bid Success Toast */}
      {showBidToast && (
        <div className="bid-success-toast">
          ◆ Bid Placed Successfully ◆
        </div>
      )}

      {/* Left Column: Details */}
      <div style={{ flex: 2, minWidth: '320px' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>{auction.itemName}</h1>
        <div className="breadcrumb" style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: 0 }}>Lot #{auction.auctionId} / {auction.category}</div>

        –

        {auction.imageUrl && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-xl)', border: '1px solid var(--color-gray-lighter)', position: 'relative' }}>
            <img src={auction.imageUrl} alt={auction.itemName} style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', background: '#fcfbf9' }} />
            {/* SOLD / UNSOLD badge on image for completed auctions */}
            {auction.status === 'COMPLETED' && (
              <div className="gallery-card-sold-overlay">
                <div className="gallery-card-sold-stamp">
                  {(bidHistory && bidHistory.length > 0) ? 'SOLD' : 'UNSOLD'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px', marginBottom: '16px' }}>Description & Provenance</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 var(--space-xl) 0' }}>
            {auction.itemDescription}
          </p>

          <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-card" style={{ borderTopColor: 'var(--color-primary)' }}>
              <span className="stat-label">Current Valuation</span>
              <span className="stat-value" style={{ color: 'var(--color-primary-light)' }}>${auction.currentHighestBid?.toFixed(2)}</span>
            </div>
            <div className="stat-card" style={{ borderTopColor: 'var(--color-gray)' }}>
              <span className="stat-label">Start Price</span>
              <span className="stat-value">${auction.startPrice?.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
            <span><strong>Seller:</strong> {auction.sellerUsername}</span>
            <span><strong>Closing:</strong> {new Date(auction.endTime).toLocaleString()}</span>
            <span><strong>Status:</strong>{' '}
              <span className={`badge ${auction.status === 'ACTIVE' ? 'badge-active' : auction.status === 'COMPLETED' ? 'badge-completed' : 'badge-cancelled'}`}>
                {auction.status}
              </span>
            </span>
          </div>
        </div>

        {auction.status === 'ACTIVE' && (
          <div className="bid-form">
            <form onSubmit={executeBidSubmission}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>Submit Bid ($)</label>
              <div className="bid-input-row" style={{ marginTop: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min. $${(auction.currentHighestBid + 0.01).toFixed(2)}`}
                  required
                  className="form-input"
                  style={{ flex: 1, minWidth: '180px' }}
                />
                <button type="submit" className="btn btn-primary">Place Bid</button>
              </div>
              {!auth?.token && (
                <p style={{ color: 'var(--color-danger)', marginTop: '12px', fontSize: '0.85rem' }}>
                  You must sign in as a bidder to place a bid.
                </p>
              )}
            </form>
          </div>
        )}

        {statusMessage && (
          <div className={`alert ${statusType === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 'var(--space-lg)' }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Right Column: Bid History */}
      <div style={{ flex: 1, minWidth: '290px' }}>
        <div className="glass-card" style={{ height: '100%', boxSizing: 'border-box', borderTop: '2px solid var(--color-primary)' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '16px' }}>Bidding History ({bidHistory?.length || 0})</h3>
          <div className="bid-history-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {(!bidHistory || bidHistory.length === 0) ? (
              <p style={{ color: 'var(--color-gray-light)', textAlign: 'center', padding: 'var(--space-xl) 0', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No bids recorded. Be the first to place a bid.
              </p>
            ) : (
              bidHistory.map((log) => (
                <div key={log.bidId} style={{
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}>
                  <div>
                    <strong style={{ color: 'var(--color-white)', fontSize: '0.9rem' }}>{log.bidderUsername}</strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-light)', marginTop: '4px' }}>
                      {new Date(log.bidTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(log.bidTime).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-primary-dark)', fontWeight: '600', fontSize: '1.05rem', fontFamily: 'var(--font-serif)' }}>
                    ${log.bidAmount?.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;