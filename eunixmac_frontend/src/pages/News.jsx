import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia,
  Box, Pagination, CircularProgress, TextField, InputAdornment,
  Chip, Skeleton
} from '@mui/material';
import { Search as SearchIcon, AccessTime, Visibility, Person } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { callApi } = useApi();

  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setSearchQuery(queryParam);
      searchNews(queryParam, 1);
    } else {
      fetchNews(1);
    }
  }, [searchParams]);

  const fetchNews = async (pageNum) => {
    setLoading(true);
    try {
      const response = await callApi('get', `/news?page=${pageNum}&per_page=12`);
      setNews(response.data);
      setTotalPages(response.last_page);
      setPage(response.current_page);
    } catch (error) {
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const searchNews = async (query, pageNum) => {
    setLoading(true);
    try {
      const response = await callApi('get', `/news/search?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=12`);
      setNews(response.data);
      setTotalPages(response.last_page);
      setPage(response.current_page);
    } catch (error) {
      toast.error('Failed to search news');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ query: searchQuery.trim() });
      searchNews(searchQuery.trim(), 1);
    } else {
      setSearchParams({});
      fetchNews(1);
    }
  };

  const handlePageChange = (event, value) => {
    if (searchQuery) {
      searchNews(searchQuery, value);
    } else {
      fetchNews(value);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsClick = (slug) => {
    navigate(`/news/${slug}`);
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch (error) {
      return date;
    }
  };

  const NewsCardSkeleton = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="60%" />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Latest News & Updates
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Stay updated with the latest announcements, features, and insights from our platform
          </Typography>

          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              display: 'flex',
              gap: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  backgroundColor: '#fff',
                }
              }}
            />
          </Box>

          {searchQuery && (
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Search results for: "${searchQuery}"`}
                onDelete={() => {
                  setSearchQuery('');
                  setSearchParams({});
                  fetchNews(1);
                }}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        {/* News Grid */}
        {loading ? (
          <Grid container spacing={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <NewsCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : news.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No news found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for updates!'}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={4}>
              {news.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(108, 71, 255, 0.15)',
                      }
                    }}
                    onClick={() => handleNewsClick(item.slug)}
                  >
                    {item.thumbnail_url && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.thumbnail_url}
                        alt={item.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4
                        }}
                      >
                        {item.title}
                      </Typography>

                      {item.summary && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.summary}
                        </Typography>
                      )}

                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.author?.name || 'Admin'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.views_count || 0} views
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                              {item.reading_time || 1} min read
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.published_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
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
      </Container>
    </Box>
  );
}

export default News;
