import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward, TrendingUp, Security, Speed } from '@mui/icons-material';

const features = [
  {
    icon: <Security />,
    title: 'Secure Transactions',
    description: 'Your safety is our priority',
  },
  {
    icon: <Speed />,
    title: 'Quick & Easy',
    description: 'Post ads in minutes',
  },
  {
    icon: <TrendingUp />,
    title: 'Growing Community',
    description: '10,000+ active users',
  },
];

const FloatingElement = ({ children, delay = 0, duration = 6 }) => (
  <Box
    sx={{
      animation: `float ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      '@keyframes float': {
        '0%, 100%': {
          transform: 'translateY(0px) rotate(0deg)',
        },
        '50%': {
          transform: 'translateY(-20px) rotate(5deg)',
        },
      },
    }}
  >
    {children}
  </Box>
);

const CallToAction = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsivePadding = (width) => {
    if (width < 480) return { x: '16px', y: '40px' };
    if (width < 768) return { x: '24px', y: '48px' };
    if (width < 1024) return { x: '32px', y: '56px' };
    return { x: '40px', y: '64px' };
  };

  const padding = getResponsivePadding(windowWidth);
  const isMobile = windowWidth < 768;

  return (
    <Box
      component="section"
      aria-labelledby="cta-heading"
      sx={{
        position: 'relative',
        padding: {
          xs: `${padding.y} ${padding.x}`,
          sm: `${padding.y} ${padding.x}`,
          md: `${padding.y} ${padding.x}`,
          lg: `${padding.y} ${padding.x}`
        },
        background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 50%, #6C47FF 100%)',
        backgroundSize: '400% 400%',
        color: 'white',
        borderRadius: {
          xs: '20px',
          sm: '24px',
          md: '28px',
          lg: '32px'
        },
        boxShadow: '0 8px 40px rgba(108,71,255,0.25)',
        margin: {
          xs: '32px 0',
          sm: '40px 0',
          md: '48px 0',
          lg: '56px 0'
        },
        overflow: 'hidden',
        animation: 'gradientShift 8s ease-in-out infinite',
        '@keyframes gradientShift': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Background Elements */}
      <Box sx={{ position: 'absolute', top: '10%', right: '10%', opacity: 0.1, zIndex: 1 }}>
        <FloatingElement delay={0} duration={8}>
          <Box sx={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        </FloatingElement>
      </Box>
      
      <Box sx={{ position: 'absolute', bottom: '15%', left: '8%', opacity: 0.1, zIndex: 1 }}>
        <FloatingElement delay={2} duration={10}>
          <Box sx={{ width: '80px', height: '80px', borderRadius: '20%', background: 'rgba(255,255,255,0.2)' }} />
        </FloatingElement>
      </Box>

      <Box sx={{ position: 'absolute', top: '30%', left: '15%', opacity: 0.1, zIndex: 1 }}>
        <FloatingElement delay={4} duration={12}>
          <Box sx={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        </FloatingElement>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container alignItems="center" spacing={{ xs: 3, sm: 4, md: 6 }}>
          <Grid item xs={12} md={7}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                id="cta-heading"
                variant="h2" 
                component="h2" 
                sx={{ 
                  marginBottom: {
                    xs: '16px',
                    sm: '20px',
                    md: '24px'
                  },
                  fontWeight: 800,
                  fontSize: {
                    xs: 'clamp(1.8rem, 7vw, 2.2rem)',
                    sm: 'clamp(2.2rem, 6vw, 2.6rem)',
                    md: 'clamp(2.6rem, 5vw, 3rem)',
                    lg: '3rem'
                  },
                  lineHeight: 1.1,
                  textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                Ready to get started?
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  marginBottom: {
                    xs: '24px',
                    sm: '28px',
                    md: '32px',
                    lg: '36px'
                  },
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: {
                    xs: 'clamp(1rem, 4vw, 1.2rem)',
                    sm: 'clamp(1.2rem, 3.5vw, 1.4rem)',
                    md: 'clamp(1.4rem, 3vw, 1.6rem)',
                    lg: '1.6rem'
                  },
                  lineHeight: 1.4,
                  fontWeight: 400,
                  textShadow: '0 1px 10px rgba(0,0,0,0.1)',
                  maxWidth: {
                    xs: '100%',
                    md: '90%'
                  }
                }}
              >
                Join thousands of users who are buying and selling on Nigeria's most trusted marketplace.
              </Typography>

              {/* Feature Pills */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: {
                  xs: '8px',
                  sm: '12px',
                  md: '16px'
                },
                marginBottom: {
                  xs: '24px',
                  sm: '28px',
                  md: '32px'
                },
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                {features.map((feature, index) => (
                  <Box
                    key={feature.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      padding: {
                        xs: '8px 12px',
                        sm: '10px 16px',
                        md: '12px 20px'
                      },
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: {
                        xs: '0.8rem',
                        sm: '0.85rem',
                        md: '0.9rem'
                      },
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        transform: 'translateY(-2px)',
                      },
                      '@keyframes fadeInUp': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(20px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    {React.cloneElement(feature.icon, {
                      sx: { 
                        fontSize: {
                          xs: '16px',
                          sm: '18px',
                          md: '20px'
                        },
                        color: 'rgba(255,255,255,0.9)'
                      }
                    })}
                    <Box>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 700,
                        display: 'block',
                        lineHeight: 1.2
                      }}>
                        {feature.title}
                      </Typography>
                      {!isMobile && (
                        <Typography variant="caption" sx={{ 
                          opacity: 0.8,
                          fontSize: '0.7rem',
                          display: 'block',
                          lineHeight: 1.2
                        }}>
                          {feature.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: {
                  xs: '16px',
                  sm: '20px',
                  md: '24px'
                },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  endIcon={<ArrowForward />}
                  sx={{
                    padding: {
                      xs: '14px 28px',
                      sm: '16px 32px',
                      md: '18px 36px',
                      lg: '20px 40px'
                    },
                    fontSize: {
                      xs: '1rem',
                      sm: '1.1rem',
                      md: '1.2rem',
                      lg: '1.25rem'
                    },
                    fontWeight: 700,
                    borderRadius: {
                      xs: '12px',
                      sm: '14px',
                      md: '16px'
                    },
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: '#6C47FF',
                    boxShadow: '0 6px 24px rgba(255,255,255,0.3)',
                    textTransform: 'none',
                    letterSpacing: '0.02em',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: {
                      xs: '200px',
                      sm: '220px',
                      md: '240px'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(108,71,255,0.1), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover': {
                      backgroundColor: '#fff',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 10px 32px rgba(255,255,255,0.4)',
                      '&::before': {
                        left: '100%',
                      },
                      '& .MuiSvgIcon-root': {
                        transform: 'translateX(4px)',
                      }
                    },
                    '&:active': {
                      transform: 'translateY(-1px) scale(1.01)',
                    },
                    '& .MuiSvgIcon-root': {
                      transition: 'transform 0.3s ease',
                    }
                  }}
                >
                  Create Free Account
                </Button>

                <Button
                  variant="text"
                  size="large"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem',
                      md: '1.1rem'
                    },
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                    textDecorationThickness: '2px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      textDecorationThickness: '3px',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              position: 'relative'
            }}>
              {/* Enhanced Illustration */}
              <FloatingElement duration={6}>
                <Box sx={{
                  width: '240px',
                  height: '240px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Outer Ring */}
                  <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.2)',
                    animation: 'rotate 20s linear infinite',
                    '@keyframes rotate': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }} />
                  
                  {/* Inner Circle */}
                  <Box sx={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Central Icon */}
                    <TrendingUp sx={{ 
                      fontSize: '80px', 
                      color: 'rgba(255,255,255,0.8)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }} />
                    
                    {/* Floating Mini Elements */}
                    {[...Array(6)].map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'absolute',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.6)',
                          top: `${20 + Math.sin(index * Math.PI / 3) * 60}%`,
                          left: `${50 + Math.cos(index * Math.PI / 3) * 60}%`,
                          animation: `pulse 2s ease-in-out infinite ${index * 0.3}s`,
                          '@keyframes pulse': {
                            '0%, 100%': {
                              opacity: 0.6,
                              transform: 'scale(1)',
                            },
                            '50%': {
                              opacity: 1,
                              transform: 'scale(1.2)',
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </FloatingElement>
            </Box>
          </Grid>
        </Grid>

        {/* Stats Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: {
            xs: '24px',
            sm: '32px',
            md: '48px'
          },
          marginTop: {
            xs: '32px',
            sm: '40px',
            md: '48px'
          },
          paddingTop: {
            xs: '24px',
            sm: '32px',
            md: '40px'
          },
          borderTop: '1px solid rgba(255,255,255,0.2)',
          flexWrap: 'wrap',
        }}>
          {[
            { number: '10K+', label: 'Active Users' },
            { number: '50K+', label: 'Ads Posted' },
            { number: '4.8★', label: 'User Rating' },
          ].map((stat, index) => (
            <Box
              key={stat.label}
              sx={{
                textAlign: 'center',
                animation: `countUp 1s ease-out ${index * 0.2}s both`,
                '@keyframes countUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <Typography variant="h4" sx={{
                fontWeight: 800,
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.8rem',
                  md: '2rem'
                },
                marginBottom: '4px',
                color: 'rgba(255,255,255,0.95)',
              }}>
                {stat.number}
              </Typography>
              <Typography variant="body2" sx={{
                fontSize: {
                  xs: '0.8rem',
                  sm: '0.85rem',
                  md: '0.9rem'
                },
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
              }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default CallToAction;
