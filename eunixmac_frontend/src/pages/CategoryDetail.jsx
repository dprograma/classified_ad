import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

function CategoryDetail() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories/${id}`);
        setCategory(response.data);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };
    fetchCategory();
  }, [id]);

  if (!category) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        {category.name}
      </Typography>
      {category.children && category.children.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Subcategories
          </Typography>
          <List>
            {category.children.map((child) => (
              <ListItem key={child.id} component={Link} to={`/categories/${child.id}`}>
                <ListItemText primary={child.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {/* TODO: Display ads belonging to this category */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Ads in this Category
      </Typography>
      <Typography>Coming Soon...</Typography>
    </Box>
  );
}

export default CategoryDetail;