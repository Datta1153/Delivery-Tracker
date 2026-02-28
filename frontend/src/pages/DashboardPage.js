import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { authAPI } from '../services/api';
import { usePackages } from '../context/PackageContext';
import PackageForm from '../components/PackageForm';
import FilterBar from '../components/FilterBar';
import StatsCard from '../components/StatsCard';
import { FaPlus, FaEye, FaTrash, FaBox, FaTruck, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const DashboardPage = () => {
  const { packages, loading, error, fetchPackages, deletePackage } = usePackages();
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '' });
  const [staffError, setStaffError] = useState('');
  const [staffSuccess, setStaffSuccess] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    inTransit: 0,
    failed: 0
  });

  useEffect(() => {
    // fetch packages whenever filter criteria change
    fetchPackages({
      status: filters.status,
      q: filters.search,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    });
  }, [fetchPackages, filters]);

  useEffect(() => {
    // derive stats from server-provided packages
    const delivered = packages.filter(p => p.status === 'delivered').length;
    const inTransit = packages.filter(p => ['pending', 'shipped', 'in_transit', 'out_for_delivery'].includes(p.status)).length;
    const failed = packages.filter(p => p.status === 'failed').length;

    setStats({
      total: packages.length,
      delivered,
      inTransit,
      failed
    });

    setFilteredPackages(packages);
  }, [packages]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
      } catch (err) {
        console.error('Failed to delete package:', err);
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };


  const getStatusBadgeClass = (status) => `status-badge status-${status}`;

  return (
    <div className="page-container">
      <div className="container">
        <div className="hero" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦 Your Packages</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Track and manage all your deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <StatsCard 
            icon={<FaBox size={20} />}
            label="Total Packages"
            value={stats.total}
            color="primary"
          />
          <StatsCard 
            icon={<FaCheckCircle size={20} />}
            label="Delivered"
            value={stats.delivered}
            color="success"
          />
          <StatsCard 
            icon={<FaTruck size={20} />}
            label="In Transit"
            value={stats.inTransit}
            color="secondary"
          />
          <StatsCard 
            icon={<FaExclamationCircle size={20} />}
            label="Failed"
            value={stats.failed}
            color="danger"
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filter Bar */}
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          onClear={handleClearFilters}
        />

        {/* Add Button - Only for Admin and Staff */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <div style={{ marginBottom: '2rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPlus /> Add New Package
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading your packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaBox size={48} />
              </div>
              <h3>{packages.length === 0 ? 'No Packages Yet' : 'No Matching Packages'}</h3>
              <p>{packages.length === 0 ? 'Start by adding your first package to track' : 'Try adjusting your filters'}</p>
              {packages.length === 0 && (user?.role === 'admin' || user?.role === 'staff') && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                  style={{ marginTop: '1rem' }}
                >
                  Add Your First Package
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {stats.total !== null && (
              <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
                Showing {filteredPackages.length} of {stats.total} packages
              </div>
            )}
            <div className="grid grid-2">
              {filteredPackages.map((pkg) => (
                <div key={pkg._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '1rem', wordBreak: 'break-word' }}>
                        {pkg.trackingNumber}
                      </h3>
                      <span className={getStatusBadgeClass(pkg.status)}>
                        {pkg.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong>From:</strong> {pkg.senderName}
                    </p>
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong>To:</strong> {pkg.recipientName}
                    </p>
                    <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
                      <strong>Location:</strong> {pkg.currentLocation || 'Not started'}
                    </p>
                    {pkg.eta && (
                      <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
                        <strong>ETA:</strong> {new Date(pkg.eta).toLocaleDateString()}
                      </p>
                    )}
                    {pkg.estimatedDelivery && (
                      <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
                        <strong>Est.:</strong> {new Date(pkg.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="package-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Link to={`/packages/${pkg._id}`} className="btn btn-primary btn-small" style={{ flex: 1, minWidth: '120px' }}>
                      <FaEye /> View
                    </Link>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(pkg._id)}
                      style={{ flex: 1, minWidth: '100px' }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin: Add Staff */}
        {user?.role === 'admin' && (
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => {
              setShowStaffForm(!showStaffForm);
              setStaffError('');
              setStaffSuccess('');
            }}>
              {showStaffForm ? 'Close Add Staff' : 'Add Staff'}
            </button>
            {showStaffForm && (
              <div style={{ marginTop: '1rem', maxWidth: 480 }}>
                <div className="card" style={{ padding: '1rem' }}>
                  <h3>Add Staff</h3>
                  
                  {staffError && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: '#fee', border: '1px solid #fcc', color: '#c00' }}>
                      ❌ {staffError}
                    </div>
                  )}
                  
                  {staffSuccess && (
                    <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px', backgroundColor: '#efe', border: '1px solid #cfc', color: '#060' }}>
                      ✓ {staffSuccess}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                      className="input" 
                      placeholder="Name" 
                      value={staffData.name} 
                      onChange={(e) => {
                        setStaffData({...staffData, name: e.target.value});
                        setStaffError('');
                      }}
                      disabled={staffLoading}
                    />
                    <input 
                      className="input" 
                      placeholder="Email" 
                      value={staffData.email} 
                      onChange={(e) => {
                        setStaffData({...staffData, email: e.target.value});
                        setStaffError('');
                      }}
                      disabled={staffLoading}
                    />
                    <input 
                      className="input" 
                      placeholder="Password" 
                      type="password" 
                      value={staffData.password} 
                      onChange={(e) => {
                        setStaffData({...staffData, password: e.target.value});
                        setStaffError('');
                      }}
                      disabled={staffLoading}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={async () => {
                          setStaffError('');
                          setStaffSuccess('');
                          
                          // Validation
                          if (!staffData.name.trim()) {
                            setStaffError('Name is required');
                            return;
                          }
                          if (!staffData.email.trim()) {
                            setStaffError('Email is required');
                            return;
                          }
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
                            setStaffError('Please enter a valid email address');
                            return;
                          }
                          if (!staffData.password) {
                            setStaffError('Password is required');
                            return;
                          }
                          if (staffData.password.length < 6) {
                            setStaffError('Password must be at least 6 characters');
                            return;
                          }
                          
                          setStaffLoading(true);
                          try {
                            const res = await authAPI.createStaff(staffData.name, staffData.email, staffData.password);
                            setStaffSuccess(`Staff created successfully: ${res.data.user.email}`);
                            setStaffData({ name: '', email: '', password: '' });
                            setTimeout(() => {
                              setShowStaffForm(false);
                              setStaffSuccess('');
                            }, 2000);
                          } catch (err) {
                            const errorMsg = err.response?.data?.message || err.message || 'Failed to create staff';
                            setStaffError(errorMsg);
                            console.error('Staff creation error:', err);
                          } finally {
                            setStaffLoading(false);
                          }
                        }}
                        disabled={staffLoading}
                      >
                        {staffLoading ? 'Creating...' : 'Create Staff'}
                      </button>
                      <button 
                        className="btn" 
                        onClick={() => {
                          setShowStaffForm(false);
                          setStaffError('');
                          setStaffSuccess('');
                        }}
                        disabled={staffLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <PackageForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              fetchPackages();
              setShowForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
