import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import useApi from '../hooks/useApi';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const { callApi } = useApi();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callApi('GET', '/categories');
        // Backend returns { success: true, data: [...] }
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array on error
      }
    };
    fetchCategories();
  }, [callApi]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Categories
      </Typography>
      <List>
        {Array.isArray(categories) && categories.map((category) => (
          <ListItem key={category.id} component={Link} to={`/categories/${category.id}`}>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default CategoryList;