import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Stack,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Share,
  TrendingUp,
  Pause,
  PlayArrow,
  MoreVert,
  Search,
  FilterList,
  Star,
  Schedule,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getStorageUrl } from '../../config/api';
import BoostAd from '../BoostAd';

const MyAdsSection = ({ ads, onRefresh }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { callApi, loading } = useApi();

  // Filter ads based on status and search
  const filterAds = (status) => {
    let filtered = ads || [];
    
    switch (status) {
      case 'active':
        filtered = filtered.filter(ad => ad.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(ad => ad.status === 'inactive' || ad.status === 'paused');
        break;
      case 'boosted':
        filtered = filtered.filter(ad => ad.is_boosted && new Date(ad.boost_expires_at) > new Date());
        break;
      case 'expired':
        filtered = filtered.filter(ad => ad.status === 'expired');
        break;
      default:
        break;
    }
    
    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleDeleteAd = async () => {
    if (!selectedAd) return;
    
    try {
      await callApi('DELETE', `/ads/${selectedAd.id}`);
      setDeleteDialogOpen(false);
      setSelectedAd(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const handleToggleAdStatus = async (ad) => {
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    
    try {
      await callApi('PUT', `/ads/${ad.id}`, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  const handleMenuClick = (event, ad) => {
    setAnchorEl(event.currentTarget);
    setSelectedAd(ad);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAd(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'paused': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (ad) => {
    if (ad.is_boosted && new Date(ad.boost_expires_at) > new Date()) {
      return <TrendingUp fontSize="small" />;
    }
    switch (ad.status) {
      case 'active': return <CheckCircle fontSize="small" />;
      case 'inactive': return <Pause fontSize="small" />;
      case 'expired': return <Cancel fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const tabLabels = ['All Ads', 'Active', 'Inactive', 'Boosted', 'Expired'];
  const tabFilters = ['all', 'active', 'inactive', 'boosted', 'expired'];
  
  const currentAds = filterAds(tabFilters[selectedTab]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            My Ads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your listings and track performance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/post-ad"
          size="large"
        >
          Post New Ad
        </Button>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search your ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={index}
              label={`${label} (${filterAds(tabFilters[index]).length})`}
            />
          ))}
        </Tabs>
      </Card>

      {/* Ads Table/Grid */}
      {currentAds.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No ads found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {selectedTab === 0 ? "You haven't posted any ads yet." : `No ${tabLabels[selectedTab].toLowerCase()} ads found.`}
            </Typography>
            <Button variant="contained" startIcon={<Add />} component={Link} to="/post-ad">
              Post Your First Ad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentAds.map((ad) => (
                  <TableRow key={ad.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={ad.images?.[0] ? getStorageUrl(ad.images[0].image_path) : null}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        >
                          {ad.title.charAt(0)}
                        </Avatar>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight="bold">
                              {ad.title}
                            </Typography>
                            {ad.is_boosted && new Date(ad.boost_expires_at) > new Date() && (
                              <Star color="primary" fontSize="small" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {ad.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ad.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ad.status}
                        color={getStatusColor(ad.status)}
                        size="small"
                        icon={getStatusIcon(ad)}
                        variant={ad.is_boosted && new Date(ad.boost_expires_at) > new Date() ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₦{ad.price?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="body2">
                          {ad.views_count || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ad.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Ad">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/ads/${ad.id}`}
                            target="_blank"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Ad">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/ads/${ad.id}/edit`}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Boost Ad">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAd(ad);
                              setBoostDialogOpen(true);
                            }}
                            disabled={ad.is_boosted && new Date(ad.boost_expires_at) > new Date()}
                          >
                            <TrendingUp />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, ad)}
                          >
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedAd) handleToggleAdStatus(selectedAd);
          handleMenuClose();
        }}>
          {selectedAd?.status === 'active' ? <Pause sx={{ mr: 1 }} /> : <PlayArrow sx={{ mr: 1 }} />}
          {selectedAd?.status === 'active' ? 'Pause Ad' : 'Activate Ad'}
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedAd) {
            navigator.share({
              title: selectedAd.title,
              url: `${window.location.origin}/ads/${selectedAd.id}`
            }).catch(() => {
              // Fallback for browsers that don't support Web Share API
              navigator.clipboard.writeText(`${window.location.origin}/ads/${selectedAd.id}`);
            });
          }
          handleMenuClose();
        }}>
          <Share sx={{ mr: 1 }} />
          Share Ad
        </MenuItem>
        
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Ad
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Ad</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAd?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAd} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Boost Ad Dialog */}
      {boostDialogOpen && selectedAd && (
        <BoostAd
          adId={selectedAd.id}
          adTitle={selectedAd.title}
          onClose={() => {
            setBoostDialogOpen(false);
            setSelectedAd(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </Box>
  );
};

export default MyAdsSection;