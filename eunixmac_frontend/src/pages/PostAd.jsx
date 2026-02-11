import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { CloudUpload, Delete, PhotoCamera } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { getLocationOptions } from '../data/nigeriaLocations';

function PostAd() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category_id: ''
  });
  const [customFields, setCustomFields] = useState({});
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const [categoryFields, setCategoryFields] = useState([]);
  const { callApi, loading } = useApi();
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await callApi('GET', '/categories');
      // Backend returns { success: true, data: [...] }
      // Filter out the "Books" category (Past Questions, Ebooks, Publications)
      // Books are only posted by Admin/Agents via their dashboard
      // Note: "Books and Media" (Music, Movies, etc.) is a separate category and remains available
      const allCategories = response.data || [];
      const filteredCategories = allCategories.filter(
        (cat) => cat.name.toLowerCase() !== 'books'
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  }, [callApi]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategoryFields = useCallback(async () => {
    if (formData.category_id) {
      try {
        const data = await callApi('GET', `/categories/${formData.category_id}/fields`);
        setCategoryFields(data.fields || []);
        setCustomFields({}); // Reset custom fields when category changes
      } catch (error) {
        console.error('Error fetching category fields:', error);
        setCategoryFields([]);
      }
    } else {
      setCategoryFields([]);
      setCustomFields({});
    }
  }, [formData.category_id, callApi]);

  useEffect(() => {
    fetchCategoryFields();
  }, [formData.category_id]);

  const handleParentCategoryChange = (parentId) => {
    setSelectedParentCategory(parentId);
    const parent = Array.isArray(categories) ? categories.find(cat => cat.id === parentId) : null;
    setSubCategories(parent && parent.children ? parent.children : []);
    handleInputChange('category_id', ''); // Reset sub-category
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 2 * 1024 * 1024; // 2MB (matching PHP upload_max_filesize limit)
    const validFiles = [];
    const previews = [];
    let errorMessages = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        errorMessages.push(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size is 2MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        errorMessages.push(`${file.name} is not an image.`);
        return;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ file, preview: e.target.result });
        if (previews.length === validFiles.length) {
          setImagePreview(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (errorMessages.length > 0) {
      setErrors(prev => ({ ...prev, images: errorMessages.join(' ') }));
    } else if (validFiles.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    
    // Validate required custom fields
    categoryFields.forEach(field => {
      if (field.required && !customFields[field.name]) {
        newErrors[`custom_${field.name}`] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    
    const submitData = new FormData();
    
    // Add basic form data
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    
    // Add custom fields
    const customFieldsArray = Object.keys(customFields).map(key => ({
      field_name: key,
      field_value: customFields[key]
    }));
    
    if (customFieldsArray.length > 0) {
      customFieldsArray.forEach((field, index) => {
        submitData.append(`custom_fields[${index}][field_name]`, field.field_name);
        submitData.append(`custom_fields[${index}][field_value]`, field.field_value);
      });
    }
    
    // Add images
    images.forEach((image, index) => {
      submitData.append(`images[]`, image);
    });

    try {
      // Don't set Content-Type manually for FormData - axios will set it with boundary automatically
      const response = await callApi('POST', '/ads', submitData);
      
      setSubmitSuccess(true);

      // Clear form after successful submission
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        category_id: ''
      });
      setCustomFields({});
      setImages([]);
      setImagePreview([]);
      setCategoryFields([]);
      setSelectedParentCategory('');
      setSubCategories([]);
      
    } catch (error) {
      console.error('Error posting ad:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to post ad. Please try again.' });
      }
    }
  };

  const renderCustomField = (field) => {
    const value = customFields[field.name] || '';
    const error = errors[`custom_${field.name}`];
    
    switch (field.type) {
      case 'select':
        return (
          <FormControl 
            fullWidth 
            margin="normal" 
            required={field.required} 
            error={!!error}
            sx={{ 
              width: '100%',
              minWidth: '250px'
            }}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
              sx={{
                width: '100%',
                minWidth: '250px',
                '& .MuiInputBase-root': {
                  width: '100%'
                },
                '& .MuiSelect-select': {
                  padding: '16.5px 14px',
                  width: 'auto',
                  minWidth: 'calc(100% - 28px)'
                }
              }}
            >
              <MenuItem value="">Select {field.label}</MenuItem>
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      case 'number':
        return (
          <TextField
            key={field.name}
            margin="normal"
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        );
      default:
        return (
          <TextField
            key={field.name}
            margin="normal"
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        );
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            <Typography variant="h6">Ad Submitted Successfully!</Typography>
            <Typography>Your ad has been submitted and is pending review. It will be live once approved.</Typography>
          </Alert>
          <Button variant="contained" onClick={() => setSubmitSuccess(false)}>
            Post Another Ad
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom align="center">
          Post a New Ad
        </Typography>
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Ad Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="Enter a descriptive title for your ad"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  required 
                  error={!!errors.category_id}
                  sx={{ 
                    width: '100%',
                    minWidth: '250px'
                  }}
                >
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedParentCategory}
                    label="Category"
                    onChange={(e) => handleParentCategoryChange(e.target.value)}
                  >
                    {Array.isArray(categories) && categories.map((category) => (
                      <MenuItem 
                        key={category.id} 
                        value={category.id}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {subCategories.length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    required 
                    error={!!errors.category_id}
                    sx={{ 
                      width: '100%',
                      minWidth: '250px'
                    }}
                  >
                    <InputLabel>Sub-Category</InputLabel>
                    <Select
                      value={formData.category_id}
                      label="Sub-Category"
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                    >
                      {subCategories.map((category) => (
                        <MenuItem 
                          key={category.id} 
                          value={category.id}
                        >
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category_id && <FormHelperText>{errors.category_id}</FormHelperText>}
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description || 'Provide a detailed description (minimum 10 characters)'}
                  placeholder="Describe your item in detail..."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Price (₦)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  required
                  error={!!errors.location}
                  sx={{
                    width: '100%',
                    minWidth: '250px'
                  }}
                >
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={formData.location}
                    label="Location"
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: '300px',
                          width: 'auto',
                          marginTop: '8px'
                        },
                      },
                    }}
                    sx={{
                      width: '100%',
                      minWidth: '250px',
                      '& .MuiInputBase-root': {
                        width: '100%'
                      },
                      '& .MuiSelect-select': {
                        padding: '16.5px 14px',
                        width: 'auto',
                        minWidth: 'calc(100% - 28px)'
                      }
                    }}
                  >
                    <MenuItem value="">Select Location</MenuItem>
                    {getLocationOptions().map((location, index) => (
                      <MenuItem
                        key={index}
                        value={location}
                        sx={{
                          whiteSpace: 'normal',
                          padding: '12px 16px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Category-specific fields */}
              {categoryFields.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Details
                    </Typography>
                  </Grid>
                  
                  {categoryFields.map((field, index) => (
                    <Grid item xs={12} md={6} key={field.name}>
                      {renderCustomField(field)}
                    </Grid>
                  ))}
                </>
              )}
              
              {/* Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Images
                </Typography>
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ mb: 2 }}
                    >
                      Choose Images
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    Upload up to 10 images (Max 2MB each)
                  </Typography>
                  {errors.images && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {errors.images}
                    </Typography>
                  )}
                </Box>
                
                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Images:
                    </Typography>
                    <Grid container spacing={2}>
                      {imagePreview.map((item, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={item.preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                            <Button
                              size="small"
                              onClick={() => removeImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                minWidth: 'auto',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </Button>
                            {index === 0 && (
                              <Chip
                                label="Main"
                                size="small"
                                color="primary"
                                sx={{ position: 'absolute', bottom: 4, left: 4 }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, py: 1.5 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Posting Ad...
                    </>
                  ) : (
                    'Post Ad'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default PostAd;