import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.email || !form.password)
      return setToast({ message: 'Please fill in all fields', type: 'error' });
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <nav className="auth-nav">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="FINDRA" style={{ height: '40px', objectFit: 'contain' }} />
        </Link>
      </nav>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your FINDRA account</p>
          </div>

          <div className="auth-form">
            <div className="auth-input-group">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" size={18} />
                <input name="email" type="email" className="auth-input" placeholder="you@example.com"
                  value={form.email} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" size={18} />
                <input name="password" type="password" className="auth-input" placeholder="••••••••"
                  value={form.password} onChange={handle} onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
            </div>

            <div className="auth-actions">
              <button className="btn-auth-primary" onClick={submit} disabled={loading}>
                {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
              </button>
              
              <div className="auth-divider">
                <span>Or</span>
              </div>

              <button className="btn-auth-outline" onClick={() => navigate('/signup')}>
                Create New Account
              </button>
            </div>
          </div>

          <p className="auth-link">
            Forgot password? <Link to="/contact">Contact Support</Link>
          </p>
        </div>
      </main>
      <div className="auth-footer">© 2026 FINDRA | Connecting Communities</div>
    </div>
  );
}
