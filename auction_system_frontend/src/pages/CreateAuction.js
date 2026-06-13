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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const executeCreation = async (e) => {
    e.preventDefault();
    setStatus({ success: false, message: '' });
    setUploading(true);

    try {
      let finalImageUrl = formData.imageUrl || null;

      // Upload file to local Spring Boot endpoint if selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);

        const uploadRes = await axios.post(`${API_BASE_URL}/api/images/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.url;
      }

      const payload = {
        itemName: formData.itemName,
        itemDescription: formData.itemDescription,
        category: formData.category,
        imageUrl: finalImageUrl,
        startPrice: parseFloat(formData.startPrice),
        durationInMinutes: parseInt(formData.durationInMinutes, 10)
      };

      const headers = await getAuthorizedHeaders();
      const res = await axios.post(`${API_BASE_URL}/api/auctions/create`, payload, {
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

      setStatus({ success: true, message: `Auction #${res.data.auctionId} created successfully.` });
      setFormData({ itemName: '', itemDescription: '', category: '', imageUrl: '', startPrice: '', durationInMinutes: '60' });
      setImageFile(null);
      setImagePreview('');
      
      // Redirect back to seller dashboard
      navigate('/dashboard/auctioneer');
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.message || 'Unable to create auction.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="breadcrumb">Home / Create Auction</div>

      <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h3 className="section-title" style={{ borderBottom: '1px solid var(--color-gray-lightest)', paddingBottom: '10px' }}>
          Create New Auction Listing
        </h3>
        <p className="page-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
          Enter the item details and publish a new auction lot.
        </p>

        <form onSubmit={executeCreation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} required className="form-input" placeholder="e.g. Vintage Gold Watch" />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Provenance</label>
            <textarea name="itemDescription" value={formData.itemDescription} onChange={handleInputChange} required className="form-textarea" placeholder="Describe the item's details, origin, and condition..." />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required className="form-input" placeholder="e.g. Fine Art, Horology, Antiquities" />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Item Image File</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="form-input" style={{ padding: '8px 12px' }} />
            {imagePreview && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '160px', objectFit: 'contain', border: '1px solid var(--color-gray-lighter)', padding: '6px', backgroundColor: '#fdfcfb' }} />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', color: 'var(--color-gray-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            — OR —
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="form-input" placeholder="https://example.com/image.jpg" disabled={!!imageFile} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Price ($)</label>
              <input type="number" name="startPrice" value={formData.startPrice} onChange={handleInputChange} min="0.01" step="0.01" required className="form-input" placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input type="number" name="durationInMinutes" value={formData.durationInMinutes} onChange={handleInputChange} min="1" required className="form-input" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={uploading}>
            {uploading ? 'Uploading Assets...' : 'Publish Auction'}
          </button>
        </form>

        {status.message && (
          <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 'var(--space-lg)' }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAuction;
