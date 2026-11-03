import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { complaintAPI, feedbackAPI, authAPI, departmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Status update form
  const [statusVal, setStatusVal] = useState('In Progress');
  const [remarksVal, setRemarksVal] = useState('');
  const [resolutionNotesVal, setResolutionNotesVal] = useState('');

  // Reopen form
  const [reopenReason, setReopenReason] = useState('');

  // Feedback form
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Assign form (admin)
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [assignPriority, setAssignPriority] = useState('Medium');
  const [assignNotes, setAssignNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // Supports lookup by database PK (if numeric) or unique Tracking ID (e.g. PGRP-202611-CFBB2)
      let res;
      if (/^\d+$/.test(id)) {
        res = await complaintAPI.getById(id);
      } else {
        res = await complaintAPI.trackById(id);
      }
      setComplaint(res.data);
      setStatusVal(res.data.status === 'Resolved' ? 'Resolved' : 'In Progress');
      setAssignDeptId(res.data.assigned_department || '');
      setAssignOfficerId(res.data.assigned_officer || '');
      setAssignPriority(res.data.priority || 'Medium');
    } catch (err) {
      console.error("Failed to load complaint details", err);
      setError('Unable to locate grievance record. Please check the tracking ID or credentials.');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async () => {
    setShowAssignModal(true);
    try {
      const [deptRes, offRes] = await Promise.all([
        departmentAPI.getAll(),
        authAPI.getOfficers(),
      ]);
      setDepartments(deptRes.data);
      setOfficers(offRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepartmentChange = async (deptId) => {
    setAssignDeptId(deptId);
    setAssignOfficerId('');
    try {
      const res = await authAPI.getOfficers(deptId);
      setOfficers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Status Update (Officer / Admin)
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await complaintAPI.updateStatus(complaint.id, {
        status: statusVal,
        remarks: remarksVal,
        resolution_notes: resolutionNotesVal,
      });
      setShowStatusModal(false);
      setRemarksVal('');
      setResolutionNotesVal('');
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Assignment (Admin)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await complaintAPI.assign(complaint.id, {
        department_id: assignDeptId,
        officer_id: assignOfficerId || null,
        priority: assignPriority,
        notes: assignNotes,
      });
      setShowAssignModal(false);
      setAssignNotes('');
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reopen (Citizen)
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setSubmitting(true);
    try {
      await complaintAPI.reopen(complaint.id, { reason: reopenReason.trim() });
      setShowReopenModal(false);
      setReopenReason('');
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reopen grievance.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Feedback (Citizen)
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackAPI.submit({
        complaint: complaint.id,
        rating: Number(rating),
        comments: feedbackComment.trim(),
      });
      setShowFeedbackModal(false);
      fetchComplaintDetails();
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stepper calculations
  const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
  const getStepStatus = (stepName) => {
    const cur = complaint?.status;
    if (cur === 'Rejected') return stepName === 'Submitted' ? 'completed' : 'rejected';
    if (cur === 'Reopened') return stepName === 'Resolved' ? '' : 'active';

    const order = { 'Submitted': 0, 'Under Review': 0, 'Assigned': 1, 'In Progress': 2, 'Resolved': 3 };
    const curIdx = order[cur] !== undefined ? order[cur] : 0;
    const stepIdx = steps.indexOf(stepName);

    if (stepIdx < curIdx) return 'completed';
    if (stepIdx === curIdx) return 'active';
    return '';
  };

  const content = (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading grievance tracking information...
        </div>
      ) : error || !complaint ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Grievance Not Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem auto' }}>
            {error || 'No record matches this grievance tracking ID. Please verify the ID.'}
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Home Page
          </Link>
        </div>
      ) : (
        <>
          {/* Header Card */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid #0f3e6d' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Official Grievance Tracking File
                </div>
                <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                    {complaint.complaint_id}
                  </h1>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>

              {/* Action Buttons based on User Role */}
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {user?.role === 'admin' && (
                  <button onClick={openAssignModal} className="btn btn-secondary btn-sm">
                    ⚙️ Assign / Triage
                  </button>
                )}
                {(user?.role === 'officer' || user?.role === 'admin') && (
                  <button onClick={() => setShowStatusModal(true)} className="btn btn-primary btn-sm">
                    ✏️ Update Status / Remarks
                  </button>
                )}
                {user?.role === 'citizen' && (complaint.status === 'Resolved' || complaint.status === 'Rejected') && (
                  <button onClick={() => setShowReopenModal(true)} className="btn btn-danger btn-sm">
                    🔄 Reopen Grievance
                  </button>
                )}
                {user?.role === 'citizen' && complaint.status === 'Resolved' && !complaint.feedback && (
                  <button onClick={() => setShowFeedbackModal(true)} className="btn btn-success btn-sm">
                    ⭐ Rate Resolution
                  </button>
                )}
              </div>
            </div>

            {/* Stepper Progress */}
            <div style={{ padding: '1rem 0' }}>
              <div className="stepper-container">
                <div className="stepper-line">
                  <div
                    className="stepper-line-fill"
                    style={{
                      width:
                        complaint.status === 'Resolved' ? '100%' :
                        complaint.status === 'In Progress' ? '66%' :
                        complaint.status === 'Assigned' ? '33%' : '0%'
                    }}
                  />
                </div>
                {steps.map((st, i) => {
                  const stStatus = getStepStatus(st);
                  return (
                    <div key={i} className="stepper-step">
                      <div className={`step-circle ${stStatus}`}>
                        {stStatus === 'completed' ? '✓' : i + 1}
                      </div>
                      <div className="step-label">{st}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Category</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{complaint.category_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Department</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{complaint.department_name || 'Awaiting Assignment'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Officer</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{complaint.officer_name || 'Not Designated'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date Lodged</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{new Date(complaint.submission_date).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Details & Image Card */}
          <div className="grid" style={{ gridTemplateColumns: complaint.image ? '1.8fr 1.2fr' : '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                {complaint.title}
              </h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Issue Description</div>
                <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  {complaint.description}
                </p>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Location / Landmark</div>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>📍 {complaint.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Full Postal Address</div>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{complaint.address}</div>
                </div>
              </div>

              {/* Citizen info */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Complainant / Citizen Information</div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '2px' }}>
                  <strong>{complaint.citizen_name}</strong> {complaint.citizen_phone ? `(${complaint.citizen_phone})` : ''} • {complaint.citizen_email}
                </div>
              </div>
            </div>

            {/* Uploaded Evidence Photo */}
            {complaint.image && (
              <div className="card">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Photo Evidence Submitted
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <img
                    src={complaint.image.startsWith('http') ? complaint.image : `http://127.0.0.1:8000${complaint.image}`}
                    alt="Grievance Evidence"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                  Photograph captured and uploaded during grievance lodging.
                </div>
              </div>
            )}
          </div>

          {/* Authority Remarks & Resolution Card */}
          {(complaint.authority_remarks || complaint.resolution_notes || complaint.reopen_reason) && (
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.75rem' }}>
                🏛️ Official Department Notes & Actions
              </h3>
              {complaint.authority_remarks && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Authority Remarks</div>
                  <p style={{ fontSize: '0.875rem', color: '#1e3a8a', marginTop: '2px' }}>{complaint.authority_remarks}</p>
                </div>
              )}
              {complaint.resolution_notes && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Resolution Summary</div>
                  <p style={{ fontSize: '0.875rem', color: '#047857', marginTop: '2px' }}>{complaint.resolution_notes}</p>
                </div>
              )}
              {complaint.reopen_reason && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Citizen Reopen Request</div>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '2px' }}>"{complaint.reopen_reason}"</p>
                </div>
              )}
            </div>
          )}

          {/* Citizen Feedback Display */}
          {complaint.feedback && (
            <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                  Citizen Resolution Feedback
                </h4>
                <div style={{ color: '#eab308', fontSize: '1.1rem', letterSpacing: '2px' }}>
                  {'★'.repeat(complaint.feedback.rating)}{'☆'.repeat(5 - complaint.feedback.rating)}
                  <span style={{ fontSize: '0.85rem', color: '#166534', marginLeft: '6px', fontWeight: 700 }}>
                    ({complaint.feedback.rating}/5)
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#14532d', fontStyle: 'italic' }}>
                "{complaint.feedback.comments || 'No written comment provided.'}"
              </p>
              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                Submitted by {complaint.citizen_name} on {new Date(complaint.feedback.created_at).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Complete Audit History Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Audit History & Action Timeline
            </h3>

            {complaint.history && complaint.history.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', marginLeft: '0.75rem' }}>
                {complaint.history.map((h, idx) => (
                  <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    {/* Circle marker on line */}
                    <div style={{
                      position: 'absolute',
                      left: '-1.85rem',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#1a56db',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 2px #93c5fd'
                    }} />

                    <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {h.action_type}
                      </span>
                      <StatusBadge status={h.status} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        by <strong>{h.action_by_name}</strong> {h.action_by_role ? `(${h.action_by_role})` : ''}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </div>

                    {h.remarks && (
                      <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        {h.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No historical events recorded.</p>
            )}
          </div>
        </>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Update Status Modal (Officer / Admin) */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Update Grievance Status & Progress
            </h3>
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">Select New Status *</label>
                <select
                  className="form-select"
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                >
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Field Work Deployed)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Rejected">Rejected (Out of Municipal Scope)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Authority Remarks / Action Notes *</label>
                <textarea
                  required
                  rows="3"
                  className="form-textarea"
                  placeholder="Explain the inspection status, work team deployed, or current step..."
                  value={remarksVal}
                  onChange={(e) => setRemarksVal(e.target.value)}
                />
              </div>

              {statusVal === 'Resolved' && (
                <div className="form-group">
                  <label className="form-label">Final Resolution Summary Notes</label>
                  <textarea
                    rows="2"
                    className="form-textarea"
                    placeholder="Technical description of repair performed (e.g. 5m asphalt patch laid)..."
                    value={resolutionNotesVal}
                    onChange={(e) => setResolutionNotesVal(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowStatusModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Updating...' : 'Save & Broadcast Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Admin Assignment Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Assign Grievance to Department & Officer
            </h3>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">Responsible Department *</label>
                <select
                  required
                  className="form-select"
                  value={assignDeptId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designated Officer (Optional)</label>
                <select
                  className="form-select"
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                >
                  <option value="">-- Assign to Entire Department --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} - {o.designation || 'Engineer'}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select
                  className="form-select"
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Directives / Instructions</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Instructions for the field team..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Assigning...' : 'Assign & Notify Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reopen Grievance Modal (Citizen) */}
      {showReopenModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem' }}>
              Reopen Public Grievance
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              If the problem was not adequately solved on-site, provide the specific reason so supervisors can re-inspect.
            </p>
            <form onSubmit={handleReopenSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Reopening *</label>
                <textarea
                  required
                  rows="4"
                  className="form-textarea"
                  placeholder="Explain why the resolution is incomplete (e.g. pothole asphalt washed away in 24 hours, water contamination still persists)..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReopenModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-danger">
                  {submitting ? 'Reopening...' : 'Confirm & Reopen Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Feedback Rating Modal (Citizen) */}
      {showFeedbackModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Submit Resolution Feedback
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              How satisfied are you with the municipal response and quality of work?
            </p>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Rating (1 to 5 Stars)</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        fontSize: '2rem',
                        color: star <= rating ? '#eab308' : '#cbd5e1',
                        transition: 'transform 0.1s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comments / Remarks (Optional)</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Share details about the work quality, timeliness, or officer professionalism..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowFeedbackModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-success">
                  {submitting ? 'Submitting...' : 'Submit Official Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If user is authenticated, render with DashboardLayout; if public visitor tracking, render with Navbar
  if (isAuthenticated) {
    return (
      <DashboardLayout
        title="Grievance Audit & Tracking"
        subtitle={`Tracking ID: ${complaint?.complaint_id || id}`}
      >
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        {content}
      </div>
    </div>
  );
};

export default ComplaintDetailsPage;
