import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Illustration = () => (
  <Box sx={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {/* Placeholder SVG illustration */}
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="80" fill="#00C6AE" fillOpacity="0.12" />
      <rect x="40" y="60" width="80" height="40" rx="12" fill="#6C47FF" fillOpacity="0.18" />
      <rect x="60" y="80" width="40" height="20" rx="6" fill="#6C47FF" fillOpacity="0.32" />
    </svg>
  </Box>
);

const CallToAction = () => {
  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(120deg, #6C47FF 0%, #00C6AE 100%)',
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(108,71,255,0.10)',
        mt: 6,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container alignItems="center" spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 800 }}>
              Ready to get started?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, color: 'rgba(255,255,255,0.92)' }}>
              Join thousands of users who are buying and selling on our platform.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/register"
              sx={{ px: 5, py: 1.5, fontWeight: 700, fontSize: '1.2rem', borderRadius: 8, boxShadow: 2 }}
            >
              Create a Free Account
            </Button>
          </Grid>
          <Grid item xs={12} md={5}>
            <Illustration />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallToAction;
