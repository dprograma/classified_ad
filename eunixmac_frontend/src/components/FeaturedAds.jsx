import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Chip, IconButton, Button } from '@mui/material';
import { FavoriteBorder, Visibility, LocationOn, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useSlowApi from '../hooks/useSlowApi';

const featuredAds = [
  {
    id: 1,
    title: 'iPhone 14 Pro',
    price: '₦950,000',
    originalPrice: '₦1,200,000',
    image: 'https://placehold.co/300x200.png?text=iPhone+14+Pro',
    location: 'Lagos',
    featured: true,
    discount: '21%',
    condition: 'Like New',
    verified: true,
  },
  {
    id: 2,
    title: 'HP Spectre x360',
    price: '₦850,000',
    image: 'https://placehold.co/300x200.png?text=HP+Spectre+x360',
    location: 'Abuja',
    featured: false,
    condition: 'Excellent',
    verified: true,
  },
  {
    id: 3,
    title: 'Toyota Camry 2021',
    price: '₦15,000,000',
    image: 'https://placehold.co/300x200.png?text=Toyota+Camry',
    location: 'Port Harcourt',
    featured: true,
    condition: 'Brand New',
    verified: true,
  },
  {
    id: 4,
    title: 'Samsung 65" QLED TV',
    price: '₦450,000',
    originalPrice: '₦580,000',
    image: 'https://placehold.co/300x200.png?text=Samsung+TV',
    location: 'Kano',
    featured: false,
    discount: '22%',
    condition: 'Good',
    verified: false,
  },
  {
    id: 5,
    title: 'MacBook Pro M2',
    price: '₦1,200,000',
    image: 'https://placehold.co/300x200.png?text=MacBook+Pro',
    location: 'Ibadan',
    featured: true,
    condition: 'Like New',
    verified: true,
  },
];

const FeaturedAds = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [favorites, setFavorites] = useState(new Set());
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { callApi } = useSlowApi(); // Use slower API for featured ads on initial load
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchFeaturedAds();
  }, []);

  const fetchFeaturedAds = async () => {
    // Check cache first
    const cacheKey = 'featured_ads';
    const cachedAds = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
    const now = Date.now();
    
    // Use cache if it's less than 3 minutes old
    if (cachedAds && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 180000) {
      try {
        const parsedAds = JSON.parse(cachedAds);
        setAds(parsedAds);
        setLoading(false);
        return;
      } catch (parseError) {
        console.warn('Failed to parse cached featured ads:', parseError);
        // Continue to fetch from API
      }
    }

    try {
      const data = await callApi('GET', '/ads?featured=true&limit=8');
      let featuredOnlyAds = [];
      
      if (data && data.data && Array.isArray(data.data)) {
        // Filter to only show boosted/featured ads
        featuredOnlyAds = data.data.filter(ad => ad.is_featured || ad.featured || ad.is_boosted);
      } else if (data && Array.isArray(data)) {
        // Filter to only show boosted/featured ads
        featuredOnlyAds = data.filter(ad => ad.is_featured || ad.featured || ad.is_boosted);
      } else {
        // Only use featured ads from static data
        featuredOnlyAds = featuredAds.filter(ad => ad.featured);
      }
      
      setAds(featuredOnlyAds);
      
      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify(featuredOnlyAds));
      sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
    } catch (error) {
      console.error('Error fetching featured ads:', error);
      
      // For rate limiting errors, use cache if available, otherwise use static data
      if (error.response?.status === 429) {
        if (cachedAds) {
          try {
            const parsedAds = JSON.parse(cachedAds);
            setAds(parsedAds);
            return;
          } catch (parseError) {
            // Fall through to static data
          }
        }
      }
      
      // Only use featured ads from static data
      const featuredStaticAds = featuredAds.filter(ad => ad.featured);
      setAds(featuredStaticAds);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (adId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(adId)) {
        newFavorites.delete(adId);
      } else {
        newFavorites.add(adId);
      }
      return newFavorites;
    });
  };

  const getCardWidth = (width) => {
    if (width < 480) return { min: '280px', max: '300px' };
    if (width < 768) return { min: '300px', max: '320px' };
    if (width < 1024) return { min: '320px', max: '340px' };
    return { min: '340px', max: '360px' };
  };

  const getScrollGap = (width) => {
    if (width < 480) return '12px';
    if (width < 768) return '16px';
    if (width < 1024) return '20px';
    return '24px';
  };

  const cardSize = getCardWidth(windowWidth);
  const scrollGap = getScrollGap(windowWidth);

  // Don't render the section if no trending ads and not loading
  if (!loading && ads.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="featured-ads-heading"
      sx={{
        width: '100%',
        padding: {
          xs: '12px',
          sm: '16px',
          md: '20px',
          lg: '24px'
        }
      }}
    >
      <Typography 
        id="featured-ads-heading"
        variant="h2" 
        component="h2" 
        sx={{ 
          marginBottom: {
            xs: '16px',
            sm: '20px',
            md: '24px',
            lg: '28px'
          },
          fontWeight: 700, 
          textAlign: 'center',
          fontSize: {
            xs: 'clamp(1.5rem, 6vw, 2rem)',
            sm: 'clamp(2rem, 5vw, 2.5rem)',
            md: 'clamp(2.5rem, 4vw, 3rem)',
            lg: '3rem'
          },
          lineHeight: 1.2,
          background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Trending Ads
      </Typography>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          color: 'text.secondary'
        }}>
          <Typography>Loading trending ads...</Typography>
        </Box>
      ) : ads.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          textAlign: 'center',
          backgroundColor: 'rgba(108, 71, 255, 0.05)',
          borderRadius: '16px',
          padding: '40px',
          border: '2px dashed rgba(108, 71, 255, 0.2)'
        }}>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              marginBottom: 2,
              fontWeight: 600,
            }}
          >
            No trending ads at the moment
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: '400px',
              lineHeight: 1.6
            }}
          >
            Check back later for featured and boosted ads from our community
          </Typography>
        </Box>
      ) : null}

      {!loading && ads.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: scrollGap,
          paddingBottom: {
            xs: '16px',
            sm: '20px',
            md: '24px'
          },
          paddingLeft: {
            xs: '8px',
            sm: '12px',
            md: '0'
          },
          paddingRight: {
            xs: '8px',
            sm: '12px',
            md: '0'
          },
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(108,71,255,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            borderRadius: '4px',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
            }
          },
          // Hide scrollbar on mobile for cleaner look
          '@media (max-width: 768px)': {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }
        }}>
        {ads.map((ad) => (
          <Card
            key={ad.id}
            sx={{
              minWidth: cardSize.min,
              maxWidth: cardSize.max,
              flex: '0 0 auto',
              borderRadius: {
                xs: '16px',
                sm: '18px',
                md: '20px'
              },
              overflow: 'hidden',
              boxShadow: ad.featured 
                ? '0 4px 20px rgba(108,71,255,0.15)' 
                : '0 2px 12px rgba(108,71,255,0.08)',
              position: 'relative',
              background: '#fff',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: ad.featured ? '2px solid transparent' : '1px solid rgba(108,71,255,0.1)',
              backgroundClip: ad.featured ? 'padding-box' : 'border-box',
              '&::before': ad.featured ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'inherit',
                padding: '2px',
                background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                zIndex: -1,
              } : {},
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: ad.featured 
                  ? '0 12px 40px rgba(108,71,255,0.25)' 
                  : '0 8px 32px rgba(108,71,255,0.18)',
              },
              '&:active': {
                transform: 'translateY(-3px) scale(1.01)',
              }
            }}
            role="article"
            aria-label={`${ad.title} for ${ad.price} in ${ad.location}`}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height={windowWidth < 480 ? "160" : windowWidth < 768 ? "180" : "200"}
                image={ad.image_url || ad.image || ad.images?.[0] || '/placeholder-image.jpg'}
                alt={ad.title}
                onError={(e) => {
                  // If image fails to load, use a fallback
                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format';
                }}
                sx={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              />
              
              {/* Discount Badge */}
              {ad.discount && (
                <Chip
                  label={`-${ad.discount}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: '#FF4444',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: {
                      xs: '0.7rem',
                      sm: '0.75rem',
                      md: '0.8rem'
                    },
                    borderRadius: '8px',
                    zIndex: 2,
                  }}
                />
              )}

              {/* Featured Badge */}
              {(ad.featured || ad.is_featured) && (
                <Chip
                  label="Featured"
                  color="secondary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: ad.discount ? 48 : 12,
                    left: 12,
                    fontWeight: 700,
                    fontSize: {
                      xs: '0.7rem',
                      sm: '0.75rem',
                      md: '0.8rem'
                    },
                    borderRadius: '8px',
                    zIndex: 2,
                    background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                    color: 'white',
                  }}
                />
              )}

              {/* Action Buttons */}
              <Box sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                zIndex: 2, 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1 
              }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(ad.id);
                  }}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '36px',
                    minHeight: '36px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      transform: 'scale(1.1)',
                    }
                  }}
                  aria-label={favorites.has(ad.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(ad.id) ? 
                    <Favorite sx={{ color: '#FF4444', fontSize: '18px' }} /> : 
                    <FavoriteBorder sx={{ color: '#6C47FF', fontSize: '18px' }} />
                  }
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '36px',
                    minHeight: '36px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      transform: 'scale(1.1)',
                    }
                  }}
                  aria-label="View details"
                >
                  <Visibility sx={{ color: '#6C47FF', fontSize: '18px' }} />
                </IconButton>
              </Box>

              {/* Condition Badge */}
              <Box sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.7rem',
                  md: '0.75rem'
                },
                fontWeight: 600,
                zIndex: 2,
              }}>
                {ad.condition}
              </Box>
            </Box>

            <CardContent sx={{ 
              padding: {
                xs: '12px',
                sm: '16px',
                md: '20px'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: {
                      xs: '0.95rem',
                      sm: '1rem',
                      md: '1.1rem'
                    },
                    lineHeight: 1.3,
                    flex: 1,
                    marginRight: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {ad.title}
                </Typography>
                {ad.verified && (
                  <Box sx={{
                    backgroundColor: '#00C6AE',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}>
                    ✓
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ 
                  fontSize: {
                    xs: '14px',
                    sm: '16px',
                    md: '18px'
                  },
                  color: 'text.secondary',
                  mr: 0.5 
                }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: {
                      xs: '0.75rem',
                      sm: '0.8rem',
                      md: '0.85rem'
                    },
                    fontWeight: 500,
                  }}
                >
                  {ad.location}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: {
                      xs: '1rem',
                      sm: '1.1rem',
                      md: '1.2rem'
                    }
                  }}
                >
                  {ad.price ? `₦${Number(ad.price).toLocaleString()}` : ad.formatted_price || 'Price on request'}
                </Typography>
                {ad.originalPrice && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: 'text.secondary',
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.8rem',
                        md: '0.85rem'
                      }
                    }}
                  >
                    {ad.originalPrice}
                  </Typography>
                )}
              </Box>

              <Button 
                variant={(ad.featured || ad.is_featured) ? "contained" : "outlined"}
                color="primary" 
                size="small" 
                fullWidth
                onClick={() => navigate(`/ads/${ad.id}`)}
                sx={{ 
                  borderRadius: {
                    xs: '8px',
                    sm: '10px',
                    md: '12px'
                  },
                  fontSize: {
                    xs: '0.75rem',
                    sm: '0.8rem',
                    md: '0.85rem'
                  },
                  fontWeight: 600,
                  padding: {
                    xs: '8px 16px',
                    sm: '10px 20px',
                    md: '12px 24px'
                  },
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  ...((ad.featured || ad.is_featured) && {
                    background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                      transform: 'translateY(-2px)',
                    }
                  })
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
        </Box>
      )}

      {/* View All Button - Only show if there are ads */}
      {!loading && ads.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: {
            xs: '24px',
            sm: '32px',
            md: '40px'
          }
        }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/search')}
            sx={{
              borderRadius: '12px',
              padding: {
                xs: '12px 24px',
                sm: '14px 28px',
                md: '16px 32px'
              },
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.1rem'
              },
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#6C47FF',
              color: '#6C47FF',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                color: 'white',
                borderColor: 'transparent',
                transform: 'translateY(-2px)',
              }
            }}
          >
            View All Ads
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FeaturedAds;
