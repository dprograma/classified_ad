import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Avatar, Chip, Divider,
  CircularProgress, Card, CardContent, Skeleton, IconButton, Breadcrumbs, Link
} from '@mui/material';
import {
  AccessTime, Visibility, Person, ArrowBack, Share, CalendarToday,
  NavigateNext
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function NewsDetail() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const { callApi } = useApi();

  useEffect(() => {
    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  const fetchNewsDetail = async () => {
    setLoading(true);
    try {
      const response = await callApi('get', `/news/${slug}`);
      setNews(response);
    } catch (error) {
      toast.error('Failed to load news article');
      navigate('/news');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.summary || news.title,
          url: url,
        });
      } catch (error) {
        // User cancelled share or share failed
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch (error) {
      return date;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Skeleton variant="text" height={60} width="80%" />
        <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="30%" />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={30} />
      </Container>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          News article not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/news"
            color="inherit"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            News
          </Link>
          <Typography color="text.primary">{news.title}</Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <IconButton
          onClick={() => navigate('/news')}
          sx={{
            mb: 3,
            '&:hover': { backgroundColor: 'rgba(108, 71, 255, 0.08)' }
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Article Card */}
        <Card sx={{ mb: 4, overflow: 'visible' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {/* Title */}
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2
              }}
            >
              {news.title}
            </Typography>

            {/* Meta Information */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  alt={news.author?.name}
                  src={news.author?.profile_picture ? getStorageUrl(news.author.profile_picture) : undefined}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {news.author?.name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Author
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(news.published_at)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {news.reading_time || 1} min read
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {news.views_count || 0} views
                </Typography>
              </Box>

              <Box sx={{ ml: 'auto' }}>
                <IconButton
                  onClick={handleShare}
                  sx={{
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'rgba(108, 71, 255, 0.08)' }
                  }}
                  title="Share article"
                >
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Summary */}
            {news.summary && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  pl: 3,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main'
                }}
              >
                {news.summary}
              </Typography>
            )}

            {/* Thumbnail */}
            {news.thumbnail_url && (
              <Box
                component="img"
                src={news.thumbnail_url}
                alt={news.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 500,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 4
                }}
              />
            )}

            {/* Content */}
            <Typography
              variant="body1"
              component="div"
              sx={{
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.primary',
                '& p': { mb: 2 },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  my: 3
                },
                '& h2, & h3, & h4': {
                  mt: 4,
                  mb: 2,
                  fontWeight: 700
                },
                '& ul, & ol': {
                  pl: 4,
                  mb: 2
                },
                '& li': {
                  mb: 1
                },
                '& a': {
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                },
                '& blockquote': {
                  pl: 3,
                  borderLeft: '4px solid',
                  borderColor: 'grey.300',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  my: 3
                }
              }}
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {/* Additional Images */}
            {news.images && news.images.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Gallery
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
                  {news.images.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={getStorageUrl(image)}
                      alt={`${news.title} - Image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Status Badge (for admins/editors - if needed) */}
        {news.status !== 'published' && (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`Status: ${news.status}`}
              color={news.status === 'draft' ? 'warning' : 'default'}
              size="small"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default NewsDetail;
