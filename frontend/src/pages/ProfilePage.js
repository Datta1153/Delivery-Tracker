import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Your Profile</h2>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Name:</strong>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>{user?.name}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Email:</strong>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>{user?.email}</p>
          </div>

          {user?.phone && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Phone:</strong>
              <p style={{ marginTop: '0.5rem', color: '#666' }}>{user.phone}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
