import React, { memo } from 'react';

const StatsCard = ({ icon, label, value, trend, color = 'primary' }) => {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid var(--${color}-color)` }}>
      <div className="stat-icon" style={{ color: `var(--${color}-color)` }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {trend && (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.85rem',
          color: trend > 0 ? '#10b981' : '#ef4444'
        }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default memo(StatsCard);
