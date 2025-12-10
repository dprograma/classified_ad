import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton
} from '@mui/material';
import {
  Search,
  Delete,
  Download,
  MoreVert,
  TrendingUp,
  Email,
  PersonAdd,
  PersonRemove,
  Verified,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useApi from '../hooks/useApi';

const AdminNewsletterManagement = () => {
  const { callApi, loading } = useApi();
  const [subscriptions, setSubscriptions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
    fetchStatistics();
  }, [page, rowsPerPage, searchTerm, activeTab]);

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams({
        per_page: rowsPerPage,
        page: page + 1, // API uses 1-based pagination
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      const response = await callApi('GET', `/admin/newsletter?${params.toString()}`);

      setSubscriptions(response.data || []);
      setTotalSubscriptions(response.total || 0);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
      setSubscriptions([]);
      setTotalSubscriptions(0);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true);
      const stats = await callApi('GET', '/admin/newsletter/statistics');
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleDeleteClick = (subscription) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription) return;

    try {
      await callApi('DELETE', `/admin/newsletter/${selectedSubscription.id}`);
      toast.success('Subscription deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error(error.message || 'Failed to delete subscription');
    }
  };

  const handleExport = async () => {
    try {
      const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const response = await callApi('GET', `/admin/newsletter/export${params}`, null, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `newsletter_subscriptions_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      toast.error('Failed to export subscriptions');
    }
  };

  const handleMenuOpen = (event, subscription) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubscription(subscription);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubscription(null);
  };

  const renderStatisticsCards = () => {
    if (loadingStats) {
      return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={80} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (!statistics) return null;

    const cards = [
      {
        title: 'Total Subscriptions',
        value: statistics.total || 0,
        icon: <Email sx={{ fontSize: 40 }} />,
        color: 'primary.main',
        bgColor: 'primary.light'
      },
      {
        title: 'Active Subscribers',
        value: statistics.active || 0,
        icon: <Verified sx={{ fontSize: 40 }} />,
        color: 'success.main',
        bgColor: 'success.light'
      },
      {
        title: 'This Month',
        value: statistics.this_month || 0,
        icon: <PersonAdd sx={{ fontSize: 40 }} />,
        color: 'info.main',
        bgColor: 'info.light'
      },
      {
        title: 'Growth Rate',
        value: `${statistics.growth_rate || 0}%`,
        icon: <TrendingUp sx={{ fontSize: 40 }} />,
        color: statistics.growth_rate >= 0 ? 'success.main' : 'error.main',
        bgColor: statistics.growth_rate >= 0 ? 'success.light' : 'error.light'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: card.bgColor,
                      color: card.color
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Newsletter Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage newsletter subscriptions and view statistics
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => { fetchSubscriptions(); fetchStatistics(); }} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={loading}
          >
            Export CSV
          </Button>
        </Stack>
      </Box>

      {renderStatisticsCards()}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <TextField
              placeholder="Search by email..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 300 }}
            />

            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="All" value="all" />
              <Tab label="Active" value="active" />
              <Tab label="Unsubscribed" value="unsubscribed" />
              <Tab label="Verified" value="verified" />
            </Tabs>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : subscriptions.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Email sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No subscriptions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search criteria' : 'Newsletter subscriptions will appear here'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>Subscribed Date</TableCell>
                    <TableCell>Unsubscribed Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {subscription.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.status}
                          color={subscription.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.source}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {subscription.verified_at ? (
                          <Chip
                            icon={<Verified />}
                            label="Yes"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(subscription.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {subscription.unsubscribed_at ? (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(subscription.unsubscribed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, subscription)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={totalSubscriptions}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDeleteClick(selectedSubscription)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the subscription for{' '}
            <strong>{selectedSubscription?.email}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNewsletterManagement;
