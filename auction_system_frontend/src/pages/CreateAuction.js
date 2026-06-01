import React, { useState } from 'react';
import axios from 'axios';

const CreateAuction = () => {
  const [formData, setFormData] = useState({ itemName: '', description: '', currentBid: '' });
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeCreation = (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    // Ensure the currentBid is formatted as a number before sending
    const payload = {
      ...formData,
      currentBid: parseFloat(formData.currentBid)
    };

    axios.post('http://localhost:8080/api/auctions', payload)
      .then(res => {
        setStatus({
          success: true,
          message: `Asset Published! "${res.data.itemName}" has been successfully listed in the auction registry with ID #${res.data.id}.`
        });
        setFormData({ itemName: '', description: '', currentBid: '' });
      })
      .catch(err => {
        setStatus({
          success: false,
          message: `Publication Blocked: ${err.response?.data?.message || 'Network communication gateway fault.'}`
        });
      });
  };

  return (
    <div style={styles.workspaceContainer}>
      <div style={styles.breadcrumbBar}>Home / Publish Asset</div>
      
      <div style={styles.formCardWrapper}>
        <h3 style={styles.cardHeaderTitle}>Create New Auction Listing</h3>
        <p style={styles.instructionText}>Enter the asset metadata below to broadcast a new item to the live auction feed.</p>
        
        <form onSubmit={executeCreation} style={styles.formLayout}>
          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Asset Name</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} placeholder="e.g., Vintage Rolex Daytona" required style={styles.textInputField} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Asset Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Provide detailed specifications and condition..." required style={{...styles.textInputField, minHeight: '100px', resize: 'vertical'}} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Starting Bid Amount (₹)</label>
            <input type="number" name="currentBid" value={formData.currentBid} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" required style={styles.textInputField} />
          </div>

          <button type="submit" style={styles.submitFormButton}>Execute Asset Publication</button>
        </form>

        {status.message && (
          <div style={status.success ? styles.successAlertBanner : styles.dangerAlertBanner}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  workspaceContainer: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  breadcrumbBar: { backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e3e6f0', fontSize: '0.9rem', color: '#4e73df', fontWeight: '500' },
  formCardWrapper: { backgroundColor: '#ffffff', border: '1px solid #e3e6f0', borderRadius: '6px', padding: '30px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 120, 0.05)' },
  cardHeaderTitle: { margin: '0 0 10px 0', borderBottom: '1px solid #e3e6f0', paddingBottom: '10px', color: '#4e73df', fontSize: '1.25rem', fontWeight: '700' },
  instructionText: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.5' },
  formLayout: { display: 'flex', flexDirection: 'column', gap: '20px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  inputLabelElement: { fontWeight: '600', marginBottom: '8px', color: '#495057', fontSize: '0.9rem' },
  textInputField: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d1d3e2', fontSize: '0.95rem', outline: 'none' },
  submitFormButton: { padding: '12px 24px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', marginTop: '10px', boxShadow: '0 2px 4px rgba(28,200,138,0.25)' },
  successAlertBanner: { padding: '12px', backgroundColor: '#d4edda', color: '#155724', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #c3e6cb', marginTop: '20px', fontWeight: '500', lineHeight: '1.4' },
  dangerAlertBanner: { padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #f5c6cb', marginTop: '20px', fontWeight: '500' }
};

export default CreateAuction;