import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  InputBase,
  Paper,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
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
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import EnhancedAdList from '../components/EnhancedAdList';

// Updated categories that match the CategoryGrid component
const categories = [
  { 
    name: 'Vehicles', 
    icon: <DirectionsCar />, 
    id: 'vehicles', 
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    description: 'Cars, trucks, motorcycles and auto parts'
  },
  { 
    name: 'Property', 
    icon: <Home />, 
    id: 'property', 
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)',
    description: 'Houses, apartments, lands and commercial properties'
  },
  { 
    name: 'Mobile', 
    icon: <PhoneAndroid />, 
    id: 'mobile', 
    color: '#45B7D1',
    bgColor: 'rgba(69, 183, 209, 0.1)',
    description: 'Smartphones, tablets and accessories'
  },
  { 
    name: 'Electronics', 
    icon: <Laptop />, 
    id: 'electronics', 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Laptops, TVs, cameras and gadgets'
  },
  { 
    name: 'Furniture', 
    icon: <Chair />, 
    id: 'furniture', 
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Home furniture and appliances'
  },
  { 
    name: 'Beauty', 
    icon: <Face />, 
    id: 'beauty', 
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    description: 'Health, beauty and personal care'
  },
  { 
    name: 'Fashion', 
    icon: <Checkroom />, 
    id: 'fashion', 
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Clothing, shoes, bags and accessories'
  },
  { 
    name: 'Pets', 
    icon: <Pets />, 
    id: 'pets', 
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    description: 'Pets, pet supplies and veterinary services'
  },
  { 
    name: 'Services', 
    icon: <Work />, 
    id: 'services', 
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    description: 'Professional services and business equipment'
  },
  { 
    name: 'Gaming', 
    icon: <SportsEsports />, 
    id: 'gaming', 
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Video games, consoles and gaming accessories'
  }
];

const Categories = () => {
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { callApi } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      
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
      const allAdsResponse = await callApi('GET', '/ads?per_page=1000'); // Get a large number to count all
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
        
        return {
          ...category,
          count: count.toLocaleString(),
          mappedId: mappedId // Store for navigation
        };
      });
      
      setCategoriesWithCount(categoriesWithRealCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to categories with zero counts
      setCategoriesWithCount(categories.map(cat => ({ ...cat, count: '0' })));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const filteredCategories = categoriesWithCount.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If a category is selected, show the ads for that category
  if (selectedCategory) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 2,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={handleBackToCategories}
          >
            <ArrowBack />
            <Typography variant="h6">Back to Categories</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '12px',
                background: selectedCategory.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedCategory.color,
              }}
            >
              {React.cloneElement(selectedCategory.icon, {
                sx: { fontSize: 30, color: selectedCategory.color }
              })}
            </Box>
            
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedCategory.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedCategory.description}
              </Typography>
            </Box>
          </Box>
        </Box>

        <EnhancedAdList 
          initialSearchParams={{ category_id: selectedCategory.mappedId || selectedCategory.id }}
        />
      </Container>
    );
  }

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
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '140px',
          
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
            background: 'rgba(255, 255, 255, 0.95)',
          },
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: category.color,
            transition: 'height 0.3s ease',
          },
          
          '&:hover::before': {
            height: '6px',
          }
        }}
      >
        {/* Icon Circle */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '12px',
            background: category.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: category.color,
            mb: 2,
            transition: 'all 0.3s ease',
            
            '& svg': {
              fontSize: 28,
              transition: 'transform 0.3s ease',
            }
          }}
        >
          {React.cloneElement(category.icon, {
            sx: { fontSize: 28, color: category.color }
          })}
        </Box>
        
        {/* Category Name */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
            lineHeight: 1.3
          }}
        >
          {category.name}
        </Typography>
        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            lineHeight: 1.4,
            fontSize: '0.85rem'
          }}
        >
          {category.description}
        </Typography>
        
        {/* Count Badge */}
        <Chip
          size="small"
          label={`${category.count} ads`}
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: `${category.color}15`,
            color: category.color,
            border: `1px solid ${category.color}30`,
            '& .MuiChip-label': {
              px: 1
            }
          }}
        />
        
        {/* Trending indicator for top categories */}
        {['mobile', 'electronics', 'vehicles'].includes(category.id) && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#10B981',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.15)',
              px: 0.8,
              py: 0.4,
              borderRadius: '6px'
            }}
          >
            <TrendingUp sx={{ fontSize: 14 }} />
            HOT
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box textAlign="center" mb={3}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Browse Categories
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Find exactly what you're looking for by browsing our organized categories
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            p: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <InputBase
            sx={{ ml: 2, flex: 1, fontSize: '1rem' }}
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton 
            type="submit" 
            sx={{ 
              p: '8px',
              background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
              }
            }} 
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(10)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Skeleton variant="rectangular" width={60} height={60} sx={{ mx: 'auto', mb: 2, borderRadius: 2 }} />
                <Skeleton variant="text" height={28} width="70%" sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" height={20} width="90%" sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="rounded" height={22} width={60} sx={{ mx: 'auto' }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : filteredCategories.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
          No categories found matching your search.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
              {renderCategoryItem(category)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Help Section */}
      <Box 
        textAlign="center" 
        sx={{ 
          mt: 4, 
          py: 3, 
          background: 'linear-gradient(135deg, rgba(108, 71, 255, 0.05) 0%, rgba(0, 198, 174, 0.05) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(108, 71, 255, 0.1)'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Don't see what you're looking for?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Try searching for specific items or browse all listings
        </Typography>
        <Box
          component="button"
          onClick={() => navigate('/search')}
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
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            
            '&:hover': {
              background: 'primary.main',
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(108, 71, 255, 0.3)'
            }
          }}
        >
          <SearchIcon />
          Browse All Items
        </Box>
      </Box>
    </Container>
  );
};

export default Categories;