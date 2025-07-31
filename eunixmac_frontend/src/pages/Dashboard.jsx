import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
  useMediaQuery,
  Card,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import KpiCard from '../components/admin/KpiCard';
import {
  FaAd,
  FaEnvelope,
  FaStar,
  FaEye,
  FaMousePointer,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from 'react-icons/fa';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    name: ad.title.substring(0, 15) + '...',
    views: ad.views || Math.floor(Math.random() * 1000),
    clicks: ad.clicks || Math.floor(Math.random() * 500),
  }));

  const kpiData = [
    { title: 'Total Ads', value: stats.ad_count, change: 'Overall', icon: FaAd },
    { title: 'Total Messages', value: stats.message_count, change: 'Overall', icon: FaEnvelope },
    { title: 'Total Reviews', value: stats.review_count, change: 'Overall', icon: FaStar },
    { title: 'Total Views', value: stats.total_views || 0, change: 'Across all your ads', icon: FaEye },
    { title: 'Total Clicks', value: stats.total_clicks || 0, change: 'Across all your ads', icon: FaMousePointer },
    { title: 'Active Ads', value: stats.active_ads || 0, change: 'Currently live', icon: FaCheckCircle },
    { title: 'Pending Ads', value: stats.pending_ads || 0, change: 'Awaiting approval', icon: FaHourglassHalf },
    { title: 'Expired Ads', value: stats.expired_ads || 0, change: 'Need renewal', icon: FaTimesCircle },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f4f6f8', color: 'text.primary', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: isMobile ? 'column' : 'row' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 'bold', mb: isMobile ? 2 : 0 }}>
          Welcome, {user.name}!
        </Typography>
        <Button variant="contained" color="primary" sx={{ borderRadius: '20px', px: 3, width: isMobile ? '100%' : 'auto' }}>
          Create New Ad
        </Button>
      </Box>

      <Grid container spacing={isMobile ? 2 : 3}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <KpiCard
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              icon={kpi.icon}
              loading={loading}
            />
          </Grid>
        ))}

        <Grid item xs={12} lg={7}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Ad Performance</Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: isMobile ? 0 : 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconSize={14} wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }} />
                  <Bar dataKey="views" fill="#8884d8" name="Views" barSize={isMobile ? 15 : 20} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" barSize={isMobile ? 15 : 20} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Ads</Typography>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ads.slice(0, 4).map(ad => (
                    <TableRow key={ad.id}>
                      <TableCell sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>{ad.title}</TableCell>
                      <TableCell sx={{ fontSize: isMobile ? '0.8rem' : 'inherit' }}>${ad.price}</TableCell>
                      <TableCell>
                        <Button size="small" sx={{ mr: 1, fontSize: isMobile ? '0.7rem' : 'inherit' }}>Edit</Button>
                        <Button size="small" color="error" sx={{ fontSize: isMobile ? '0.7rem' : 'inherit' }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Activity</Typography>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {ads.slice(0, 5).map(ad => (
                <li key={ad.id} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '40px', height: '40px', borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0 }}>
                    <FaAd color="#1e88e5" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                      You posted a new ad: <strong>{ad.title}</strong> in <strong>{ad.category.name}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ad.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </li>
              ))}
            </ul>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;