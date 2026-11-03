import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { departmentAPI } from '../services/api';

const ManageDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    head_officer_name: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentAPI.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      head_officer_name: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      contact_email: dept.contact_email,
      contact_phone: dept.contact_phone,
      head_officer_name: dept.head_officer_name,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingDept) {
        await departmentAPI.update(editingDept.id, formData);
      } else {
        await departmentAPI.create(formData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.name?.[0] || err.response?.data?.code?.[0] || 'Operation failed. Please verify fields.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      await departmentAPI.toggleStatus(dept.id);
      fetchDepartments();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  return (
    <DashboardLayout
      title="Municipal Departments Directory"
      subtitle="Manage civic departments, administrative codes, divisional contact info & board officers."
      actions={
        <button onClick={openCreateModal} className="btn btn-primary btn-sm">
          + Add New Department
        </button>
      }
    >
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Loading municipal departments...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Department Name & Code</th>
                  <th>Head Official</th>
                  <th>Contact Information</th>
                  <th>Officers Assigned</th>
                  <th>Grievance Workload</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: <strong>{d.code}</strong></div>
                      {d.description && (
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', maxWidth: '320px' }}>
                          {d.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                        {d.head_officer_name || 'Designation Pending'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>✉️ {d.contact_email || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>📞 {d.contact_phone || '—'}</div>
                    </td>
                    <td>
                      <span className="badge badge-role-officer">{d.officer_count || 0} Officers</span>
                    </td>
                    <td>
                      <span className="badge badge-priority-medium">{d.complaint_count || 0} Active Grievances</span>
                    </td>
                    <td>
                      <span className={`badge ${d.is_active ? 'badge-status-resolved' : 'badge-status-rejected'}`}>
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(d)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(d)}
                          className={`btn btn-sm ${d.is_active ? 'btn-danger' : 'btn-success'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {d.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Department Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              {editingDept ? `Edit Department: ${editingDept.code}` : 'Add Municipal Department'}
            </h3>

            {error && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roads & Bridges Department"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROADS"
                    className="form-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Head Official Name</label>
                <input
                  type="text"
                  placeholder="e.g. Er. Vikram Malhotra, Chief Engineer"
                  className="form-input"
                  value={formData.head_officer_name}
                  onChange={(e) => setFormData({ ...formData, head_officer_name: e.target.value })}
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    placeholder="roads@pgrp.gov.in"
                    className="form-input"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Helpline Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 11 2345 6780"
                    className="form-input"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Operational Description</label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  placeholder="Mandate and scope of civic responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : (editingDept ? 'Update Department' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageDepartmentsPage;
