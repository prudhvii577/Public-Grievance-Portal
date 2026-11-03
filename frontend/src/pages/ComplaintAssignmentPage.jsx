import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI, departmentAPI, authAPI } from '../services/api';

const ComplaintAssignmentPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Assignment Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');
  const [assignNotes, setAssignNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [complaintsRes, deptsRes] = await Promise.all([
        complaintAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setComplaints(complaintsRes.data.results || complaintsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Failed to load triage data", err);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setAssignDeptId(complaint.assigned_department || (departments[0]?.id || ''));
    setAssignOfficerId(complaint.assigned_officer || '');
    setAssignPriority(complaint.priority || 'Medium');
    setAssignNotes(complaint.authority_remarks || '');

    // Fetch officers for initial department
    const targetDeptId = complaint.assigned_department || (departments[0]?.id || '');
    if (targetDeptId) {
      try {
        const offRes = await authAPI.getOfficers(targetDeptId);
        setOfficers(offRes.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeptSelect = async (deptId) => {
    setAssignDeptId(deptId);
    setAssignOfficerId('');
    try {
      const res = await authAPI.getOfficers(deptId);
      setOfficers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !assignDeptId) return;
    setSubmitting(true);

    try {
      await complaintAPI.assign(selectedComplaint.id, {
        department_id: assignDeptId,
        officer_id: assignOfficerId || null,
        priority: assignPriority,
        notes: assignNotes,
      });
      setSelectedComplaint(null);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.error || 'Assignment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term);

    const matchesDept = !deptFilter || String(c.assigned_department) === String(deptFilter);
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Grievance Triage & Department Assignment"
      subtitle="Dispatch civic complaints to responsible municipal boards, designate field officers, and set response priorities."
    >
      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px' }}>
            <input
              type="text"
              placeholder="Search by Tracking ID, subject, locality..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted (Needs Assignment)</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Assignment Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Loading triage queue...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No complaints found</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              All complaints are currently assigned or match no filter.
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
                  <th>Current Department</th>
                  <th>Assigned Officer</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Assignment</th>
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
                    </td>
                    <td>{item.category_name}</td>
                    <td style={{ fontSize: '0.825rem' }}>{item.citizen_name}</td>
                    <td>
                      {item.department_name ? (
                        <span style={{ fontWeight: 600, color: '#0f3e6d' }}>{item.department_name}</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>
                      {item.officer_name}
                    </td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openAssignModal(item)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.775rem' }}
                      >
                        {item.assigned_department ? 'Reassign' : '⚡ Assign Now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Assign Grievance: {selectedComplaint.complaint_id}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {selectedComplaint.title} (📍 {selectedComplaint.location})
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Municipal Department *</label>
                <select
                  required
                  className="form-select"
                  value={assignDeptId}
                  onChange={(e) => handleDeptSelect(e.target.value)}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Specific Officer (Optional)</label>
                <select
                  className="form-select"
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                >
                  <option value="">-- Department Pool / Unassigned Officer --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation || 'Engineer'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level *</label>
                <select
                  className="form-select"
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                >
                  <option value="Low">Low - Routine Civic Maintenance</option>
                  <option value="Medium">Medium - Standard 48h Resolution</option>
                  <option value="High">High - Impaired Civic Function</option>
                  <option value="Critical">Critical - Safety Hazard / Contamination</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Directives</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Special instructions or field directives for the engineering division..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setSelectedComplaint(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Confirming...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ComplaintAssignmentPage;
