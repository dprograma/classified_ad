import React, { useState } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import axios from 'axios';

function BecomeAffiliate() {
  const [referralLink, setReferralLink] = useState('');

  const handleBecomeAffiliate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to become an affiliate.');
        return;
      }
      const response = await axios.post('http://localhost:8000/api/user/become-affiliate', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReferralLink(response.data.referral_link);
      alert('You are now an affiliate!');
    } catch (error) {
      console.error('Error becoming affiliate:', error);
      alert('Failed to become an affiliate.');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Become an Affiliate</Typography>
      <Typography variant="body1" paragraph>
        Earn commission by promoting our platform. Click the button below to become an affiliate.
      </Typography>
      <Button variant="contained" onClick={handleBecomeAffiliate}>Become Affiliate</Button>
      {referralLink && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Your Referral Link:</Typography>
          <TextField
            fullWidth
            value={referralLink}
            InputProps={{ readOnly: true }}
            sx={{ mt: 1 }}
          />
        </Box>
      )}
    </Box>
  );
}

export default BecomeAffiliate;