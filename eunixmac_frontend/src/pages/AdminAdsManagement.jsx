import React from 'react';
import { Box, Typography } from '@mui/material';
import AdApproval from '../components/admin/AdApproval';

function AdminAdsManagement() {
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Ads Management
      </Typography>
      <AdApproval />
    </Box>
  );
}

export default AdminAdsManagement;
