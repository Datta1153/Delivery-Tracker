import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageAPI } from '../services/api';
import StatusUpdateForm from '../components/StatusUpdateForm';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // package context available via `usePackages` in other components when needed
  const [pkg, setPkg] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await packageAPI.getPackageById(id);
        setPkg(response.data.package);
        setStatusUpdates(response.data.statusUpdates || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load package details');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id]);

  const getStatusBadgeClass = (status) => `status-badge status-${status}`;

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            Loading package details...
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="empty-state">
              <h3>Package not found</h3>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
                style={{ marginTop: '1rem' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <button
          className="btn btn-secondary btn-small"
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaArrowLeft /> Back
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%'
        }}>
          {/* Package Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{pkg.trackingNumber}</h2>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={getStatusBadgeClass(pkg.status)}>
                    {pkg.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>From:</strong>
                <p style={{ marginTop: '0.5rem', color: '#666', wordWrap: 'break-word' }}>
                  {pkg.senderName}
                  <br />
                  {pkg.senderAddress}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>To:</strong>
                <p style={{ marginTop: '0.5rem', color: '#666', wordWrap: 'break-word' }}>
                  {pkg.recipientName}
                  <br />
                  {pkg.recipientAddress}
                </p>
              </div>

              {pkg.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666', wordWrap: 'break-word' }}>{pkg.description}</p>
                </div>
              )}

              {pkg.weight && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Weight:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>{pkg.weight}</p>
                </div>
              )}

              {pkg.currentLocation && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Current Location:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666', wordWrap: 'break-word' }}>{pkg.currentLocation}</p>
                </div>
              )}

              {pkg.coords && pkg.coords.lat && pkg.coords.lng && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Coordinates:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>
                    {pkg.coords.lat.toFixed(5)}, {pkg.coords.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {pkg.eta && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>ETA:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>
                    {new Date(pkg.eta).toLocaleString()}
                  </p>
                </div>
              )}

              {pkg.estimatedDelivery && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Estimated Delivery:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>
                    {new Date(pkg.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}

              {pkg.deliveryDate && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Delivered:</strong>
                  <p style={{ marginTop: '0.5rem', color: '#27ae60' }}>
                    {new Date(pkg.deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => setShowStatusForm(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
            >
              <FaEdit /> Update Status
            </button>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Delivery Timeline</h3>
            </div>

            {statusUpdates.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: '1.5rem 0' }}>
                <p>No updates yet</p>
              </div>
            ) : (
              <div className="timeline">
                {statusUpdates.map((update, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-content">
                      <h4>{update.status.replace(/_/g, ' ')}</h4>
                      <p style={{ wordWrap: 'break-word' }}>{update.location}</p>
                      {update.notes && <p style={{ marginTop: '0.5rem', fontStyle: 'italic', wordWrap: 'break-word' }}>{update.notes}</p>}
                      {update.coords && update.coords.lat != null && update.coords.lng != null && (
                        <p style={{ marginTop: '0.5rem' }}>
                          Coordinates: {update.coords.lat.toFixed(5)}, {update.coords.lng.toFixed(5)}
                        </p>
                      )}
                      {update.proofUrl && (
                        <p style={{ marginTop: '0.5rem' }}>
                          <a href={update.proofUrl} target="_blank" rel="noopener noreferrer">
                            View proof
                          </a>
                        </p>
                      )}
                      <div className="timeline-date">
                        {new Date(update.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showStatusForm && (
          <StatusUpdateForm
            packageId={id}
            onClose={() => setShowStatusForm(false)}
            onSuccess={() => {
              // Refresh page data
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PackageDetailPage;
