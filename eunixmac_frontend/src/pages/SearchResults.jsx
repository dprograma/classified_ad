import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import EnhancedAdList from '../components/EnhancedAdList';

function SearchResults() {
  const location = useLocation();
  const [initialParams, setInitialParams] = useState({});

  useEffect(() => {
    // Parse URL parameters and set as initial search params
    const searchParams = new URLSearchParams(location.search);
    const params = {};
    
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    
    setInitialParams(params);
  }, [location.search]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Find What You're Looking For
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Browse thousands of ads with our advanced search and filtering system
        </Typography>
      </Box>

      <EnhancedAdList initialSearchParams={initialParams} />
    </Container>
  );
}

export default SearchResults;