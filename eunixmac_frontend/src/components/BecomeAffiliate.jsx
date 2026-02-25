import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

function BecomeAffiliate() {
  const { callApi, loading } = useApi();

  const handleBecomeAffiliate = async () => {
    try {
      const response = await callApi('POST', '/affiliate/enroll');
      if (response.data?.authorization_url) {
        // Redirect to Paystack payment page for ₦3,000 enrollment fee
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling as affiliate:', error);
      toast.error(error.message || 'Failed to initiate enrollment. Please try again.');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Become an Affiliate</Typography>
      <Typography variant="body1" paragraph>
        Join our affiliate program for a one-time fee of ₦3,000. Earn ₦1,950 (65% commission) for every referral who joins the affiliate program.
      </Typography>
      <Button variant="contained" onClick={handleBecomeAffiliate} disabled={loading}>
        {loading ? 'Processing...' : 'Pay ₦3,000 & Join Affiliate Program'}
      </Button>
    </Box>
  );
}

export default BecomeAffiliate;
