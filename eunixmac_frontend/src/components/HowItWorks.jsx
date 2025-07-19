import React from 'react';
import { Box, Typography, Grid, Paper, Avatar } from '@mui/material';
import { HowToReg, PostAdd, MonetizationOn } from '@mui/icons-material';

const steps = [
  {
    icon: <HowToReg sx={{ fontSize: 32 }} />,
    title: 'Create an Account',
    description: 'Sign up for a free account in just a few minutes.',
    color: '#6C47FF',
  },
  {
    icon: <PostAdd sx={{ fontSize: 32 }} />,
    title: 'Post Your Ad',
    description: 'Create a detailed and attractive ad for your product or service.',
    color: '#00C6AE',
  },
  {
    icon: <MonetizationOn sx={{ fontSize: 32 }} />,
    title: 'Start Selling',
    description: 'Connect with buyers and start making money.',
    color: '#FFBF00',
  },
];

const HowItWorks = () => {
  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        How It Works
      </Typography>
      <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto', py: 4 }}>
        {/* Vertical line */}
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: '#E5E7EB',
          zIndex: 0,
          transform: 'translateX(-50%)',
        }} />
        <Grid container direction="column" spacing={6} sx={{ position: 'relative', zIndex: 1 }}>
          {steps.map((step, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <Grid item key={step.title}>
                <Box sx={{ display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', alignItems: 'center', position: 'relative' }}>
                  <Box sx={{ width: '50%', pr: isLeft ? 4 : 0, pl: isLeft ? 0 : 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 2px 12px rgba(108,71,255,0.07)', background: '#fff', textAlign: isLeft ? 'right' : 'left', position: 'relative' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {step.description}
                      </Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', zIndex: 2 }}>
                    <Avatar sx={{
                      bgcolor: step.color,
                      width: 56,
                      height: 56,
                      boxShadow: '0 2px 8px rgba(108,71,255,0.10)',
                      border: '4px solid #fff',
                    }}>
                      {step.icon}
                    </Avatar>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default HowItWorks;
