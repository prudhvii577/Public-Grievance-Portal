import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getStats();
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      if (res.data.recent_complaints) {
        setRecentComplaints(res.data.recent_complaints);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = recentComplaints.filter((item) => {
    const matchesSearch =
      item.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.first_name || 'Citizen'}!`}
      subtitle="Track your public service grievances, review authority updates, and register new complaints."
      actions={
        <Link to="/citizen/submit-complaint" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Submit New Grievance
        </Link>
      }
    >
      {/* 4 Stat Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Total Grievances Lodged</div>
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
            <div className="stat-label">Pending / Triage</div>
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
            <div className="stat-label">In Progress / Field Action</div>
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
            <div className="stat-label">Resolved Successfully</div>
          </div>
        </div>
      </div>

      {/* Recent Grievances Section */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Recent Grievance Submissions</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest public issues reported by your account</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by ID or title..."
              className="form-input"
              style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading your grievances...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No grievances found</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px', maxWidth: '380px', margin: '4px auto 1rem auto' }}>
              You haven't submitted any complaints matching this criteria yet. Report an issue in your locality to notify authorities.
            </p>
            <Link to="/citizen/submit-complaint" className="btn btn-primary btn-sm">
              + Lodge New Grievance
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Title & Location</th>
                  <th>Category</th>
                  <th>Submission Date</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {item.location}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', fontWeight: 500, color: '#334155' }}>
                        {item.category_name}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {new Date(item.submission_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {item.department_name || 'Pending Assignment'}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/complaints/${item.complaint_id}`} className="btn btn-secondary btn-sm">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center" style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing {filteredComplaints.length} recent grievances
          </div>
          <Link to="/citizen/my-complaints" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f3e6d' }}>
            View All My Grievances →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;
