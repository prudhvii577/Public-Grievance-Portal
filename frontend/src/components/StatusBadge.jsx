import React from 'react';

const StatusBadge = ({ status }) => {
  const getSlug = (str) => (str || '').toLowerCase().replace(/\s+/g, '-');
  const slug = getSlug(status);

  return (
    <span className={`badge badge-status-${slug}`}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }}></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
