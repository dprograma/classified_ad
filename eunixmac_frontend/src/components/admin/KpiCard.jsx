import React from 'react';
import { Card, Typography } from '@mui/material';
import Skeleton from '../ui/Skeleton';

const KpiCard = ({ title, value, change, loading }) => {
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
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 'auto' }}>{change}</Typography>
    </Card>
  );
};

export default KpiCard;