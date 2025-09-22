import React from 'react';
import { Card, Typography, Box } from '@mui/material';

const StatCard = ({
  icon: Icon,
  value,
  label,
  color = 'primary.main',
  bgColor,
  onClick,
  loading = false,
  variant = 'standard'
}) => {
  const getCardStyling = () => {
    const baseStyling = {
      textAlign: 'center',
      p: { xs: 1.5, sm: 2, md: 2.5 },
      height: { xs: 140, sm: 150, md: 160 },
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        transform: 'translateY(-2px)',
        boxShadow: (theme) => theme.shadows[4],
      } : {}
    };

    if (bgColor) {
      baseStyling.backgroundColor = bgColor;
      baseStyling.border = `1px solid ${bgColor}`;
    }

    return baseStyling;
  };

  const getIconStyling = () => ({
    fontSize: { xs: 36, sm: 40, md: 44 },
    color: color,
    mb: { xs: 1.5, md: 2 },
    flexShrink: 0
  });

  const getValueStyling = () => ({
    variant: { xs: 'h5', sm: 'h4', md: 'h4' },
    fontWeight: 'bold',
    sx: {
      mb: 0.5,
      fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
      lineHeight: 1.1,
      color: bgColor ? 'inherit' : 'text.primary',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      textAlign: 'center'
    }
  });

  const getLabelStyling = () => ({
    variant: 'body2',
    color: bgColor ? 'inherit' : 'text.secondary',
    sx: {
      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
      fontWeight: 500,
      lineHeight: 1.2,
      textAlign: 'center',
      wordWrap: 'break-word',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      px: 0.5,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }
  });

  if (loading) {
    return (
      <Card sx={getCardStyling()}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40, md: 44 },
              height: { xs: 36, sm: 40, md: 44 },
              borderRadius: '50%',
              backgroundColor: 'grey.200',
              mb: { xs: 1.5, md: 2 },
              flexShrink: 0
            }}
          />
          <Box
            sx={{
              width: '60px',
              height: '24px',
              borderRadius: 1,
              backgroundColor: 'grey.200',
              mb: 0.5
            }}
          />
          <Box
            sx={{
              width: '80px',
              height: '16px',
              borderRadius: 1,
              backgroundColor: 'grey.100'
            }}
          />
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={getCardStyling()} onClick={onClick}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        justifyContent: 'center'
      }}>
        {Icon && <Icon sx={getIconStyling()} />}
        <Typography {...getValueStyling()}>
          {value !== undefined ? value : '—'}
        </Typography>
        <Typography {...getLabelStyling()}>
          {label}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;