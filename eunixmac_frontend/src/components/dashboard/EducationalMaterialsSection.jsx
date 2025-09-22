import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  School,
  Add,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
  CloudUpload,
  Analytics,
  CheckCircle,
  Schedule,
  Cancel
} from '@mui/icons-material';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const EducationalMaterialsSection = ({ materials, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { callApi, loading } = useApi();
  const navigate = useNavigate();

  const handleViewMaterial = (material) => {
    navigate(`/educational-materials/${material.id}`);
  };

  const handleEditMaterial = (material) => {
    navigate(`/educational-materials/${material.id}/edit`);
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      await callApi('DELETE', `/educational-materials/${selectedMaterial.id}`);
      toast.success('Material deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error(error.message || 'Failed to delete material');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'review':
        return 'warning';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'pending':
      case 'review':
        return <Schedule fontSize="small" />;
      case 'rejected':
      case 'inactive':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  const materialStats = {
    total: materials?.length || 0,
    active: materials?.filter(m => m.status === 'active').length || 0,
    pending: materials?.filter(m => m.status === 'pending').length || 0,
    total_sales: materials?.reduce((sum, m) => sum + (m.sales_count || 0), 0) || 0,
    total_earnings: materials?.reduce((sum, m) => sum + (m.total_earnings || 0), 0) || 0
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            My Educational Materials
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your uploaded educational materials and track sales
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          href="/educational-materials/upload"
          size="large"
        >
          Upload Material
        </Button>
      </Box>

      {/* Stats Cards */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 5 }}
        gap="20px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={School}
          value={materialStats.total}
          label="Total Materials"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={CheckCircle}
          value={materialStats.active}
          label="Active Materials"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={Schedule}
          value={materialStats.pending}
          label="Pending Review"
          color="#f59e0b"
          size="medium"
        />

        <EnhancedStatCard
          icon={Analytics}
          value={materialStats.total_sales}
          label="Total Sales"
          color="#8b5cf6"
          size="medium"
        />

        <EnhancedStatCard
          icon={AttachMoney}
          value={`₦${materialStats.total_earnings.toLocaleString()}`}
          label="Total Earnings"
          color="#059669"
          size="medium"
        />
      </StatCardsContainer>

      {/* Materials Table */}
      {materials?.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No materials uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Start by uploading your first educational material to earn from sales.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              href="/educational-materials/upload"
            >
              Upload Your First Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material Details</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Sales</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {material.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {material.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {material.file_type} • {material.file_size}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.category || 'General'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{material.price?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {material.sales_count || 0} sales
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          ₦{material.total_earnings?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={material.status || 'pending'}
                        color={getStatusColor(material.status)}
                        size="small"
                        icon={getStatusIcon(material.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {material.created_at ? format(new Date(material.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewMaterial(material)}
                          title="View Material"
                        >
                          <Visibility />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleEditMaterial(material)}
                          title="Edit Material"
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                          title="Delete Material"
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Guidelines
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Accepted formats:</strong> PDF, DOC, DOCX, PPT, PPTX<br/>
              <strong>Maximum file size:</strong> 10MB<br/>
              <strong>Content policy:</strong> Only educational materials are allowed. All uploads are reviewed before approval.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Educational Material</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMaterial?.title}"? This action cannot be undone and will also remove it from the marketplace.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMaterial} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationalMaterialsSection;