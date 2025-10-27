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

const BooksSection = ({ books, onRefresh }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const { callApi, loading } = useApi();
  const navigate = useNavigate();

  const handleViewBook = (book) => {
    navigate(`/books/${book.id}`);
  };

  const handleEditBook = (book) => {
    navigate(`/books/${book.id}/edit`);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      await callApi('DELETE', `/books/${selectedBook.id}`);
      toast.success('Book deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedBook(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(error.message || 'Failed to delete book');
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

  const bookStats = {
    total: books?.length || 0,
    active: books?.filter(m => m.status === 'active').length || 0,
    pending: books?.filter(m => m.status === 'pending').length || 0,
    total_sales: books?.reduce((sum, m) => sum + (m.sales_count || 0), 0) || 0,
    total_earnings: books?.reduce((sum, m) => sum + (m.total_earnings || 0), 0) || 0
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            My Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your uploaded books and track sales
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          href="/books/upload"
          size="large"
        >
          Upload Book
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
          value={bookStats.total}
          label="Total Books"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={CheckCircle}
          value={bookStats.active}
          label="Active Books"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={Schedule}
          value={bookStats.pending}
          label="Pending Review"
          color="#f59e0b"
          size="medium"
        />

        <EnhancedStatCard
          icon={Analytics}
          value={bookStats.total_sales}
          label="Total Sales"
          color="#8b5cf6"
          size="medium"
        />

        <EnhancedStatCard
          icon={AttachMoney}
          value={`₦${bookStats.total_earnings.toLocaleString()}`}
          label="Total Earnings"
          color="#059669"
          size="medium"
        />
      </StatCardsContainer>

      {/* Books Table */}
      {books?.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No books uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Start by uploading your first book to earn from sales.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              href="/books/upload"
            >
              Upload Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book Details</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Sales</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {book.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {book.file_type} • {book.file_size}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.category || 'General'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{book.price?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {book.sales_count || 0} sales
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          ₦{book.total_earnings?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.status || 'pending'}
                        color={getStatusColor(book.status)}
                        size="small"
                        icon={getStatusIcon(book.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.created_at ? format(new Date(book.created_at), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewBook(book)}
                          title="View Book"
                        >
                          <Visibility />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleEditBook(book)}
                          title="Edit Book"
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBook(book);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                          title="Delete Book"
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
              <strong>Content policy:</strong> Only books are allowed. All uploads are reviewed before approval.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone and will also remove it from the marketplace.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBook} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BooksSection;