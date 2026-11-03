import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI } from '../services/api';

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, categoriesRes] = await Promise.all([
        complaintAPI.getAll(),
        complaintAPI.getCategories(),
      ]);
      setComplaints(complaintsRes.data.results || complaintsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term);

    const matchesCategory = !selectedCategory || String(c.category) === String(selectedCategory);
    const matchesStatus = !selectedStatus || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout
      title="My Submitted Grievances"
      subtitle="Complete list and tracking history of all public service issues reported by you."
      actions={
        <Link to="/citizen/submit-complaint" className="btn btn-primary btn-sm">
          + Lodge New Grievance
        </Link>
      }
    >
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              type="text"
              placeholder="Search by ID, keyword, or locality..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {(searchTerm || selectedCategory || selectedStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading your grievance records...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No complaints match your filters</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              Try adjusting the search query or resetting category/status dropdowns.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Grievance Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Assigned Department</th>
                  <th>Date Filed</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/complaints/${item.complaint_id}`} style={{ fontWeight: 700, color: '#1a56db' }}>
                        {item.complaint_id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                      {item.authority_remarks && (
                        <div style={{ fontSize: '0.725rem', color: '#0369a1', marginTop: '2px' }}>
                          💬 Remarks: {item.authority_remarks.slice(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td>{item.category_name}</td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>{item.location}</td>
                    <td style={{ fontSize: '0.825rem', color: '#334155' }}>{item.department_name || 'Awaiting Triage'}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(item.submission_date).toLocaleDateString()}
                    </td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/complaints/${item.complaint_id}`} className="btn btn-secondary btn-sm">
                        Track & View →
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

export default MyComplaintsPage;
