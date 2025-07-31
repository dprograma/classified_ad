import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import Skeleton from '../ui/Skeleton';

const KpiCard = ({ title, value, change, loading, icon: Icon }) => {
  if (loading) {
    return (
      <Card sx={{ display: 'flex', flexDirection: 'column', height: 144, p: 2, borderRadius: '12px', boxShadow: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
        <Skeleton variant="text" width="75%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mt: 'auto' }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 144,
        p: 2,
        borderRadius: '12px',
        boxShadow: 3,
        bgcolor: 'background.paper',
        color: 'text.primary',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {Icon && <Icon size={20} style={{ marginRight: '8px', color: '#42a5f5' }} />}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{title}</Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 'auto' }}>{change}</Typography>
    </Card>
  );
};

export default KpiCard;