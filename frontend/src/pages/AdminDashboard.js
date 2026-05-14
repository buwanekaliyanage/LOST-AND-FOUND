import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ClipboardList, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Check,
  X,
  LogOut,
  TrendingUp,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../api';
import './Admin.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]     = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionClaim, setActionClaim] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, uRes, iRes, cRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/items'),
        api.get('/admin/claims'),
      ]);
      setStats(sRes.data); setUsers(uRes.data);
      setItems(iRes.data); setClaims(cRes.data);
    } catch { navigate('/login'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [user, navigate, fetchAll]);

  const deleteUser = async id => {
    if (!window.confirm('Delete this user and all their data?')) return;
    await api.delete(`/admin/users/${id}`).catch(() => {});
    setUsers(p => p.filter(u => u._id !== id));
    setToast({ message: 'User deleted', type: 'success' });
  };

  const deleteItem = async id => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`/items/${id}`).catch(() => {});
    setItems(p => p.filter(i => i._id !== id));
    setToast({ message: 'Item deleted', type: 'success' });
  };

  const handleClaim = async (id, status) => {
    try {
      await api.patch(`/claims/${id}`, { status, adminNote });
      setClaims(p => p.map(c => c._id === id ? { ...c, status, adminNote } : c));
      setActionClaim(null); setAdminNote('');
      setToast({ message: `Claim ${status}!`, type: status === 'approved' ? 'success' : 'error' });
    } catch { setToast({ message: 'Action failed', type: 'error' }); }
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}><div className="spinner" /></div>;

  const STAT_CARDS = [
    { label:'Total Users',     value: stats.totalUsers,   icon: <Users />, color:'#3b82f6' },
    { label:'Lost Reports',    value: stats.totalLost,    icon: <Search />, color:'#ef4444' },
    { label:'Found Reports',   value: stats.totalFound,   icon: <Package />, color:'#22c55e' },
    { label:'Pending Claims',  value: stats.pendingClaims,icon: <Clock />, color:'#f59e0b' },
    { label:'Resolved Items',  value: stats.resolved,     icon: <CheckCircle />, color:'#8b5cf6' },
    { label:'Total Claims',    value: stats.totalClaims,  icon: <ClipboardList />, color:'#06b6d4' },
  ];

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'items', label: 'Items', icon: <Package size={18} /> },
    { id: 'claims', label: 'Claims', icon: <ClipboardList size={18} /> }
  ];

  const getTypeBadge = (item) => {
    if (!item) return null;
    const isActuallyLost = item.type === 'lost' || (item.type === 'registered' && item.isLost);
    const badgeClass = isActuallyLost ? 'badge-lost' : (item.type === 'registered' ? '' : 'badge-found');
    const badgeStyle = item.type === 'registered' && !item.isLost ? {background: '#e0f2fe', color: '#0369a1'} : {};
    const text = isActuallyLost ? 'lost' : item.type;
    return <span className={`card-badge ${badgeClass}`} style={badgeStyle}>{text}</span>;
  };

  return (
    <div className="admin-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-logo">Findra</div>
        <p className="admin-logo-label">Admin Panel</p>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t.id} className={`admin-nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon}
              {' '}{t.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <p>Signed in as<br /><strong>{user?.fullName}</strong></p>
          <button className="btn btn-view-system btn-sm" style={{marginTop:'0.75rem', width:'100%'}}
            onClick={() => navigate('/')}>
            <ExternalLink size={14} /> View System
          </button>
          <button className="btn btn-signout btn-sm" style={{marginTop:'0.5rem', width:'100%'}}
            onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-title-wrap">
            {tab === 'overview' && <LayoutDashboard className="header-icon" />}
            {tab === 'users' && <Users className="header-icon" />}
            {tab === 'items' && <Package className="header-icon" />}
            {tab === 'claims' && <ClipboardList className="header-icon" />}
            <h1 className="admin-title">
              {tab === 'overview' ? 'Dashboard Overview'
                : tab === 'users' ? 'Manage Users'
                : tab === 'items' ? 'Manage Items'
                : 'Manage Claims'}
            </h1>
          </div>
          <span className="admin-date">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            <div className="stats-grid">
              {STAT_CARDS.map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{background: s.color + '20', color: s.color}}>{s.icon}</div>
                  <div>
                    <div className="stat-num">{s.value ?? 0}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="overview-tables">
              <div className="ov-table">
                <h3>Recent Claims to Review</h3>
                {claims.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                  <div className="ov-row" key={c._id}>
                    <span>{c.item?.title}</span>
                    <span className="claim-status pending">pending</span>
                    <button className="btn btn-green btn-sm" onClick={() => { setActionClaim(c); setTab('claims'); }}>Review</button>
                  </div>
                ))}
                {claims.filter(c => c.status === 'pending').length === 0 && <p className="pt-empty">No pending claims 🎉</p>}
              </div>
              <div className="ov-table">
                <h3>Recent Items</h3>
                {items.slice(0,5).map(i => (
                  <div className="ov-row" key={i._id}>
                    <span>{i.title}</span>
                    <span style={{fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px'}}>#{i.qrCodeNumber}</span>
                    {getTypeBadge(i)}
                    <span className="card-date">{new Date(i.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm" style={{background:'#fef2f2', color:'var(--red)', border:'1px solid #fecaca'}} onClick={() => deleteUser(u._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="pt-empty" style={{padding:'2rem'}}>No users found.</p>}
          </div>
        )}

        {/* ── Items ── */}
        {tab === 'items' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>QR Code</th><th>Location</th><th>Reporter</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(i => (
                  <tr key={i._id}>
                    <td><strong>{i.title}</strong></td>
                    <td>{getTypeBadge(i)}</td>
                    <td>{i.category}</td>
                    <td><span style={{fontWeight: 700, color: 'var(--dark)'}}>#{i.qrCodeNumber || '---'}</span></td>
                    <td style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <MapPin size={14} className="text-muted" /> {i.location}
                    </td>
                    <td>{i.user?.fullName}</td>
                    <td>{i.resolved ? <span className="card-badge badge-resolved">Resolved</span> : <span style={{color:'var(--muted)',fontSize:'0.82rem'}}>Active</span>}</td>
                    <td><button className="btn btn-sm" style={{background:'#fef2f2', color:'var(--red)', border:'1px solid #fecaca'}} onClick={() => deleteItem(i._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <p className="pt-empty" style={{padding:'2rem'}}>No items found.</p>}
          </div>
        )}

        {/* ── Claims ── */}
        {tab === 'claims' && (
          <div>
            {claims.map(c => (
              <div className="claim-review-card" key={c._id}>
                <div className="crc-header">
                  <div>
                    <p className="crc-item">{c.item?.title} {getTypeBadge(c.item)}</p>
                    <p className="crc-loc"><MapPin size={14} /> {c.item?.location}</p>
                  </div>
                  <span className={`claim-status ${c.status}`}>{c.status}</span>
                </div>
                <div className="crc-body">
                  <p><strong>Claimant:</strong> {c.claimant?.fullName} ({c.claimant?.email})</p>
                  <p><strong>Phone:</strong> {c.claimant?.phone}</p>
                  <p><strong>Evidence:</strong> {c.evidence}</p>
                  {c.adminNote && <p><strong>Admin note:</strong> {c.adminNote}</p>}
                </div>
                {c.status === 'pending' && (
                  <div className="crc-actions">
                    <input className="form-input" placeholder="Admin note (optional)"
                      value={actionClaim?._id === c._id ? adminNote : ''}
                      onChange={e => { setActionClaim(c); setAdminNote(e.target.value); }} />
                    <div style={{display:'flex', gap:'0.75rem'}}>
                      <button className="btn btn-green btn-sm" style={{display:'flex', alignItems:'center', gap:'4px'}} onClick={() => handleClaim(c._id, 'approved')}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn btn-sm" style={{background:'#fef2f2', color:'var(--red)', border:'1px solid #fecaca', display:'flex', alignItems:'center', gap:'4px'}}
                        onClick={() => handleClaim(c._id, 'rejected')}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {claims.length === 0 && <p className="pt-empty" style={{padding:'2rem'}}>No claims found.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
