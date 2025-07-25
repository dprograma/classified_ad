import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Chip, IconButton, Button } from '@mui/material';
import { FavoriteBorder, Visibility, LocationOn, Favorite } from '@mui/icons-material';

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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <Box
      component="section"
      aria-labelledby="featured-ads-heading"
      sx={{
        width: '100%',
        padding: {
          xs: '16px',
          sm: '24px',
          md: '32px',
          lg: '40px'
        }
      }}
    >
      <Typography 
        id="featured-ads-heading"
        variant="h2" 
        component="h2" 
        sx={{ 
          marginBottom: {
            xs: '24px',
            sm: '32px',
            md: '40px',
            lg: '48px'
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
        {featuredAds.map((ad) => (
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
                image={ad.image}
                alt={ad.title}
                sx={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
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
              {ad.featured && (
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
                  {ad.price}
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
                variant={ad.featured ? "contained" : "outlined"}
                color="primary" 
                size="small" 
                fullWidth
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
                  ...(ad.featured && {
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

      {/* View All Button */}
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
    </Box>
  );
};

export default FeaturedAds;
