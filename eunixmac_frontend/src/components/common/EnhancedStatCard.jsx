import React from 'react';
import './EnhancedStatCard.css';

const EnhancedStatCard = ({
  icon: Icon,
  value,
  label,
  color = '#3b82f6',
  bgColor,
  onClick,
  loading = false,
  trend,
  trendDirection = 'up', // 'up', 'down', 'neutral'
  variant = 'default', // 'default', 'compact', 'detailed'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const cardClasses = [
    'enhanced-stat-card',
    `enhanced-stat-card--${variant}`,
    `enhanced-stat-card--${size}`,
    onClick ? 'enhanced-stat-card--clickable' : '',
    loading ? 'enhanced-stat-card--loading' : ''
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="enhanced-stat-card enhanced-stat-card--loading">
        <div className="enhanced-stat-card__content">
          <div className="enhanced-stat-card__icon-skeleton"></div>
          <div className="enhanced-stat-card__data">
            <div className="enhanced-stat-card__value-skeleton"></div>
            <div className="enhanced-stat-card__label-skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={{
        '--stat-color': color,
        '--stat-bg': bgColor
      }}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="enhanced-stat-card__content">
        {Icon && (
          <div className="enhanced-stat-card__icon-wrapper">
            <Icon className="enhanced-stat-card__icon" aria-hidden="true" />
          </div>
        )}

        <div className="enhanced-stat-card__data">
          <div className="enhanced-stat-card__value" title={value?.toString()}>
            {value !== undefined && value !== null ? value : '—'}
          </div>

          <div className="enhanced-stat-card__label" title={label}>
            {label}
          </div>

          {trend && (
            <div className={`enhanced-stat-card__trend enhanced-stat-card__trend--${trendDirection}`}>
              <span className="enhanced-stat-card__trend-icon" aria-hidden="true">
                {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
              </span>
              <span className="enhanced-stat-card__trend-value">{trend}</span>
            </div>
          )}
        </div>
      </div>

      {onClick && (
        <div className="enhanced-stat-card__overlay" aria-hidden="true">
          <span className="enhanced-stat-card__overlay-text">View Details</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedStatCard;