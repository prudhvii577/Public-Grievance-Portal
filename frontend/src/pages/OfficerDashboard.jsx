import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, high_priority: 0 });
  const [departmentName, setDepartmentName] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getStats();
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.department) setDepartmentName(res.data.department);
      if (res.data.recent_complaints) setRecentComplaints(res.data.recent_complaints);
    } catch (err) {
      console.error("Failed to fetch officer stats", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = recentComplaints.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.complaint_id.toLowerCase().includes(term) ||
      item.title.toLowerCase().includes(term) ||
      item.citizen_name.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <DashboardLayout
      title={`Officer Console: ${user?.first_name || 'Officer'} ${user?.last_name || ''}`}
      subtitle={`Department: ${departmentName || user?.department_details?.name || 'Municipal Works'}`}
      actions={
        <Link to="/officer/assigned-complaints" className="btn btn-primary btn-sm">
          📋 Open Assigned Work Queue →
        </Link>
      }
    >
      {/* High Priority Urgent Alert Banner if any critical items */}
      {stats.high_priority > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '1.25rem' }}>🚨</span>
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.9rem' }}>High Priority Grievances Alert</strong>
              <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                You have <strong>{stats.high_priority}</strong> High/Critical grievances that require urgent inspection.
              </div>
            </div>
          </div>
          <Link to="/officer/assigned-complaints" className="btn btn-danger btn-sm">
            View Urgent Tasks
          </Link>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Total Assigned to Dept</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.pending}</div>
            <div className="stat-label">Pending Review / Triage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.in_progress}</div>
            <div className="stat-label">Active Work in Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#047857' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.resolved}</div>
            <div className="stat-label">Resolved & Completed</div>
          </div>
        </div>
      </div>

      {/* Assigned Complaints Table */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Department Action Queue</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Complaints requiring investigation, remarks, and status transitions</p>
          </div>

          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search complaint or citizen..."
              className="form-input"
              style={{ width: '200px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: '140px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              className="form-select"
              style={{ width: '130px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading department assignments...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Queue Clear</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              No complaints currently match the selected filters for your department.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Title & Location</th>
                  <th>Complainant</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Assigned</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((item) => (
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
                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{item.citizen_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.citizen_phone || item.citizen_email}</div>
                    </td>
                    <td>{item.category_name}</td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(item.submission_date).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/complaints/${item.complaint_id}`} className="btn btn-primary btn-sm">
                        Inspect & Update →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OfficerDashboard;
