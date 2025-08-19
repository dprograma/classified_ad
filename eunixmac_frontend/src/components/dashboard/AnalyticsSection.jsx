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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Visibility sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.total_views || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <People sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.unique_visitors || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Visitors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.click_through_rate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.avg_time_on_page || 0}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Time on Page
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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