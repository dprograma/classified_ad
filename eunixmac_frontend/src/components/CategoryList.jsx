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
        const data = await callApi('GET', '/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Error handling is done by useApi hook
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
        {categories.map((category) => (
          <ListItem key={category.id} component={Link} to={`/categories/${category.id}`}>
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default CategoryList;