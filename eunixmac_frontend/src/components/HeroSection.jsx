import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, InputBase, IconButton, Paper, useTheme, Fade, Chip, Stack } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Search as SearchIcon, TrendingUp, Shield, Speed, Add } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const HeroContainer = styled(Box)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(59, 130, 246, 0.95) 0%, 
      rgba(139, 92, 246, 0.9) 35%,
      rgba(16, 185, 129, 0.85) 70%,
      rgba(59, 130, 246, 0.95) 100%
    ),
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>')
  `,
  backgroundSize: '400% 400%, 100px 100px',
  animation: `${gradientMove} 15s ease-in-out infinite`,
  textAlign: 'center',
  padding: theme.spacing(8, 0, 6, 0),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10, 0, 8, 0),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(14, 0, 12, 0),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(18, 0, 16, 0),
  },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: {
    xs: '100vh',
    sm: '100vh',
    md: '100vh',
    lg: '100vh'
  },
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '600px',
  margin: '32px auto 0',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  padding: '6px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
    animation: `${shimmerAnimation} 3s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15)',
  },
  '&:focus-within': {
    transform: 'translateY(-4px)',
    boxShadow: '0 30px 80px rgba(59, 130, 246, 0.2)',
    background: 'rgba(255, 255, 255, 0.98)',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    margin: '24px auto 0',
    borderRadius: '16px',
  },
}));

const FloatingOrb = styled('div')(({ theme, delay = 0, size = 120, top = '10%', left = '10%', color = 'rgba(255,255,255,0.1)' }) => ({
  position: 'absolute',
  top,
  left,
  width: size,
  height: size,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
  animation: `${floatAnimation} ${8 + delay}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  pointerEvents: 'none',
  filter: 'blur(1px)',
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'white',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  fontWeight: 500,
  fontSize: '0.875rem',
  height: '36px',
  '& .MuiChip-icon': {
    color: 'white',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.primary.main,
  border: 'none',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeInUp} 1s ease 0.8s both`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    background: 'rgba(255, 255, 255, 1)',
    '&::before': {
      left: '100%',
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: '14px 28px',
    fontSize: '1rem',
  },
}));

function HeroSection() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePostAdClick = () => {
    if (isAuthenticated) {
      navigate('/post-ad');
    } else {
      navigate('/login?redirect=/post-ad');
    }
  };

  return (
    <HeroContainer>
      {/* Floating Background Orbs */}
      <FloatingOrb delay={0} size={180} top="10%" left="5%" color="rgba(59, 130, 246, 0.1)" />
      <FloatingOrb delay={2} size={120} top="20%" right="8%" color="rgba(139, 92, 246, 0.1)" />
      <FloatingOrb delay={4} size={150} bottom="15%" left="10%" color="rgba(16, 185, 129, 0.1)" />
      <FloatingOrb delay={1} size={100} top="60%" right="15%" color="rgba(255, 255, 255, 0.05)" />

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        <Fade in={mounted} timeout={1000}>
          <Box>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#fff',
                marginBottom: 3,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${fadeInUp} 1s ease 0.2s both`,
                maxWidth: '900px',
                margin: '0 auto',
              }}
            >
              Discover Amazing Deals Across Nigeria
            </Typography>

            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)', 
                marginBottom: 4,
                fontWeight: 400,
                lineHeight: 1.5,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '600px',
                margin: '0 auto 32px',
                animation: `${fadeInUp} 1s ease 0.4s both`,
                [theme.breakpoints.down('sm')]: {
                  fontSize: '1.2rem',
                  marginBottom: 3,
                },
              }}
            >
              Your trusted marketplace for buying and selling everything from electronics to real estate
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center" 
              sx={{ 
                marginBottom: 4,
                animation: `${fadeInUp} 1s ease 0.6s both`,
              }}
            >
              <FeatureChip icon={<Shield />} label="Secure Transactions" />
              <FeatureChip icon={<Speed />} label="Instant Messaging" />
              <FeatureChip icon={<TrendingUp />} label="Best Prices" />
            </Stack>
          </Box>
        </Fade>

        <Fade in={mounted} timeout={1500}>
          <GlassSearchBar 
            elevation={0}
            role="search"
            aria-label="Search for products"
          >
            <InputBase
              placeholder="What are you looking for today?"
              aria-label="Search input"
              sx={{ 
                marginLeft: 2,
                flex: 1, 
                fontSize: '1.1rem',
                color: theme.palette.text.primary,
                fontWeight: 500,
                '&::placeholder': {
                  color: 'rgba(0,0,0,0.6)',
                  opacity: 1,
                },
                [theme.breakpoints.down('sm')]: {
                  fontSize: '1rem',
                  marginLeft: 1.5,
                },
              }}
            />
            <IconButton 
              type="submit" 
              sx={{ 
                padding: '12px',
                margin: '6px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: 'white',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  transform: 'scale(1.05)',
                },
                [theme.breakpoints.down('sm')]: {
                  padding: '10px',
                  margin: '4px',
                },
              }} 
              aria-label="Search button"
            >
              <SearchIcon />
            </IconButton>
          </GlassSearchBar>
        </Fade>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ marginTop: 4 }}
        >
          <AnimatedButton
            variant="contained"
            size="large"
            onClick={handlePostAdClick}
            startIcon={<Add />}
            aria-label="Post your ad to start selling"
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Post Your Ad
          </AnimatedButton>
          
          <AnimatedButton
            variant="outlined"
            size="large"
            component={Link}
            to="/categories"
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            Browse Categories
          </AnimatedButton>
        </Stack>

        <Box sx={{ 
          marginTop: 6,
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9rem',
          animation: `${fadeInUp} 1s ease 1s both`,
        }}>
          <Typography variant="body2">
            Join thousands of satisfied users across Nigeria
          </Typography>
        </Box>
      </Container>
    </HeroContainer>
  );
}

export default HeroSection;
