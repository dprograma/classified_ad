import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Analytics,
  Visibility,
  TrendingUp,
  People,
  Schedule
} from '@mui/icons-material';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';

const AnalyticsSection = ({ stats }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your ad performance and engagement metrics
      </Typography>

      {/* Quick Stats */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={Visibility}
          value={stats?.total_views || 0}
          label="Total Views"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={People}
          value={stats?.unique_visitors || 0}
          label="Unique Visitors"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={TrendingUp}
          value={`${stats?.click_through_rate || 0}%`}
          label="Click Rate"
          color="#06b6d4"
          size="medium"
        />

        <EnhancedStatCard
          icon={Schedule}
          value={`${stats?.avg_time_on_page || 0}m`}
          label="Avg. Time on Page"
          color="#f59e0b"
          size="medium"
        />
      </StatCardsContainer>

      {/* Coming Soon */}
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Detailed Analytics Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We're working on comprehensive analytics dashboard with charts, graphs, and detailed insights.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsSection;