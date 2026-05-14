import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import api from '../api';
import { Search, X, Camera, MapPin, Tag, Plus, Package } from 'lucide-react';
import './Items.css';

const CATEGORIES = ['Phone','Wallet','Keys','Bag','Laptop','ID Card','Jewelry','Other'];
const LOCATIONS  = ['Kandy','Colombo','Galle','Matara','Jaffna','Negombo','Kurunegala','Other'];

export default function Found() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [query, setQuery]     = useState('');
  const [catFilter, setCat]   = useState('');
  const [locFilter, setLoc]   = useState('');
  const [selected, setSelected] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: 'found' };
      if (query)     params.search   = query;
      if (catFilter) params.category = catFilter;
      if (locFilter) params.location = locFilter;
      const { data } = await api.get('/items', { params });
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [query, catFilter, locFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const initials = n => n ? n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?';

  return (
    <div className="page-wrap">
      <Navbar />
      <div className="items-hero items-hero-found">
        <div className="items-hero-bg" />
        <div className="items-hero-content">
          <h1><span className="text-green">Found</span> Items</h1>
          <p>Browse items that have been found. Is one of these yours? Submit a claim to recover it.</p>
          <div className="search-bar">
            <Search size={18} />
            <input className="search-input" placeholder="Search by name, description…"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setQuery(search)} />
            <button className="search-btn" onClick={() => setQuery(search)}>Search</button>
            <Link to="/report-found" className="btn btn-green btn-sm" style={{borderRadius:'999px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'4px'}}>
              <Plus size={16} /> Report
            </Link>
          </div>
          <div className="filter-row">
            <select className="filter-select" value={catFilter} onChange={e => setCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={locFilter} onChange={e => setLoc(e.target.value)}>
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            {(catFilter || locFilter || query) && (
              <button className="filter-clear" onClick={() => { setCat(''); setLoc(''); setQuery(''); setSearch(''); }}>
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="items-section">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon"><Package size={48} /></div>
            <p>No found items match your search.</p>
            <Link to="/report-found" className="btn btn-green btn-sm" style={{marginTop:'1rem'}}>Report a Found Item</Link>
          </div>
        ) : (
          <div className="cards-grid">
            {items.map(item => (
              <div className="item-card" key={item._id}>
                <div className="card-img">
                  {item.image
                    ? <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                    : <Camera size={48} color="#ccc" />}
                </div>
                <div className="card-body">
                  <span className="card-badge badge-found">Found</span>
                  {item.resolved && <span className="card-badge badge-resolved" style={{marginLeft:'0.4rem'}}>Resolved</span>}
                  <div className="card-meta">
                    <div className="card-avatar found">{initials(item.user?.fullName)}</div>
                    <span className="card-reporter">{item.user?.fullName}</span>
                    <span className="card-date">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <p className="card-title-text">{item.title}</p>
                  <p className="card-location">
                    <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {item.location} &nbsp;·&nbsp; 
                    <Tag size={14} style={{ verticalAlign: 'middle', marginLeft: '4px', marginRight: '4px' }} /> {item.category}
                  </p>
                  <p className="card-desc">
                    {item.description?.includes('registered item') && item.description?.includes('QR Code #') 
                      ? '' 
                      : item.description}
                  </p>
                  <div className="card-footer-row">
                    <button className="btn btn-dark btn-sm" style={{flex:1}} onClick={() => setSelected(item)}>
                      Contact
                    </button>
                    <Link to={`/item/${item._id}`} className="btn btn-outline btn-sm" style={{flex:1, textAlign:'center'}}>
                      View & Claim
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && <ContactModal item={selected} onClose={() => setSelected(null)} />}
      <Footer />
    </div>
  );
}
