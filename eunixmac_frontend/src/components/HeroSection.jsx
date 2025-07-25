import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, InputBase, IconButton, Paper, useTheme } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { Search as SearchIcon } from '@mui/icons-material';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 50%, #6C47FF 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientMove} 12s ease-in-out infinite`,
  textAlign: 'center',
  padding: theme.spacing(6, 0, 4, 0),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(8, 0, 6, 0),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(12, 0, 10, 0),
  },
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(16, 0, 14, 0),
  },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: {
    xs: '70vh',
    sm: '75vh',
    md: '80vh',
    lg: '85vh'
  },
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
}));

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: {
    xs: '90%',
    sm: '480px',
    md: '520px',
    lg: '560px'
  },
  margin: {
    xs: '24px auto 0',
    sm: '32px auto 0',
    md: '40px auto 0'
  },
  borderRadius: {
    xs: '24px',
    sm: '28px',
    md: '32px'
  },
  boxShadow: '0 8px 32px rgba(108,71,255,0.15)',
  padding: {
    xs: '8px 16px',
    sm: '10px 18px',
    md: '12px 20px'
  },
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(108,71,255,0.2)',
  },
  '&:focus-within': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(108,71,255,0.25)',
    background: 'rgba(255,255,255,0.98)',
  }
}));

const FloatingShape = styled('div')(({ theme, delay = 0, size = 80, top = '10%', left = '10%' }) => ({
  position: 'absolute',
  top,
  left,
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  animation: `${floatAnimation} ${6 + delay}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  pointerEvents: 'none',
}));

const GeometricShape = styled('div')(({ theme, shape = 'circle', size = 60, top = '20%', right = '15%', delay = 0 }) => ({
  position: 'absolute',
  top,
  right,
  width: size,
  height: size,
  background: 'rgba(0,198,174,0.15)',
  borderRadius: shape === 'circle' ? '50%' : '20%',
  animation: `${pulseAnimation} ${4 + delay}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  zIndex: 1,
  pointerEvents: 'none',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: {
    xs: theme.spacing(3),
    sm: theme.spacing(4),
    md: theme.spacing(5)
  },
  padding: {
    xs: theme.spacing(1.5, 4),
    sm: theme.spacing(1.8, 5),
    md: theme.spacing(2, 6),
    lg: theme.spacing(2.2, 7)
  },
  fontSize: {
    xs: '1rem',
    sm: '1.1rem',
    md: '1.25rem',
    lg: '1.3rem'
  },
  fontWeight: 700,
  borderRadius: {
    xs: '12px',
    sm: '14px',
    md: '16px'
  },
  boxShadow: '0 4px 20px rgba(0,198,174,0.3)',
  letterSpacing: '0.02em',
  textTransform: 'none',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 8px 30px rgba(0,198,174,0.4)',
    '&::before': {
      left: '100%',
    }
  },
  '&:active': {
    transform: 'translateY(-1px) scale(1.02)',
  }
}));

