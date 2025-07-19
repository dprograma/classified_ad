import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

function PostAd() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (event) => {
    setImages(Array.from(event.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('location', location);
    formData.append('category_id', categoryId);
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to post an ad.');
        return;
      }
      await axios.post('http://localhost:8000/api/ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Ad posted successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setLocation('');
      setCategoryId('');
      setImages([]);
    } catch (error) {
      console.error('Error posting ad:', error);
      alert('Failed to post ad.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Post a New Ad
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Ad Title"
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
          <TextField
            margin="normal"
            required
            fullWidth
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body1" sx={{ mt: 2 }}>Upload Images</Typography>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            style={{ marginBottom: '16px' }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Post Ad
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default PostAd;