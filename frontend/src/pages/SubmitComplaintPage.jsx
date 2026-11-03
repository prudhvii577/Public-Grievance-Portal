import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { complaintAPI } from '../services/api';

const SubmitComplaintPage = () => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successComplaint, setSuccessComplaint] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await complaintAPI.getCategories();
      setCategories(res.data);
      if (res.data.length > 0) {
        setCategoryId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5 MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !address.trim() || !categoryId) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', categoryId);
    formData.append('description', description.trim());
    formData.append('location', location.trim());
    formData.append('address', address.trim());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await complaintAPI.create(formData);
      setSuccessComplaint(res.data);
    } catch (err) {
      console.error("Failed to submit grievance", err);
      const errMsg = err.response?.data?.detail || err.response?.data?.error || 'Failed to submit grievance. Please verify form details.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (successComplaint) {
    return (
      <DashboardLayout title="Grievance Lodged Successfully">
        <div style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Grievance Registered!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
              Your complaint has been logged with the municipal authority. An official tracking ID has been generated.
            </p>

            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '1.25rem', margin: '1.5rem 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Unique Grievance Tracking ID
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f3e6d', letterSpacing: '1px', marginTop: '4px' }}>
                {successComplaint.complaint_id}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Save this reference code to track the investigation and progress.
              </div>
            </div>

            <div className="flex justify-center gap-3" style={{ flexWrap: 'wrap' }}>
              <Link to={`/complaints/${successComplaint.complaint_id}`} className="btn btn-primary">
                View & Track Grievance →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessComplaint(null);
                  setTitle('');
                  setDescription('');
                  setLocation('');
                  setAddress('');
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="btn btn-secondary"
              >
                + Lodge Another Grievance
              </button>
              <Link to="/citizen/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lodge a Public Grievance"
      subtitle="Report civic infrastructure failures, cleanliness issues, or municipal service disruptions."
    >
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div className="card">
          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Grievance Category *</label>
                <select
                  required
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.department_name ? `(${c.department_name})` : ''}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Routes automatically to the responsible department.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep pothole near Gate 3 causing skidding"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description of Problem *</label>
              <textarea
                required
                rows="4"
                placeholder="Describe the severity, when it started, and specific civic risks (e.g. danger to school children, water leakage volume, nighttime accidents)..."
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Landmark / Specific Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Opposite State Bank ATM, Ring Road Junction"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Complete Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 14, Main Commercial Block, New Delhi"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Evidence Image Upload */}
            <div className="form-group">
              <label className="form-label">Upload Photo Evidence (Optional but Recommended)</label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', background: '#f8fafc' }}>
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: '180px', borderRadius: '6px', objectFit: 'cover', margin: '0 auto 0.75rem auto', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger btn-sm"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem auto', display: 'block' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <label style={{ display: 'inline-block', cursor: 'pointer' }} className="btn btn-secondary btn-sm">
                      Select Image File (JPG, PNG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                      Maximum file size: 5 MB. Photos assist engineers in rapid on-site assessment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <Link to="/citizen/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? 'Submitting Grievance...' : 'Submit Grievance to Municipal Board'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaintPage;
