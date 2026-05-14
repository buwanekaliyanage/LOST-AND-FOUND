import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, User, MapPin, Eye, X } from 'lucide-react';

export default function ContactModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}><Phone size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Contact Reporter</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>
        <p><strong>Item:</strong> {item.title} ({item.category})</p>
        <p><User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> <strong>Reported by:</strong> {item.user?.fullName}</p>
        <p><Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> <strong>Email:</strong> <a href={`mailto:${item.user?.email}`}>{item.user?.email}</a></p>
        <p><Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> <strong>Phone:</strong> <a href={`tel:${item.user?.phone}`}>{item.user?.phone}</a></p>
        <p><MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> <strong>Location:</strong> {item.location}</p>
        <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
        <div className="modal-actions">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          <Link to={`/item/${item._id}`} className="btn btn-green btn-sm" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={16} /> View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
