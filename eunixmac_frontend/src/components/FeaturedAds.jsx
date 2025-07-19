import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Chip, IconButton, Button } from '@mui/material';
import { FavoriteBorder, Visibility } from '@mui/icons-material';

const featuredAds = [
  {
    title: 'iPhone 14 Pro',
    price: '₦950,000',
    image: 'https://via.placeholder.com/300x200.png?text=iPhone+14+Pro',
    location: 'Lagos',
    featured: true,
  },
  {
    title: 'HP Spectre x360',
    price: '₦850,000',
    image: 'https://via.placeholder.com/300x200.png?text=HP+Spectre+x360',
    location: 'Abuja',
    featured: false,
  },
  {
    title: 'Toyota Camry 2021',
    price: '₦15,000,000',
    image: 'https://via.placeholder.com/300x200.png?text=Toyota+Camry',
    location: 'Port Harcourt',
    featured: true,
  },
  {
    title: 'Samsung TV',
    price: '₦450,000',
    image: 'https://via.placeholder.com/300x200.png?text=Samsung+TV',
    location: 'Kano',
    featured: false,
  },
];

const FeaturedAds = () => {
  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        Trending Ads
      </Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 3, pb: 2 }}>
        {featuredAds.map((ad) => (
          <Card
            key={ad.title}
            sx={{
              minWidth: 300,
              maxWidth: 320,
              flex: '0 0 auto',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(108,71,255,0.10)',
              position: 'relative',
              background: '#fff',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: ad.featured ? 'scale(1.05)' : 'scale(1.03)',
                boxShadow: '0 8px 32px rgba(108,71,255,0.18)',
              },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="180"
                image={ad.image}
                alt={ad.title}
                sx={{ objectFit: 'cover', filter: ad.featured ? 'brightness(0.95)' : 'none' }}
              />
              {ad.featured && (
                <Chip
                  label="Featured"
                  color="secondary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontWeight: 700,
                    px: 1.5,
                    fontSize: '0.95rem',
                    borderRadius: 2,
                    zIndex: 2,
                  }}
                />
              )}
              <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.85)' }}><FavoriteBorder color="primary" /></IconButton>
                <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.85)' }}><Visibility color="primary" /></IconButton>
              </Box>
            </Box>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700 }}>
                {ad.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {ad.location}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 700 }}>
                {ad.price}
              </Typography>
              <Button variant="outlined" color="primary" size="small" sx={{ mt: 2, borderRadius: 2 }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default FeaturedAds;
