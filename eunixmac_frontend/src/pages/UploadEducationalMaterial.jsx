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

const steps = ['Upload File', 'Material Details', 'Pricing & Settings', 'Review & Submit'];

const materialCategories = [
  'Past Questions',
  'Textbooks',
  'Research Papers',
  'Study Guides',
  'Presentations',
  'Worksheets',
  'Other Educational Material'
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

function UploadEducationalMaterial() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  
  const [materialData, setMaterialData] = useState({
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
    setMaterialData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (activeStep === 1) {
      if (!materialData.title || !materialData.description || !materialData.category) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    if (activeStep === 2) {
      if (!materialData.price || parseFloat(materialData.price) <= 0) {
        toast.error('Please set a valid price');
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Add all material data
      Object.keys(materialData).forEach(key => {
        formData.append(key, materialData[key]);
      });

      const response = await callApi('POST', '/educational-materials', formData, {
        'Content-Type': 'multipart/form-data'
      });

      toast.success('Educational material uploaded successfully! It will be reviewed before being published.');
      navigate('/dashboard?tab=educational-materials');
    } catch (error) {
      toast.error(error.message || 'Failed to upload material. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Upload Your Educational Material
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
              Material Details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Provide detailed information about your educational material
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Material Title *"
                  fullWidth
                  value={materialData.title}
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
                  value={materialData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of the material, what it covers, and who it's for..."
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={materialData.category}
                    label="Category *"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {materialCategories.map((category) => (
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
                    value={materialData.subject_area}
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
                    value={materialData.education_level}
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
                  value={materialData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., mathematics, algebra, geometry, exam prep"
                  helperText="Add relevant tags to help users find your material"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Year Published"
                  type="number"
                  fullWidth
                  value={materialData.year_published}
                  onChange={(e) => handleInputChange('year_published', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Preview Text"
                  fullWidth
                  multiline
                  rows={3}
                  value={materialData.preview_text}
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
              Set your pricing and additional settings for the material
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price (₦) *"
                  type="number"
                  fullWidth
                  value={materialData.price}
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
                    value={materialData.language}
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
                  value={materialData.author_info}
                  onChange={(e) => handleInputChange('author_info', e.target.value)}
                  placeholder="Brief information about the author or source of this material..."
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
                    <Typography variant="h6">₦{materialData.price ? parseFloat(materialData.price).toLocaleString() : '0'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Your Earnings (70%)</Typography>
                    <Typography variant="h6" color="success.main">
                      ₦{materialData.price ? (parseFloat(materialData.price) * 0.7).toLocaleString() : '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Platform Fee (30%)</Typography>
                    <Typography variant="h6">₦{materialData.price ? (parseFloat(materialData.price) * 0.3).toLocaleString() : '0'}</Typography>
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
              Review your material details before submitting for approval
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
                      Material Details
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Title:</Typography>
                        <Typography variant="body1">{materialData.title}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category:</Typography>
                        <Typography variant="body1">{materialData.category}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Subject:</Typography>
                        <Typography variant="body1">{materialData.subject_area}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Level:</Typography>
                        <Typography variant="body1">{materialData.education_level}</Typography>
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
                        <Typography variant="h6">₦{parseFloat(materialData.price).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Your Earnings:</Typography>
                        <Typography variant="h6" color="success.main">₦{(parseFloat(materialData.price) * 0.7).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Platform Fee:</Typography>
                        <Typography variant="h6">₦{(parseFloat(materialData.price) * 0.3).toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Review Process:</strong> Your material will be reviewed by our team within 2-3 business days. 
                You'll be notified via email once the review is complete. Materials must comply with our content guidelines 
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Uploading...' : activeStep === steps.length - 1 ? 'Submit for Review' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default UploadEducationalMaterial;