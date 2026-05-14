import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import { FileText, ShieldCheck, Handshake, Search } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [stats, setStats] = useState({ lost: 0, found: 0, users: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/items?type=lost'),
      api.get('/items?type=found'),
    ]).then(([l, f]) => setStats({ lost: l.data.length, found: f.data.length, users: '100+' })).catch(() => { });
  }, []);

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        {/* Animated floating shapes */}
        <div className="hero-shapes">
          <div className="shape s1" />
          <div className="shape s2" />
          <div className="shape s3" />
          <div className="shape s4" />
        </div>

        <div className="hero-content anim-fade-up">
          <h1 className="hero-h1">
            Lost Something?<br />
            <span className="hero-highlight">Find It Here.</span>
          </h1>
          <p className="hero-sub">
            Sri Lanka's trusted platform to report lost items, share found belongings,
            and reconnect people with what matters most — powered by QR technology.
          </p>
          <div className="hero-btns">
            <Link to="/report-lost" className="btn btn-red">I Have Lost</Link>
            <Link to="/report-found" className="btn btn-green">I Have Found</Link>
          </div>
          <div className="hero-stats">
            <div className="hstat"><span className="hstat-n">{stats.lost}</span><span className="hstat-l">Lost Reports</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-n">{stats.found}</span><span className="hstat-l">Found Reports</span></div>
            <div className="hstat-div" />
            <div className="hstat"><span className="hstat-n">{stats.users}</span><span className="hstat-l">Community Members</span></div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <h2 className="how-title">How It Works</h2>
        <p className="how-sub">Three simple steps to reunite with your belongings</p>
        <div className="how-grid">
          {[
            { icon: <FileText size={32} />, step: '01', title: 'Report a lost or found item', desc: 'Submit a detailed report of your lost or found item with photos.' },
            { icon: <ShieldCheck size={32} />, step: '02', title: 'Prove its yours', desc: 'Provide necessary details or proof of ownership to verify it belongs to you.' },
            { icon: <Handshake size={32} />, step: '03', title: 'Get it back', desc: 'Connect securely through our platform and recover your belongings.' },
          ].map(h => (
            <div className="how-card" key={h.step}>
              <div className="how-icon">{h.icon}</div>
              <div className="how-step">Step {h.step}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <span className="hero-badge"><Search size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Community Lost &amp; Found</span>
          <h2>Ready to Find What's Lost?</h2>
          <p>Join hundreds of Sri Lankans who've already recovered their belongings.</p>
          <div className="hero-btns" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link to="/report-lost" className="btn btn-red">Report Lost Item</Link>
            <Link to="/report-found" className="btn btn-green">Report Found Item</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
