import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      {/* Top Civic Tricolor & Helpline Ribbon */}
      <div className="gov-top-ribbon">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="gov-flag-bar"></span>
            <span className="gov-top-text">भारत सरकार | Government of India - Public Grievance Portal</span>
          </div>
          <div className="flex items-center gap-4 gov-top-links">
            <span>Toll-Free Helpline: <strong>1800-11-4000</strong></span>
            <span>|</span>
            <Link to="/">Emergency Civic Response</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="container flex items-center justify-between">
          <Link to="/" className="brand-logo flex items-center gap-3">
            <div className="logo-emblem">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f3e6d' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div className="brand-title">Public Grievance Redressal Portal</div>
              <div className="brand-subtitle">Centralized Civic Complaint Resolution Platform</div>
            </div>
          </Link>

          <div className="nav-actions flex items-center gap-4">
            <Link to="/" className="nav-link">Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath(user?.role)} className="nav-link">
                  Dashboard
                </Link>
                {user?.role === 'citizen' && (
                  <Link to="/citizen/submit-complaint" className="btn btn-primary btn-sm">
                    + Lodge Grievance
                  </Link>
                )}
                
                <div className="user-dropdown-container flex items-center gap-3">
                  <Link to="/profile" className="user-pill flex items-center gap-2">
                    <div className="user-avatar-circle">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="user-meta">
                      <div className="user-name">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</div>
                      <span className={`badge badge-role-${user?.role}`}>{user?.role}</span>
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register as Citizen
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        .site-header {
          background-color: #fff;
          border-bottom: 2px solid #0f3e6d;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .gov-top-ribbon {
          background-color: #0c2340;
          color: #e2e8f0;
          font-size: 0.75rem;
          padding: 0.35rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .gov-flag-bar {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 2px;
          background: linear-gradient(to bottom, #ff9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%);
        }
        .gov-top-text {
          font-weight: 500;
        }
        .gov-top-links a:hover {
          text-decoration: underline;
        }
        .main-nav {
          padding: 0.75rem 0;
        }
        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f3e6d;
          letter-spacing: -0.3px;
        }
        .brand-subtitle {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }
        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: #334155;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .nav-link:hover {
          color: #0f3e6d;
          background-color: #f1f5f9;
        }
        .user-pill {
          padding: 0.3rem 0.6rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
        }
        .user-avatar-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #0f3e6d;
          color: white;
          font-weight: 700;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name {
          font-size: 0.825rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.1;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
