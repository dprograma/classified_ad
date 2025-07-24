import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-700 rounded-md ${className}`}></div>
  );
};

export default Skeleton;