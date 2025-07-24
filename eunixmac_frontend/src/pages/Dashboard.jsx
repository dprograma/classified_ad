import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import axios from 'axios';
import KpiCard from '../components/admin/KpiCard';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const { user, ads, stats } = dashboardData;

  const chartData = ads.map(ad => ({
    name: ad.title,
    views: ad.views || Math.floor(Math.random() * 1000), // Use actual views if available, otherwise mock
    clicks: ad.clicks || Math.floor(Math.random() * 500), // Use actual clicks if available, otherwise mock
  }));

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ color: 'text.primary', fontWeight: 'bold', mb: 4 }}>
        Welcome, {user.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Total Ads"
            value={stats.ad_count}
            change="Overall"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Total Messages"
            value={stats.message_count}
            change="Overall"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Total Reviews"
            value={stats.review_count}
            change="Overall"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Total Views"
            value={stats.total_views || 0}
            change="Across all your ads"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Total Clicks"
            value={stats.total_clicks || 0}
            change="Across all your ads"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Active Ads"
            value={stats.active_ads || 0}
            change="Currently live"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Pending Ads"
            value={stats.pending_ads || 0}
            change="Awaiting approval"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard
            title="Expired Ads"
            value={stats.expired_ads || 0}
            change="Need renewal"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: '12px', boxShadow: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>Ad Performance</Typography>
            <BarChart width={500} height={300} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="divider" />
              <XAxis dataKey="name" stroke="text.secondary" />
              <YAxis stroke="text.secondary" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: 'background.paper', border: '1px solid #e0e0e0', color: 'text.primary' }} />
              <Legend />
              <Bar dataKey="views" fill="#42a5f5" />
              <Bar dataKey="clicks" fill="#66bb6a" />
            </BarChart>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: '12px', boxShadow: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>Recent Ads</Typography>
            <TableContainer sx={{ bgcolor: 'background.default', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ads.map(ad => (
                    <TableRow key={ad.id} sx={{ '&:hover': { bgcolor: 'grey.50' }, transition: 'background-color 0.2s' }}>
                      <TableCell sx={{ color: 'text.secondary' }}>{ad.title}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{ad.category.name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>${ad.price}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" size="small" sx={{ mr: 1, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, color: 'white', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                          Edit
                        </Button>
                        <Button variant="contained" color="secondary" size="small" sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }, color: 'white', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', color: 'text.primary', borderRadius: '12px', boxShadow: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>Recent Activity</Typography>
            {ads.length > 0 ? (
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {ads.slice(0, 5).map(ad => (
                  <li key={ad.id} style={{ marginBottom: '8px', color: 'text.secondary' }}>
                    You posted a new ad: <span style={{ fontWeight: 'bold', color: '#1976d2' }}>{ad.title}</span> in <span style={{ fontWeight: 'bold', color: '#388e3c' }}>{ad.category.name}</span> on {new Date(ad.created_at).toLocaleDateString()}.
                  </li>
                ))}
              </ul>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>No recent ad activity to display.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;