import React, { useState } from 'react';
import { Button, Typography, Box, TextField } from '@mui/material';
import useApi from '../hooks/useApi';

function BecomeAffiliate() {
  const [referralLink, setReferralLink] = useState('');
  const { callApi, loading } = useApi();

  const handleBecomeAffiliate = async () => {
    try {
      const response = await callApi('POST', '/user/become-affiliate');
      setReferralLink(response.referral_link);
      alert('You are now an affiliate!');
    } catch (error) {
      console.error('Error becoming affiliate:', error);
      // Error message is already handled by useApi hook
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>Become an Affiliate</Typography>
      <Typography variant="body1" paragraph>
        Earn commission by promoting our platform. Click the button below to become an affiliate.
      </Typography>
      <Button variant="contained" onClick={handleBecomeAffiliate} disabled={loading}>
        {loading ? 'Processing...' : 'Become Affiliate'}
      </Button>
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