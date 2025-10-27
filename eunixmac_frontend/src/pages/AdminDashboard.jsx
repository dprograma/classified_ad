import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import KpiCard from '../components/admin/KpiCard';
import ActivityChart from '../components/admin/ActivityChart';
import RecentEvents from '../components/admin/RecentEvents';
import ResourceUtilization from '../components/admin/ResourceUtilization';
import QuickActions from '../components/admin/QuickActions';
import useApi from '../hooks/useApi';
import DateRangePicker from '../components/ui/DateRangePicker';
import AdApproval from '../components/admin/AdApproval';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: { value: 0, change: 0 },
    apiRequests: { value: 0, avgResponseTime: 0 },
    serverHealth: 'Operational',
    failedJobs: 0,
  });
  const { loading, callApi } = useApi();

  useEffect(() => {
    const fetchStats = async () => {
      // const data = await callApi('get', '/admin/stats');
      // setStats(data);

      // Mock data for now
      setStats({
        totalUsers: { value: 1234, change: 5.4 },
        apiRequests: { value: 2100000, avgResponseTime: 120 },
        serverHealth: 'Operational',
        failedJobs: 12,
      });
    };

    fetchStats();
  }, [callApi]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 4, md: 8 }, flexDirection: { xs: 'column', md: 'row' } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '2.5rem' }, mb: { xs: 2, md: 0 } }}>Admin Dashboard</Typography>
        <Paper sx={{ p: 1, borderRadius: 2, boxShadow: 3 }}>
          <DateRangePicker />
        </Paper>
      </Box>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Total Active Users"
            value={stats.totalUsers.value.toLocaleString()}
            change={`${stats.totalUsers.change}% from yesterday`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="API Requests"
            value={stats.apiRequests.value.toLocaleString()}
            change={`avg. ${stats.apiRequests.avgResponseTime}ms`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Server Health"
            value={stats.serverHealth}
            change="All systems green"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Failed Jobs"
            value={stats.failedJobs}
            change="in last 24h"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <AdApproval />
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 2, md: 6 } }}>
        <Grid item xs={12} lg={8}>
          <ActivityChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <ResourceUtilization />
            </Grid>
            <Grid item xs={12}>
              <QuickActions />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{ mt: { xs: 4, md: 6 } }}>
        <RecentEvents />
      </Box>
    </Box>
  );
}

export default AdminDashboard;