import React from 'react';

const PriorityBadge = ({ priority }) => {
  const p = (priority || 'Medium').toLowerCase();

  return (
    <span className={`badge badge-priority-${p}`}>
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
