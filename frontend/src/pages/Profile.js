import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Edit2, Trash2, QrCode, Bell, CheckCircle, XCircle, Smartphone, MapPin, Calendar, Circle, AlertCircle } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'items';

  const [tab, setTab]         = useState(defaultTab);
  const [profile, setProfile] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [delItemId, setDelItemId]   = useState(null);
  const [editForm, setEditForm]     = useState({ fullName:'', email:'', phone:'', password:'' });

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, iRes, cRes, nRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/items/user/me'),
        api.get('/claims/my'),
        api.get('/users/notifications'),
      ]);
      setProfile(pRes.data);
      setMyItems(iRes.data);
      setMyClaims(cRes.data);
      setNotifs(nRes.data);
      setEditForm({ fullName: pRes.data.fullName, email: pRes.data.email, phone: pRes.data.phone, password:'' });
    } catch { navigate('/login'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const initials = n => n ? n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?';

  const saveProfile = async () => {
    try {
      const payload = { fullName: editForm.fullName, email: editForm.email, phone: editForm.phone };
      if (editForm.password) payload.password = editForm.password;
      const { data } = await api.put('/users/me', payload);
      updateUser(data); setProfile(p => ({ ...p, ...data }));
      setShowEdit(false); setToast({ message:'Profile updated!', type:'success' });
    } catch (err) { setToast({ message: err.response?.data?.message || 'Update failed', type:'error' }); }
  };

  const deleteItem = async id => {
    try {
      await api.delete(`/items/${id}`);
      setMyItems(p => p.filter(i => i._id !== id));
      setDelItemId(null); setToast({ message:'Report deleted', type:'success' });
    } catch { setToast({ message:'Delete failed', type:'error' }); }
  };

  const toggleLost = async id => {
    try {
      const { data } = await api.patch(`/items/${id}/lost`);
      setMyItems(p => p.map(i => i._id === id ? data : i));
      setToast({ message: data.isLost ? 'Item marked as lost!' : 'Item marked as found!', type: 'success' });
    } catch { setToast({ message:'Update failed', type:'error' }); }
  };

  const deleteAccount = async () => {
    try { await api.delete('/users/me'); logout(); navigate('/'); }
    catch { setToast({ message:'Failed to delete account', type:'error' }); }
  };

  const markAllRead = async () => {
    await api.patch('/users/notifications/read-all').catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <div className="page-wrap"><Navbar /><div className="spinner-wrap"><div className="spinner" /></div></div>;

  const registeredItems = myItems.filter(i => i.type === 'registered');
  const lostItems  = myItems.filter(i => i.type === 'lost' || (i.type === 'registered' && i.isLost));
  const foundItems = myItems.filter(i => i.type === 'found');
  const unread = notifs.filter(n => !n.isRead).length;

  const TABS = [
    { id:'items',         label:'My Items' },
    { id:'reports',       label:'My Reports' },
    { id:'claims',        label:'My Claims' },
    { id:'notifications', label:`Notifications ${unread > 0 ? `(${unread})` : ''}` },
  ];

  return (
    <div className="page-wrap">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Navbar />

      <main className="profile-main">
        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">{initials(profile?.fullName)}</div>
          <h2 className="profile-name">{profile?.fullName}</h2>
          <p className="profile-email">{profile?.email}</p>
          <p className="profile-phone">{profile?.phone}</p>

          <div className="profile-stats">
            <div className="pstat"><span className="pstat-n">{registeredItems.length}</span><span className="pstat-l">Items</span></div>
            <div className="pstat-div" />
            <div className="pstat"><span className="pstat-n">{profile?.lostCount || lostItems.length}</span><span className="pstat-l">Lost</span></div>
            <div className="pstat-div" />
            <div className="pstat"><span className="pstat-n">{profile?.foundCount || foundItems.length}</span><span className="pstat-l">Found</span></div>
            <div className="pstat-div" />
            <div className="pstat"><span className="pstat-n">{myClaims.length}</span><span className="pstat-l">Claims</span></div>
          </div>

          <button className="btn btn-dark btn-sm" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}} onClick={() => setShowEdit(s => !s)}>
            {showEdit ? 'Cancel Edit' : <><Edit2 size={16} /> Edit Profile</>}
          </button>
          <button className="btn btn-outline btn-sm" style={{width:'100%', color:'var(--red)', borderColor:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'0.5rem'}}
            onClick={() => setConfirmDel(true)}>
            <Trash2 size={16} /> Delete Account
          </button>
        </aside>

        {/* ── Content ── */}
        <section className="profile-content">
          {/* Edit form */}
          {showEdit && (
            <div className="profile-edit-card">
              <h3>Edit Profile</h3>
              <div className="form-row">
                {[
                  { label:'Full Name', key:'fullName', type:'text' },
                  { label:'Email', key:'email', type:'email' },
                  { label:'Phone', key:'phone', type:'tel' },
                  { label:'New Password', key:'password', type:'password', ph:'Leave blank to keep current' },
                ].map(f => (
                  <div className="form-group" key={f.key}>
                    <label>{f.label}</label>
                    <input type={f.type} className="form-input" placeholder={f.ph || ''}
                      value={editForm[f.key]} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setShowEdit(false)}>Cancel</button>
                <button className="btn btn-green btn-sm" onClick={saveProfile}>Save Changes</button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="profile-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`ptab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Items Tab ── */}
          {tab === 'items' && (
            <div>
              <h3 className="pt-title">My Registered Items ({registeredItems.length})</h3>
              {registeredItems.length === 0 ? <p className="pt-empty">No items registered yet.</p> : (
                <div className="report-list">
                  {registeredItems.map(item => (
                    <RegisteredItemCard key={item._id} item={item} onDelete={() => setDelItemId(item._id)} onToggleLost={toggleLost} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Reports Tab ── */}
          {tab === 'reports' && (
            <div>
              <h3 className="pt-title">Lost Reports ({lostItems.length})</h3>
              {lostItems.length === 0 ? <p className="pt-empty">No lost reports yet.</p> : (
                <div className="report-list">
                  {lostItems.map(item => (
                    <ReportCard key={item._id} item={item} type="lost" onDelete={() => setDelItemId(item._id)} />
                  ))}
                </div>
              )}
              <h3 className="pt-title" style={{marginTop:'2rem'}}>Found Reports ({foundItems.length})</h3>
              {foundItems.length === 0 ? <p className="pt-empty">No found reports yet.</p> : (
                <div className="report-list">
                  {foundItems.map(item => (
                    <ReportCard key={item._id} item={item} type="found" onDelete={() => setDelItemId(item._id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Claims Tab ── */}
          {tab === 'claims' && (
            <div>
              <h3 className="pt-title">My Ownership Claims ({myClaims.length})</h3>
              {myClaims.length === 0 ? <p className="pt-empty">You haven't submitted any claims yet.</p> : (
                <div className="report-list">
                  {myClaims.map(claim => (
                    <div className="claim-card" key={claim._id}>
                      <div className="claim-header">
                        <span className={`claim-status ${claim.status}`}>{claim.status}</span>
                        <span className="card-date">{new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="claim-item-title">{claim.item?.title}</p>
                      <p className="claim-type">
                        {claim.item?.type === 'lost' 
                          ? <Circle size={10} fill="var(--red)" color="var(--red)" style={{marginRight:'5px'}} /> 
                          : <Circle size={10} fill="var(--green)" color="var(--green)" style={{marginRight:'5px'}} />
                        }
                        {claim.item?.type === 'lost' ? 'Lost Item' : 'Found Item'} · {claim.item?.location}
                      </p>
                      <p className="claim-evidence"><strong>Your evidence:</strong> {claim.evidence}</p>
                      {claim.adminNote && <p className="claim-note"><strong>Admin note:</strong> {claim.adminNote}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {tab === 'notifications' && (
            <div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem'}}>
                <h3 className="pt-title" style={{margin:0}}>Notifications ({notifs.length})</h3>
                {unread > 0 && (
                  <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>
                )}
              </div>
              {notifs.length === 0 ? <p className="pt-empty">No notifications yet.</p> : (
                <div className="notif-list">
                  {notifs.map((n, i) => (
                    <div className={`notif-item ${!n.isRead ? 'unread' : ''}`} key={i}>
                      <div className="notif-icon">
                        {n.type === 'qr_scan' ? <Smartphone size={18} /> : n.type === 'claim_approved' ? <CheckCircle size={18} color="var(--green)" /> : n.type === 'claim_rejected' ? <XCircle size={18} color="var(--red)" /> : <Bell size={18} />}
                      </div>
                      <div className="notif-body">
                        <p>{n.message}</p>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Delete item confirm */}
      {delItemId && (
        <div className="modal-overlay" onClick={() => setDelItemId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Report?</h3>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setDelItemId(null)}>Cancel</button>
              <button className="btn btn-red btn-sm" onClick={() => deleteItem(delItemId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirm */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p>All your data, reports, and claims will be permanently deleted. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setConfirmDel(false)}>Cancel</button>
              <button className="btn btn-red btn-sm" onClick={deleteAccount}>Yes, Delete Everything</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ReportCard({ item, type, onDelete }) {
  return (
    <div className={`report-row-card ${type}`}>
      <div className="rrc-left">
        <span className={`card-badge ${type === 'lost' ? 'badge-lost' : 'badge-found'}`}>{type}</span>
        {item.resolved && <span className="card-badge badge-resolved" style={{marginLeft:'0.4rem'}}>Resolved</span>}
        <p className="rrc-title">{item.title}</p>
        <p className="rrc-meta">
          <MapPin size={14} style={{verticalAlign:'middle', marginRight:'4px'}} /> {item.location} · 
          <Calendar size={14} style={{verticalAlign:'middle', marginLeft:'8px', marginRight:'4px'}} /> {new Date(item.date).toLocaleDateString()}
        </p>
        <p className="rrc-desc">{item.description}</p>
      </div>
      <div className="rrc-right">
        <button className="btn btn-sm" style={{background:'#fff0f0', color:'var(--red)', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}
          onClick={onDelete}><Trash2 size={14} /> Delete</button>
      </div>
    </div>
  );
}

function RegisteredItemCard({ item, onDelete, onToggleLost }) {
  const qrUrl = `${window.location.origin}/item/${item._id}`;
  const [showQR, setShowQR] = useState(false);
  return (
    <div className={`report-row-card`}>
      <div className="rrc-left">
        <span className="card-badge" style={{background: '#e0f2fe', color: '#0369a1'}}>Registered</span>
        {item.isLost && <span className="card-badge badge-lost" style={{marginLeft:'0.4rem'}}>Marked as Lost</span>}
        <p className="rrc-title">{item.title}</p>
        <p className="rrc-meta">Category: {item.category}</p>
        <p className="rrc-meta">QR Code Number: {item.qrCodeNumber}</p>
      </div>
      <div className="rrc-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <button className={`btn btn-sm ${item.isLost ? 'btn-green' : 'btn-red'}`} style={{margin: '0 0 0.4rem 0', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}} onClick={() => onToggleLost(item._id)}>
          {item.isLost ? <><CheckCircle size={16} /> Found It!</> : <><AlertCircle size={16} /> Mark as Lost</>}
        </button>
        <button className="btn btn-outline btn-sm" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}} onClick={() => setShowQR(s => !s)}>
          {showQR ? 'Hide QR' : <><QrCode size={16} /> QR Code</>}
        </button>
        {showQR && (
          <div style={{marginTop:'0.75rem', textAlign:'center'}}>
            <QRCodeSVG value={qrUrl} size={120} />
            <p style={{fontSize:'0.72rem', color:'var(--muted)', marginTop:'0.4rem'}}>Scan to view item</p>
          </div>
        )}
        <button className="btn btn-sm" style={{background:'#fff0f0', color:'var(--red)', border:'1px solid #fecaca', marginTop:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}
          onClick={onDelete}><Trash2 size={14} /> Delete</button>
      </div>
    </div>
  );
}
