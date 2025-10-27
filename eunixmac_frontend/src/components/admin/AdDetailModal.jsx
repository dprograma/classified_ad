import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Paper, Grid, Chip
} from '@mui/material';

const AdDetailModal = ({ ad, open, onClose }) => {
  console.log(ad);
  if (!ad) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Ad Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{ad.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>{ad.category.name}</Typography>
            <Typography variant="h6" color="primary.main" sx={{ my: 2 }}>{ad.formatted_price}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{ad.description}</Typography>
            <Chip label={`Location: ${ad.location}`} sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            {ad.images && ad.images.length > 0 ? (
              <Paper elevation={0} sx={{ p: 1, border: '1px solid #eee' }}>
                <img 
                  src={ad.preview_image || 'https://via.placeholder.com/300'} 
                  alt={ad.title} 
                  style={{ width: '100%', height: 'auto', borderRadius: '4px' }} 
                />
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <Typography color="text.secondary">No Image</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
        {ad.customFields && ad.customFields.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Additional Details</Typography>
            <Grid container spacing={2}>
              {ad.customFields.map(field => (
                <Grid item xs={12} sm={6} key={field.id}>
                  <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee' }}>
                    <Typography variant="subtitle2" color="text.secondary">{field.field_name}</Typography>
                    <Typography variant="body1">{field.field_value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdDetailModal;
