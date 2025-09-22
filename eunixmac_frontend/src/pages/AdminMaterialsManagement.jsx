import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  Alert,
  Tooltip,
  Checkbox,
  Menu,
  MenuList,
  MenuItem as MenuListItem,
  Divider,
  CircularProgress,
  Badge,
  Avatar
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  CheckCircle,
  Cancel,
  Delete,
  Download,
  Refresh,
  School,
  TrendingUp,
  Assignment,
  Warning,
  CloudDownload,
  Person,
  Category,
  AttachMoney,
  MoreVert,
  FilePresent,
  Schedule,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';
import EnhancedStatCard from '../components/common/EnhancedStatCard';
import StatCardsContainer from '../components/common/StatCardsContainer';

const AdminMaterialsManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState({ open: false, type: '', material: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const { callApi, loading } = useApi();

  const statusColors = {
    active: 'success',
    pending_approval: 'warning',
    rejected: 'error',
    draft: 'default'
  };

  const categories = [
    { id: 83, name: 'Educational Material' },
    { id: 84, name: 'Past Questions' },
    { id: 85, name: 'Publications' },
    { id: 86, name: 'Ebooks' }
  ];

  useEffect(() => {
    fetchMaterials();
    fetchStatistics();
  }, [page, rowsPerPage, filters]);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
        ...filters
      });

      const response = await callApi('GET', `/admin/materials?${params}`);
      setMaterials(response.data);
      setTotalCount(response.total);
    } catch (error) {
      toast.error('Failed to load materials');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await callApi('GET', '/admin/materials-stats');
      setStatistics(response);
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleMaterialSelect = (materialId) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedMaterials(materials.map(material => material.id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleViewMaterial = async (materialId) => {
    try {
      const response = await callApi('GET', `/admin/materials/${materialId}`);
      setSelectedMaterial(response);
      setShowMaterialDialog(true);
    } catch (error) {
      toast.error('Failed to load material details');
    }
  };

  const handleApproveMaterial = async (materialId) => {
    try {
      await callApi('PUT', `/admin/materials/${materialId}/approve`);
      toast.success('Material approved successfully');
      fetchMaterials();
      fetchStatistics();
      if (selectedMaterial && selectedMaterial.id === materialId) {
        handleViewMaterial(materialId);
      }
    } catch (error) {
      toast.error('Failed to approve material');
    }
  };

  const handleRejectMaterial = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await callApi('PUT', `/admin/materials/${approvalDialog.material.id}/reject`, {
        rejection_reason: rejectionReason
      });
      toast.success('Material rejected');
      setRejectionReason('');
      setApprovalDialog({ open: false, type: '', material: null });
      fetchMaterials();
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to reject material');
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deletionReason.trim()) {
      toast.error('Please provide a deletion reason');
      return;
    }

    try {
      await callApi('DELETE', `/admin/materials/${approvalDialog.material.id}`, {
        deletion_reason: deletionReason
      });
      toast.success('Material deleted successfully');
      setDeletionReason('');
      setApprovalDialog({ open: false, type: '', material: null });
      fetchMaterials();
      fetchStatistics();
      setShowMaterialDialog(false);
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const materialDate = new Date(date);
    const diffMs = now - materialDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Educational Materials Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchMaterials();
            fetchStatistics();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={School}
          value={statistics.total_materials || 0}
          label="Total Materials"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={Schedule}
          value={statistics.pending_approval || 0}
          label="Pending Approval"
          color="#f59e0b"
          size="medium"
        />

        <EnhancedStatCard
          icon={TrendingUp}
          value={statistics.total_sales || 0}
          label="Total Sales"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={CheckCircle}
          value={statistics.approved_materials || 0}
          label="Active Materials"
          color="#10b981"
          size="medium"
        />
      </StatCardsContainer>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search materials..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category_id}
                label="Category"
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setFilters({ status: '', category_id: '', search: '' });
                setPage(0);
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Materials Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedMaterials.length > 0 && selectedMaterials.length < materials.length}
                    checked={materials.length > 0 && selectedMaterials.length === materials.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sales</TableCell>
                <TableCell>File Info</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No materials found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedMaterials.includes(material.id)}
                        onChange={() => handleMaterialSelect(material.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          variant="rounded"
                          sx={{ bgcolor: 'primary.light' }}
                        >
                          <FilePresent />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: 200 }}>
                            {material.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {material.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {material.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.category?.name}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.status.replace('_', ' ')}
                        size="small"
                        color={statusColors[material.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{material.price.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {material.sales_count} sales
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₦{material.total_earnings.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {material.file_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {material.file_size}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTimeAgo(material.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewMaterial(material.id)}
                        >
                          <Visibility />
                        </IconButton>
                        {material.status === 'pending_approval' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveMaterial(material.id)}
                            >
                              <ThumbUp />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setApprovalDialog({
                                open: true,
                                type: 'reject',
                                material: material
                              })}
                            >
                              <ThumbDown />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setApprovalDialog({
                            open: true,
                            type: 'delete',
                            material: material
                          })}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Material Detail Dialog */}
      <Dialog
        open={showMaterialDialog}
        onClose={() => setShowMaterialDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedMaterial && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedMaterial.title}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedMaterial.status.replace('_', ' ')}
                    color={statusColors[selectedMaterial.status]}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={0}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Material Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" paragraph>
                          <strong>Description:</strong>
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {selectedMaterial.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Category:</strong> {selectedMaterial.category?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Price:</strong> ₦{selectedMaterial.price.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>File Type:</strong> {selectedMaterial.file_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>File Size:</strong> {selectedMaterial.file_size}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Recent Purchases */}
                  {selectedMaterial.recent_purchases?.length > 0 && (
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Recent Purchases
                      </Typography>
                      {selectedMaterial.recent_purchases.map((purchase, index) => (
                        <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                          <Typography variant="body2">
                            {purchase.user?.name} ({purchase.user?.email})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  {/* Agent Information */}
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Agent Information
                    </Typography>
                    <Box>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedMaterial.user?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedMaterial.user?.email}
                      </Typography>
                      {selectedMaterial.user?.phone_number && (
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedMaterial.user?.phone_number}
                        </Typography>
                      )}
                    </Box>
                  </Paper>

                  {/* Performance Stats */}
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Performance
                    </Typography>
                    <Box>
                      <Typography variant="body2">
                        <strong>Sales:</strong> {selectedMaterial.sales_count}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Earnings:</strong> ₦{selectedMaterial.total_earnings.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Action Buttons */}
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Actions
                    </Typography>
                    <Stack spacing={2}>
                      {selectedMaterial.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApproveMaterial(selectedMaterial.id)}
                          >
                            Approve Material
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => setApprovalDialog({
                              open: true,
                              type: 'reject',
                              material: selectedMaterial
                            })}
                          >
                            Reject Material
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setApprovalDialog({
                          open: true,
                          type: 'delete',
                          material: selectedMaterial
                        })}
                      >
                        Delete Material
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowMaterialDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Rejection/Deletion Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ open: false, type: '', material: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalDialog.type === 'reject' ? 'Reject Material' : 'Delete Material'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            {approvalDialog.type === 'reject'
              ? 'Please provide a reason for rejecting this material:'
              : 'Please provide a reason for deleting this material:'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={approvalDialog.type === 'reject' ? rejectionReason : deletionReason}
            onChange={(e) => {
              if (approvalDialog.type === 'reject') {
                setRejectionReason(e.target.value);
              } else {
                setDeletionReason(e.target.value);
              }
            }}
            placeholder={approvalDialog.type === 'reject'
              ? "e.g., Content does not meet quality standards..."
              : "e.g., Violates content policy..."}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog({ open: false, type: '', material: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={approvalDialog.type === 'reject' ? handleRejectMaterial : handleDeleteMaterial}
            disabled={approvalDialog.type === 'reject' ? !rejectionReason.trim() : !deletionReason.trim()}
          >
            {approvalDialog.type === 'reject' ? 'Reject' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMaterialsManagement;