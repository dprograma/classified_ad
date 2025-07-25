import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { PhoneAndroid, Laptop, Chair, Checkroom, SportsEsports, DirectionsCar, Home, Work, Pets, Build, Face, Star } from '@mui/icons-material';

const categories = [
  { name: 'Vehicles', icon: <DirectionsCar />, id: 'vehicles' },
  { name: 'Property', icon: <Home />, id: 'property' },
  { name: 'Mobile Phones & Tablets', icon: <PhoneAndroid />, id: 'mobile' },
  { name: 'Electronics', icon: <Laptop />, id: 'electronics' },
  { name: 'Home, Furniture & Appliances', icon: <Chair />, id: 'home' },
  { name: 'Health & Beauty', icon: <Face />, id: 'health' },
  { name: 'Fashion', icon: <Checkroom />, id: 'fashion' },
  { name: 'Pets', icon: <Pets />, id: 'pets' },
  { name: 'Jobs & Services', icon: <Work />, id: 'jobs' },
  { name: 'Building Materials', icon: <Build />, id: 'building' },
  { name: 'Gaming', icon: <SportsEsports />, id: 'gaming' },
];

const featuredCategory = {
  name: 'Featured: Real Estate',
  icon: <Star />,
  description: 'Find the best deals on properties and land.',
  id: 'featured',
};

const CategoryGrid = () => {
  const theme = useTheme();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Dynamic viewport tracking for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic column calculation based on viewport width
  const getGridColumns = (width) => {
    if (width < 480) return 2;      // Mobile portrait
    if (width < 640) return 3;      // Mobile landscape
    if (width < 768) return 3;      // Small tablet
    if (width < 1024) return 4;     // Tablet
    if (width < 1280) return 5;     // Desktop
    return 6;                       // Large desktop
  };

  // Responsive spacing system
  const getSpacing = (width) => {
    if (width < 480) return '8px';
    if (width < 768) return '12px';
    if (width < 1024) return '16px';
    return '20px';
  };

  // Responsive card dimensions
  const getCardSize = (width) => {
    if (width < 480) return { min: '140px', max: '160px' };
    if (width < 768) return { min: '150px', max: '170px' };
    if (width < 1024) return { min: '160px', max: '180px' };
    return { min: '170px', max: '190px' };
  };

  // Responsive icon size
  const getIconSize = (width) => {
    if (width < 480) return 28;
    if (width < 768) return 32;
    if (width < 1024) return 36;
    return 40;
  };

  // Responsive icon circle size
  const getIconCircleSize = (width) => {
    if (width < 480) return 56;
    if (width < 768) return 64;
    if (width < 1024) return 72;
    return 80;
  };

  const columns = getGridColumns(windowWidth);
  const spacing = getSpacing(windowWidth);
  const cardSize = getCardSize(windowWidth);
  const iconSize = getIconSize(windowWidth);
  const iconCircleSize = getIconCircleSize(windowWidth);

  const renderCategoryCard = (category, isFeatured = false) => {
    const cardId = `category-${category.id}`;
    
    return (
      <Card
        key={category.id}
        id={cardId}
        role="button"
        tabIndex={0}
        aria-label={`Browse ${category.name} category`}
        sx={{
          minWidth: cardSize.min,
          maxWidth: cardSize.max,
          minHeight: cardSize.min,
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: {
            xs: '12px',
            sm: '16px',
            md: '20px',
            lg: '24px'
          },
          borderRadius: {
            xs: '12px',
            sm: '16px',
            md: '20px'
          },
          boxShadow: isFeatured 
            ? '0 4px 20px rgba(108,71,255,0.15)' 
            : '0 2px 12px rgba(108,71,255,0.08)',
          background: isFeatured 
            ? 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)' 
            : '#fff',
          color: isFeatured ? '#fff' : 'inherit',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          
          // Ensure minimum touch target
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            minWidth: '44px',
            minHeight: '44px',
          },
          
          '&:hover, &:focus-visible': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: isFeatured 
              ? '0 8px 32px rgba(108,71,255,0.25)' 
              : '0 8px 24px rgba(108,71,255,0.15)',
            outline: 'none',
          },
          
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
          
          '&:active': {
            transform: 'translateY(-2px) scale(1.01)',
          },
          
          // Responsive hover effects
          '@media (hover: none)': {
            '&:hover': {
              transform: 'none',
              boxShadow: isFeatured 
                ? '0 4px 20px rgba(108,71,255,0.15)' 
                : '0 2px 12px rgba(108,71,255,0.08)',
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Handle category selection
            console.log(`Selected category: ${category.name}`);
          }
        }}
      >
        <Box
          sx={{
            width: iconCircleSize,
            height: iconCircleSize,
            borderRadius: '50%',
            background: isFeatured
              ? 'rgba(255, 255, 255, 0.2)'
              : 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFeatured ? '#fff' : '#fff',
            boxShadow: '0 4px 12px rgba(108,71,255,0.15)',
            marginBottom: {
              xs: '12px',
              sm: '16px',
              md: '20px'
            },
            transition: 'all 0.3s ease',
            '& svg': {
              fontSize: iconSize,
              transition: 'transform 0.3s ease',
            }
          }}
        >
          {React.cloneElement(category.icon, {
            sx: { fontSize: iconSize }
          })}
        </Box>
        
        <CardContent sx={{ 
          padding: 0,
          '&:last-child': { paddingBottom: 0 }
        }}>
          <Typography 
            variant="subtitle1" 
            component="h3"
            sx={{ 
              fontWeight: 600,
              fontSize: {
                xs: 'clamp(0.75rem, 3.5vw, 0.875rem)',
                sm: 'clamp(0.875rem, 2.5vw, 1rem)',
                md: 'clamp(1rem, 1.5vw, 1.125rem)',
                lg: '1.125rem'
              },
              lineHeight: 1.3,
              marginBottom: isFeatured ? '8px' : 0,
              // Ensure text doesn't break awkwardly
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {category.name}
          </Typography>
          
          {isFeatured && category.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: {
                  xs: 'clamp(0.625rem, 2.5vw, 0.75rem)',
                  sm: 'clamp(0.75rem, 2vw, 0.875rem)',
                  md: '0.875rem'
                },
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.4,
                marginTop: '4px'
              }}
            >
              {category.description}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      component="section"
      aria-labelledby="categories-heading"
      sx={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: {
          xs: '16px',
          sm: '24px',
          md: '32px',
          lg: '40px'
        }
      }}
    >
      <Typography 
        id="categories-heading"
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
          color: theme.palette.text.primary
        }}
      >
        Trending Categories
      </Typography>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: spacing,
          justifyItems: 'center',
          alignItems: 'start',
          width: '100%',
          
          // Featured category spans multiple columns on larger screens
          '& > *:first-of-type': {
            gridColumn: windowWidth >= 768 ? 'span 2' : 'span 1',
            justifySelf: 'center',
          },
          
          // Smooth transitions when grid changes
          transition: 'all 0.3s ease',
          
          // Ensure proper spacing on very small screens
          '@media (max-width: 320px)': {
            gap: '6px',
          }
        }}
      >
        {/* Featured category */}
        {renderCategoryCard(featuredCategory, true)}
        
        {/* Regular categories */}
        {categories.map((category) => renderCategoryCard(category))}
      </Box>
      
      {/* Screen reader only text for better accessibility */}
      <Box
        component="p"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Use arrow keys to navigate between categories. Press Enter or Space to select a category.
      </Box>
    </Box>
  );
};

export default CategoryGrid;
