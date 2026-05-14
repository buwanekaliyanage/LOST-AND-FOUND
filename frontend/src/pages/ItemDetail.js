import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './ItemDetail.css';

import { Smartphone, ArrowLeft, Camera, Tag, MapPin, Calendar, User, Mail, Phone, ClipboardList, Star, Copy } from 'lucide-react';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [evidence, setEvidence] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(({ data }) => setItem(data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    // Record QR scan visit (if came via QR link)
    const isQRVisit = document.referrer === '' || document.referrer.includes('localhost');
    if (isQRVisit) {
      api.post(`/items/${id}/qr-scan`).then(() => setScanned(true)).catch(() => { });
    }
  }, [id, navigate]);

  const submitClaim = async () => {
    if (!user) return navigate('/login');
    if (!evidence.trim()) return setToast({ message: 'Please describe your evidence of ownership', type: 'error' });
    try {
      setClaiming(true);
      await api.post('/claims', { itemId: id, evidence });
      setToast({ message: 'Claim submitted! Admin will review it shortly.', type: 'success' });
      setShowClaim(false);
      setEvidence('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit claim', type: 'error' });
    } finally { setClaiming(false); }
  };

  const qrUrl = `${window.location.origin}/item/${id}`;
  const qrNumberUrl = item?.qrCodeNumber ? `${window.location.origin}/qr/${item.qrCodeNumber}` : qrUrl;

  const copyQrLink = () => {
    const link = qrNumberUrl;
    navigator.clipboard.writeText(link);
    setToast({ message: 'QR link copied to clipboard!', type: 'success' });
  };

  if (loading) return (
    <div className="page-wrap"><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></div>
  );
  if (!item) return null;

  const isOwner = user && item.user?._id === user._id;

  return (
    <div className="page-wrap">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Navbar />

      {scanned && (
        <div className="qr-scan-banner">
          <Smartphone size={18} /> QR Code scanned! The owner has been notified.
        </div>
      )}

      <div className="item-detail-wrap">
        <Link to={item.type === 'lost' ? '/lost' : (item.type === 'found' ? '/found' : '/profile?tab=items')} className="back-link">
          <ArrowLeft size={16} /> Back to {item.type === 'lost' ? 'Lost' : (item.type === 'found' ? 'Found' : 'My')} Items
        </Link>

        <div className="item-detail-grid">
          {/* Left: Image */}
          <div className="detail-image-col">
            <div className="detail-img-box">
              {item.image
                ? <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                : <div className="detail-img-placeholder"><Camera size={48} color="#ccc" /><p>No photo provided</p></div>}
            </div>
            {/* QR Code - Hide for lost items */}
            {item.type === 'registered' && !item.isLost && item.type !== 'lost' && item.type !== 'found' && (
              <div className="qr-box">
                <h4><Smartphone size={18} style={{verticalAlign:'middle', marginRight:'8px'}} /> QR Code</h4>
                <p>Scan to instantly view &amp; report this item</p>
                <div className="qr-code-wrap">
                  <QRCodeSVG value={qrNumberUrl} size={180} level="H"
                    imageSettings={{ src: '', x: undefined, y: undefined, height: 24, width: 24, excavate: true }} />
                </div>
                {item.qrCodeNumber && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'var(--dark2)' }}>
                    QR Number: <strong>{item.qrCodeNumber}</strong>
                  </p>
                )}
                <button className="btn btn-outline btn-sm" onClick={copyQrLink} style={{ marginTop: '0.75rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%' }}>
                  <Copy size={16} /> Copy QR Link
                </button>
                <p className="qr-hint">Anyone who scans this will see item details and can notify the owner.</p>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="detail-info-col">
            <div className="detail-badges">
              <span className={`card-badge ${item.type === 'lost' ? 'badge-lost' : (item.type === 'registered' ? '' : 'badge-found')}`} style={item.type === 'registered' ? { background: '#e0f2fe', color: '#0369a1' } : {}}>
                {item.type === 'lost' ? 'Lost' : (item.type === 'registered' ? 'Registered' : 'Found')}
              </span>
              {item.type === 'registered' && item.isLost && <span className="card-badge badge-lost" style={{ marginLeft: '0.4rem' }}>Marked as Lost</span>}
              {item.resolved && <span className="card-badge badge-resolved">Resolved</span>}
            </div>

            <h1 className="detail-title">{item.title}</h1>

            <div className="detail-meta-grid">
              <div className="dmeta"><span className="dmeta-label">Category</span><span className="dmeta-val"><Tag size={14} style={{marginRight:'6px', verticalAlign:'middle'}} /> {item.category}</span></div>
              <div className="dmeta"><span className="dmeta-label">Location</span><span className="dmeta-val"><MapPin size={14} style={{marginRight:'6px', verticalAlign:'middle'}} /> {item.location}</span></div>
              <div className="dmeta"><span className="dmeta-label">Date</span><span className="dmeta-val"><Calendar size={14} style={{marginRight:'6px', verticalAlign:'middle'}} /> {new Date(item.date).toLocaleDateString()}</span></div>
              <div className="dmeta"><span className="dmeta-label">Reported by</span><span className="dmeta-val"><User size={14} style={{marginRight:'6px', verticalAlign:'middle'}} /> {item.user?.fullName}</span></div>
            </div>

            <div className="detail-desc">
              <h4>Description</h4>
              <p>{item.description}</p>
            </div>

            <div className="detail-contact">
              <h4>Reporter Contact</h4>
              <p><Mail size={14} style={{marginRight:'8px', verticalAlign:'middle'}} /> <a href={`mailto:${item.user?.email}`}>{item.user?.email}</a></p>
              <p><Phone size={14} style={{marginRight:'8px', verticalAlign:'middle'}} /> <a href={`tel:${item.user?.phone}`}>{item.user?.phone}</a></p>
            </div>

            {/* Actions */}
            {!isOwner && !item.resolved && (
              <div className="detail-actions">
                {!showClaim ? (
                  <button className="btn btn-green" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}} onClick={() => user ? setShowClaim(true) : navigate('/login')}>
                    <ClipboardList size={18} /> Submit Ownership Claim
                  </button>
                ) : (
                  <div className="claim-form">
                    <h4>Submit Your Claim</h4>
                    <p>Describe evidence that proves this item belongs to you (unique marks, contents, purchase receipt, etc.)</p>
                    <textarea className="form-input form-textarea" rows={4}
                      placeholder="e.g. My wallet has a scratch on the left corner, and contains a Sampath Bank card with my name…"
                      value={evidence} onChange={e => setEvidence(e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowClaim(false)}>Cancel</button>
                      <button className="btn btn-green btn-sm" onClick={submitClaim} disabled={claiming}>
                        {claiming ? 'Submitting…' : 'Submit Claim'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOwner && (
              <div className="owner-note">
                <span><Star size={16} fill="currentColor" style={{marginRight:'8px', verticalAlign:'middle'}} /> You reported this item</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
