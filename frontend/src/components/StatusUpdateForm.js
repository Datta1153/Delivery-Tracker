import React, { useState } from 'react';
import { usePackages } from '../context/PackageContext';
import { FaTimes } from 'react-icons/fa';

const StatusUpdateForm = ({ packageId, onClose, onSuccess }) => {
  const { updatePackageStatus } = usePackages();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'in_transit',
    location: '',
    notes: '',
    lat: '',
    lng: '',
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proof') {
      setFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload = formData;
      if (file) {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
        payload.append('proof', file);
      }
      await updatePackageStatus(packageId, payload);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Package Status</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., New York, NY"
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                name="lat"
                value={formData.lat || ''}
                onChange={handleChange}
                placeholder="e.g., 40.7128"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                name="lng"
                value={formData.lng || ''}
                onChange={handleChange}
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes"
            />
          </div>

          <div className="form-group">
            <label>Proof of Delivery (image/pdf)</label>
            <input
              type="file"
              name="proof"
              accept="image/*,application/pdf"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdateForm;
