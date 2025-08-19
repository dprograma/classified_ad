import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import useApi from '../hooks/useApi';

function BecomeAgent() {
  const { callApi, loading } = useApi();
  
  const handleBecomeAgent = async () => {
    try {
      await callApi('POST', '/user/become-agent');
      alert('You are now an agent!');
      // Optionally, refresh user data or redirect
    } catch (error) {
      console.error('Error becoming agent:', error);
      // Error message is already handled by useApi hook
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Become an Agent</Typography>
      <Typography variant="body1" paragraph>
        Sell educational materials on our platform. Click the button below to become an agent.
      </Typography>
      <Button variant="contained" onClick={handleBecomeAgent} disabled={loading}>
        {loading ? 'Processing...' : 'Become Agent'}
      </Button>
    </Box>
  );
}

export default BecomeAgent;