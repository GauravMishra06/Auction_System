import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const ActiveAuctions = () => {
  // 1. Search Form Filter State Parameters
  const [searchParams, setSearchParams] = useState({
    auctionId: '',
    auctionTitle: '',
    sortBy: 'publishDate',
    captchaInput: ''
  });

  // 2. Data Management and UI Logic States
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Static Mock Captcha content to mimic the government portal security validation layer
  const MOCK_CAPTCHA_TEXT = "bJcpAZ";

  // Initial data synchronization hook on component mount
  useEffect(() => {
    axios.get('http://localhost:8080/api/auctions/active')
      .then(response => {
        setAuctions(response.data);
        setFilteredAuctions(response.data); // Set default full list visibility layout
        setLoading(false);
      })
      .catch(error => {
        console.error("Database query extraction failure logs:", error);
        setLoading(false);
      });
  }, []);

  // Track real-time form input modifications
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  // Process operational execution upon clicking 'Search'
  const handleSearchExecute = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Security Gate Verification: Validate captcha matching rules
    if (searchParams.captchaInput !== MOCK_CAPTCHA_TEXT) {
      setErrorMessage('Security Assertion Failure: Provided Captcha text does not match the active image node.');
      return;
    }

    // Filter local memory arrays based on active text search parameters
    let processedResults = [...auctions];

    if (searchParams.auctionId.trim() !== '') {
      processedResults = processedResults.filter(item => 
        item.auctionId.toString().includes(searchParams.auctionId.trim())
      );
    }

    if (searchParams.auctionTitle.trim() !== '') {
      processedResults = processedResults.filter(item => 
        item.itemName.toLowerCase().includes(searchParams.auctionTitle.toLowerCase().trim())
      );
    }

    // Process sorting logic variations based on radio selection vectors
    if (searchParams.sortBy === 'auctionId') {
      processedResults.sort((a, b) => a.auctionId - b.auctionId);
    } else {
      // Sort by timeline configuration metrics
      processedResults.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }

    setFilteredAuctions(processedResults);
  };

  // Flush out search forms back to the absolute base state context
  const handleFormReset = () => {
    setSearchParams({ auctionId: '', auctionTitle: '', sortBy: 'publishDate', captchaInput: '' });
    setFilteredAuctions(auctions);
    setErrorMessage('');
  };

  if (loading) return <h3 style={{ textAlign: 'center', padding: '50px' }}>Loading Live Auction System Frameworks...</h3>;

  return (
    <div style={styles.workspaceContainer}>
      {/* Search Console Header Breadcrumb Title */}
      <div style={styles.breadcrumbBar}>Home / Active Auctions</div>

      <div style={styles.searchConsoleWrapper}>
        <h3 style={styles.consoleTitleHeader}>Active Auctions Search Matrix</h3>
        <form onSubmit={handleSearchExecute}>
          
          {/* Main Input Field Row Block */}
          <div style={styles.inputFormRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabelElement}>Auction ID</label>
              <input type="text" name="auctionId" value={searchParams.auctionId} onChange={handleInputChange} placeholder="Enter exact Auction ID record" style={styles.textInputField} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabelElement}>Auction Title</label>
              <input type="text" name="auctionTitle" value={searchParams.auctionTitle} onChange={handleInputChange} placeholder="Enter item descriptive keywords" style={styles.textInputField} />
            </div>
          </div>

          {/* Sorting Option Element Line */}
          <div style={styles.sortOptionsWrapper}>
            <span style={{ fontWeight: 'bold', color: '#495057', marginRight: '15px' }}>Select Sorting Option:</span>
            <label style={styles.radioLabelOption}>
              <input type="radio" name="sortBy" value="publishDate" checked={searchParams.sortBy === 'publishDate'} onChange={handleInputChange} style={{ marginRight: '6px' }} /> Submission/Publish Date
            </label>
            <label style={styles.radioLabelOption}>
              <input type="radio" name="sortBy" value="auctionId" checked={searchParams.sortBy === 'auctionId'} onChange={handleInputChange} style={{ marginRight: '6px' }} /> Auction ID
            </label>
          </div>

          {/* Captcha Security Column Node Box Layout */}
          <div style={styles.captchaControlRow}>
            <div style={styles.captchaDisplayBox}>
              <span style={styles.scrambledCaptchaText}>{MOCK_CAPTCHA_TEXT}</span>
              <span style={{ fontSize: '0.8rem', color: '#0056b3', cursor: 'pointer', textDecoration: 'underline' }}>Refresh</span>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabelElement}>Enter Captcha</label>
              <input type="text" name="captchaInput" value={searchParams.captchaInput} onChange={handleInputChange} required style={{ ...styles.textInputField, width: '240px' }} />
            </div>
          </div>

          {errorMessage && <div style={styles.dangerAlertBanner}>{errorMessage}</div>}
          <div style={styles.infoInstructionBar}>Provide valid Captcha constraints and execute query parameters to look up specific database listings.</div>

          {/* Action Trigger Buttons Section */}
          <div style={styles.buttonActionConsoleBar}>
            <button type="button" onClick={handleFormReset} style={styles.clearFormButton}>Clear Filters</button>
            <button type="submit" style={styles.searchSubmitButton}>Execute Search</button>
          </div>
        </form>
      </div>

      {/* Grid Results Container View Block */}
      <h3 style={{ borderBottom: '2px solid #343a40', paddingBottom: '8px', color: '#2b2d42' }}>Live Results Match Grid</h3>
      <div style={styles.resultsGridMatrix}>
        {filteredAuctions.length === 0 ? (
          <p style={{ color: '#6c757d', padding: '30px' }}>No active auction items match the current search criteria rules configuration.</p>
        ) : (
          filteredAuctions.map(item => (
            <AuctionCard key={item.auctionId} auction={item} />
          ))
        )}
      </div>
    </div>
  );
};

