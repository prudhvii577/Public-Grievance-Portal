import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackError, setTrackError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setTrackError('Please enter a valid Grievance Tracking ID');
      return;
    }
    setTrackError('');
    navigate(`/complaints/${encodeURIComponent(trackingId.trim())}`);
  };

  const categories = [
    { name: 'Road Damage', icon: '🛣️', desc: 'Potholes, broken roads, damaged dividers, and sidewalk cave-ins.' },
    { name: 'Water Supply Issues', icon: '🚰', desc: 'Pipe bursts, contaminated tap water, low pressure, or supply disruption.' },
    { name: 'Garbage Collection', icon: '🗑️', desc: 'Overflowing dustbins, unattended roadside heaps, and irregular pickups.' },
    { name: 'Drainage Problems', icon: '🌊', desc: 'Waterlogging, clogged stormwater lines, or overflowing sewage drains.' },
    { name: 'Streetlight Issues', icon: '💡', desc: 'Non-functional streetlights, dangerous dark stretches, or pole damage.' },
    { name: 'Electricity Problems', icon: '⚡', desc: 'Transformer sparking, dangling wires, or municipal supply faults.' },
    { name: 'Public Sanitation', icon: '🧼', desc: 'Unsanitary public restrooms, stagnant water, and pest breeding sites.' },
    { name: 'Other Civic Issues', icon: '🏛️', desc: 'Footpath encroachments, municipal tree trimming, and noise hazards.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-badge">OFFICIAL CIVIC REDRESSAL SYSTEM</div>
          <h1 className="hero-heading">
            Empowering Citizens for a <span style={{ color: '#ffedd5' }}>Cleaner, Safer & Better</span> City
          </h1>
          <p className="hero-subtext">
            Submit your grievances directly to municipal authorities. Track real-time progress, receive official departmental remarks, and confirm resolutions transparently.
          </p>

          {/* Grievance Quick Tracking Form */}
          <div className="hero-track-box">
            <form onSubmit={handleTrackSubmit} className="track-form">
              <div className="track-input-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Enter Grievance Tracking ID (e.g. PGRP-202611-CFBB2)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="track-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ backgroundColor: '#0f3e6d' }}>
                Track Status
              </button>
            </form>
            {trackError && <p style={{ color: '#dc2626', fontSize: '0.825rem', marginTop: '0.5rem', textAlign: 'left' }}>{trackError}</p>}
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'left' }}>
              💡 Hint: You can test with sample ID: <strong>PGRP-202611-CFBB2</strong> or <strong>PGRP-202611-283C1</strong>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex items-center justify-center gap-4" style={{ marginTop: '1.75rem' }}>
            {isAuthenticated ? (
              <Link to={getDashboardPath(user?.role)} className="btn btn-primary btn-lg" style={{ backgroundColor: '#ff9933', color: '#000', fontWeight: 700 }}>
                Go to My Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" style={{ backgroundColor: '#ff9933', color: '#000', fontWeight: 700 }}>
                  Lodge a Grievance Now
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#0f3e6d', fontWeight: 600 }}>
                  Official Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Key Metrics Ribbon */}
      <section style={{ backgroundColor: '#0c2340', color: '#fff', padding: '1.75rem 0', borderBottom: '3px solid #ff9933' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38bdf8' }}>98.4%</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Grievance Resolution Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#34d399' }}>48 Hours</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Average First-Response SLA</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fbbf24' }}>6 Depts</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Integrated Municipal Boards</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f472b6' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Transparent Public Audit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', marginBottom: '0.5rem' }}>
              CIVIC SERVICES
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              Report Civic Issues Across 8 Core Categories
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.5rem' }}>
              Every complaint is tagged directly to responsible department engineers for swift physical inspection and resolution.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {categories.map((c, i) => (
              <div key={i} className="card category-card">
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f3e6d', marginBottom: '0.35rem' }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.5 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ backgroundColor: '#f1f5f9', padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', marginBottom: '0.5rem' }}>
              TRANSPARENT PROCESS
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              How the Grievance Redressal System Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.5rem' }}>
              Step-by-step lifecycle from citizen submission to physical inspection and verified closure.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', title: 'Lodge Grievance', desc: 'Select category, pinpoint location, describe issue & attach evidence photos.' },
              { step: '02', title: 'Automated / Admin Triage', desc: 'System routes issue to the responsible municipal department and engineer.' },
              { step: '03', title: 'Field Action & Progress', desc: 'Officers update live progress remarks, dispatch work crews, and resolve issue.' },
              { step: '04', title: 'Citizen Audit & Feedback', desc: 'Citizen verifies the fix, rates service quality, or reopens if dissatisfied.' },
            ].map((st, idx) => (
              <div key={idx} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#cbd5e1', position: 'absolute', top: '10px', right: '15px' }}>
                  {st.step}
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0f3e6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '1rem' }}>
                  {st.step}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>{st.title}</h4>
                <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.5 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Roles Overview */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="badge badge-role-citizen" style={{ marginBottom: '0.75rem' }}>CITIZEN PORTAL</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>For Citizens</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1rem' }}>
                Submit civic complaints, upload photo evidence, receive automated tracking IDs, and verify municipal repair work.
              </p>
              <Link to="/register" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Register Free Account →
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
              <div className="badge badge-role-officer" style={{ marginBottom: '0.75rem' }}>OFFICER DESK</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Department Officers</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1rem' }}>
                Access department work queue, inspect photos, log technical remarks, update field status, and mark repairs resolved.
              </p>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Officer Sign In →
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid #6d28d9' }}>
              <div className="badge badge-role-admin" style={{ marginBottom: '0.75rem' }}>ADMINISTRATION</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Municipal Administrators</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginBottom: '1rem' }}>
                City-wide grievance monitoring, department workload analytics, SLA compliance reports, and officer management.
              </p>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Admin Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0c2340', color: '#94a3b8', padding: '2.5rem 0 1.5rem 0', marginTop: 'auto' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Public Grievance Redressal Portal</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>National Civic Complaint & Urban Infrastructure Redressal Authority</div>
            </div>
            <div className="flex items-center gap-4" style={{ fontSize: '0.825rem' }}>
              <Link to="/" style={{ color: '#cbd5e1' }}>Citizen Charter</Link>
              <Link to="/" style={{ color: '#cbd5e1' }}>Privacy Policy</Link>
              <Link to="/" style={{ color: '#cbd5e1' }}>Terms of Service</Link>
              <Link to="/" style={{ color: '#cbd5e1' }}>Department Directory</Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1.5rem', color: '#64748b' }}>
            © 2026 Public Grievance Redressal Portal. Content Owned, Maintained & Updated by Municipal Governance Directorate.
          </div>
        </div>
      </footer>

      <style>{`
        .hero-banner {
          background: linear-gradient(135deg, #0c2340 0%, #0f3e6d 50%, #1a56db 100%);
          color: #fff;
          padding: 4.5rem 0 3.5rem 0;
          text-align: center;
          position: relative;
        }
        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          color: #ffedd5;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 1rem;
        }
        .hero-heading {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          max-width: 860px;
          margin: 0 auto 1.25rem auto;
          letter-spacing: -0.5px;
        }
        .hero-subtext {
          font-size: 1.05rem;
          color: #cbd5e1;
          max-width: 720px;
          margin: 0 auto 2rem auto;
          line-height: 1.6;
        }
        .hero-track-box {
          background: #ffffff;
          padding: 1.25rem;
          border-radius: 14px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
          max-width: 680px;
          margin: 0 auto;
        }
        .track-form {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .track-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.4rem 0.85rem;
        }
        .track-input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
        }
        .category-card {
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: #3b82f6;
        }
        @media (max-width: 640px) {
          .hero-heading { font-size: 1.85rem; }
          .track-form { flex-direction: column; }
          .track-input-wrap { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
