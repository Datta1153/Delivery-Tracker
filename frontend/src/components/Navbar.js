import React, { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBox, FaUser, FaSignOutAlt } from 'react-icons/fa';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="brand">
            <FaBox size={24} className="brand-icon" />
            <h1>DeliveryTracker</h1>
          </Link>

          <button className="nav-toggle" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <span className="hamburger" />
          </button>

          <div className={`navbar-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
            <Link to="/">Home</Link>
            <Link to="/track">Track</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/ratings">Ratings</Link>
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <Link to="/profile" className="profile-link"><FaUser /> {user?.name}</Link>
                <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="btn btn-primary btn-small">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Navbar);
