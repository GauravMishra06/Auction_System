import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';
import { API_BASE_URL } from '../auth/auth';

const ActiveAuctions = () => {
  const [searchParams, setSearchParams] = useState({
    auctionId: '',
    auctionTitle: '',
    startDate: '',
    endDate: '',
    sortBy: 'publishDate'
  });

  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auctions/active`)
      .then(response => {
        setAuctions(response.data);
        setFilteredAuctions(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleSearchExecute = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auctions/search`, {
        params: {
          auctionId: searchParams.auctionId,
          auctionTitle: searchParams.auctionTitle,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          sortBy: searchParams.sortBy
        }
      });
      setFilteredAuctions(response.data);
    } catch (error) {
      console.error('Search request failed:', error);
      setErrorMessage('Search failed. Please ensure the backend is running.');
    }
  };

  const handleFormReset = () => {
    setSearchParams({ auctionId: '', auctionTitle: '', startDate: '', endDate: '', sortBy: 'publishDate' });
    setFilteredAuctions(auctions);
    setErrorMessage('');
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading curated catalogue...</p>
      </div>
    );
  }

  return (
    <div className="page-container page-bg-catalog fade-in">
      <div className="breadcrumb">Home / Curated Lots</div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 className="section-title" style={{ borderBottom: '1px solid var(--color-gray-lighter)', paddingBottom: '12px', marginBottom: '24px' }}>
          Search Catalogue
        </h3>
        <form onSubmit={handleSearchExecute}>
          <div className="form-row" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Lot ID</label>
              <input
                type="text"
                name="auctionId"
                value={searchParams.auctionId}
                onChange={handleInputChange}
                placeholder="Enter lot number"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Keyword / Title</label>
              <input
                type="text"
                name="auctionTitle"
                value={searchParams.auctionTitle}
                onChange={handleInputChange}
                placeholder="e.g. Modern art, Gold"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Published On or After</label>
              <input
                type="date"
                name="startDate"
                value={searchParams.startDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ending On or Before</label>
              <input
                type="date"
                name="endDate"
                value={searchParams.endDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="filter-bar" style={{ marginBottom: '24px' }}>
            <span style={{ fontWeight: '600', color: 'var(--color-dark)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Sort by:</span>
            <label>
              <input type="radio" name="sortBy" value="publishDate" checked={searchParams.sortBy === 'publishDate'} onChange={handleInputChange} />
              Publish Date
            </label>
            <label>
              <input type="radio" name="sortBy" value="auctionId" checked={searchParams.sortBy === 'auctionId'} onChange={handleInputChange} />
              Lot Number
            </label>
          </div>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <div className="action-row" style={{ marginTop: '24px' }}>
            <button type="button" onClick={handleFormReset} className="btn btn-secondary">Clear Filters</button>
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>
      </div>

      <h3 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Curated Lots ({filteredAuctions.length})</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '1rem'
      }}>
        {filteredAuctions.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No active lots match the current search criteria.</p>
          </div>
        ) : (
          filteredAuctions.map(item => (
            <AuctionCard key={item.auctionId} auction={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveAuctions;