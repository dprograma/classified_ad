import React, { useState } from 'react';
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
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';

const EducationalMaterialsSection = ({ materials, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const { callApi, loading } = useApi();

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;
    
    try {
      await callApi('DELETE', `/educational-materials/${selectedMaterial.id}`);
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting material:', error);
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <School sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {materialStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Materials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {materialStats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Schedule sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {materialStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Analytics sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {materialStats.total_sales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AttachMoney sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                ₦{materialStats.total_earnings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                          href={`/educational-materials/${material.id}`}
                          target="_blank"
                        >
                          <Visibility />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          href={`/educational-materials/${material.id}/edit`}
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