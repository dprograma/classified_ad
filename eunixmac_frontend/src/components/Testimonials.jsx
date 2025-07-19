import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';

const testimonials = [
  {
    name: 'Tunde O.',
    avatar: 'T',
    testimonial: 'I sold my old laptop within 24 hours of posting it on this platform. Highly recommended!',
    color: '#6C47FF',
    featured: true,
  },
  {
    name: 'Chioma E.',
    avatar: 'C',
    testimonial: 'A great place to find amazing deals. I bought a used car at a very good price.',
    color: '#00C6AE',
    featured: false,
  },
  {
    name: 'Musa A.',
    avatar: 'M',
    testimonial: 'The interface is so easy to use, and I love the fact that I can chat with sellers directly.',
    color: '#FFBF00',
    featured: false,
  },
];

const Testimonials = () => {
  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
        What Our Users Say
      </Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 4, pb: 2, justifyContent: 'center' }}>
        {testimonials.map((testimonial, idx) => (
          <Paper
            key={testimonial.name}
            sx={{
              minWidth: testimonial.featured ? 340 : 260,
              maxWidth: testimonial.featured ? 360 : 280,
              flex: '0 0 auto',
              p: testimonial.featured ? 5 : 4,
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: testimonial.featured ? '0 4px 24px rgba(108,71,255,0.13)' : '0 2px 12px rgba(108,71,255,0.07)',
              background: idx % 2 === 0 ? '#fff' : 'rgba(108,71,255,0.04)',
              border: testimonial.featured ? '2.5px solid #6C47FF' : 'none',
              position: 'relative',
              transition: 'box-shadow 0.2s, border 0.2s',
            }}
          >
            <Avatar sx={{
              bgcolor: testimonial.color,
              width: testimonial.featured ? 72 : 56,
              height: testimonial.featured ? 72 : 56,
              mx: 'auto',
              mb: 2,
              fontSize: testimonial.featured ? 36 : 28,
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 2px 8px rgba(108,71,255,0.10)',
            }}>
              {testimonial.avatar}
            </Avatar>
            <Typography variant={testimonial.featured ? 'h5' : 'h6'} sx={{ mt: 1, fontWeight: 700 }}>
              {testimonial.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: testimonial.featured ? '1.15rem' : '1rem' }}>
              {testimonial.testimonial}
            </Typography>
            {testimonial.featured && (
              <Box sx={{ position: 'absolute', top: 16, right: 16, color: '#6C47FF', fontWeight: 700, fontSize: 18 }}>
                ★
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Testimonials;
