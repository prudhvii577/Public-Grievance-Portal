import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, departmentAPI } from '../services/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);

  // New Officer form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department: '',
    designation: '',
    password: 'Officer@123',
    role: 'officer',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await authAPI.getUsers(params);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data);
      if (res.data.length > 0 && !formData.department) {
        setFormData((prev) => ({ ...prev, department: res.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userObj) => {
    const action = userObj.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${userObj.first_name || userObj.username}'s account?`)) {
      return;
    }
    try {
      await authAPI.toggleUserStatus(userObj.id, !userObj.is_active);
      fetchUsers();
    } catch (err) {
      alert("Failed to change user status.");
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      await authAPI.createUser(formData);
      setShowAddOfficerModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        department: departments[0]?.id || '',
        designation: '',
        password: 'Officer@123',
        role: 'officer',
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to create officer", err);
      const errMsg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to create officer.';
      setModalError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="User Management & Access Control"
      subtitle="Supervise citizen accounts, appoint municipal engineers, and maintain portal directory."
      actions={
        <button onClick={() => setShowAddOfficerModal(true)} className="btn btn-primary btn-sm">
          + Add Department Officer
        </button>
      }
    >
      {/* Search & Filter Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="officer">Department Officers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Search Directory
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            Loading user accounts...
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No accounts found</h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              No user records match the specified search query.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Department / Designation</th>
                  <th>Contact Phone</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Account Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge badge-role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', color: '#1e293b' }}>
                        {u.department_name || (u.role === 'citizen' ? 'Citizen Resident' : 'Municipal Board')}
                      </div>
                      {u.designation && (
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{u.designation}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#475569' }}>
                      {u.phone_number || '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-status-resolved' : 'badge-status-rejected'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Create Department Officer Account
            </h3>

            {modalError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateOfficer}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department Assignment *</label>
                  <select
                    required
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant Engineer, Zonal Inspector"
                    className="form-input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Default password set to Officer@123. Can be changed by officer after login.
                </div>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddOfficerModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Officer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsersPage;