function HeroSection() {
  const theme = useTheme();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsiveTitleSize = (width) => {
    if (width < 480) return 'clamp(1.8rem, 8vw, 2.2rem)';
    if (width < 768) return 'clamp(2.2rem, 7vw, 2.8rem)';
    if (width < 1024) return 'clamp(2.8rem, 6vw, 3.5rem)';
    return 'clamp(3.5rem, 5vw, 4rem)';
  };

  const getResponsiveSubtitleSize = (width) => {
    if (width < 480) return 'clamp(0.9rem, 4vw, 1.1rem)';
    if (width < 768) return 'clamp(1.1rem, 3.5vw, 1.3rem)';
    if (width < 1024) return 'clamp(1.3rem, 3vw, 1.5rem)';
    return 'clamp(1.5rem, 2.5vw, 1.7rem)';
  };

  return (
    <HeroContainer>
      {/* Animated Background Shapes */}
      <FloatingShape delay={0} size={120} top="8%" left="5%" />
      <FloatingShape delay={2} size={80} top="15%" right="8%" />
      <FloatingShape delay={4} size={100} bottom="12%" left="10%" />
      
      <GeometricShape shape="square" delay={1} size={70} top="25%" right="12%" />
      <GeometricShape shape="circle" delay={3} size={90} bottom="20%" right="15%" />
      <GeometricShape shape="square" delay={5} size={60} top="35%" left="8%" />

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          padding: {
            xs: theme.spacing(0, 2),
            sm: theme.spacing(0, 3),
            md: theme.spacing(0, 4)
          }
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontWeight: 900, 
            color: '#fff', 
            marginBottom: {
              xs: '16px',
              sm: '20px',
              md: '24px',
              lg: '28px'
            },
            letterSpacing: '-0.02em',
            fontSize: getResponsiveTitleSize(windowWidth),
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${pulseAnimation} 3s ease-in-out infinite`,
          }}
        >
          Discover, Buy & Sell Anything in Nigeria
        </Typography>

        <Typography 
          variant="h5" 
          sx={{ 
            color: 'rgba(255,255,255,0.95)', 
            marginBottom: {
              xs: '20px',
              sm: '24px',
              md: '32px',
              lg: '40px'
            },
            fontWeight: 400,
            fontSize: getResponsiveSubtitleSize(windowWidth),
            lineHeight: 1.4,
            textShadow: '0 1px 10px rgba(0,0,0,0.1)',
            maxWidth: {
              xs: '100%',
              sm: '90%',
              md: '80%',
              lg: '70%'
            },
            margin: '0 auto',
          }}
        >
          Your trusted classifieds marketplace for everything you need. Connect with buyers and sellers across Nigeria.
        </Typography>

        <GlassSearchBar 
          elevation={0}
          role="search"
          aria-label="Search for products"
        >
          <InputBase
            placeholder="What are you looking for?"
            aria-label="Search input"
            sx={{ 
              marginLeft: {
                xs: theme.spacing(1),
                sm: theme.spacing(1.5),
                md: theme.spacing(2)
              },
              flex: 1, 
              fontSize: {
                xs: '0.95rem',
                sm: '1rem',
                md: '1.1rem',
                lg: '1.15rem'
              },
              color: theme.palette.text.primary,
              fontWeight: 500,
              '&::placeholder': {
                color: 'rgba(0,0,0,0.6)',
                opacity: 1,
              }
            }}
          />
          <IconButton 
            type="submit" 
            sx={{ 
              padding: {
                xs: '10px',
                sm: '12px',
                md: '14px'
              },
              color: 'primary.main',
              backgroundColor: 'rgba(108,71,255,0.1)',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(108,71,255,0.2)',
                transform: 'scale(1.1)',
              }
            }} 
            aria-label="Search button"
          >
            <SearchIcon sx={{ 
              fontSize: {
                xs: '20px',
                sm: '22px',
                md: '24px'
              }
            }} />
          </IconButton>
        </GlassSearchBar>

        <StyledButton
          variant="contained"
          color="secondary"
          size="large"
          aria-label="Get started with our platform"
        >
          Get Started Today
        </StyledButton>

        {/* Trust indicators */}
        <Box sx={{ 
          marginTop: {
            xs: theme.spacing(4),
            sm: theme.spacing(5),
            md: theme.spacing(6)
          },
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row'
          },
          alignItems: 'center',
          justifyContent: 'center',
          gap: {
            xs: theme.spacing(2),
            sm: theme.spacing(4),
            md: theme.spacing(6)
          },
          opacity: 0.9
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: {
              xs: '0.8rem',
              sm: '0.85rem',
              md: '0.9rem'
            },
            fontWeight: 500,
            textAlign: 'center'
          }}>
            🔒 Secure Transactions
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: {
              xs: '0.8rem',
              sm: '0.85rem',
              md: '0.9rem'
            },
            fontWeight: 500,
            textAlign: 'center'
          }}>
            ⚡ Instant Messaging
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: {
              xs: '0.8rem',
              sm: '0.85rem',
              md: '0.9rem'
            },
            fontWeight: 500,
            textAlign: 'center'
          }}>
            🌍 Nationwide Coverage
          </Typography>
        </Box>
      </Container>
    </HeroContainer>
  );
}

export default HeroSection;
