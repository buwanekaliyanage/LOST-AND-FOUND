import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import api from '../api';
import LocationPicker from '../components/LocationPicker';
import { Camera, AlertCircle, Send } from 'lucide-react';
import './Items.css';

const CATEGORIES = ['Phone', 'Wallet', 'Keys', 'Bag', 'Laptop', 'ID Card', 'Jewelry', 'Other'];

export default function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: '', location: '', date: '', time: '', description: '', qrCodeNumber: '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLocationSelect = (address) => {
    setForm(prev => ({ ...prev, location: address }));
  };
  const handlePhoto = e => {
    const f = e?.target?.files?.[0] || e?.dataTransfer?.files?.[0];
    if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); }
  };
  const handleDrag = e => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = e => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    handlePhoto(e);
  };
  const reset = () => { setForm({ title: '', category: '', location: '', date: '', time: '', description: '', qrCodeNumber: '' }); setPhoto(null); setPreview(''); };

  const submit = async () => {
    const { title, category, location, date, time, description, qrCodeNumber } = form;
    if (!title || !category || !location || !date || !description)
      return setToast({ message: 'Please fill all required fields', type: 'error' });

    // Validate QR code number if provided
    if (qrCodeNumber) {
      const num = parseInt(qrCodeNumber);
      if (isNaN(num) || num < 1000 || num > 1100) {
        return setToast({ message: 'QR Code number must be between 1000 and 1100', type: 'error' });
      }
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('type', 'lost');
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });
      if (photo) fd.append('image', photo);
      await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast({ message: 'Lost item reported! A QR code has been generated.', type: 'success' });
      reset();
      setTimeout(() => navigate('/lost'), 1800);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrap">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Navbar />
      <div className="report-hero">
        <h1><AlertCircle size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Report <span style={{ color: 'var(--red)' }}>Lost</span> Item</h1>
        <p>Provide details about your lost item. A unique QR code will be generated for it.</p>
      </div>
      <div className="report-form-wrap">
        <div className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Item Title </label>
              <input name="title" className="form-input" placeholder="e.g. Black Leather Wallet" value={form.title} onChange={handle} />
            </div>
            <div className="form-group">
              <label>Category </label>
              <select name="category" className="form-input" value={form.category} onChange={handle}>
                <option value="" disabled>Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Location Lost </label>
            <LocationPicker 
              onLocationSelect={handleLocationSelect} 
              initialAddress={form.location}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date & Time Lost </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input name="date" type="date" className="form-input" value={form.date} onChange={handle} />
                <input name="time" type="time" className="form-input" value={form.time} onChange={handle} />
              </div>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description </label>
            <textarea name="description" className="form-input form-textarea" rows={5}
              placeholder="Describe the item in detail — color, brand, distinguishing marks…"
              value={form.description} onChange={handle} />
          </div>
          <div className="form-group full-width">
            <label>Link to Existing QR Code (optional)</label>
            <input name="qrCodeNumber" type="number" className="form-input" placeholder="Enter QR Code number (1000-1100)"
              value={form.qrCodeNumber} onChange={handle} min="1000" max="1100" />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>If you found this item with a QR code, enter the number here to link them.</small>
          </div>
          <div className="form-group full-width">
            <label>Upload Photo (optional)</label>
            <label
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              htmlFor="photo-lost"
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              {preview
                ? <img src={preview} alt="preview" className="upload-preview" />
                : <><Camera className="upload-icon" size={32} /><span className="upload-text">Drag & drop or Click to upload a photo</span></>}
              <input type="file" id="photo-lost" accept="image/*" hidden onChange={handlePhoto} />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={reset}>Reset</button>
            <button className="btn btn-red" onClick={submit} disabled={loading}>
              {loading ? 'Submitting…' : <><Send size={18} style={{ marginRight: '8px' }} /> Submit Lost Report</>}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
