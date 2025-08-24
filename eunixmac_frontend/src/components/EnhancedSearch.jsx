import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  Drawer,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Badge,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  LocationOn,
  AttachMoney,
  Category,
  Star,
  Close
} from '@mui/icons-material';
import useApi from '../hooks/useApi';

const EnhancedSearch = ({ onSearch, onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    location: true,
    price: true,
    condition: false,
    customFields: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    category_id: '',
    location: [],
    price_range: '',
    min_price: '',
    max_price: '',
    condition: [],
    custom_fields: {},
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const [categoryFilters, setCategoryFilters] = useState({
    locations: [],
    custom_fields: {},
    price_stats: {}
  });

  const { callApi, loading } = useApi();

  // Price range presets (matching Jiji.ng style)
  const priceRanges = [
    { value: 'under_50k', label: 'Under ₦50,000' },
    { value: '50k_200k', label: '₦50,000 - ₦200,000' },
    { value: '200k_1m', label: '₦200,000 - ₦1,000,000' },
    { value: '1m_5m', label: '₦1,000,000 - ₦5,000,000' },
    { value: 'over_5m', label: 'Over ₦5,000,000' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date: Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'title', label: 'Name: A to Z' }
  ];

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await callApi('GET', '/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch search suggestions with debouncing
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length >= 2) {
        try {
          const data = await callApi('GET', `/ads/search/suggestions?query=${encodeURIComponent(query)}&limit=10`);
          if (data) {
            const suggestions = [];
            if (data.titles && Array.isArray(data.titles)) {
              suggestions.push(...data.titles.map(title => ({ type: 'title', value: title })));
            }
            if (data.locations && Array.isArray(data.locations)) {
              suggestions.push(...data.locations.map(location => ({ type: 'location', value: location })));
            }
            if (data.custom_fields && Array.isArray(data.custom_fields)) {
              suggestions.push(...data.custom_fields.map(cf => ({ type: cf.field_name, value: cf.field_value })));
            }
            setSuggestions(suggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          // Don't show error to user, just provide fallback suggestions
          setSuggestions([
            { type: 'title', value: query },
            { type: 'title', value: `${query} for sale` },
            { type: 'title', value: `buy ${query}` },
            { type: 'title', value: `${query} in Lagos` },
            { type: 'title', value: `${query} in Abuja` }
          ]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Fetch category-specific filters
  const fetchCategoryFilters = async (categoryId) => {
    if (!categoryId) {
      setCategoryFilters({ locations: [], custom_fields: {}, price_stats: {} });
      return;
    }

    try {
      const data = await callApi('GET', `/categories/${categoryId}/filters`);
      setCategoryFilters(data);
    } catch (error) {
      console.error('Error fetching category filters:', error);
    }
  };

  // Handle search term changes
  useEffect(() => {
    if (searchTerm) {
      fetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, fetchSuggestions]);

  // Handle category change
  useEffect(() => {
    if (filters.category_id) {
      fetchCategoryFilters(filters.category_id);
    }
  }, [filters.category_id]);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'price_range' && value ? { min_price: '', max_price: '' } : {}),
      ...(key === 'min_price' || key === 'max_price' ? { price_range: '' } : {})
    }));
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFilters(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: value
      }
    }));
  };

  const handleSearch = () => {
    const searchParams = {
      search: searchTerm,
      ...filters,
      ...(filters.sort_by === 'price_asc' ? { sort_by: 'price', sort_order: 'asc' } : {}),
      ...(filters.sort_by === 'price_desc' ? { sort_by: 'price', sort_order: 'desc' } : {})
    };

    // Clean up empty values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === '' || 
          (Array.isArray(searchParams[key]) && searchParams[key].length === 0) ||
          (typeof searchParams[key] === 'object' && Object.keys(searchParams[key]).length === 0)) {
        delete searchParams[key];
      }
    });

    onSearch?.(searchParams);
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      location: [],
      price_range: '',
      min_price: '',
      max_price: '',
      condition: [],
      custom_fields: {},
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.location.length > 0) count++;
    if (filters.price_range || filters.min_price || filters.max_price) count++;
    if (filters.condition.length > 0) count++;
    if (Object.keys(filters.custom_fields).some(key => filters.custom_fields[key])) count++;
    return count;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderCustomFieldFilters = () => {
    return Object.entries(categoryFilters.custom_fields || {}).map(([fieldName, values]) => (
      <Box key={fieldName} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'capitalize' }}>
          {fieldName.replace('_', ' ')}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            multiple
            value={filters.custom_fields[fieldName] || []}
            onChange={(e) => handleCustomFieldChange(fieldName, e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return <em>Any {fieldName.replace('_', ' ')}</em>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.slice(0, 2).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                  {selected.length > 2 && (
                    <Chip label={`+${selected.length - 2}`} size="small" />
                  )}
                </Box>
              );
            }}
          >
            {values.map((value) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={filters.custom_fields[fieldName]?.includes(value) || false} />
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    ));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Search Bar */}
      <Paper sx={{ p: 2, mb: 2, elevation: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={suggestions}
              getOptionLabel={(option) => option.value}
              groupBy={(option) => option.type}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.type === 'location' && <LocationOn fontSize="small" />}
                    {option.type === 'title' && <Search fontSize="small" />}
                    <Typography variant="body2">{option.value}</Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for cars, phones, houses..."
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              )}
              inputValue={searchTerm}
              onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  setSearchTerm(newValue.value);
                }
              }}
              freeSolo
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Badge badgeContent={getActiveFiltersCount()} color="primary">
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                onClick={() => setShowFilters(true)}
                sx={{ height: '56px' }}
              >
                Filters
              </Button>
            </Badge>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            maxWidth: '90vw'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <Box>
              <Button onClick={clearFilters} size="small" sx={{ mr: 1 }}>
                Clear All
              </Button>
              <IconButton onClick={() => setShowFilters(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Category Filter */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection('category')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Category
              </Typography>
              {expandedSections.category ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={expandedSections.category}>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Collapse>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Location Filter */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection('location')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Location
              </Typography>
              {expandedSections.location ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={expandedSections.location}>
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  multiple
                  options={categoryFilters.locations || []}
                  value={filters.location}
                  onChange={(event, newValue) => handleFilterChange('location', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select locations"
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Box>
            </Collapse>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Price Filter */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection('price')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Price Range
              </Typography>
              {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={expandedSections.price}>
              <Box sx={{ mt: 2 }}>
                <RadioGroup
                  value={filters.price_range}
                  onChange={(e) => handleFilterChange('price_range', e.target.value)}
                >
                  <FormControlLabel value="" control={<Radio />} label="Any Price" />
                  {priceRanges.map((range) => (
                    <FormControlLabel
                      key={range.value}
                      value={range.value}
                      control={<Radio />}
                      label={range.label}
                    />
                  ))}
                </RadioGroup>
                
                <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                  Or set custom range:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      placeholder="Min Price"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      placeholder="Max Price"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Condition Filter */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => toggleSection('condition')}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Condition
              </Typography>
              {expandedSections.condition ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={expandedSections.condition}>
              <Box sx={{ mt: 2 }}>
                <FormGroup>
                  {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((condition) => (
                    <FormControlLabel
                      key={condition}
                      control={
                        <Checkbox
                          checked={filters.condition.includes(condition)}
                          onChange={(e) => {
                            const newConditions = e.target.checked
                              ? [...filters.condition, condition]
                              : filters.condition.filter(c => c !== condition);
                            handleFilterChange('condition', newConditions);
                          }}
                        />
                      }
                      label={condition}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Dynamic Custom Field Filters */}
          {Object.keys(categoryFilters.custom_fields || {}).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => toggleSection('customFields')}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  More Filters
                </Typography>
                {expandedSections.customFields ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSections.customFields}>
                <Box sx={{ mt: 2 }}>
                  {renderCustomFieldFilters()}
                </Box>
              </Collapse>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}

          {/* Sort Options */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Sort By
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Apply Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              handleSearch();
              setShowFilters(false);
            }}
            sx={{ mt: 'auto' }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </Box>
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

export default EnhancedSearch;