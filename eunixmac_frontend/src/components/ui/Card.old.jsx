import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;