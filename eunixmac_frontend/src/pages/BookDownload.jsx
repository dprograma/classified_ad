import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import { Download, CheckCircle, MenuBook, ArrowBack, Dashboard } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { getStorageUrl, API_CONFIG } from '../config/api';
import { toast } from 'react-toastify';

function BookDownload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const { callApi } = useApi();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await callApi('GET', `/books/${id}`);
        setBook(data);
      } catch (err) {
        console.error('Error fetching book:', err);
        if (err.response?.status === 403) {
          setError('You have not purchased this book. Please purchase it first.');
        } else {
          setError('Failed to load book details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchBook();
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [id, isAuthenticated]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to download.');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/books/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('You need to purchase this item first.');
          return;
        }
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${book?.title || 'download'}.pdf`;
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

      toast.success('Download started successfully!');
    } catch (err) {
      console.error('Error downloading:', err);
      toast.error('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            {error}
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/ads/${id}`)}
            >
              View Book Details
            </Button>
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!book) return null;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 3 }}>
        {/* Success Banner */}
        <Box
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <CheckCircle sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Purchase Successful!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Your book is ready for download
          </Typography>
        </Box>

        {/* Book Info */}
        <Box sx={{ p: 4 }}>
          <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            {book.preview_image_path && (
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 'auto' }, objectFit: 'cover' }}
                image={getStorageUrl(book.preview_image_path)}
                alt={book.title}
              />
            )}
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {book.description?.substring(0, 200)}
                {book.description?.length > 200 ? '...' : ''}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip icon={<MenuBook />} label="Digital Download" color="info" size="small" />
                {book.file_type && (
                  <Chip label={book.file_type} variant="outlined" size="small" />
                )}
                {book.file_size && (
                  <Chip label={book.file_size} variant="outlined" size="small" />
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                }
              }}
            >
              {downloading ? 'Downloading...' : 'Download Now'}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You can download this book anytime from your dashboard
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/ads/${id}`)}
            >
              Back to Book
            </Button>
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default BookDownload;
