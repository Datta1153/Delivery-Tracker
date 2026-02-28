import React, { useState } from 'react';
import api from '../services/api';

const TrackPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setError(null);
    try {
      const res = await api.get(`/track/${trackingNumber.toUpperCase()}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Package not found');
      setData(null);
    } finally {
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: 600, padding: '2rem 0' }}>
        <h2>Track Your Package</h2>
        <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            className="input"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Track
          </button>
        </form>
        {error && <div className="alert alert-error">{error}</div>}
        {data && <TrackResult data={data} />}
      </div>
    </div>
  );
};

const TrackResult = ({ data }) => {
  const { package: pkg, statusUpdates } = data;
  if (!pkg) return null;
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h3>{pkg.trackingNumber}</h3>
      <p>Status: {pkg.status.replace(/_/g, ' ')}</p>
      {pkg.eta && (
        <p>ETA: {new Date(pkg.eta).toLocaleString()}</p>
      )}
      {pkg.coords && pkg.coords.lat && pkg.coords.lng && (
        <p>Coords: {pkg.coords.lat.toFixed(5)}, {pkg.coords.lng.toFixed(5)}</p>
      )}
      <div className="timeline">
        {statusUpdates && statusUpdates.length ? (
          statusUpdates.map((u, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-content">
                <h4>{u.status.replace(/_/g, ' ')}</h4>
                <p>{u.location}</p>
                {u.notes && <p><em>{u.notes}</em></p>}
                {u.coords && u.coords.lat != null && u.coords.lng != null && (
                  <p>Coords: {u.coords.lat.toFixed(5)}, {u.coords.lng.toFixed(5)}</p>
                )}
                <div className="timeline-date">{new Date(u.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))
        ) : (
          <p>No updates yet</p>
        )}
      </div>
    </div>
  );
};

export default TrackPage;
