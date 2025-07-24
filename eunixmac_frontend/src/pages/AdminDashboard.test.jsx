import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

// Mock the child components to isolate the test
jest.mock('../components/admin/KpiCard', () => (props) => <div data-testid="kpi-card">{JSON.stringify(props)}</div>);
jest.mock('../components/admin/ActivityChart', () => () => <div data-testid="activity-chart" />);
jest.mock('../components/admin/RecentEvents', () => () => <div data-testid="recent-events" />);
jest.mock('../components/admin/ResourceUtilization', () => () => <div data-testid="resource-utilization" />);
jest.mock('../components/admin/QuickActions', () => () => <div data-testid="quick-actions" />);
jest.mock('../components/ui/DateRangePicker', () => () => <div data-testid="date-range-picker" />);

describe('AdminDashboard', () => {
  it('renders the main dashboard heading', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders all the dashboard widgets', () => {
    render(<AdminDashboard />);
    expect(screen.getAllByTestId('kpi-card')).toHaveLength(4);
    expect(screen.getByTestId('activity-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recent-events')).toBeInTheDocument();
    expect(screen.getByTestId('resource-utilization')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });
});