import React, { memo } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const FilterBar = ({ filters, setFilters, onClear }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <FaFilter style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }} />
        <h3 style={{ margin: 0, color: 'var(--dark-color)', fontSize: '1rem' }}>Advanced Filters</h3>
        {Object.values(filters).some(v => v) && (
          <button 
            onClick={onClear}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--danger-color)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <FaTimes /> Clear Filters
          </button>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-item">
          <label>Status</label>
          <select 
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Sort By</label>
          <select 
            value={filters.sort || ''}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="">Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Search</label>
          <input 
            type="text"
            placeholder="Search by tracking ID, recipient..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(FilterBar);
