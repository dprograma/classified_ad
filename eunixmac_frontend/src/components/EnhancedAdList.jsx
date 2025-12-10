import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Badge,
  Pagination,
  CircularProgress,
  Alert,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Star,
  LocationOn,
  AccessTime,
  MoreVert,
  ViewModule,
  ViewList,
  GridView
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';
import EnhancedSearch from './EnhancedSearch';

function EnhancedAdList({ initialSearchParams = {} }) {
  const [ads, setAds] = useState([]);
  const [searchMetadata, setSearchMetadata] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [currentFilters, setCurrentFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [rateLimitError, setRateLimitError] = useState(false);

  const { callApi, loading, error } = useApi();

  const fetchAds = useCallback(async (searchParams = {}, page = 1) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...searchParams
      });

      const queryString = params.toString() ? `?${params.toString()}` : '';
      console.log('Fetching ads with query:', queryString, 'Search params:', searchParams);
      
      // Check cache first
      const cacheKey = `ads_${queryString}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      
      // Use cache if it's less than 2 minutes old
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 120000) {
        console.log('Using cached data for:', queryString);
        const parsed = JSON.parse(cachedData);
        setAds(parsed.data || []);
        setSearchMetadata(parsed.search_metadata || {});
        setCurrentPage(parsed.current_page || 1);
        return;
      }

      console.log('Making API call to: /ads' + queryString);
      const response = await callApi('GET', `/ads${queryString}`);
      
      console.log('API response - Total ads found:', response.data?.length || 0);
      setAds(response.data || []);
      setSearchMetadata(response.search_metadata || {});
      setCurrentPage(response.current_page || 1);
      
      // Cache the response
      sessionStorage.setItem(cacheKey, JSON.stringify(response));
      sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());
    } catch (error) {
      console.error('Error fetching ads:', error);
      
      // If it's a rate limiting error, show a user-friendly message
      if (error.response?.status === 429) {
        setRateLimitError(true);
        // Clear rate limit error after 10 seconds
        setTimeout(() => {
          setRateLimitError(false);
        }, 10000);
      } else {
        setAds([]);
      }
    }
  }, [callApi, perPage]);

  // Initialize search when initialSearchParams changes
  useEffect(() => {
    const initializeSearch = async () => {
      // Create a stable key from params to detect changes
      const paramsKey = JSON.stringify(initialSearchParams);
      console.log('EnhancedAdList initializing with params:', initialSearchParams, 'Key:', paramsKey);
      
      if (Object.keys(initialSearchParams).length > 0) {
        setCurrentFilters(initialSearchParams);
        await fetchAds(initialSearchParams, 1);
      } else {
        console.log('No initial search params, fetching all ads');
        await fetchAds();
      }
    };
    
    initializeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialSearchParams)]); // Use stringified version to detect actual changes

  const handleSearch = (searchParams) => {
    setCurrentFilters(searchParams);
    setCurrentPage(1);
    fetchAds(searchParams, 1);
  };

  const handleFiltersChange = (filters) => {
    // Optional: Apply filters in real-time or wait for explicit search
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchAds(currentFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (event) => {
    setPerPage(event.target.value);
    setCurrentPage(1);
    
    // Debounce the API call to prevent rapid requests
    setTimeout(() => {
      fetchAds(currentFilters, 1);
    }, 300);
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getConditionChipColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
      case 'brand new':
        return 'success';
      case 'like new':
        return 'info';
      case 'good':
        return 'warning';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderGridView = () => (
    <Grid container spacing={3}>
      {ads.map((ad) => (
        <Grid item key={ad.id} xs={12} sm={6} md={4} lg={3}>
          <Badge
            sx={{
              width: '100%',
              '& .MuiBadge-badge': {
                top: 8,
                right: 8,
                zIndex: 1
              }
            }}
          >
            <Card
              component={Link}
              to={`/ads/${ad.id}`}
              sx={{
                textDecoration: 'none',
                height: '100%',
                width: '100%',
                border: 1,
                borderColor: 'divider',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >

              {ad.images && ad.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={getStorageUrl(ad.preview_image) || getStorageUrl(ad.images[0]?.image_path)}
                  alt={ad.title}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                />
              )}

              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '1rem',
                    lineHeight: 1.3
                  }}
                >
                  {ad.title}
                </Typography>

                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {formatPrice(ad.price)}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {ad.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(ad.created_at)}
                  </Typography>
                </Box>

                {/* Custom fields (condition, brand, etc.) */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {ad.custom_fields?.slice(0, 2).map((field, index) => (
                    <Chip
                      key={index}
                      label={field.field_value}
                      size="small"
                      variant="outlined"
                      color={field.field_name === 'condition' ? getConditionChipColor(field.field_value) : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Badge>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Box>
      {ads.map((ad) => (
        <Card
          key={ad.id}
          component={Link}
          to={`/ads/${ad.id}`}
          sx={{
            mb: 2,
            textDecoration: 'none',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              boxShadow: 3,
            }
          }}
        >
          <Box sx={{ display: 'flex', p: 2 }}>
            {ad.images && ad.images.length > 0 && (
              <CardMedia
                component="img"
                sx={{ width: 150, height: 120, objectFit: 'cover', borderRadius: 1 }}
                image={getStorageUrl(ad.preview_image) || getStorageUrl(ad.images[0]?.image_path)}
                alt={ad.title}
              />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {ad.title}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  {formatPrice(ad.price)}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {ad.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {ad.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(ad.created_at)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {ad.custom_fields?.slice(0, 3).map((field, index) => (
                    <Chip
                      key={index}
                      label={field.field_value}
                      size="small"
                      variant="outlined"
                      color={field.field_name === 'condition' ? getConditionChipColor(field.field_value) : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ mt: 4 }}>
      {/* Enhanced Search Component */}
      <EnhancedSearch onSearch={handleSearch} onFiltersChange={handleFiltersChange} />

      {/* Results Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {searchMetadata.search_term ? `Search Results for "${searchMetadata.search_term}"` : 'All Ads'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchMetadata.total_count || 0} ads found
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <GridView />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Box>

            {/* Results Per Page */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Per Page</InputLabel>
              <Select value={perPage} onChange={handlePerPageChange} label="Per Page">
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
                <MenuItem value={36}>36</MenuItem>
                <MenuItem value={48}>48</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Active Filters Display */}
        {Object.keys(currentFilters).length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
              Active filters:
            </Typography>
            {Object.entries(currentFilters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
              return (
                <Chip
                  key={key}
                  label={`${key.replace('_', ' ')}: ${displayValue}`}
                  size="small"
                  onDelete={() => {
                    const newFilters = { ...currentFilters };
                    delete newFilters[key];
                    handleSearch(newFilters);
                  }}
                />
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Rate Limit Error */}
      {rateLimitError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Too many requests. Please wait a moment before trying again. Using cached results when available.
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        renderSkeletons()
      ) : ads.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No ads found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or clearing some filters.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Ad Results */}
          {viewMode === 'grid' ? renderGridView() : renderListView()}

          {/* Pagination */}
          {searchMetadata.total_count > perPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(searchMetadata.total_count / perPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default EnhancedAdList;