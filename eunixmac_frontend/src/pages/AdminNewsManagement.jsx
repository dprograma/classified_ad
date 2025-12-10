import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  Alert, Grid, Card, CardContent, InputAdornment, Pagination, Tabs, Tab,
  FormControl, InputLabel, Select
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility, Search, Image as ImageIcon,
  TrendingUp, Article, Drafts, Archive
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';
import { format } from 'date-fns';

function AdminNewsManagement() {
  const [news, setNews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [deletingNewsId, setDeletingNewsId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { callApi } = useApi();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    status: 'draft',
    published_at: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
    fetchStatistics();
  }, [statusFilter, page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await callApi(
        'get',
        `/admin/news?status=${statusFilter}&page=${page}&per_page=10`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      setNews(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await callApi(
        'get',
        '/admin/news/statistics',
        null,
        { Authorization: `Bearer ${token}` }
      );
      setStatistics(response);
    } catch (error) {
      console.error('Failed to load statistics');
    }
  };

  const handleOpenDialog = (newsItem = null) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        summary: newsItem.summary || '',
        content: newsItem.content,
        status: newsItem.status,
        published_at: newsItem.published_at ? format(new Date(newsItem.published_at), "yyyy-MM-dd'T'HH:mm") : '',
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        status: 'draft',
        published_at: '',
      });
    }
    setThumbnailFile(null);
    setImageFiles([]);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      status: 'draft',
      published_at: '',
    });
    setThumbnailFile(null);
    setImageFiles([]);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail size must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    setImageFiles(validFiles);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      data.append('title', formData.title);
      data.append('summary', formData.summary);
      data.append('content', formData.content);
      data.append('status', formData.status);
      if (formData.published_at) {
        data.append('published_at', formData.published_at);
      }

      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      imageFiles.forEach((file, index) => {
        data.append(`images[${index}]`, file);
      });

      if (editingNews) {
        await callApi(
          'post',
          `/admin/news/${editingNews.id}`,
          data,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'X-HTTP-Method-Override': 'PUT'
          }
        );
        toast.success('News updated successfully');
      } else {
        await callApi(
          'post',
          '/admin/news',
          data,
          {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        );
        toast.success('News created successfully');
      }

      handleCloseDialog();
      fetchNews();
      fetchStatistics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (newsId) => {
    setDeletingNewsId(newsId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await callApi(
        'delete',
        `/admin/news/${deletingNewsId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      toast.success('News deleted successfully');
      setOpenDeleteDialog(false);
      setDeletingNewsId(null);
      fetchNews();
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to delete news');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return date;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          News Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, edit, and manage news articles for your platform
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #6C47FF 0%, #9747FF 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                      {statistics.total}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Total News
                    </Typography>
                  </Box>
                  <Article sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                      {statistics.published}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Published
                    </Typography>
                  </Box>
                  <Visibility sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                      {statistics.draft}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Drafts
                    </Typography>
                  </Box>
                  <Drafts sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
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
                      {statistics.total_views.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Total Views
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actions Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: 600 }}
        >
          Create News
        </Button>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* News Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : news.length === 0 ? (
        <Alert severity="info">No news found. Create your first news article!</Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Thumbnail</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Author</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Views</strong></TableCell>
                  <TableCell><strong>Published At</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {news.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      {item.thumbnail_url ? (
                        <Box
                          component="img"
                          src={item.thumbnail_url}
                          alt={item.title}
                          sx={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'grey.200',
                            borderRadius: 1
                          }}
                        >
                          <ImageIcon sx={{ color: 'grey.500' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 300 }}>
                        {item.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.author?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{item.views_count || 0}</TableCell>
                    <TableCell>
                      {item.published_at ? formatDate(item.published_at) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(item.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNews ? 'Edit News' : 'Create New News'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />

            <TextField
              fullWidth
              label="Summary"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              multiline
              rows={2}
              helperText="Brief summary (optional, max 500 characters)"
            />

            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              error={!!formErrors.content}
              helperText={formErrors.content || 'Full article content (HTML supported)'}
              required
              multiline
              rows={8}
            />

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Publish Date & Time"
              name="published_at"
              type="datetime-local"
              value={formData.published_at}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to publish immediately when status is 'Published'"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Thumbnail Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                {thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Max 5MB. Recommended: 1200x630px
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Additional Images (Optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                {imageFiles.length > 0 ? `${imageFiles.length} files selected` : 'Upload Images'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Max 5 images, 5MB each
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : (editingNews ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this news article? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminNewsManagement;
