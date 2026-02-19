import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload,
  School,
  AttachMoney,
  CheckCircle,
  Upload,
  Description
} from '@mui/icons-material';
import { styled } from '@mui/system';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const UploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #ccc',
  borderRadius: '8px',
  padding: '40px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.dragging': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  }
}));

const steps = ['Upload File', 'Book Details', 'Pricing & Settings', 'Review & Submit'];

const bookCategories = [
  'Past Questions',
  'Ebooks',
  'Publications'
];

const subjectAreas = [
  'Mathematics',
  'English Language',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Literature',
  'Geography',
  'History',
  'Computer Science',
  'Agricultural Science',
  'Further Mathematics',
  'Technical Drawing',
  'Other'
];

const educationLevels = [
  'Primary School',
  'Junior Secondary School (JSS)',
  'Senior Secondary School (SSS)',
  'JAMB/UTME',
  'WAEC',
  'NECO',
  'Undergraduate',
  'Postgraduate',
  'Professional Certification'
];

function UploadBook() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [bookData, setBookData] = useState({
    title: '',
    description: '',
    category: '',
    subject_area: '',
    education_level: '',
    price: '',
    tags: '',
    preview_text: '',
    author_info: '',
    year_published: new Date().getFullYear(),
    language: 'English'
  });

  const { callApi, loading } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, DOCX, PPT, and PPTX files are allowed');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleInputChange = (field, value) => {
    setBookData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCoverImageSelect(file);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (activeStep === 1) {
      if (!bookData.title || !bookData.description || !bookData.category) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    if (activeStep === 2) {
      if (!bookData.price || parseFloat(bookData.price) <= 0) {
        toast.error('Please set a valid price');
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);

      // Add cover image if selected
      if (coverImage) {
        formData.append('preview_image', coverImage);
      }

      // Add all book data
      Object.keys(bookData).forEach(key => {
        formData.append(key, bookData[key]);
      });

      const token = localStorage.getItem('token');

      // Use a dedicated axios instance with a generous timeout for file uploads
      // (default useApi timeout of 30s is too short for large files on shared hosting)
      await axios.post(`${API_CONFIG.BASE_URL}/books`, formData, {
        timeout: 300000, // 5 minutes — enough for large files on slow shared hosting
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      toast.success('Book uploaded successfully! It will be reviewed before being published.');
      navigate('/dashboard?tab=books');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload book. Please try again.';
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Upload Your Book
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select a file to upload. Supported formats: PDF, DOC, DOCX, PPT, PPTX
            </Typography>

            <UploadBox
              className={dragging ? 'dragging' : ''}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                type="file"
                id="file-input"
                hidden
                onChange={handleFileInputChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
              
              {selectedFile ? (
                <Box>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    File Selected Successfully
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {filePreview.name}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip label={filePreview.size} size="small" />
                    <Chip label={filePreview.type.split('/')[1].toUpperCase()} size="small" />
                  </Stack>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-input').click();
                    }}
                  >
                    Choose Different File
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop Your File Here
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    or click to browse files
                  </Typography>
                  <Button variant="outlined" startIcon={<Upload />}>
                    Choose File
                  </Button>
                </Box>
              )}
            </UploadBox>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Upload Guidelines:</strong><br/>
                • Maximum file size: 10MB<br/>
                • Accepted formats: PDF, DOC, DOCX, PPT, PPTX<br/>
                • Only educational content is allowed<br/>
                • All uploads are reviewed before publication
              </Typography>
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Book Details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Provide detailed information about your book
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Book Title *"
                  fullWidth
                  value={bookData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., WAEC Mathematics Past Questions 2020-2023"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description *"
                  fullWidth
                  multiline
                  rows={4}
                  value={bookData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of the book, what it covers, and who it's for..."
                />
              </Grid>

              {/* Cover Image Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Cover Image (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cover-image-upload"
                    type="file"
                    onChange={handleCoverImageChange}
                  />
                  <label htmlFor="cover-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                    >
                      Upload Cover Image
                    </Button>
                  </label>
                  {coverImagePreview && (
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        style={{
                          maxWidth: '150px',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          minWidth: 'auto',
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          p: 0
                        }}
                        onClick={() => {
                          setCoverImage(null);
                          setCoverImagePreview(null);
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Upload a cover image for your book (JPG, PNG, GIF - Max 2MB)
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={bookData.category}
                    label="Category *"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {bookCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject Area</InputLabel>
                  <Select
                    value={bookData.subject_area}
                    label="Subject Area"
                    onChange={(e) => handleInputChange('subject_area', e.target.value)}
                  >
                    {subjectAreas.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Education Level</InputLabel>
                  <Select
                    value={bookData.education_level}
                    label="Education Level"
                    onChange={(e) => handleInputChange('education_level', e.target.value)}
                  >
                    {educationLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Tags (comma-separated)"
                  fullWidth
                  value={bookData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., mathematics, algebra, geometry, exam prep"
                  helperText="Add relevant tags to help users find your book"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Year Published"
                  type="number"
                  fullWidth
                  value={bookData.year_published}
                  onChange={(e) => handleInputChange('year_published', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Preview Text"
                  fullWidth
                  multiline
                  rows={3}
                  value={bookData.preview_text}
                  onChange={(e) => handleInputChange('preview_text', e.target.value)}
                  placeholder="A brief preview or sample of the content to help potential buyers..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Pricing & Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Set your pricing and additional settings for the book
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price (₦) *"
                  type="number"
                  fullWidth
                  value={bookData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  You will receive 70% of the sale price
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={bookData.language}
                    label="Language"
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Pidgin English">Pidgin English</MenuItem>
                    <MenuItem value="Hausa">Hausa</MenuItem>
                    <MenuItem value="Yoruba">Yoruba</MenuItem>
                    <MenuItem value="Igbo">Igbo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Author Information"
                  fullWidth
                  multiline
                  rows={2}
                  value={bookData.author_info}
                  onChange={(e) => handleInputChange('author_info', e.target.value)}
                  placeholder="Brief information about the author or source of this book..."
                />
              </Grid>
            </Grid>

            <Card sx={{ mt: 3, bgcolor: 'primary.light' }}>
              <CardContent>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  Earnings Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Sale Price</Typography>
                    <Typography variant="h6">₦{bookData.price ? parseFloat(bookData.price).toLocaleString() : '0'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Your Earnings (70%)</Typography>
                    <Typography variant="h6" color="success.main">
                      ₦{bookData.price ? (parseFloat(bookData.price) * 0.7).toLocaleString() : '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Platform Fee (30%)</Typography>
                    <Typography variant="h6">₦{bookData.price ? (parseFloat(bookData.price) * 0.3).toLocaleString() : '0'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Review & Submit
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Review your book details before submitting for approval
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                      File Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">File Name:</Typography>
                        <Typography variant="body1">{filePreview?.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">File Size:</Typography>
                        <Typography variant="body1">{filePreview?.size}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">File Type:</Typography>
                        <Typography variant="body1">{filePreview?.type}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Book Details
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Title:</Typography>
                        <Typography variant="body1">{bookData.title}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category:</Typography>
                        <Typography variant="body1">{bookData.category}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Subject:</Typography>
                        <Typography variant="body1">{bookData.subject_area}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Level:</Typography>
                        <Typography variant="body1">{bookData.education_level}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Pricing Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Sale Price:</Typography>
                        <Typography variant="h6">₦{parseFloat(bookData.price).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Your Earnings:</Typography>
                        <Typography variant="h6" color="success.main">₦{(parseFloat(bookData.price) * 0.7).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Platform Fee:</Typography>
                        <Typography variant="h6">₦{(parseFloat(bookData.price) * 0.3).toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Review Process:</strong> Your book will be reviewed by our team within 2-3 business days. 
                You'll be notified via email once the review is complete. Books must comply with our content guidelines 
                to be approved for sale.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          
          <Button
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            variant="contained"
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : activeStep === steps.length - 1
              ? 'Submit for Review'
              : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default UploadBook;