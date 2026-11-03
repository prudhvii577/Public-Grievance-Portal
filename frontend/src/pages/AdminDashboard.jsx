import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_citizens: 0,
    total_officers: 0,
    total_departments: 0,
    total_complaints: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [priorityBreakdown, setPriorityBreakdown] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getStats();
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.category_breakdown) setCategoryBreakdown(res.data.category_breakdown);
      if (res.data.department_breakdown) setDepartmentBreakdown(res.data.department_breakdown);
      if (res.data.priority_breakdown) setPriorityBreakdown(res.data.priority_breakdown);
      if (res.data.recent_complaints) setRecentComplaints(res.data.recent_complaints);
    } catch (err) {
      console.error("Failed to load admin dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const maxCategoryCount = Math.max(...categoryBreakdown.map(c => c.count), 1);
  const maxDeptCount = Math.max(...departmentBreakdown.map(d => d.count), 1);

  return (
    <DashboardLayout
      title="Administrator Command Center"
      subtitle="Comprehensive municipal governance, triage monitoring, department efficiency & civic audit."
      actions={
        <div className="flex gap-2">
          <Link to="/admin/assignments" className="btn btn-primary btn-sm">
            ⚡ Grievance Triage & Assignment
          </Link>
          <Link to="/admin/reports" className="btn btn-secondary btn-sm">
            📊 Generate Reports
          </Link>
        </div>
      }
    >
      {/* 6 Top Stat Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.total_citizens}</div>
            <div className="stat-label">Citizens Enrolled</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.total_officers}</div>
            <div className="stat-label">Active Officers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.total_complaints}</div>
            <div className="stat-label">Total Grievances</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.pending}</div>
            <div className="stat-label">Pending Triage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.in_progress}</div>
            <div className="stat-label">Work in Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.resolved}</div>
            <div className="stat-label">Resolved Issues</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Category Breakdown Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            📊 Grievance Volume by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryBreakdown.map((cat) => {
              const pct = Math.round((cat.count / maxCategoryCount) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.825rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{cat.name}</span>
                    <span style={{ fontWeight: 700, color: '#0f3e6d' }}>{cat.count} grievances</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            🏛️ Department Workload Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {departmentBreakdown.map((dept) => {
              const pct = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={dept.id}>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.825rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{dept.name} ({dept.code})</span>
                    <span style={{ fontWeight: 700, color: '#047857' }}>{dept.count} cases</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #047857)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Grievances Across All Municipalities */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Latest City-Wide Submissions</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Recent grievances logged across all civic wards</p>
          </div>
          <Link to="/admin/assignments" className="btn btn-secondary btn-sm">
            View Triage Desk →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Subject & Area</th>
                <th>Category</th>
                <th>Complainant</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/complaints/${item.complaint_id}`} style={{ fontWeight: 700, color: '#1a56db' }}>
                      {item.complaint_id}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {item.location}</div>
                  </td>
                  <td>{item.category_name}</td>
                  <td style={{ fontSize: '0.825rem' }}>{item.citizen_name}</td>
                  <td style={{ fontSize: '0.825rem' }}>{item.department_name || <span style={{ color: '#dc2626', fontWeight: 600 }}>Unassigned</span>}</td>
                  <td><PriorityBadge priority={item.priority} /></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/complaints/${item.complaint_id}`} className="btn btn-secondary btn-sm">
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
