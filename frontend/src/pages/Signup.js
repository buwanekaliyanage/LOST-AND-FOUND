import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validation regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const gmailRegex = /^[a-zA-Z0-9._%-]+@gmail\.com$/;
  const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/; // Sri Lanka format

  // Real-time validation
  const validateField = (name, value) => {
    let error = '';

    if (name === 'fullName' && value.trim().length < 3) {
      error = 'Full name must be at least 3 characters';
    } else if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
      else if (!gmailRegex.test(value)) error = 'Please use a Gmail address';
    } else if (name === 'phone') {
      const cleanPhone = value.replace(/[\s-()]/g, '');
      if (!cleanPhone) error = 'Phone number is required';
      else if (!/^\d{10,15}$/.test(cleanPhone)) error = 'Phone must be 10-15 digits';
      else if (!phoneRegex.test(value)) error = 'Enter a valid phone number (Sri Lanka format: +94 or 0)';
    } else if (name === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (name === 'confirm' && value !== form.password) {
      error = 'Passwords do not match';
    }

    return error;
  };

  const handle = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const submit = async () => {
    const { fullName, email, phone, password, confirm } = form;

    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { fullName, email, phone, password });
      login(data);
      navigate('/');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
    } finally { setLoading(false); }
  };

  const fields = [
    { label: 'Full Name', name: 'fullName', type: 'text', ph: 'Your full name', icon: User },
    { label: 'Email Address', name: 'email', type: 'email', ph: 'you@example.com', icon: Mail },
    { label: 'Phone Number', name: 'phone', type: 'tel', ph: '+94 77 000 0000', icon: Phone },
    { label: 'Password', name: 'password', type: 'password', ph: 'Min. 6 characters', icon: Lock },
    { label: 'Confirm Password', name: 'confirm', type: 'password', ph: 'Repeat your password', icon: Lock },
  ];

  return (
    <div className="auth-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <nav className="auth-nav">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="FINDRA" style={{ height: '40px', objectFit: 'contain' }} />
        </Link>
      </nav>
      <main className="auth-main">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the FINDRA community today</p>
          </div>

          <div className="auth-form">
            {fields.map(f => (
              <div className="auth-input-group" key={f.name}>
                <label>{f.label}</label>
                <div className="auth-input-wrap">
                  <f.icon className="auth-input-icon" size={18} />
                  <input
                    type={f.type}
                    name={f.name}
                    className={`auth-input ${errors[f.name] ? 'input-error' : ''}`}
                    placeholder={f.ph}
                    value={form[f.name]}
                    onChange={handle}
                    onBlur={handleBlur}
                  />
                </div>
                {errors[f.name] && <span className="error-message">{errors[f.name]}</span>}
              </div>
            ))}

            <div className="auth-actions" style={{ marginTop: '0.5rem' }}>
              <button className="btn-auth-primary green" onClick={submit} disabled={loading}>
                {loading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
              </button>
            </div>
          </div>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </main>
      <div className="auth-footer">© 2026 FINDRA | Connecting Communities</div>
    </div>
  );
}
