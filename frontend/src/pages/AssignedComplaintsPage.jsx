import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssignedComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  // Quick Status Modal
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignedToMeOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (assignedToMeOnly) params.assigned_to_me = 'true';

      const [complaintsRes, catRes] = await Promise.all([
        complaintAPI.getAll(params),
        complaintAPI.getCategories(),
      ]);
      setComplaints(complaintsRes.data.results || complaintsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to load assigned grievances", err);
    } finally {
      setLoading(false);
    }
  };

  const openQuickStatusModal = (complaint) => {
    setActiveComplaint(complaint);
    setNewStatus(complaint.status === 'Resolved' ? 'Resolved' : 'In Progress');
    setRemarks(complaint.authority_remarks || '');
    setResolutionNotes(complaint.resolution_notes || '');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setSubmitting(true);
    try {
      await complaintAPI.updateStatus(activeComplaint.id, {
        status: newStatus,
        remarks,
        resolution_notes: resolutionNotes,
      });
      setActiveComplaint(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(term));

    const matchesCategory = !categoryFilter || String(c.category) === String(categoryFilter);
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  return (
    <DashboardLayout
      title="Department Grievance Queue"
      subtitle="Examine field issues, update progress remarks, and record physical resolutions."
    >
      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="Search by ID, keyword, citizen, locality..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 160px' }}>
            <select
              className="form-select"
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

          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-select"
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

          <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            <input
              type="checkbox"
              checked={assignedToMeOnly}
              onChange={(e) => setAssignedToMeOnly(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            Assigned Directly to Me
          </label>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Loading department assignments...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📑</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No grievances found</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              No complaints match the specified search or filter settings.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Grievance Summary</th>
                  <th>Category</th>
                  <th>Complainant</th>
                  <th>Assigned Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {item.location}</div>
                      {item.authority_remarks && (
                        <div style={{ fontSize: '0.725rem', color: '#0369a1', marginTop: '2px' }}>
                          💬 {item.authority_remarks}
                        </div>
                      )}
                    </td>
                    <td>{item.category_name}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.citizen_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.citizen_phone || item.citizen_email}</div>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>
                      {item.officer_name}
                    </td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openQuickStatusModal(item)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.775rem' }}
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/complaints/${item.complaint_id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.775rem' }}
                        >
                          Details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Status Update Modal */}
      {activeComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Update Grievance: {activeComplaint.complaint_id}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {activeComplaint.title}
            </p>

            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">New Status *</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Field Work Deployed)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Action Remarks / Field Update *</label>
                <textarea
                  required
                  rows="3"
                  className="form-textarea"
                  placeholder="Details of field crew deployed, materials dispatched, or inspection result..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {newStatus === 'Resolved' && (
                <div className="form-group">
                  <label className="form-label">Resolution Summary</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    placeholder="Specific technical repair details..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveComplaint(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save & Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssignedComplaintsPage;
