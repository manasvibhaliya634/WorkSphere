import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) => {
  return (
    <div className="stat-card">
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatCard;
