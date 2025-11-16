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

// Updated categories that match the backend CategorySeeder
const categories = [
  { 
    name: 'Vehicles', 
    icon: <DirectionsCar />, 
    id: 'vehicles', 
    color: '#FF6B35',
    bgColor: 'rgba(255, 107, 53, 0.1)',
    description: 'Cars, trucks, motorcycles and auto parts',
    subcategories: ['Cars', 'Trucks/ heavy duty equipment', 'Motorcycles', 'buses/ minibus', 'vehicle spare part']
  },
  { 
    name: 'Real Estate', 
    icon: <Home />, 
    id: 'real-estate', 
    color: '#4ECDC4',
    bgColor: 'rgba(78, 205, 196, 0.1)',
    description: 'Houses, apartments, lands and commercial properties',
    subcategories: ['Apartments for Rent', 'Houses for Sale', 'Commercial Properties', 'Land for Sale']
  },
  { 
    name: 'Electronics', 
    icon: <Laptop />, 
    id: 'electronics', 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Smartphones, laptops, tablets and gadgets',
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Smartwatches', 'Gaming Consoles']
  },
  { 
    name: 'Home and Kitchen', 
    icon: <Chair />, 
    id: 'home-and-kitchen', 
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Furniture, decor, and kitchen appliances',
    subcategories: ['Furniture', 'Decor', 'Kitchen Appliances', 'Bed and Bath', 'Outdoor Living']
  },
  { 
    name: 'Beauty and Personal Care', 
    icon: <Face />, 
    id: 'beauty', 
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    description: 'Skincare, haircare, makeup and wellness',
    subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Wellness and Health']
  },
  { 
    name: 'Fashion', 
    icon: <Checkroom />, 
    id: 'fashion', 
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Clothing, shoes, bags and accessories',
    subcategories: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Footwear', 'Accessories']
  },
  { 
    name: 'Pets', 
    icon: <Pets />, 
    id: 'pets', 
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    description: 'Dogs, cats, and pet supplies',
    subcategories: ['Dogs', 'Cats', 'Other Pets', 'Pet Supplies']
  },
  { 
    name: 'Services', 
    icon: <Work />, 
    id: 'services', 
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    description: 'Professional services and business equipment',
    subcategories: ['Beauty and Wellness', 'Pet Services', 'Home Services', 'Tutoring and Lessons']
  },
  { 
    name: 'Sports and Outdoors', 
    icon: <SportsEsports />, 
    id: 'sports', 
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Fitness equipment and outdoor gear',
    subcategories: ['Fitness Equipment', 'Team Sports', 'Outdoor Gear', 'Camping and Hiking', 'Cycling']
  },
  { 
    name: 'Jobs', 
    icon: <Work />, 
    id: 'jobs', 
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Full-time, part-time, and freelance opportunities',
    subcategories: ['Full-time Jobs', 'Part-time Jobs', 'Internships', 'Freelance Work']
  }
];

