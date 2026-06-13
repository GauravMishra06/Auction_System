import React from 'react';
import { Link } from 'react-router-dom';

const AuctionCard = ({ auction }) => {
  const getStatusBadge = (status) => {
    const map = {
      ACTIVE: 'badge-active',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
      PENDING: 'badge-pending',
    };
    return map[status] || 'badge-pending';
  };

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link to={`/auctions/${auction.auctionId}`} className="gallery-card">
      <div className="gallery-card-img-container">
        {auction.imageUrl ? (
          <img
            src={auction.imageUrl}
            alt={auction.itemName}
            className="gallery-card-img"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div 
          className="gallery-card-img"
          style={{
            display: auction.imageUrl ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-gray-lightest)'
          }}
        >
          <span className="gallery-card-price-label">No Image</span>
        </div>
        <span className={`badge ${getStatusBadge(auction.status)} gallery-card-status`}>
          {auction.status}
        </span>
      </div>
      <div className="gallery-card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          {auction.category && (
            <span className="gallery-card-category" style={{ marginBottom: 0 }}>{auction.category}</span>
          )}
          <span className="gallery-card-category" style={{ marginBottom: 0, color: 'var(--color-gray-light)', fontWeight: 'normal' }}>
            Lot #{auction.auctionId}
          </span>
        </div>
        <h3 className="gallery-card-title">{auction.itemName}</h3>
        <p className="gallery-card-desc">{auction.itemDescription}</p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px', 
          fontSize: '0.75rem', 
          color: 'var(--color-gray)', 
          marginBottom: '14px',
          borderTop: '1px dashed var(--color-gray-lighter)',
          paddingTop: '8px'
        }}>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--color-dark-light)' }}>Published:</span> {formatDate(auction.startTime)}
          </div>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--color-dark-light)' }}>Ending:</span> {formatDate(auction.endTime)}
          </div>
        </div>

        <div className="gallery-card-footer">
          <div>
            <span className="gallery-card-price-label">Current Valuation</span>
            <span className="gallery-card-price">${auction.currentHighestBid?.toFixed(2) || '0.00'}</span>
          </div>
          {auction.status === 'ACTIVE' && (
            <span className="gallery-card-timer">{formatTimeLeft(auction.endTime)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
