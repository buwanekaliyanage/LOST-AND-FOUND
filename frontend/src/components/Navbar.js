import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

import { Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const navClass = 'navbar light';

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    api.get('/users/notifications').then(({ data }) => {
      setUnread(data.filter(n => !n.isRead).length);
    }).catch(() => { });
  }, [user, location.pathname]);

  const handleAuth = () => {
    if (user) { logout(); navigate('/login'); }
    else navigate('/login');
  };

  return (
    <nav className={navClass}>
      <Link to="/" className="nav-logo">
        <img src="/logo.png" alt="FINDRA" style={{ height: '40px', objectFit: 'contain' }} />
      </Link>

      <ul className="nav-links">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/lost">Lost</NavLink></li>
        <li><NavLink to="/found">Found</NavLink></li>
        <li><NavLink to="/shop">Shop</NavLink></li>
        {user && user.role !== 'admin' && <li><NavLink to="/register">Register QR</NavLink></li>}
        {user && user.role !== 'admin' && <li><NavLink to="/profile">Profile</NavLink></li>}
        {user && user.role === 'admin' && <li><NavLink to="/admin">Dashboard</NavLink></li>}
      </ul>

      <div className="nav-right">
        {user && user.role !== 'admin' && (
          <button className="nav-notif" onClick={() => navigate('/profile?tab=notifications')} title="Notifications">
            <Bell size={20} />
            {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
        )}
        {user
          ? <button className="btn-nav btn-nav-outline" onClick={handleAuth}>Sign Out</button>
          : <>
            <button className="btn-nav btn-nav-outline" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn-nav btn-nav-green" onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        }
      </div>
    </nav>
  );
}
