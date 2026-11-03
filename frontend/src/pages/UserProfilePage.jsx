import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const UserProfilePage = () => {
  const { user, updateProfileState } = useAuth();

  const [profileData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await authAPI.updateProfile(profileData);
      updateProfileState(res.data);
      setProfileSuccess('Profile details saved successfully.');
    } catch (err) {
      console.error(err);
      setProfileError('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password updated successfully.');
      setPasswordData({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.old_password?.[0] || 'Current password incorrect or update failed.';
      setPasswordError(errMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout
      title="User Account & Security Settings"
      subtitle="Manage your personal contact details, residential address & authentication credentials."
    >
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Personal Details Form */}
        <div className="card">
          <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0f3e6d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
                <span className={`badge badge-role-${user?.role}`}>{user?.role}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</span>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div style={{ padding: '0.75rem', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ✓ {profileSuccess}
            </div>
          )}
          {profileError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={profileData.first_name}
                  onChange={(e) => setFormData({ ...profileData, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={profileData.last_name}
                  onChange={(e) => setFormData({ ...profileData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Registered)</label>
              <input
                type="email"
                disabled
                className="form-input"
                style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                value={user?.email || ''}
              />
              <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Email address is fixed to your identity profile.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={profileData.phone_number}
                onChange={(e) => setFormData({ ...profileData, phone_number: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal / Residential Address</label>
              <textarea
                rows="3"
                className="form-textarea"
                value={profileData.address}
                onChange={(e) => setFormData({ ...profileData, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Change Account Password
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Ensure your account is protected with a secure password.
          </p>

          {passwordSuccess && (
            <div style={{ padding: '0.75rem', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '6px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ✓ {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength="6"
                className="form-input"
                placeholder="At least 6 characters"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength="6"
                className="form-input"
                placeholder="Re-type new password"
                value={passwordData.confirm_new_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
