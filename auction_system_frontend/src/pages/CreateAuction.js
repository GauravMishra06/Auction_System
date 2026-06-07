import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../auth/auth';

const CreateAuction = () => {
  const { getAuthorizedHeaders } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    itemDescription: '',
    category: '',
    imageUrl: '',
    startPrice: '',
    durationInMinutes: '60'
  });
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const executeCreation = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });

    const payload = {
      itemName: formData.itemName,
      itemDescription: formData.itemDescription,
      category: formData.category,
      imageUrl: formData.imageUrl || null,
      startPrice: parseFloat(formData.startPrice),
      durationInMinutes: parseInt(formData.durationInMinutes, 10)
    };

    try {
      const headers = await getAuthorizedHeaders();
      const res = await axios.post(`${API_BASE_URL}/api/auctions/create`, payload, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      setStatus({ success: true, message: `Auction #${res.data.auctionId} created successfully.` });
      setFormData({ itemName: '', itemDescription: '', category: '', imageUrl: '', startPrice: '', durationInMinutes: '60' });
      navigate('/dashboard/auctioneer');
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || 'Unable to create auction.' });
    }
  };

  return (
    <div style={styles.workspaceContainer}>
      <div style={styles.breadcrumbBar}>Home / Publish Asset</div>

      <div style={styles.formCardWrapper}>
        <h3 style={styles.cardHeaderTitle}>Create New Auction Listing</h3>
        <p style={styles.instructionText}>Enter the item details and publish a new auction.</p>

        <form onSubmit={executeCreation} style={styles.formLayout}>
          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Item Name</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} required style={styles.textInputField} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Description</label>
            <textarea name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} required style={{ ...styles.textInputField, minHeight: '100px', resize: 'vertical' }} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required style={styles.textInputField} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.inputLabelElement}>Image URL (optional)</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} style={styles.textInputField} />
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabelElement}>Start Price ($)</label>
              <input type="number" name="startPrice" value={formData.startPrice} onChange={handleInputChange} min="0.01" step="0.01" required style={styles.textInputField} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.inputLabelElement}>Duration (minutes)</label>
              <input type="number" name="durationInMinutes" value={formData.durationInMinutes} onChange={handleInputChange} min="1" required style={styles.textInputField} />
            </div>
          </div>

          <button type="submit" style={styles.submitFormButton}>Create Auction</button>
        </form>

        {status.message && <div style={status.success ? styles.successAlertBanner : styles.dangerAlertBanner}>{status.message}</div>}
      </div>
    </div>
  );
};

const styles = {
  workspaceContainer: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  breadcrumbBar: { backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e3e6f0', fontSize: '0.9rem', color: '#4e73df', fontWeight: '500' },
  formCardWrapper: { backgroundColor: '#ffffff', border: '1px solid #e3e6f0', borderRadius: '6px', padding: '30px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 120, 0.05)' },
  cardHeaderTitle: { margin: '0 0 10px 0', borderBottom: '1px solid #e3e6f0', paddingBottom: '10px', color: '#4e73df', fontSize: '1.25rem', fontWeight: '700' },
  instructionText: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '25px', lineHeight: '1.5' },
  formLayout: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  inputLabelElement: { fontWeight: '600', marginBottom: '8px', color: '#495057', fontSize: '0.9rem' },
  textInputField: { padding: '10px 14px', borderRadius: '4px', border: '1px solid #d1d3e2', fontSize: '0.95rem', outline: 'none' },
  submitFormButton: { padding: '12px 24px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', marginTop: '10px', boxShadow: '0 2px 4px rgba(28,200,138,0.25)' },
  successAlertBanner: { padding: '12px', backgroundColor: '#d4edda', color: '#155724', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #c3e6cb', marginTop: '20px', fontWeight: '500', lineHeight: '1.4' },
  dangerAlertBanner: { padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #f5c6cb', marginTop: '20px', fontWeight: '500' }
};

export default CreateAuction;
