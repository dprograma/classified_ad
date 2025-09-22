import React from 'react';
import './StatCardsContainer.css';

const StatCardsContainer = ({
  children,
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  gap = '16px'
}) => {
  const containerClasses = [
    'stat-cards-container',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      style={{
        '--gap': gap,
        '--mobile-columns': columns.mobile,
        '--tablet-columns': columns.tablet,
        '--desktop-columns': columns.desktop
      }}
    >
      {children}
    </div>
  );
};

export default StatCardsContainer;