const Categories = () => {
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { callApi } = useApi();
  const navigate = useNavigate();

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch backend categories with counts
      const categoriesResponse = await callApi('GET', '/categories');

      if (!categoriesResponse || !categoriesResponse.success) {
        throw new Error(categoriesResponse?.message || 'Failed to fetch categories');
      }

      const backendCategories = categoriesResponse?.data || [];

      console.log('Backend categories received:', backendCategories);

      if (backendCategories.length === 0) {
        console.warn('No categories returned from backend');
        setError('No categories available at the moment');
        setCategoriesWithCount(categories.map(cat => ({ ...cat, count: '0', children: [] })));
        return;
      }

      // Create a mapping between frontend display categories and backend categories
      const categoriesWithRealCount = categories.map(category => {
        console.log(`Trying to match frontend category "${category.name}" (id: ${category.id})`);

        // Find all matching backend categories by name (case insensitive)
        const allMatches = backendCategories.filter(backendCat =>
          backendCat.name?.toLowerCase() === category.name.toLowerCase()
        );

        if (allMatches.length > 0) {
          console.log(`  ✓ Found ${allMatches.length} match(es) for "${category.name}"`);

          // Aggregate counts from all matching categories
          const totalCount = allMatches.reduce((sum, cat) => sum + (cat.ads_count || 0), 0);

          // Collect all children from all matching parent categories
          // Use a Map to deduplicate children by name while keeping the most relevant one
          const childrenMap = new Map();
          allMatches.forEach(parentCat => {
            (parentCat.children || []).forEach(child => {
              const childName = child.name.toLowerCase();
              if (!childrenMap.has(childName) || child.ads_count > (childrenMap.get(childName).ads_count || 0)) {
                childrenMap.set(childName, child);
              }
            });
          });

          const uniqueChildren = Array.from(childrenMap.values());

          console.log(`  Total count: ${totalCount}, Children: ${uniqueChildren.length}`);

          return {
            ...category,
            count: totalCount.toLocaleString(),
            backendId: allMatches[0].id, // Use first match as primary
            backendName: allMatches[0].name,
            children: uniqueChildren,
            multipleMatches: allMatches.map(m => m.id) // Store all IDs for filtering
          };
        }

        console.log(`  ✗ No match found for "${category.name}"`);
        return {
          ...category,
          count: '0',
          backendId: null,
          backendName: null,
          children: []
        };
      });

      setCategoriesWithCount(categoriesWithRealCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message || 'Failed to load categories. Please try again later.');
      // Fallback to categories with zero counts
      setCategoriesWithCount(categories.map(cat => ({ ...cat, count: '0', children: [] })));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null); // Reset sub-category when a new category is selected
  };

  const handleSubCategoryClick = (subcategory) => {
    // subcategory can be either a string (from hardcoded subcategories) or an object (from backend children)
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

  const filteredCategories = categoriesWithCount.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    console.log('Selected category:', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    console.log('Selected sub-category:', selectedSubCategory);
  }, [selectedSubCategory]);

  const searchParams = useMemo(() => {
    if (!selectedCategory) {
      return {};
    }

    const params = {};

    // When a subcategory is selected, we still search by parent category ID
    // but add the subcategory name to filter results
    if (selectedSubCategory) {
      // Always use parent category ID for the main filter
      if (selectedCategory.multipleMatches && selectedCategory.multipleMatches.length > 0) {
        params.category_id = selectedCategory.multipleMatches[0];
      } else if (selectedCategory.backendId) {
        params.category_id = selectedCategory.backendId;
      } else {
        params.category_id = selectedCategory.id;
      }

      // Add subcategory name to filter ads
      let subcategoryName = '';
      if (typeof selectedSubCategory === 'object' && selectedSubCategory.name) {
        subcategoryName = selectedSubCategory.name;
      } else if (typeof selectedSubCategory === 'string') {
        subcategoryName = selectedSubCategory;
      }

      if (subcategoryName) {
        // Use the subcategory parameter that the backend expects
        params.subcategory = subcategoryName;
        console.log('Filtering by parent category:', params.category_id, 'with subcategory:', subcategoryName);
      }
    } else {
      // No subcategory selected, show ads from this parent category AND all its children
      if (selectedCategory.multipleMatches && selectedCategory.multipleMatches.length > 1) {
        params.category_id = selectedCategory.multipleMatches[0];
        console.log('Using first of multiple matches:', selectedCategory.multipleMatches[0], 'All matches:', selectedCategory.multipleMatches);
      } else if (selectedCategory.backendId) {
        params.category_id = selectedCategory.backendId;
        console.log('Using parent category ID:', params.category_id, '- Will show all ads from parent + children');
      } else {
        params.category_id = selectedCategory.id;
        console.log('Using frontend category ID as fallback:', params.category_id);
      }
    }

    console.log('Final search params:', params);
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
              {React.cloneElement(selectedCategory.icon, {
                sx: { fontSize: 30, color: selectedCategory.color }
              })}
            </Box>
            
            {/* <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedCategory.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedCategory.children && selectedCategory.children.length > 0 
                  ? selectedCategory.children.map(c => c.name).join(', ')
                  : selectedCategory.subcategories.join(', ')
                }
              </Typography>
            </Box> */}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedCategory.children && selectedCategory.children.length > 0
              ? selectedCategory.children.map(child => {
                  const isSelected = (typeof selectedSubCategory === 'object' && selectedSubCategory?.id === child.id) ||
                                   (typeof selectedSubCategory === 'string' && selectedSubCategory === child.name);

                  return (
                    <Chip
                      key={child.id || child.name}
                      label={child.name}
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
                })
              : selectedCategory.subcategories.map(subcategory => (
                  <Chip
                    key={subcategory}
                    label={subcategory}
                    onClick={() => handleSubCategoryClick(subcategory)}
                    color={selectedSubCategory === subcategory ? 'primary' : 'default'}
                  />
                ))
            }
            {selectedSubCategory && (
              <Chip
                label="Clear Filter"
                onClick={() => setSelectedSubCategory(null)}
                variant="outlined"
                color="secondary"
              />
            )}
          </Box>
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
        
        {/* Subcategories */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 2 }}>
          {category.children && category.children.length > 0
            ? category.children.slice(0, 3).map((child) => (
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
              ))
            : category.subcategories?.slice(0, 3).map((subcategory, index) => (
                <Chip
                  key={index}
                  label={subcategory}
                  size="small"
                  sx={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}
                />
              ))
          }
          {category.children && category.children.length > 3 && (
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

      {/* Error Display */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

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