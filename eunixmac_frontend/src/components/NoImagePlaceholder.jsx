import React from 'react';
import { Box, Typography } from '@mui/material';
import { ImageNotSupported } from '@mui/icons-material';

/**
 * NoImagePlaceholder
 * Renders a styled "No Image" box as a drop-in replacement for missing
 * ad images or book cover images. Works both as a <CardMedia> substitute
 * (fixed height) and as an inline element.
 *
 * Props:
 *   height  – number | string  – CSS height (default: 200)
 *   label   – string           – caption shown below the icon (default: 'No Image')
 *   fontSize– number           – icon font size in px (default: 48)
 */
const NoImagePlaceholder = ({ height = 200, label = 'No Image', fontSize = 48 }) => (
  <Box
    sx={{
      height,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb',
      gap: 1,
      flexShrink: 0,
    }}
  >
    <ImageNotSupported sx={{ fontSize, color: '#9ca3af' }} />
    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
      {label}
    </Typography>
  </Box>
);

export default NoImagePlaceholder;
