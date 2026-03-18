import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  Alert, Grid, Card, CardContent, InputAdornment, Pagination, Avatar,
  FormControl, InputLabel, Select, Button, Switch, FormControlLabel
} from '@mui/material';
import {
  Edit, Delete, Search, Visibility, VerifiedUser, People,
  AdminPanelSettings, Person, SupervisorAccount, CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const { callApi } = useApi();

  // View dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    is_admin: false,
    is_agent: false,
    is_affiliate: false,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    agents: 0,
    affiliates: 0,
    verified: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        per_page: 15,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await callApi(
        'get',
        `/admin/users?${params.toString()}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      setUsers(response.data);
      setTotalPages(response.last_page);
      setTotalUsers(response.total);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch counts for each role in parallel
      const [allRes, adminRes, agentRes, affiliateRes] = await Promise.all([
        callApi('get', '/admin/users?per_page=1', null, { Authorization: `Bearer ${token}` }),
        callApi('get', '/admin/users?per_page=1&role=admin', null, { Authorization: `Bearer ${token}` }),
        callApi('get', '/admin/users?per_page=1&role=agent', null, { Authorization: `Bearer ${token}` }),
        callApi('get', '/admin/users?per_page=1&role=affiliate', null, { Authorization: `Bearer ${token}` }),
      ]);

      setStats({
        total: allRes.total || 0,
        admins: adminRes.total || 0,
        agents: agentRes.total || 0,
        affiliates: affiliateRes.total || 0,
      });
    } catch (error) {
      console.error('Failed to load user statistics');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // View user
  const handleViewUser = (user) => {
    setViewingUser(user);
    setViewDialogOpen(true);
  };

  // Edit user
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      is_admin: user.is_admin || false,
      is_agent: user.is_agent || false,
      is_affiliate: user.is_affiliate || false,
    });
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = (field) => {
    setEditFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEditSubmit = async () => {
    setEditSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await callApi(
        'put',
        `/admin/users/${editingUser.id}`,
        editFormData,
        { Authorization: `Bearer ${token}` }
      );
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Verify user
  const handleVerifyUser = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await callApi(
        'put',
        `/admin/users/${user.id}/verify`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      toast.success(`${user.name} has been verified`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to verify user');
    }
  };

  // Delete user
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await callApi(
        'delete',
        `/admin/users/${deletingUser.id}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleChips = (user) => {
    const chips = [];
    if (user.is_admin) chips.push(<Chip key="admin" label="Admin" size="small" color="error" sx={{ mr: 0.5 }} />);
    if (user.is_agent) chips.push(<Chip key="agent" label="Agent" size="small" color="info" sx={{ mr: 0.5 }} />);
    if (user.is_affiliate) chips.push(<Chip key="affiliate" label="Affiliate" size="small" color="success" sx={{ mr: 0.5 }} />);
    if (chips.length === 0) chips.push(<Chip key="user" label="User" size="small" color="default" />);
    return chips;
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date || '-';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, edit, and manage all registered users on the platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6C47FF 0%, #9747FF 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Users
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.admins}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Admins
                  </Typography>
                </Box>
                <AdminPanelSettings sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #00C6AE 0%, #00D4B8 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.agents}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Agents
                  </Typography>
                </Box>
                <SupervisorAccount sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFBF00 0%, #FFD24D 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {stats.affiliates}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Affiliates
                  </Typography>
                </Box>
                <VerifiedUser sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
            <MenuItem value="agent">Agents</MenuItem>
            <MenuItem value="affiliate">Affiliates</MenuItem>
            <MenuItem value="regular">Regular Users</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {totalUsers} user{totalUsers !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">No users found matching your criteria.</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Ads</strong></TableCell>
                  <TableCell><strong>Verified</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.profile_picture}
                          sx={{ width: 36, height: 36 }}
                        >
                          {user.name?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone_number || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getRoleChips(user)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.ads_count ?? 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {user.email_verified_at ? (
                        <Chip label="Verified" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="Unverified" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(user.created_at)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="default"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      {!user.is_verified && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleVerifyUser(user)}
                          title="Verify User"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(user)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewingUser && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={viewingUser.profile_picture}
                  sx={{ width: 64, height: 64 }}
                >
                  {viewingUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {viewingUser.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {getRoleChips(viewingUser)}
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewingUser.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewingUser.phone_number || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewingUser.location || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Total Ads</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewingUser.ads_count ?? 0}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email Verified</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {viewingUser.email_verified_at ? formatDate(viewingUser.email_verified_at) : 'Not verified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Joined</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(viewingUser.created_at)}</Typography>
                </Grid>
                {viewingUser.bio && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Bio</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewingUser.bio}</Typography>
                  </Grid>
                )}
                {viewingUser.provider && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Login Provider</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {viewingUser.provider}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {viewingUser && (
            <Button
              variant="contained"
              onClick={() => {
                setViewDialogOpen(false);
                handleEditClick(viewingUser);
              }}
            >
              Edit User
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={editFormData.name}
              onChange={handleEditInputChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={editFormData.email}
              onChange={handleEditInputChange}
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={editFormData.phone_number}
              onChange={handleEditInputChange}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Roles & Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.is_admin}
                      onChange={() => handleEditToggle('is_admin')}
                      color="error"
                    />
                  }
                  label="Administrator"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.is_agent}
                      onChange={() => handleEditToggle('is_agent')}
                      color="info"
                    />
                  }
                  label="Agent"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.is_affiliate}
                      onChange={() => handleEditToggle('is_affiliate')}
                      color="success"
                    />
                  }
                  label="Affiliate"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editSubmitting}
          >
            {editSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
            This will also delete all their ads and related data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUserManagement;
