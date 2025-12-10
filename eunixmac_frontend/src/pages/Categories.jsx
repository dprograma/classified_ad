import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  Pagination
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
  ArrowBack,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import EnhancedAdList from '../components/EnhancedAdList';

// Icon mapping for categories (fallback icons)
const iconMapping = {
  'vehicles': DirectionsCar,
  'real estate': Home,
  'electronics': Laptop,
  'home': Chair,
  'beauty': Face,
  'fashion': Checkroom,
  'pets': Pets,
  'services': Work,
  'sports': SportsEsports,
  'jobs': Work,
};

// Color palette for categories
const colorPalette = [
  { color: '#FF6B35', bgColor: 'rgba(255, 107, 53, 0.1)' },
  { color: '#4ECDC4', bgColor: 'rgba(78, 205, 196, 0.1)' },
  { color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
  { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  { color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)' },
];

const getIconForCategory = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  for (const [key, Icon] of Object.entries(iconMapping)) {
    if (name.includes(key)) {
      return Icon;
    }
  }
  return CategoryIcon; // Default icon
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [page, setPage] = useState(1);
  const categoriesPerPage = 12;

  const { callApi } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await callApi('GET', '/categories');

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch categories');
      }

      const backendCategories = response?.data || [];

      if (backendCategories.length === 0) {
        setError('No categories available at the moment');
        setCategories([]);
        return;
      }

      // Remove duplicates by name, keeping the one with most children
      const uniqueCategories = {};
      backendCategories.forEach(cat => {
        if (!uniqueCategories[cat.name] ||
            (cat.children && uniqueCategories[cat.name].children &&
             cat.children.length > uniqueCategories[cat.name].children.length)) {
          uniqueCategories[cat.name] = cat;
        } else if (!uniqueCategories[cat.name]) {
          uniqueCategories[cat.name] = cat;
        }
      });

      const deduplicatedCategories = Object.values(uniqueCategories);

      // Enhance categories with UI properties
      const enhancedCategories = deduplicatedCategories.map((category, index) => {
        const colorSet = colorPalette[index % colorPalette.length];
        const IconComponent = getIconForCategory(category.name);

        return {
          ...category,
          icon: IconComponent,
          color: colorSet.color,
          bgColor: colorSet.bgColor,
        };
      });

      setCategories(enhancedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message || 'Failed to load categories. Please try again later.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
  };

  const handleSubCategoryClick = (subcategory) => {
    setSelectedSubCategory(subcategory);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (page - 1) * categoriesPerPage;
    return filteredCategories.slice(startIndex, startIndex + categoriesPerPage);
  }, [filteredCategories, page, categoriesPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchParams = useMemo(() => {
    if (!selectedCategory) return {};

    const params = {};

    if (selectedSubCategory) {
      // Use subcategory ID for filtering
      params.category_id = selectedSubCategory.id;
    } else {
      // Use parent category ID
      params.category_id = selectedCategory.id;
    }

    return params;
  }, [selectedCategory, selectedSubCategory]);

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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
              {React.createElement(selectedCategory.icon, {
                sx: { fontSize: 30, color: selectedCategory.color }
              })}
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedCategory.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedCategory.ads_count || 0} ads available
              </Typography>
            </Box>
          </Box>

          {/* Subcategories */}
          {selectedCategory.children && selectedCategory.children.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {selectedCategory.children.map(child => {
                const isSelected = selectedSubCategory?.id === child.id;
                return (
                  <Chip
                    key={child.id}
                    label={`${child.name} (${child.ads_count || 0})`}
                    onClick={() => handleSubCategoryClick(child)}
                    color={isSelected ? 'primary' : 'default'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected ? undefined : 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  />
                );
              })}
              {selectedSubCategory && (
                <Chip
                  label="Clear Filter"
                  onClick={() => setSelectedSubCategory(null)}
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          )}
        </Box>

        <EnhancedAdList
          key={JSON.stringify(searchParams)}
          initialSearchParams={searchParams}
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
          }}
        >
          {React.createElement(category.icon, {
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

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 2 }}>
            {category.children.slice(0, 3).map((child) => (
              <Chip
                key={child.id}
                label={child.name}
                size="small"
                sx={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }}
              />
            ))}
            {category.children.length > 3 && (
              <Chip
                label={`+${category.children.length - 3} more`}
                size="small"
                sx={{
                  backgroundColor: `${category.color}10`,
                  color: category.color,
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
        )}

        {/* Count Badge */}
        <Chip
          size="small"
          label={`${category.ads_count || 0} ads`}
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
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

      {/* Stats */}
      {!loading && !error && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
          Showing {paginatedCategories.length} of {filteredCategories.length} categories
        </Typography>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(12)].map((_, index) => (
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
      ) : paginatedCategories.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
          No categories found matching your search.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                {renderCategoryItem(category)}
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
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
