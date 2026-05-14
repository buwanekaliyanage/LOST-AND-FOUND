import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import api from '../api';
import { Tag, CheckCircle, Copy, Eye } from 'lucide-react';
import './Items.css';

const CATEGORIES = ['Phone', 'Wallet', 'Keys', 'Bag', 'Laptop', 'ID Card', 'Jewelry', 'Other'];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        category: '',
        qrCodeNumber: ''
    });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useAutoNumber, setUseAutoNumber] = useState(true);
    const [createdItem, setCreatedItem] = useState(null);

    const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
    const reset = () => {
        setForm({ title: '', category: '', qrCodeNumber: '' });
        setUseAutoNumber(true);
    };

    const copyQrLink = () => {
        if (!createdItem) return;
        const link = `${window.location.origin}/qr/${createdItem.qrCodeNumber}`;
        navigator.clipboard.writeText(link);
        setToast({ message: 'QR link copied to clipboard!', type: 'success' });
    };

    const submit = async () => {
        const { title, category, qrCodeNumber } = form;
        if (!title || !category)
            return setToast({ message: 'Please fill all required fields', type: 'error' });

        // Validate QR code number if manually entered
        if (!useAutoNumber && qrCodeNumber) {
            const num = parseInt(qrCodeNumber);
            if (isNaN(num) || num < 1000 || num > 1100) {
                return setToast({ message: 'QR Code number must be between 1000 and 1100', type: 'error' });
            }
        }

        try {
            setLoading(true);
            const fd = new FormData();
            fd.append('type', 'registered');
            fd.append('title', title);
            fd.append('category', category);
            if (!useAutoNumber) {
                fd.append('qrCodeNumber', qrCodeNumber);
            } else {
                fd.append('qrCodeNumber', '');
            }

            const response = await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCreatedItem(response.data);
            setToast({
                message: `Item registered! Your QR Code Number is: ${response.data.qrCodeNumber}`,
                type: 'success'
            });
            reset();
        } catch (err) {
            setToast({ message: err.response?.data?.message || 'Failed to submit', type: 'error' });
        } finally { setLoading(false); }
    };

    return (
        <div className="page-wrap">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            <Navbar />
            <div className="report-hero">
                <h1><Tag size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Register <span style={{ color: 'var(--primary)' }}>QR Code</span> for Item</h1>
                <p> </p>

            </div>
            <div className="report-form-wrap" style={{ maxWidth: '650px' }}>
                <div className="form-card">
                    <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="form-group">
                            <label>Item Title *</label>
                            <input name="title" className="form-input" placeholder="e.g. Black Leather Wallet" value={form.title} onChange={handle} />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" className="form-input" value={form.category} onChange={handle}>
                                <option value="" disabled>Select category</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>QR Code Number</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={useAutoNumber}
                                    onChange={(e) => setUseAutoNumber(e.target.checked)}
                                />
                                <span>Auto-assign next available number</span>
                            </label>
                        </div>
                        {!useAutoNumber && (
                            <input
                                name="qrCodeNumber"
                                type="number"
                                className="form-input"
                                placeholder="Enter QR Code number (1000-1100)"
                                value={form.qrCodeNumber}
                                onChange={handle}
                                min="1000"
                                max="1100"
                            />
                        )}
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                        <button className="btn btn-outline" onClick={reset}>Reset</button>
                        <button className="btn btn-green" onClick={submit} disabled={loading}>
                            {loading ? 'Registering…' : <><Tag size={18} style={{ marginRight: '8px' }} /> Register & Get QR Code</>}
                        </button>
                    </div>
                </div>
            </div>
            {createdItem && (
                <div className="report-form-wrap" style={{ paddingTop: '0', marginTop: '1rem', maxWidth: '650px' }}>
                    <div className="form-card" style={{ textAlign: 'center' }}>
                        <h3>QR Code Created</h3>
                        <p>Your item has been registered with QR code number <strong>{createdItem.qrCodeNumber}</strong>.</p>
                        {createdItem.qrCode && (
                            <div style={{ display: 'inline-block', padding: '1rem', background: '#fff', borderRadius: '18px', margin: '1rem 0' }}>
                                <img src={createdItem.qrCode} alt="QR Code" style={{ width: '180px', height: '180px' }} />
                            </div>
                        )}
                        <p style={{ marginBottom: '1rem' }}>
                            Link: <code>{`${window.location.origin}/qr/${createdItem.qrCodeNumber}`}</code>
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-outline btn-sm" onClick={copyQrLink}>
                                <Copy size={16} style={{ marginRight: '6px' }} /> Copy QR Link
                            </button>
                            <button className="btn btn-green btn-sm" onClick={() => navigate(`/item/${createdItem._id}`)}>
                                <Eye size={16} style={{ marginRight: '6px' }} /> View Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}