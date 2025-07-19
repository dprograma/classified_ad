import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardContent, CardMedia, Typography, Box, TextField, Button } from '@mui/material';
import axios from 'axios';

function AdList() {
  const [ads, setAds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchAds = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/ads', {
        params: {
          search: searchTerm,
          location: locationFilter,
        },
      });
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  }, [searchTerm, locationFilter]);

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
            <Card component={Link} to={`/ads/${ad.id}`} sx={{ textDecoration: 'none', height: '100%' }}>
              {ad.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="140"
                  image={`http://localhost:8000/storage/${ad.images[0].image_path}`}
                  alt={ad.title}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {ad.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ad.description.substring(0, 100)}...
                </Typography>
                <Typography variant="h6" color="primary">
                  ₦{ad.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {ad.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AdList;