import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Input } from '@mui/material';
import axios from 'axios';

function UploadEducationalMaterial() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    if (file) formData.append('file', file);
    if (previewImage) formData.append('preview_image', previewImage);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to upload educational material.');
        return;
      }
      await axios.post('http://localhost:8000/api/educational-materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Educational material uploaded successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error uploading educational material:', error);
      alert('Failed to upload educational material.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Upload Educational Material
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Typography variant="body1" sx={{ mt: 2 }}>Upload File (PDF, DOC, TXT)</Typography>
          <Input
            type="file"
            inputProps={{ accept: '.pdf,.doc,.docx,.txt' }}
            onChange={(e) => setFile(e.target.files[0])}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="body1" sx={{ mt: 2 }}>Upload Preview Image</Typography>
          <Input
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={(e) => setPreviewImage(e.target.files[0])}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Upload Material
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default UploadEducationalMaterial;