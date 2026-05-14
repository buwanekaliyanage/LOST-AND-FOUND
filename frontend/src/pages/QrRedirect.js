import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import './ItemDetail.css';

export default function QrRedirect() {
    const { qrNumber } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Looking up item...');

    useEffect(() => {
        const lookup = async () => {
            try {
                const { data } = await api.get(`/items/qr/${qrNumber}`);
                setMessage('Item found! Redirecting...');
                setTimeout(() => {
                    navigate(`/item/${data._id}`);
                }, 800);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Unable to find item for this QR code number.');
            }
        };
        lookup();
    }, [qrNumber, navigate]);

    return (
        <div className="page-wrap">
            <Navbar />
            <div className="item-detail-wrap" style={{ padding: '4rem 2rem' }}>
                <div className="profile-edit-card" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
                    {status === 'loading' ? (
                        <>
                            <h2>🔍 Looking up QR Code #{qrNumber}</h2>
                            <p>{message}</p>
                            <div className="spinner-wrap"><div className="spinner" /></div>
                        </>
                    ) : (
                        <>
                            <h2>⚠️ Item not found</h2>
                            <p>{message}</p>
                            <Link to="/" className="btn btn-outline btn-sm">Go to Home</Link>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
