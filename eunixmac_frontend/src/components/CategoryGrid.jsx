import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Chip } from '@mui/material';
import {
  DirectionsCar,
  Home,
  PhoneAndroid,
  Laptop,
  Chair,
  Face,
  Checkroom,
  Pets,
  Work,
  SportsEsports,
  TrendingUp,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';

// Default category configuration with frontend names and colors
const defaultCategories = [
  {
    name: 'Vehicles',
    icon: <DirectionsCar />,
    id: 'vehicles',
    matchNames: ['vehicles', 'vehicle', 'cars', 'car', 'automotive'],
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)'
  },
  {
    name: 'Property',
    icon: <Home />,
    id: 'property',
    matchNames: ['property', 'properties', 'real estate', 'house', 'houses', 'land'],
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)'
  },
  {
    name: 'Mobile',
    icon: <PhoneAndroid />,
    id: 'mobile',
    matchNames: ['mobile', 'phones', 'phone', 'smartphone', 'tablets'],
    color: '#45B7D1',
    bgColor: 'rgba(69, 183, 209, 0.1)'
  },
  {
    name: 'Electronics',
    icon: <Laptop />,
    id: 'electronics',
    matchNames: ['electronics', 'electronic', 'computers', 'computer', 'gadgets'],
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  {
    name: 'Furniture',
    icon: <Chair />,
    id: 'furniture',
    matchNames: ['furniture', 'home & garden', 'home'],
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  {
    name: 'Beauty',
    icon: <Face />,
    id: 'beauty',
    matchNames: ['beauty', 'health', 'health & beauty', 'cosmetics'],
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)'
  },
  {
    name: 'Fashion',
    icon: <Checkroom />,
    id: 'fashion',
    matchNames: ['fashion', 'clothing', 'clothes', 'apparel'],
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  {
    name: 'Books & Media',
    icon: <MenuBook />,
    id: 'books',
    matchNames: ['books', 'book', 'media', 'books & media', 'books and media', 'educational'],
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)'
  },
  {
    name: 'Pets',
    icon: <Pets />,
    id: 'pets',
    matchNames: ['pets', 'pet', 'animals', 'animal'],
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)'
  },
  {
    name: 'Services',
    icon: <Work />,
    id: 'services',
    matchNames: ['services', 'service', 'jobs', 'job'],
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.1)'
  }
];

const CategoryGrid = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { callApi } = useApi();
  const [categories, setCategories] = useState(
    defaultCategories.map(cat => ({ ...cat, count: '0', backendId: null }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      const response = await callApi('GET', '/categories');
      const backendCategories = response?.data || response || [];

      if (backendCategories.length > 0) {
        // Match backend categories with our frontend categories
        const updatedCategories = defaultCategories.map(frontendCat => {
          // Find matching backend category by name
          const backendMatch = backendCategories.find(backendCat => {
            const backendName = backendCat.name?.toLowerCase() || '';
            return frontendCat.matchNames.some(matchName =>
              backendName.includes(matchName) || matchName.includes(backendName)
            );
          });

          if (backendMatch) {
            // Use ads_count from backend (includes parent + children count)
            const count = backendMatch.ads_count || 0;
            const formattedCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : count.toString();

            return {
              ...frontendCat,
              count: formattedCount,
              backendId: backendMatch.id,
              backendName: backendMatch.name
            };
          }

          return { ...frontendCat, count: '0', backendId: null };
        });

        setCategories(updatedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
      // Keep default categories with zero counts
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // Use backend ID if available, otherwise search by name
    if (category.backendId) {
      navigate(`/search?category_id=${category.backendId}`);
    } else {
      navigate(`/search?category=${encodeURIComponent(category.name)}`);
    }
  };

  const renderCategoryItem = (category) => {
    return (
      <Box
        key={category.id}
        onClick={() => handleCategoryClick(category)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minWidth: { xs: '120px', sm: '140px' },
          minHeight: { xs: '100px', sm: '110px' },
          flexShrink: 0,

          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
            background: 'rgba(255, 255, 255, 0.95)',
          },

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: category.color,
            transition: 'height 0.3s ease',
          },

          '&:hover::before': {
            height: '4px',
          }
        }}
      >
        {/* Icon Circle */}
        <Box
          sx={{
            width: { xs: 40, sm: 45 },
            height: { xs: 40, sm: 45 },
            borderRadius: '10px',
            background: category.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: category.color,
            mb: 1,
            transition: 'all 0.3s ease',

            '& svg': {
              fontSize: { xs: 20, sm: 22 },
              transition: 'transform 0.3s ease',
            }
          }}
        >
          {React.cloneElement(category.icon, {
            sx: { fontSize: { xs: 20, sm: 22 }, color: category.color }
          })}
        </Box>

        {/* Category Name */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            color: 'text.primary',
            mb: 0.5,
            lineHeight: 1.2
          }}
        >
          {category.name}
        </Typography>

        {/* Count Badge */}
        <Chip
          size="small"
          label={`${category.count} ads`}
          sx={{
            height: 18,
            fontSize: '0.7rem',
            fontWeight: 500,
            backgroundColor: `${category.color}15`,
            color: category.color,
            border: `1px solid ${category.color}30`,
            '& .MuiChip-label': {
              px: 0.8
            }
          }}
        />

        {/* Trending indicator for top categories */}
        {['mobile', 'electronics', 'vehicles'].includes(category.id) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              color: '#10B981',
              fontSize: '0.65rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              px: 0.5,
              py: 0.2,
              borderRadius: '4px'
            }}
          >
            <TrendingUp sx={{ fontSize: 12 }} />
            HOT
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, sm: 2, md: 3 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Browse by Category
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1rem', maxWidth: '500px', mx: 'auto' }}
        >
          Discover thousands of items across our most popular categories
        </Typography>
      </Box>

      {/* Categories Horizontal Scroll */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          overflowX: 'auto',
          pb: 1,
          px: 1,
          mx: -1,
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
          },
          '@media (max-width: 768px)': {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }
        }}
      >
        {categories.map((category) => renderCategoryItem(category))}
      </Box>

      {/* View All Button */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Box
          component="button"
          onClick={() => navigate('/categories')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            borderRadius: '50px',
            border: '2px solid',
            borderColor: 'primary.main',
            background: 'transparent',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',

            '&:hover': {
              background: 'primary.main',
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(108, 71, 255, 0.3)'
            }
          }}
        >
          View All Categories
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'currentColor',
              color: 'background.paper',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            →
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryGrid;
