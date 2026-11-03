import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ title, subtitle, actions, children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="app-layout" style={{ flex: 1 }}>
        <Sidebar />
        <main className="main-content">
          {(title || actions) && (
            <div className="topbar">
              <div>
                {title && <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{title}</h1>}
                {subtitle && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          <div className="page-body">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
