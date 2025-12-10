import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Paper,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Menu,
  ListItemText,
  Fade
} from '@mui/material';
import { Search, LocationOn, Category, KeyboardArrowRight } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { UNIQUE_LOCATIONS } from '../data/nigerianStates';

const CompactSearch = ({ sx = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const { callApi } = useApi();
  const navigate = useNavigate();

  // Fetch categories on component mount with caching
  useEffect(() => {
    if (!categoriesLoaded && !categoriesError) {
      fetchCategories();
    }
  }, [categoriesLoaded, categoriesError]);

  const fetchCategories = async () => {
    // Check if we already have cached categories
    const cachedCategories = localStorage.getItem('categories_with_children');
    const cacheTimestamp = localStorage.getItem('categories_with_children_timestamp');
    const now = Date.now();

    // Use cache if it's less than 5 minutes old
    if (cachedCategories && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
      setCategories(JSON.parse(cachedCategories));
      setCategoriesLoaded(true);
      return;
    }

    try {
      const response = await callApi('GET', '/categories');
      let categoriesData = [];

      // Backend returns { success: true, data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response && Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      }

      // Group categories by parent
      const parentCategories = categoriesData.filter(cat => !cat.parent_id);
      const childCategories = categoriesData.filter(cat => cat.parent_id);

      // Attach children to parents
      const structuredCategories = parentCategories.map(parent => ({
        ...parent,
        children: childCategories.filter(child => child.parent_id === parent.id)
      }));

      // Remove duplicates by name, keeping the one with most children
      const uniqueCategories = {};
      structuredCategories.forEach(cat => {
        if (!uniqueCategories[cat.name] || cat.children.length > uniqueCategories[cat.name].children.length) {
          uniqueCategories[cat.name] = cat;
        }
      });

      const finalCategories = Object.values(uniqueCategories);

      setCategories(finalCategories);
      setCategoriesLoaded(true);
      setCategoriesError(false);

      // Cache the categories
      localStorage.setItem('categories_with_children', JSON.stringify(finalCategories));
      localStorage.setItem('categories_with_children_timestamp', now.toString());
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError(true);

      // Set fallback categories so the dropdown still works
      const fallbackCategories = [
        { id: 1, name: 'Electronics', children: [] },
        { id: 2, name: 'Vehicles', children: [] },
        { id: 3, name: 'Real Estate', children: [] },
        { id: 4, name: 'Fashion', children: [] },
        { id: 5, name: 'Home & Garden', children: [] }
      ];
      setCategories(fallbackCategories);
      setCategoriesLoaded(true);

      // Don't show alert for rate limiting errors
      if (error.response?.status !== 429) {
        setTimeout(() => {
          if (!categoriesLoaded) {
            console.warn('Unable to load categories. Using default categories.');
          }
        }, 1000);
      }
    }
  };

  // Create a stable debounced function
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query, apiFunction) => {
      if (query.length >= 2) {
        // Check cache first
        const cacheKey = `suggestions_${query.toLowerCase()}`;
        const cachedSuggestions = sessionStorage.getItem(cacheKey);
        const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
        const now = Date.now();

        // Use cache if it's less than 2 minutes old
        if (cachedSuggestions && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 120000) {
          setSuggestions(JSON.parse(cachedSuggestions));
          return;
        }

        try {
          const data = await apiFunction('GET', `/ads/search/suggestions?query=${encodeURIComponent(query)}&limit=5`);
          let suggestionsData = [];

          if (data && data.titles && Array.isArray(data.titles)) {
            suggestionsData = data.titles.map(title => ({ type: 'title', value: title }));
          }

          setSuggestions(suggestionsData);

          // Cache the suggestions
          sessionStorage.setItem(cacheKey, JSON.stringify(suggestionsData));
          sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } catch (error) {
          console.error('Error fetching suggestions:', error);

          // For rate limiting errors, don't provide fallback suggestions
          if (error.response?.status === 429) {
            setSuggestions([]);
          } else {
            // Provide fallback suggestions for other errors
            setSuggestions([
              { type: 'title', value: query },
              { type: 'title', value: `${query} for sale` },
              { type: 'title', value: `buy ${query}` }
            ]);
          }
        }
      } else {
        setSuggestions([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    try {
      if (searchTerm && searchTerm.trim().length >= 2) {
        debouncedFetchSuggestions(searchTerm.trim(), callApi);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error in useEffect for search suggestions:', error);
      setSuggestions([]);
    }
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleCategoryOpen = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
    setHoveredCategory(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(''); // Reset subcategory when changing parent
    handleCategoryClose();
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    handleCategoryClose();
  };

  const handleSearch = (customTerm = null) => {
    const searchParams = new URLSearchParams();

    const termToUse = customTerm || searchTerm;
    const searchTermString = typeof termToUse === 'string' ? termToUse : String(termToUse || '');
    if (searchTermString && searchTermString.trim()) {
      searchParams.set('search', searchTermString.trim());
    }

    // Use subcategory if selected, otherwise use category
    if (selectedSubcategory) {
      searchParams.set('category_id', selectedSubcategory);
    } else if (selectedCategory) {
      searchParams.set('category_id', selectedCategory);
    }

    if (selectedLocation && typeof selectedLocation === 'string' && selectedLocation.trim()) {
      searchParams.set('location', selectedLocation.trim());
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Get selected category/subcategory name for display
  const getSelectedCategoryName = () => {
    if (selectedSubcategory) {
      const parentCat = categories.find(cat =>
        cat.children && cat.children.some(child => child.id === selectedSubcategory)
      );
      if (parentCat) {
        const subCat = parentCat.children.find(child => child.id === selectedSubcategory);
        return `${parentCat.name} > ${subCat?.name}`;
      }
    }
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      return cat?.name || '';
    }
    return '';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(108,71,255,0.02) 0%, rgba(0,198,174,0.02) 100%)',
        border: '1px solid',
        borderColor: 'rgba(108,71,255,0.1)',
        ...sx
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: { xs: 2, sm: 2.5, md: 3 },
          fontWeight: 700,
          textAlign: 'center',
          color: 'text.primary',
          fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' }
        }}
      >
        Find Your Perfect Match
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        {/* Search Term */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' }, minWidth: 0 }}>
          <Autocomplete
            options={suggestions || []}
            getOptionLabel={(option) => (option && option.value) ? option.value : ''}
            renderOption={(props, option) => {
              if (!option || !option.value) return null;
              return (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Search fontSize="small" color="action" />
                    <Typography variant="body2">{option.value}</Typography>
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="What are you looking for?"
                placeholder="Search for cars, phones, houses..."
                variant="outlined"
                fullWidth
                onKeyPress={handleKeyPress}
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '48px', sm: '52px', md: '56px' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 12px', sm: '12px 14px' }
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                }}
              />
            )}
            inputValue={searchTerm || ''}
            onInputChange={(event, newInputValue) => {
              if (typeof newInputValue === 'string') {
                setSearchTerm(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue === 'object' && newValue.value) {
                setSearchTerm(newValue.value);
                handleSearch(newValue.value);
              }
            }}
            freeSolo
          />
        </Box>

        {/* Category with Subcategories */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 1 200px' }, minWidth: 0 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Category</InputLabel>
            <Select
              value={selectedSubcategory || selectedCategory || ''}
              onChange={(e) => {
                const value = e.target.value;
                // Check if it's a subcategory or parent category
                const isSubcategory = categories.some(cat =>
                  cat.children && cat.children.some(child => child.id === value)
                );
                if (isSubcategory) {
                  setSelectedSubcategory(value);
                  const parentCat = categories.find(cat =>
                    cat.children && cat.children.some(child => child.id === value)
                  );
                  if (parentCat) setSelectedCategory(parentCat.id);
                } else {
                  setSelectedCategory(value);
                  setSelectedSubcategory('');
                }
              }}
              renderValue={(value) => getSelectedCategoryName() || 'All Categories'}
              label="Category"
              sx={{
                height: { xs: '48px', sm: '52px', md: '56px' },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  padding: { xs: '8px 12px', sm: '12px 14px' }
                }
              }}
              startAdornment={<Category sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => [
                <MenuItem
                  key={category.id}
                  value={category.id}
                  sx={{ fontWeight: 600 }}
                >
                  {category.name}
                </MenuItem>,
                ...(category.children && category.children.length > 0 ? category.children.map(subcat => (
                  <MenuItem
                    key={subcat.id}
                    value={subcat.id}
                    sx={{ pl: 4, fontSize: '0.9rem' }}
                  >
                    <KeyboardArrowRight sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {subcat.name}
                  </MenuItem>
                )) : [])
              ]).flat()}
            </Select>
          </FormControl>
        </Box>

        {/* Location */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 1 200px' }, minWidth: 0 }}>
          <Autocomplete
            options={UNIQUE_LOCATIONS}
            value={selectedLocation}
            onChange={(event, newValue) => setSelectedLocation(newValue || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                placeholder="State or City"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': {
                    height: { xs: '48px', sm: '52px', md: '56px' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '8px 12px', sm: '12px 14px' }
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                }}
              />
            )}
            freeSolo
          />
        </Box>

        {/* Search Button */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: { xs: 0, md: '120px' } }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleSearch()}
            sx={{
              height: { xs: '48px', sm: '52px', md: '56px' },
              background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(108,71,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(108,71,255,0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Quick Categories */}
      <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, textAlign: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Popular searches:
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: { xs: 0.5, sm: 1 },
          px: { xs: 1, sm: 0 }
        }}>
          {['Cars', 'Phones', 'Laptops', 'Houses', 'Fashion', 'Electronics'].map((term) => (
            <Button
              key={term}
              size="small"
              variant="text"
              onClick={() => {
                setSearchTerm(term);
                const searchParams = new URLSearchParams();
                searchParams.set('search', term);
                navigate(`/search?${searchParams.toString()}`);
              }}
              sx={{
                color: 'primary.main',
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                minWidth: { xs: 'auto', sm: 'auto' },
                padding: { xs: '4px 8px', sm: '6px 12px' },
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              {term}
            </Button>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default CompactSearch;
