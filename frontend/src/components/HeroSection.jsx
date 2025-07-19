import React from 'react';
import { Box, Typography, Button, Container, InputBase, IconButton, Paper, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Search as SearchIcon } from '@mui/icons-material';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(120deg, #6C47FF 0%, #00C6AE 100%)',
  backgroundSize: '200% 200%',
  animation: `${gradientMove} 8s ease-in-out infinite`,
  textAlign: 'center',
  padding: theme.spacing(14, 0, 12, 0),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
}));

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 520,
  margin: '40px auto 0',
  borderRadius: 32,
  boxShadow: '0 4px 24px rgba(108,71,255,0.10)',
  padding: '6px 16px',
  background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(10px)',
}));

const FloatingShapes = styled('svg')({
  position: 'absolute',
  top: '-60px',
  right: '-80px',
  width: 320,
  height: 220,
  opacity: 0.18,
  zIndex: 1,
  pointerEvents: 'none',
});

const IconCluster = styled('svg')({
  position: 'absolute',
  left: '-60px',
  bottom: '-40px',
  width: 180,
  height: 120,
  opacity: 0.13,
  zIndex: 1,
  pointerEvents: 'none',
});

function HeroSection() {
  const theme = useTheme();
  return (
    <HeroContainer>
      {/* Layered SVG shapes for depth */}
      <FloatingShapes viewBox="0 0 320 220" fill="none">
        <ellipse cx="160" cy="110" rx="160" ry="110" fill="#fff" />
      </FloatingShapes>
      <IconCluster viewBox="0 0 180 120" fill="none">
        <circle cx="40" cy="60" r="40" fill="#00C6AE" />
        <rect x="90" y="30" width="60" height="60" rx="18" fill="#6C47FF" />
      </IconCluster>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 900, color: '#fff', mb: 2, letterSpacing: '-0.04em', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
          Discover, Buy & Sell Anything in Nigeria
        </Typography>
        <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.96)', mb: 5, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
          Your trusted classifieds marketplace for everything you need.
        </Typography>
        <GlassSearchBar elevation={3}>
          <InputBase
            placeholder="What are you looking for?"
            sx={{ ml: 2, flex: 1, fontSize: '1.1rem', color: theme.palette.text.primary }}
          />
          <IconButton type="submit" sx={{ p: '10px', color: 'primary.main' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </GlassSearchBar>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 5, px: 5, py: 1.7, fontWeight: 700, fontSize: '1.25rem', borderRadius: 8, boxShadow: 2, letterSpacing: '0.01em', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'scale(1.06)', boxShadow: 4 } }}
        >
          Get Started
        </Button>
      </Container>
    </HeroContainer>
  );
}

export default HeroSection;
