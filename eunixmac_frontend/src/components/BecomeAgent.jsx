import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function BecomeAgent() {
  const { callApi, loading } = useApi();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleBecomeAgent = async () => {
    try {
      const response = await callApi('POST', '/user/become-agent');

      // Update user in context with the returned user data
      if (response.user) {
        updateUser(response.user);
      }

      toast.success('Congratulations! You are now an agent. You can start uploading educational materials.');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error becoming agent:', error);

      // Handle "already an agent" case gracefully
      if (error.message && error.message.includes('already an agent')) {
        toast.info('You are already an agent!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error(error.message || 'Failed to become an agent. Please try again.');
      }
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