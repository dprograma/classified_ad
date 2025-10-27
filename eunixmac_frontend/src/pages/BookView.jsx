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

const BookView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await callApi('GET', `/books/${id}`);
      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      setError(error.message || 'Failed to load book');
      toast.error('Failed to load book details');
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/books/${id}/download`, {
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

      // Get filename from Content-Disposition header or fallback to book title
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${book.title}.pdf`;
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
      console.error('Error downloading book:', error);
      toast.error('Failed to download book');
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

  if (error || !book) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Book not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard?tab=books')}
          sx={{ mt: 2 }}
        >
          Back to My Books
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
          onClick={() => navigate('/dashboard?tab=books')}
          sx={{ mb: 2 }}
        >
          Back to My Books
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {book.title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={book.category}
            size="small"
            variant="outlined"
          />
          <Chip
            label={book.status || 'pending'}
            color={getStatusColor(book.status)}
            size="small"
            icon={getStatusIcon(book.status)}
          />
          <Chip
            label={`₦${book.price?.toLocaleString()}`}
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
                {book.description}
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
                    {book.file_type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {book.file_size}
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
                    disabled={book.status !== 'active' && book.status !== 'approved'}
                  >
                    Download File
                  </Button>

                  <Button
                    variant="outlined"
                    href={`/books/${book.id}/edit`}
                    fullWidth
                  >
                    Edit Book
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
                      {book.sales_count || 0}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₦{book.total_earnings?.toLocaleString() || 0}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Uploaded
                    </Typography>
                    <Typography variant="body1">
                      {book.created_at ? format(new Date(book.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Status Info */}
            {book.status === 'pending_approval' && (
              <Alert severity="info">
                <Typography variant="body2">
                  Your book is currently under review. You'll be notified once it's approved.
                </Typography>
              </Alert>
            )}

            {book.status === 'rejected' && (
              <Alert severity="error">
                <Typography variant="body2">
                  This book was rejected. Please review our guidelines and resubmit.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookView;