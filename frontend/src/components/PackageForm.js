import React, { useState } from 'react';
import { usePackages } from '../context/PackageContext';
import { FaTimes } from 'react-icons/fa';

const PackageForm = ({ onClose, initialData = null, onSuccess = null }) => {
  const { createPackage } = usePackages();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      trackingNumber: '',
      senderName: '',
      senderAddress: '',
      recipientName: '',
      recipientAddress: '',
      description: '',
      weight: '',
      estimatedDelivery: '',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPackage(formData);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      const errorResponse = err.response?.data;
      let errorMessage = errorResponse?.message || 'Failed to create package';
      
      // Provide helpful error messages based on response
      if (errorResponse?.requiredAction === 'LOGIN') {
        errorMessage = '❌ Not logged in. Please login to create packages.';
      } else if (errorResponse?.requiredAction === 'RE_LOGIN') {
        errorMessage = '❌ Session expired. Please login again.';
      } else if (errorResponse?.requiredAction === 'INSUFFICIENT_PERMISSIONS') {
        errorMessage = `❌ ${errorMessage}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Package</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tracking Number *</label>
            <input
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              required
              placeholder="e.g., PKG123456789"
            />
          </div>

          <div className="form-group">
            <label>Sender Name *</label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Sender Address *</label>
            <textarea
              name="senderAddress"
              value={formData.senderAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Name *</label>
            <input
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Recipient Address *</label>
            <textarea
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the package contents"
            />
          </div>

          <div className="form-group">
            <label>Weight</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g., 2.5 kg"
            />
          </div>

          <div className="form-group">
            <label>Estimated Delivery Date</label>
            <input
              type="date"
              name="estimatedDelivery"
              value={formData.estimatedDelivery}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Add Package'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageForm;
