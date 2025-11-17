import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardContent, CardMedia, Typography, Box, TextField, Button, Chip, Badge } from '@mui/material';
import { TrendingUp, Star } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';

function AdList() {
  const [ads, setAds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const { callApi, loading } = useApi();

  const fetchAds = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await callApi('GET', `/ads${queryString}`);
      setAds(data.data || data); // Handle both paginated and direct response
    } catch (error) {
      console.error('Error fetching ads:', error);
      // Error handling is done by useApi hook
    }
  }, [searchTerm, locationFilter, callApi]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleSearch = () => {
    fetchAds();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        All Ads
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search by title or description"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <TextField
          label="Filter by location"
          variant="outlined"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>
      <Grid container spacing={3}>
        {ads.map((ad) => (
          <Grid item key={ad.id} xs={12} sm={6} md={4}>
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
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                
                {ad.images && ad.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={getStorageUrl(ad.preview_image) || getStorageUrl(ad.images[0]?.image_path)}
                    alt={ad.title}
                  />
                )}
                
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0, flex: 1 }}>
                      {ad.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {ad.description?.substring(0, 100)}...
                  </Typography>
                  
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ₦{ad.price?.toLocaleString()}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {ad.location}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Badge>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AdList;