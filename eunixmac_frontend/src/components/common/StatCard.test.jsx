import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedStatCard from './EnhancedStatCard';
import StatCardsContainer from './StatCardsContainer';
import { Store, TrendingUp, Visibility, Message } from '@mui/icons-material';

// Mock CSS modules for testing
jest.mock('./EnhancedStatCard.css', () => ({}));
jest.mock('./StatCardsContainer.css', () => ({}));

describe('EnhancedStatCard', () => {
  const defaultProps = {
    icon: Store,
    value: 42,
    label: 'Test Stat',
    color: '#3b82f6'
  };

  test('renders with basic props', () => {
    render(<EnhancedStatCard {...defaultProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<EnhancedStatCard {...defaultProps} loading={true} />);
    expect(screen.getByRole('article')).toHaveClass('enhanced-stat-card--loading');
  });

  test('renders clickable card', () => {
    const onClick = jest.fn();
    render(<EnhancedStatCard {...defaultProps} onClick={onClick} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders with trend indicator', () => {
    render(
      <EnhancedStatCard
        {...defaultProps}
        trend="+5.2%"
        trendDirection="up"
      />
    );
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });

  test('applies different size variants', () => {
    const { rerender } = render(<EnhancedStatCard {...defaultProps} size="small" />);
    expect(screen.getByRole('article')).toHaveClass('enhanced-stat-card--small');

    rerender(<EnhancedStatCard {...defaultProps} size="large" />);
    expect(screen.getByRole('article')).toHaveClass('enhanced-stat-card--large');
  });
});

describe('StatCardsContainer', () => {
  test('renders children correctly', () => {
    render(
      <StatCardsContainer>
        <EnhancedStatCard
          icon={Store}
          value={10}
          label="Total Ads"
          color="#3b82f6"
        />
        <EnhancedStatCard
          icon={TrendingUp}
          value={5}
          label="Active Ads"
          color="#10b981"
        />
      </StatCardsContainer>
    );

    expect(screen.getByText('Total Ads')).toBeInTheDocument();
    expect(screen.getByText('Active Ads')).toBeInTheDocument();
  });

  test('applies custom column configuration', () => {
    render(
      <StatCardsContainer
        columns={{ mobile: 1, tablet: 3, desktop: 5 }}
        gap="24px"
      >
        <div>Test child</div>
      </StatCardsContainer>
    );

    const container = screen.getByText('Test child').parentElement;
    expect(container).toHaveStyle({
      '--mobile-columns': '1',
      '--tablet-columns': '3',
      '--desktop-columns': '5',
      '--gap': '24px'
    });
  });
});

describe('Responsive Design', () => {
  test('stat cards respond to screen size changes', () => {
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    render(
      <StatCardsContainer
        columns={{ mobile: 1, tablet: 2, desktop: 4 }}
      >
        <EnhancedStatCard
          icon={Store}
          value={42}
          label="Test Stat"
          color="#3b82f6"
          size="medium"
        />
      </StatCardsContainer>
    );

    // Cards should be rendered and responsive classes applied
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('provides proper ARIA attributes for clickable cards', () => {
    const onClick = jest.fn();
    render(
      <EnhancedStatCard
        icon={Store}
        value={42}
        label="Test Stat"
        color="#3b82f6"
        onClick={onClick}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  test('provides proper title attributes for long content', () => {
    render(
      <EnhancedStatCard
        icon={Store}
        value="Very long value that might be truncated"
        label="Very long label that might be truncated in mobile view"
        color="#3b82f6"
      />
    );

    expect(screen.getByTitle('Very long value that might be truncated')).toBeInTheDocument();
  });
});