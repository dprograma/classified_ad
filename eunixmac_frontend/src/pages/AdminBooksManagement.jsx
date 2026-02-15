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

const AdminBooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState({ open: false, type: '', book: null });
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
    { id: 83, name: 'Books' },
    { id: 84, name: 'Past Questions' },
    { id: 85, name: 'Ebooks' },
    { id: 86, name: 'Publications' }
  ];

  useEffect(() => {
    fetchBooks();
    fetchStatistics();
  }, [page, rowsPerPage, filters]);

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
        ...filters
      });

      const response = await callApi('GET', `/admin/books?${params}`);
      setBooks(response.data);
      setTotalCount(response.total);
    } catch (error) {
      toast.error('Failed to load books');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await callApi('GET', '/admin/books-stats');
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

  const handleBookSelect = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBooks(books.map(book => book.id));
    } else {
      setSelectedBooks([]);
    }
  };

  const handleViewBook = async (bookId) => {
    try {
      const response = await callApi('GET', `/admin/books/${bookId}`);
      setSelectedBook(response);
      setShowBookDialog(true);
    } catch (error) {
      toast.error('Failed to load book details');
    }
  };

  const handleApproveBook = async (bookId) => {
    try {
      await callApi('PUT', `/admin/books/${bookId}/approve`);
      toast.success('Book approved successfully');
      fetchBooks();
      fetchStatistics();
      if (selectedBook && selectedBook.id === bookId) {
        handleViewBook(bookId);
      }
    } catch (error) {
      toast.error('Failed to approve book');
    }
  };

  const handleRejectBook = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await callApi('PUT', `/admin/books/${approvalDialog.book.id}/reject`, {
        rejection_reason: rejectionReason
      });
      toast.success('Book rejected');
      setRejectionReason('');
      setApprovalDialog({ open: false, type: '', book: null });
      fetchBooks();
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to reject book');
    }
  };

  const handleDeleteBook = async () => {
    if (!deletionReason.trim()) {
      toast.error('Please provide a deletion reason');
      return;
    }

    try {
      await callApi('DELETE', `/admin/books/${approvalDialog.book.id}`, {
        deletion_reason: deletionReason
      });
      toast.success('Book deleted successfully');
      setDeletionReason('');
      setApprovalDialog({ open: false, type: '', book: null });
      fetchBooks();
      fetchStatistics();
      setShowBookDialog(false);
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const bookDate = new Date(date);
    const diffMs = now - bookDate;
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
          Books Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchBooks();
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
          value={statistics.total_books || 0}
          label="Total Books"
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
          value={statistics.approved_books || 0}
          label="Active Books"
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
              placeholder="Search books..."
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

      {/* Books Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedBooks.length > 0 && selectedBooks.length < books.length}
                    checked={books.length > 0 && selectedBooks.length === books.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Book</TableCell>
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
              ) : books.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No books found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                books.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBooks.includes(book.id)}
                        onChange={() => handleBookSelect(book.id)}
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
                            {book.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {book.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {book.user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {book.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={book.category?.parent?.name || book.category?.name}
                          size="small"
                          variant="outlined"
                        />
                        {book.category?.parent && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {book.category?.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.status.replace('_', ' ')}
                        size="small"
                        color={statusColors[book.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{book.price.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {book.sales_count} sales
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₦{book.total_earnings.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {book.file_type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {book.file_size}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTimeAgo(book.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewBook(book.id)}
                        >
                          <Visibility />
                        </IconButton>
                        {book.status === 'pending_approval' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveBook(book.id)}
                            >
                              <ThumbUp />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setApprovalDialog({
                                open: true,
                                type: 'reject',
                                book: book
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
                            book: book
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

      {/* Book Detail Dialog */}
      <Dialog
        open={showBookDialog}
        onClose={() => setShowBookDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedBook && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedBook.title}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedBook.status.replace('_', ' ')}
                    color={statusColors[selectedBook.status]}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={0}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Book Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" paragraph>
                          <strong>Description:</strong>
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {selectedBook.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Category:</strong> {selectedBook.category?.parent?.name || selectedBook.category?.name}
                          {selectedBook.category?.parent && ` > ${selectedBook.category?.name}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Price:</strong> ₦{selectedBook.price.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>File Type:</strong> {selectedBook.file_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>File Size:</strong> {selectedBook.file_size}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Recent Purchases */}
                  {selectedBook.recent_purchases?.length > 0 && (
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Recent Purchases
                      </Typography>
                      {selectedBook.recent_purchases.map((purchase, index) => (
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
                        <strong>Name:</strong> {selectedBook.user?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedBook.user?.email}
                      </Typography>
                      {selectedBook.user?.phone_number && (
                        <Typography variant="body2">
                          <strong>Phone:</strong> {selectedBook.user?.phone_number}
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
                        <strong>Sales:</strong> {selectedBook.sales_count}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Earnings:</strong> ₦{selectedBook.total_earnings.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Action Buttons */}
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Actions
                    </Typography>
                    <Stack spacing={2}>
                      {selectedBook.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApproveBook(selectedBook.id)}
                          >
                            Approve Book
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => setApprovalDialog({
                              open: true,
                              type: 'reject',
                              book: selectedBook
                            })}
                          >
                            Reject Book
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
                          book: selectedBook
                        })}
                      >
                        Delete Book
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowBookDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Rejection/Deletion Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ open: false, type: '', book: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {approvalDialog.type === 'reject' ? 'Reject Book' : 'Delete Book'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            {approvalDialog.type === 'reject'
              ? 'Please provide a reason for rejecting this book:'
              : 'Please provide a reason for deleting this book:'}
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
          <Button onClick={() => setApprovalDialog({ open: false, type: '', book: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={approvalDialog.type === 'reject' ? handleRejectBook : handleDeleteBook}
            disabled={approvalDialog.type === 'reject' ? !rejectionReason.trim() : !deletionReason.trim()}
          >
            {approvalDialog.type === 'reject' ? 'Reject' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBooksManagement;