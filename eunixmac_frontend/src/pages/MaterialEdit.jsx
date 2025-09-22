import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  Save,
  ArrowBack,
  CloudUpload,
  AttachFile,
  Image
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const MaterialEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: ''
  });
  const [newFile, setNewFile] = useState(null);
  const [newPreviewImage, setNewPreviewImage] = useState(null);
  const { callApi } = useApi();

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const data = await callApi('GET', `/educational-materials/${id}`);
      setMaterial(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price?.toString() || ''
      });
    } catch (error) {
      console.error('Error fetching material:', error);
      setError(error.message || 'Failed to load material');
      toast.error('Failed to load material details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 10MB.');
        return;
      }

      setNewFile(file);
    }
  };

  const handlePreviewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid image type. Only JPEG, PNG, JPG, GIF, and SVG images are allowed.');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size too large. Maximum size is 2MB.');
        return;
      }

      setNewPreviewImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.price) < 0) {
      toast.error('Price must be a positive number');
      return;
    }

    try {
      setSaving(true);

      const updateData = new FormData();
      updateData.append('title', formData.title.trim());
      updateData.append('description', formData.description.trim());
      updateData.append('price', parseFloat(formData.price));

      if (newFile) {
        updateData.append('file', newFile);
      }

      if (newPreviewImage) {
        updateData.append('preview_image', newPreviewImage);
      }

      await callApi('PUT', `/educational-materials/${id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Material updated successfully');
      navigate(`/educational-materials/${id}`);
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error(error.message || 'Failed to update material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !material) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Material not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard?tab=educational-materials')}
          sx={{ mt: 2 }}
        >
          Back to My Materials
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/educational-materials/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Material
        </Button>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Edit Material
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update your educational material details
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    name="title"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    helperText="Give your material a clear, descriptive title"
                  />

                  <TextField
                    name="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    helperText="Describe what students will learn from this material"
                  />

                  <TextField
                    name="price"
                    label="Price"
                    value={formData.price}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                    }}
                    helperText="Set a fair price for your educational material"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* File Upload Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Current File Info */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Current File
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Type: {material.file_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size: {material.file_size}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Replace File */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Replace File (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFile />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Choose New File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {newFile && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Selected: {newFile.name}
                    </Alert>
                  )}
                  <FormHelperText>
                    Accepted formats: PDF, DOC, DOCX, TXT (max 10MB)
                    <br />
                    Note: Uploading a new file will require re-approval.
                  </FormHelperText>
                </CardContent>
              </Card>

              {/* Replace Preview Image */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Preview Image (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Image />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Choose New Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePreviewImageChange}
                    />
                  </Button>
                  {newPreviewImage && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Selected: {newPreviewImage.name}
                    </Alert>
                  )}
                  <FormHelperText>
                    Accepted formats: JPEG, PNG, JPG, GIF, SVG (max 2MB)
                  </FormHelperText>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={saving}
                fullWidth
              >
                {saving ? 'Updating...' : 'Update Material'}
              </Button>

              {/* Warning for new file */}
              {newFile && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    Uploading a new file will change your material's status to "Pending Approval"
                    and it will need to be reviewed again before going live.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default MaterialEdit;