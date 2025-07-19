import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import axios from 'axios';

function BecomeAgent() {
  const handleBecomeAgent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to become an agent.');
        return;
      }
      // Assuming an API endpoint to update user role
      await axios.post('http://localhost:8000/api/user/become-agent', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('You are now an agent!');
      // Optionally, refresh user data or redirect
    } catch (error) {
      console.error('Error becoming agent:', error);
      alert('Failed to become an agent.');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Become an Agent</Typography>
      <Typography variant="body1" paragraph>
        Sell educational materials on our platform. Click the button below to become an agent.
      </Typography>
      <Button variant="contained" onClick={handleBecomeAgent}>Become Agent</Button>
    </Box>
  );
}

export default BecomeAgent;