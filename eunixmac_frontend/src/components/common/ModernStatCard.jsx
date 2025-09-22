import React from 'react';
import './ModernStatCard.css';

const ModernStatCard = ({
  icon: Icon,
  value,
  label,
  color = '#3b82f6',
  bgColor,
  onClick,
  loading = false,
  trend,
  trendDirection = 'up' // 'up', 'down', 'neutral'
}) => {
  const cardClasses = [
    'modern-stat-card',
    onClick ? 'modern-stat-card--clickable' : '',
    loading ? 'modern-stat-card--loading' : ''
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="modern-stat-card modern-stat-card--loading">
        <div className="modern-stat-card__content">
          <div className="modern-stat-card__icon-skeleton"></div>
          <div className="modern-stat-card__value-skeleton"></div>
          <div className="modern-stat-card__label-skeleton"></div>
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
    >
      <div className="modern-stat-card__content">
        {Icon && (
          <div className="modern-stat-card__icon-wrapper">
            <Icon className="modern-stat-card__icon" />
          </div>
        )}

        <div className="modern-stat-card__data">
          <div className="modern-stat-card__value">
            {value !== undefined ? value : '—'}
          </div>

          <div className="modern-stat-card__label">
            {label}
          </div>

          {trend && (
            <div className={`modern-stat-card__trend modern-stat-card__trend--${trendDirection}`}>
              <span className="modern-stat-card__trend-icon">
                {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
              </span>
              <span className="modern-stat-card__trend-value">{trend}</span>
            </div>
          )}
        </div>
      </div>

      {onClick && (
        <div className="modern-stat-card__overlay">
          <span className="modern-stat-card__overlay-text">View Details</span>
        </div>
      )}
    </div>
  );
};

export default ModernStatCard;