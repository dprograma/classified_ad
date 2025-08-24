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
  Build, 
  SportsEsports,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';

const categories = [
  { 
    name: 'Vehicles', 
    icon: <DirectionsCar />, 
    id: 'vehicles', 
    count: '2.1k',
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)'
  },
  { 
    name: 'Property', 
    icon: <Home />, 
    id: 'property', 
    count: '1.8k',
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)'
  },
  { 
    name: 'Mobile', 
    icon: <PhoneAndroid />, 
    id: 'mobile', 
    count: '3.2k',
    color: '#45B7D1',
    bgColor: 'rgba(69, 183, 209, 0.1)'
  },
  { 
    name: 'Electronics', 
    icon: <Laptop />, 
    id: 'electronics', 
    count: '2.7k',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)'
  },
  { 
    name: 'Furniture', 
    icon: <Chair />, 
    id: 'furniture', 
    count: '1.4k',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  { 
    name: 'Beauty', 
    icon: <Face />, 
    id: 'beauty', 
    count: '890',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)'
  },
  { 
    name: 'Fashion', 
    icon: <Checkroom />, 
    id: 'fashion', 
    count: '2.0k',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  { 
    name: 'Pets', 
    icon: <Pets />, 
    id: 'pets', 
    count: '654',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)'
  },
  { 
    name: 'Services', 
    icon: <Work />, 
    id: 'services', 
    count: '1.2k',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)'
  },
  { 
    name: 'Gaming', 
    icon: <SportsEsports />, 
    id: 'gaming', 
    count: '756',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  }
];

const CategoryGrid = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { callApi } = useApi();
  const [categoriesWithCount, setCategoriesWithCount] = useState(categories);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      // Try to fetch backend categories first to get the real mapping
      let backendCategories = [];
      try {
        const categoriesResponse = await callApi('GET', '/categories');
        backendCategories = categoriesResponse?.data || categoriesResponse || [];
      } catch (categoriesError) {
        console.warn('Could not fetch backend categories:', categoriesError);
      }
      
      // Create a mapping between our frontend categories and backend categories
      const categoryMapping = {};
      if (backendCategories.length > 0) {
        categories.forEach(frontendCategory => {
          // Try to match by name (case insensitive) or slug
          const backendMatch = backendCategories.find(backendCat => 
            backendCat.name?.toLowerCase().includes(frontendCategory.name.toLowerCase()) ||
            backendCat.slug === frontendCategory.id ||
            frontendCategory.id.includes(backendCat.name?.toLowerCase()) ||
            backendCat.name?.toLowerCase().includes(frontendCategory.id)
          );
          if (backendMatch) {
            categoryMapping[frontendCategory.id] = backendMatch.id;
          }
        });
      }
      
      // First get all ads to count by category
      const allAdsResponse = await callApi('GET', '/ads?per_page=1000');
      const allAds = allAdsResponse?.data || [];
      
      // Count ads per category using various possible identifiers
      const categoryCounts = {};
      allAds.forEach(ad => {
        // Try different ways to get the category identifier
        const possibleIds = [
          ad.category_id,
          ad.category?.id,
          ad.category?.slug,
          ad.category?.name?.toLowerCase()
        ].filter(Boolean);
        
        possibleIds.forEach(id => {
          if (id) {
            categoryCounts[id] = (categoryCounts[id] || 0) + 1;
          }
        });
      });

      // Map counts to our categories using both frontend IDs and mapped backend IDs
      const categoriesWithRealCount = categories.map(category => {
        let count = categoryCounts[category.id] || 0;
        
        // Also try the mapped backend ID if available
        const mappedId = categoryMapping[category.id];
        if (mappedId && categoryCounts[mappedId]) {
          count = Math.max(count, categoryCounts[mappedId]);
        }
        
        const formattedCount = count > 999 ? `${(count / 1000).toFixed(1)}k` : count.toString();
        return {
          ...category,
          count: formattedCount,
          mappedId: mappedId // Store for navigation
        };
      });
      
      setCategoriesWithCount(categoriesWithRealCount);
    } catch (error) {
      console.error('Error fetching categories with counts:', error);
      // Fallback to categories with zero counts
      setCategoriesWithCount(categories.map(cat => ({ ...cat, count: '0' })));
    }
  };

  const handleCategoryClick = (category) => {
    // Use the mapped backend ID if available, otherwise use the frontend ID
    const categoryId = category.mappedId || category.id;
    navigate(`/search?category_id=${categoryId}`);
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
          flexShrink: 0, // Prevent shrinking in flex container
          
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
          label={category.count}
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
          // Hide scrollbar on mobile for cleaner look
          '@media (max-width: 768px)': {
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }
        }}
      >
        {categoriesWithCount.map((category) => renderCategoryItem(category))}
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