// CSS-in-JS style configurations mimicking the professional structure from the uploaded image
const styles = {
  workspaceContainer: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  breadcrumbBar: { backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e3e6f0', fontSize: '0.9rem', color: '#4e73df', fontWeight: '500' },
  searchConsoleWrapper: { backgroundColor: '#ffffff', border: '1px solid #e3e6f0', borderRadius: '6px', padding: '24px', marginBottom: '30px', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 120, 0.05)' },
  consoleTitleHeader: { margin: '0 0 20px 0', borderBottom: '1px solid #e3e6f0', paddingBottom: '10px', color: '#4e73df', fontSize: '1.2rem', fontWeight: '700' },
  inputFormRow: { display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' },
  fieldGroup: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '260px' },
  inputLabelElement: { fontWeight: '600', marginBottom: '8px', color: '#495057', fontSize: '0.9rem' },
  textInputField: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d1d3e2', fontSize: '0.95rem', transition: 'border-color 0.15s ease-in-out', outline: 'none' },
  sortOptionsWrapper: { marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.9rem' },
  radioLabelOption: { marginRight: '20px', color: '#495057', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  captchaControlRow: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f1f3f9', padding: '15px', borderRadius: '4px', marginBottom: '15px', flexWrap: 'wrap' },
  captchaDisplayBox: { padding: '10px 15px', backgroundColor: '#ffffff', border: '1px dashed #4e73df', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '15px' },
  scrambledCaptchaText: { fontStyle: 'italic', letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.4rem', color: '#2e59d9', fontFamily: 'Courier New, monospace' },
  infoInstructionBar: { padding: '8px 12px', backgroundColor: '#fff3cd', color: '#856404', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ffeeba', marginBottom: '20px' },
  dangerAlertBanner: { padding: '10px 12px', backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #f5c6cb', marginBottom: '20px', fontWeight: '500' },
  buttonActionConsoleBar: { display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #e3e6f0', paddingTop: '15px' },
  clearFormButton: { padding: '10px 20px', backgroundColor: '#858796', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  searchSubmitButton: { padding: '10px 24px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(78,115,223,0.25)' },
  resultsGridMatrix: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', justifyContent: 'flex-start' }
};

export default ActiveAuctions;