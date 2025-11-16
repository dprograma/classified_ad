import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { CloudUpload, Delete } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { getStorageUrl } from '../config/api';
import { getLocationOptions } from '../data/nigeriaLocations';

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category_id: ''
  });
  const [customFields, setCustomFields] = useState({});
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFields, setCategoryFields] = useState([]);
  const { callApi, loading } = useApi();
  const [errors, setErrors] = useState({});
  const [loadingAd, setLoadingAd] = useState(true);

  const fetchAd = useCallback(async () => {
    try {
      setLoadingAd(true);
      const data = await callApi('GET', `/ads/${id}`);

      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        location: data.location || '',
        category_id: data.category_id || ''
      });

      // Set existing images
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
      }

      // Set custom fields
      if (data.custom_fields && data.custom_fields.length > 0) {
        const fieldsObj = {};
        data.custom_fields.forEach(field => {
          fieldsObj[field.field_name] = field.field_value;
        });
        setCustomFields(fieldsObj);
      }

    } catch (error) {
      console.error('Error fetching ad:', error);
      setErrors({ submit: 'Failed to load ad details. Please try again.' });
    } finally {
      setLoadingAd(false);
    }
  }, [id, callApi]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await callApi('GET', '/categories');
      // Backend returns { success: true, data: [...] }
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  }, [callApi]);

  const fetchCategoryFields = useCallback(async () => {
    if (formData.category_id) {
      try {
        const data = await callApi('GET', `/categories/${formData.category_id}/fields`);
        setCategoryFields(data.fields || []);
      } catch (error) {
        console.error('Error fetching category fields:', error);
        setCategoryFields([]);
      }
    } else {
      setCategoryFields([]);
    }
  }, [formData.category_id, callApi]);

  useEffect(() => {
    fetchAd();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategoryFields();
  }, [formData.category_id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = [];
    const previews = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, images: `File ${file.name} is too large. Max size is 5MB.` }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: `File ${file.name} is not an image.` }));
        return;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ file, preview: e.target.result });
        if (previews.length === validFiles.length) {
          setImagePreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(validFiles);
    if (validFiles.length > 0 && errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const removeNewImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
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

    // Add new images
    images.forEach((image) => {
      submitData.append(`images`, image);
    });

    // Add existing image IDs to keep
    existingImages.forEach((image, index) => {
      submitData.append(`existing_images[${index}]`, image.id);
    });

    try {
      await callApi('POST', `/ads/${id}?_method=PUT`, submitData, {
        'Content-Type': 'multipart/form-data',
      });

      // Navigate to dashboard after successful update
      navigate('/dashboard');

    } catch (error) {
      console.error('Error updating ad:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to update ad. Please try again.' });
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
                minWidth: '250px'
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

  if (loadingAd) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom align="center">
          Edit Ad
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
                    value={formData.category_id}
                    label="Category"
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    sx={{
                      width: '100%',
                      minWidth: '250px'
                    }}
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
                  {errors.category_id && <FormHelperText>{errors.category_id}</FormHelperText>}
                </FormControl>
              </Grid>

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

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Current Images
                  </Typography>
                  <Grid container spacing={2}>
                    {existingImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={image.id}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={getStorageUrl(image.image_path)}
                            alt={`Existing ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          <Button
                            size="small"
                            onClick={() => removeExistingImage(image.id)}
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
                          {image.is_preview && (
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
                </Grid>
              )}

              {/* New Image Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Add New Images
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
                    Upload up to 10 images (Max 5MB each)
                  </Typography>
                  {errors.images && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {errors.images}
                    </Typography>
                  )}
                </Box>

                {/* New Image Preview */}
                {imagePreview.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      New Images to Upload:
                    </Typography>
                    <Grid container spacing={2}>
                      {imagePreview.map((item, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={item.preview}
                              alt={`New ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                            <Button
                              size="small"
                              onClick={() => removeNewImage(index)}
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
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                        Updating Ad...
                      </>
                    ) : (
                      'Update Ad'
                    )}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default EditAd;
