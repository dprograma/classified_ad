import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useMediaQuery } from '@mui/material';
import { PhoneAndroid, Laptop, Chair, Checkroom, SportsEsports, DirectionsCar, Home, Work, Pets, Build, Face, Star } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const categories = [
  { name: 'Vehicles', icon: <DirectionsCar sx={{ fontSize: 32 }} /> },
  { name: 'Property', icon: <Home sx={{ fontSize: 32 }} /> },
  { name: 'Mobile Phones & Tablets', icon: <PhoneAndroid sx={{ fontSize: 32 }} /> },
  { name: 'Electronics', icon: <Laptop sx={{ fontSize: 32 }} /> },
  { name: 'Home, Furniture & Appliances', icon: <Chair sx={{ fontSize: 32 }} /> },
  { name: 'Health & Beauty', icon: <Face sx={{ fontSize: 32 }} /> },
  { name: 'Fashion', icon: <Checkroom sx={{ fontSize: 32 }} /> },
  { name: 'Pets', icon: <Pets sx={{ fontSize: 32 }} /> },
  { name: 'Jobs & Services', icon: <Work sx={{ fontSize: 32 }} /> },
  { name: 'Building Materials', icon: <Build sx={{ fontSize: 32 }} /> },
  { name: 'Gaming', icon: <SportsEsports sx={{ fontSize: 32 }} /> },
];

const featuredCategory = {
  name: 'Featured: Real Estate',
  icon: <Star sx={{ fontSize: 40 }} />,
  description: 'Find the best deals on properties and land.',
};

const ICON_CIRCLE_SIZE = 64;

const CategoryGrid = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderCategoryCard = (category, isFeatured = false) => (
    <Card
      key={category.name}
      sx={{
        width: 160,
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 2,
        borderRadius: 4,
        boxShadow: isFeatured ? '0 2px 16px rgba(108,71,255,0.13)' : '0 2px 12px rgba(108,71,255,0.07)',
        background: isFeatured ? 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)' : '#fff',
        color: isFeatured ? '#fff' : 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.04)',
          boxShadow: '0 8px 24px rgba(108,71,255,0.13)',
        },
        mx: isMobile ? 1 : 0,
      }}
    >
      <Box
        sx={{
          width: ICON_CIRCLE_SIZE,
          height: ICON_CIRCLE_SIZE,
          borderRadius: '50%',
          background: isFeatured
            ? 'linear-gradient(135deg, #fff 0%, #00C6AE 100%)'
            : 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isFeatured ? '#6C47FF' : '#fff',
          boxShadow: '0 2px 8px rgba(108,71,255,0.10)',
          mb: 2.5,
          mt: 1,
        }}
      >
        {category.icon}
      </Box>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '1rem', mt: 1 }}>
          {category.name}
        </Typography>
        {isFeatured && (
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.92)' }}>
            {category.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        Trending Categories
      </Typography>
      {isMobile ? (
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
          {renderCategoryCard(featuredCategory, true)}
          {categories.map((category) => renderCategoryCard(category))}
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            {renderCategoryCard(featuredCategory, true)}
          </Grid>
          {categories.map((category) => (
            <Grid item key={category.name}>
              {renderCategoryCard(category)}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CategoryGrid;
