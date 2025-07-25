import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, useTheme } from '@mui/material';
import { HowToReg, PostAdd, MonetizationOn } from '@mui/icons-material';

const steps = [
  {
    icon: <HowToReg />,
    title: 'Create an Account',
    description: 'Sign up for a free account in just a few minutes and join our growing community.',
    color: '#6C47FF',
    gradient: 'linear-gradient(135deg, #6C47FF 0%, #8B5FFF 100%)',
    id: 'create-account',
  },
  {
    icon: <PostAdd />,
    title: 'Post Your Ad',
    description: 'Create a detailed and attractive ad for your product or service with our easy-to-use tools.',
    color: '#00C6AE',
    gradient: 'linear-gradient(135deg, #00C6AE 0%, #00E5C7 100%)',
    id: 'post-ad',
  },
  {
    icon: <MonetizationOn />,
    title: 'Start Selling',
    description: 'Connect with buyers, negotiate deals, and start making money from your listings.',
    color: '#FFBF00',
    gradient: 'linear-gradient(135deg, #FFBF00 0%, #FFD700 100%)',
    id: 'start-selling',
  },
];

const HowItWorks = () => {
  const theme = useTheme();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance steps for visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getResponsiveSpacing = (width) => {
    if (width < 480) return { container: '16px', step: '24px' };
    if (width < 768) return { container: '24px', step: '32px' };
    if (width < 1024) return { container: '32px', step: '40px' };
    return { container: '40px', step: '48px' };
  };

  const getAvatarSize = (width) => {
    if (width < 480) return { width: 64, height: 64, iconSize: 32 };
    if (width < 768) return { width: 72, height: 72, iconSize: 36 };
    if (width < 1024) return { width: 80, height: 80, iconSize: 40 };
    return { width: 88, height: 88, iconSize: 44 };
  };

  const spacing = getResponsiveSpacing(windowWidth);
  const avatarSize = getAvatarSize(windowWidth);
  const isMobile = windowWidth < 768;

  return (
    <Box
      component="section"
      aria-labelledby="how-it-works-heading"
      sx={{
        width: '100%',
        padding: spacing.container,
        background: 'linear-gradient(180deg, rgba(108,71,255,0.02) 0%, rgba(0,198,174,0.02) 100%)',
        borderRadius: {
          xs: '20px',
          sm: '24px',
          md: '28px'
        },
        margin: {
          xs: '16px 0',
          sm: '24px 0',
          md: '32px 0'
        }
      }}
    >
      <Typography 
        id="how-it-works-heading"
        variant="h2" 
        component="h2" 
        sx={{ 
          marginBottom: {
            xs: '32px',
            sm: '40px',
            md: '48px',
            lg: '56px'
          },
          fontWeight: 700, 
          textAlign: 'center',
          fontSize: {
            xs: 'clamp(1.5rem, 6vw, 2rem)',
            sm: 'clamp(2rem, 5vw, 2.5rem)',
            md: 'clamp(2.5rem, 4vw, 3rem)',
            lg: '3rem'
          },
          lineHeight: 1.2,
          background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        How It Works
      </Typography>

      <Box sx={{ 
        position: 'relative', 
        maxWidth: '1000px', 
        margin: '0 auto',
        padding: {
          xs: '16px',
          sm: '24px',
          md: '32px'
        }
      }}>
        {/* Connection Line - Desktop Only */}
        {!isMobile && (
          <Box sx={{
            position: 'absolute',
            left: '50%',
            top: '80px',
            bottom: '80px',
            width: '4px',
            background: 'linear-gradient(180deg, #6C47FF 0%, #00C6AE 50%, #FFBF00 100%)',
            borderRadius: '2px',
            transform: 'translateX(-50%)',
            zIndex: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#6C47FF',
              transform: 'translateX(-50%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#FFBF00',
              transform: 'translateX(-50%)',
            }
          }} />
        )}

        {/* Steps Container */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.step,
          position: 'relative',
          zIndex: 1
        }}>
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const isActive = activeStep === index;
            
            return (
              <Box 
                key={step.id}
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : isLeft ? 'flex-start' : 'flex-end',
                  position: 'relative',
                  opacity: isActive ? 1 : 0.8,
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Content Card */}
                <Box sx={{ 
                  width: isMobile ? '100%' : '45%',
                  display: 'flex',
                  justifyContent: isMobile ? 'center' : isLeft ? 'flex-end' : 'flex-start',
                  paddingRight: isMobile ? 0 : isLeft ? '40px' : 0,
                  paddingLeft: isMobile ? 0 : isLeft ? 0 : '40px',
                }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      padding: {
                        xs: '20px',
                        sm: '24px',
                        md: '28px',
                        lg: '32px'
                      },
                      borderRadius: {
                        xs: '16px',
                        sm: '18px',
                        md: '20px'
                      },
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(108,71,255,0.05) 0%, rgba(0,198,174,0.05) 100%)'
                        : '#fff',
                      border: isActive 
                        ? '2px solid transparent'
                        : '1px solid rgba(108,71,255,0.1)',
                      backgroundClip: isActive ? 'padding-box' : 'border-box',
                      boxShadow: isActive 
                        ? '0 8px 32px rgba(108,71,255,0.15)'
                        : '0 4px 16px rgba(108,71,255,0.08)',
                      position: 'relative',
                      textAlign: isMobile ? 'center' : isLeft ? 'right' : 'left',
                      maxWidth: {
                        xs: '100%',
                        sm: '400px',
                        md: '450px'
                      },
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(108,71,255,0.2)',
                      },
                      ...(isActive && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 'inherit',
                          padding: '2px',
                          background: step.gradient,
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'exclude',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          zIndex: -1,
                        }
                      })
                    }}
                    onClick={() => setActiveStep(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveStep(index);
                      }
                    }}
                  >
                    {/* Step Number */}
                    <Box sx={{
                      position: 'absolute',
                      top: '-12px',
                      [isMobile ? 'left' : isLeft ? 'right' : 'left']: '-12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: step.gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}>
                      {index + 1}
                    </Box>

                    <Typography 
                      variant="h5" 
                      component="h3"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: {
                          xs: '1.1rem',
                          sm: '1.2rem',
                          md: '1.3rem',
                          lg: '1.4rem'
                        },
                        marginBottom: '12px',
                        color: isActive ? step.color : 'text.primary',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {step.title}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: {
                          xs: '0.9rem',
                          sm: '0.95rem',
                          md: '1rem',
                          lg: '1.05rem'
                        },
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Avatar - Center positioned */}
                <Box sx={{ 
                  position: isMobile ? 'static' : 'absolute',
                  left: isMobile ? 'auto' : '50%',
                  transform: isMobile ? 'none' : 'translateX(-50%)',
                  zIndex: 2,
                  marginTop: isMobile ? '16px' : 0,
                  marginBottom: isMobile ? '8px' : 0,
                }}>
                  <Avatar sx={{
                    background: isActive ? step.gradient : step.color,
                    width: avatarSize.width,
                    height: avatarSize.height,
                    boxShadow: isActive 
                      ? `0 8px 24px ${step.color}40`
                      : `0 4px 12px ${step.color}30`,
                    border: '4px solid #fff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      boxShadow: `0 12px 32px ${step.color}50`,
                    }
                  }}>
                    {React.cloneElement(step.icon, {
                      sx: { 
                        fontSize: avatarSize.iconSize,
                        color: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }
                    })}
                  </Avatar>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Progress Indicators */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: {
            xs: '32px',
            sm: '40px',
            md: '48px'
          }
        }}>
          {steps.map((step, index) => (
            <Box
              key={step.id}
              onClick={() => setActiveStep(index)}
              sx={{
                width: activeStep === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: activeStep === index 
                  ? step.gradient 
                  : 'rgba(108,71,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: activeStep === index 
                    ? step.gradient 
                    : 'rgba(108,71,255,0.4)',
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Go to step ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(index);
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HowItWorks;
