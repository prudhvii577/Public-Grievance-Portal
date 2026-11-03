import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0f3e6d', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0110 0v4"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Sign In to Portal</h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              Access Citizen, Department Officer, or Administrator Console
            </p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* One-Click Demo Role Switcher */}
          <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Quick Demo Credentials (Click to fill)
            </div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('citizen.ramesh@gmail.com', 'Citizen@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('officer.roads@pgrp.gov.in', 'Officer@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                🛠️ Roads Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@pgrp.gov.in', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                🛡️ Administrator
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            New to the portal?{' '}
            <Link to="/register" style={{ color: '#1a56db', fontWeight: 600 }}>
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
