import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Download,
  Visibility,
  School,
  AttachMoney,
  CheckCircle,
  Schedule,
  Cancel,
  ArrowBack
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

const MaterialView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const data = await callApi('GET', `/educational-materials/${id}`);
      setMaterial(data);
    } catch (error) {
      console.error('Error fetching material:', error);
      setError(error.message || 'Failed to load material');
      toast.error('Failed to load material details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Get the token for direct axios call
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to download');
        return;
      }

      // Use direct fetch for blob download
      const response = await fetch(`${API_CONFIG.BASE_URL}/educational-materials/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or fallback to material title
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${material.title}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started successfully');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast.error('Failed to download material');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'pending_approval':
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
      case 'pending_approval':
        return <Schedule fontSize="small" />;
      case 'rejected':
      case 'inactive':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !material) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Material not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard?tab=educational-materials')}
          sx={{ mt: 2 }}
        >
          Back to My Materials
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard?tab=educational-materials')}
          sx={{ mb: 2 }}
        >
          Back to My Materials
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {material.title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={material.category}
            size="small"
            variant="outlined"
          />
          <Chip
            label={material.status || 'pending'}
            color={getStatusColor(material.status)}
            size="small"
            icon={getStatusIcon(material.status)}
          />
          <Chip
            label={`₦${material.price?.toLocaleString()}`}
            color="primary"
            size="small"
          />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                {material.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                File Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    File Type
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {material.file_type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {material.file_size}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Actions Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    fullWidth
                    onClick={handleDownload}
                    disabled={material.status !== 'active' && material.status !== 'approved'}
                  >
                    Download File
                  </Button>

                  <Button
                    variant="outlined"
                    href={`/educational-materials/${material.id}/edit`}
                    fullWidth
                  >
                    Edit Material
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Performance
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Sales
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {material.sales_count || 0}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₦{material.total_earnings?.toLocaleString() || 0}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Uploaded
                    </Typography>
                    <Typography variant="body1">
                      {material.created_at ? format(new Date(material.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Status Info */}
            {material.status === 'pending_approval' && (
              <Alert severity="info">
                <Typography variant="body2">
                  Your material is currently under review. You'll be notified once it's approved.
                </Typography>
              </Alert>
            )}

            {material.status === 'rejected' && (
              <Alert severity="error">
                <Typography variant="body2">
                  This material was rejected. Please review our guidelines and resubmit.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaterialView;