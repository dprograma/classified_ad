import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Rating } from '@mui/material';
import { ChevronLeft, ChevronRight, FormatQuote } from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: 'Tunde Ogundimu',
    avatar: 'T',
    testimonial: 'I sold my old laptop within 24 hours of posting it on this platform. The interface is intuitive and the buyers were genuine. Highly recommended!',
    color: '#6C47FF',
    gradient: 'linear-gradient(135deg, #6C47FF 0%, #8B5FFF 100%)',
    featured: true,
    rating: 5,
    location: 'Lagos, Nigeria',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Chioma Ezekiel',
    avatar: 'C',
    testimonial: 'A great place to find amazing deals on quality items. I bought a used car at a very good price and the seller was transparent about everything.',
    color: '#00C6AE',
    gradient: 'linear-gradient(135deg, #00C6AE 0%, #00E5C7 100%)',
    featured: false,
    rating: 5,
    location: 'Abuja, Nigeria',
    category: 'Vehicles',
  },
  {
    id: 3,
    name: 'Musa Abdullahi',
    avatar: 'M',
    testimonial: 'The interface is so easy to use, and I love the fact that I can chat with sellers directly. Found exactly what I was looking for!',
    color: '#FFBF00',
    gradient: 'linear-gradient(135deg, #FFBF00 0%, #FFD700 100%)',
    featured: false,
    rating: 4,
    location: 'Kano, Nigeria',
    category: 'Home & Garden',
  },
  {
    id: 4,
    name: 'Adaora Nwosu',
    avatar: 'A',
    testimonial: 'Excellent platform for both buying and selling. The verification system gives me confidence in the transactions. Great customer support too!',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    featured: true,
    rating: 5,
    location: 'Port Harcourt, Nigeria',
    category: 'Fashion',
  },
  {
    id: 5,
    name: 'Ibrahim Yusuf',
    avatar: 'I',
    testimonial: 'Been using this platform for months now. The search functionality is powerful and I always find what I need quickly.',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    featured: false,
    rating: 4,
    location: 'Ibadan, Nigeria',
    category: 'Services',
  },
];

const Testimonials = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const getVisibleCount = (width) => {
    if (width < 480) return 1;
    if (width < 768) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const getCardWidth = (width) => {
    if (width < 480) return { min: '280px', max: '320px' };
    if (width < 768) return { min: '320px', max: '360px' };
    if (width < 1024) return { min: '340px', max: '380px' };
    return { min: '360px', max: '400px' };
  };

  const getScrollGap = (width) => {
    if (width < 480) return '16px';
    if (width < 768) return '20px';
    if (width < 1024) return '24px';
    return '28px';
  };

  const visibleCount = getVisibleCount(windowWidth);
  const cardSize = getCardWidth(windowWidth);
  const scrollGap = getScrollGap(windowWidth);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <Box
      component="section"
      aria-labelledby="testimonials-heading"
      sx={{
        width: '100%',
        padding: {
          xs: '24px 16px',
          sm: '32px 24px',
          md: '40px 32px',
          lg: '48px 40px'
        },
        background: 'linear-gradient(180deg, rgba(108,71,255,0.03) 0%, rgba(0,198,174,0.03) 100%)',
        borderRadius: {
          xs: '20px',
          sm: '24px',
          md: '28px'
        },
        margin: {
          xs: '16px 0',
          sm: '24px 0',
          md: '32px 0'
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography 
        id="testimonials-heading"
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
        What Our Users Say
      </Typography>

      {/* Navigation Controls */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <IconButton
          onClick={prevTestimonial}
          sx={{
            backgroundColor: 'rgba(108,71,255,0.1)',
            color: '#6C47FF',
            width: '48px',
            height: '48px',
            '&:hover': {
              backgroundColor: 'rgba(108,71,255,0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </IconButton>

        <Box sx={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          {testimonials.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToTestimonial(index)}
              sx={{
                width: currentIndex === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentIndex === index 
                  ? 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)'
                  : 'rgba(108,71,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: currentIndex === index 
                    ? 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)'
                    : 'rgba(108,71,255,0.5)',
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Go to testimonial ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToTestimonial(index);
                }
              }}
            />
          ))}
        </Box>

        <IconButton
          onClick={nextTestimonial}
          sx={{
            backgroundColor: 'rgba(108,71,255,0.1)',
            color: '#6C47FF',
            width: '48px',
            height: '48px',
            '&:hover': {
              backgroundColor: 'rgba(108,71,255,0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Testimonials Container */}
      <Box sx={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: scrollGap,
        paddingBottom: {
          xs: '16px',
          sm: '20px',
          md: '24px'
        },
        scrollBehavior: 'smooth',
        justifyContent: visibleCount === 1 ? 'center' : 'flex-start',
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(108,71,255,0.1)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
          borderRadius: '3px',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
          }
        },
        // Hide scrollbar on mobile
        '@media (max-width: 768px)': {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }
      }}>
        {testimonials.map((testimonial, index) => {
          const isActive = index === currentIndex;
          const isVisible = Math.abs(index - currentIndex) < visibleCount;
          
          return (
            <Paper
              key={testimonial.id}
              sx={{
                minWidth: cardSize.min,
                maxWidth: cardSize.max,
                flex: '0 0 auto',
                padding: {
                  xs: '24px',
                  sm: '28px',
                  md: '32px',
                  lg: testimonial.featured ? '36px' : '32px'
                },
                textAlign: 'center',
                borderRadius: {
                  xs: '16px',
                  sm: '18px',
                  md: '20px'
                },
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(108,71,255,0.05) 0%, rgba(0,198,174,0.05) 100%)'
                  : '#fff',
                border: testimonial.featured 
                  ? '2px solid transparent'
                  : isActive 
                    ? '2px solid rgba(108,71,255,0.2)'
                    : '1px solid rgba(108,71,255,0.1)',
                backgroundClip: testimonial.featured ? 'padding-box' : 'border-box',
                boxShadow: testimonial.featured 
                  ? '0 8px 32px rgba(108,71,255,0.15)'
                  : isActive 
                    ? '0 6px 24px rgba(108,71,255,0.12)'
                    : '0 4px 16px rgba(108,71,255,0.08)',
                position: 'relative',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                opacity: isVisible ? 1 : 0.7,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: isActive ? 'scale(1.04)' : 'scale(1.02)',
                  boxShadow: testimonial.featured 
                    ? '0 12px 40px rgba(108,71,255,0.2)'
                    : '0 8px 28px rgba(108,71,255,0.15)',
                },
                ...(testimonial.featured && {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 'inherit',
                    padding: '2px',
                    background: testimonial.gradient,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    zIndex: -1,
                  }
                })
              }}
              onClick={() => goToTestimonial(index)}
              role="article"
              aria-label={`Testimonial from ${testimonial.name}`}
            >
              {/* Quote Icon */}
              <Box sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: testimonial.color,
                opacity: 0.3,
              }}>
                <FormatQuote sx={{ fontSize: '32px', transform: 'rotate(180deg)' }} />
              </Box>

              {/* Featured Badge */}
              {testimonial.featured && (
                <Box sx={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: testimonial.gradient,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  ⭐ Featured
                </Box>
              )}

              <Avatar sx={{
                background: testimonial.gradient,
                width: {
                  xs: testimonial.featured ? 72 : 64,
                  sm: testimonial.featured ? 80 : 72,
                  md: testimonial.featured ? 88 : 80
                },
                height: {
                  xs: testimonial.featured ? 72 : 64,
                  sm: testimonial.featured ? 80 : 72,
                  md: testimonial.featured ? 88 : 80
                },
                margin: '0 auto',
                marginBottom: '16px',
                fontSize: {
                  xs: testimonial.featured ? '32px' : '28px',
                  sm: testimonial.featured ? '36px' : '32px',
                  md: testimonial.featured ? '40px' : '36px'
                },
                fontWeight: 700,
                color: '#fff',
                boxShadow: `0 4px 16px ${testimonial.color}40`,
                border: '3px solid #fff',
                transition: 'all 0.3s ease',
              }}>
                {testimonial.avatar}
              </Avatar>

              <Typography 
                variant={testimonial.featured ? 'h5' : 'h6'} 
                component="h3"
                sx={{ 
                  fontWeight: 700,
                  fontSize: {
                    xs: testimonial.featured ? '1.2rem' : '1rem',
                    sm: testimonial.featured ? '1.3rem' : '1.1rem',
                    md: testimonial.featured ? '1.4rem' : '1.2rem'
                  },
                  marginBottom: '8px',
                  color: testimonial.color,
                }}
              >
                {testimonial.name}
              </Typography>

              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: {
                    xs: '0.8rem',
                    sm: '0.85rem',
                    md: '0.9rem'
                  },
                  color: 'text.secondary',
                  marginBottom: '12px',
                  fontWeight: 500,
                }}
              >
                {testimonial.location} • {testimonial.category}
              </Typography>

              <Rating
                value={testimonial.rating}
                readOnly
                size="small"
                sx={{
                  marginBottom: '16px',
                  '& .MuiRating-iconFilled': {
                    color: testimonial.color,
                  }
                }}
              />

              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: {
                    xs: testimonial.featured ? '0.95rem' : '0.85rem',
                    sm: testimonial.featured ? '1rem' : '0.9rem',
                    md: testimonial.featured ? '1.05rem' : '0.95rem'
                  },
                  lineHeight: 1.6,
                  color: 'text.primary',
                  fontStyle: 'italic',
                  position: 'relative',
                  '&::before': {
                    content: '"\u201C"',
                    fontSize: '2em',
                    color: testimonial.color,
                    opacity: 0.3,
                    position: 'absolute',
                    left: '-10px',
                    top: '-10px',
                  },
                  '&::after': {
                    content: '"\u201D"',
                    fontSize: '2em',
                    color: testimonial.color,
                    opacity: 0.3,
                    position: 'absolute',
                    right: '-10px',
                    bottom: '-20px',
                  }
                }}
              >
                {testimonial.testimonial}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Trust Indicators */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: {
          xs: '16px',
          sm: '24px',
          md: '32px'
        },
        marginTop: {
          xs: '32px',
          sm: '40px',
          md: '48px'
        },
        flexWrap: 'wrap',
      }}>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontSize: {
            xs: '0.8rem',
            sm: '0.85rem',
            md: '0.9rem'
          },
          fontWeight: 600,
          textAlign: 'center',
        }}>
          ⭐ 4.8/5 Average Rating
        </Typography>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontSize: {
            xs: '0.8rem',
            sm: '0.85rem',
            md: '0.9rem'
          },
          fontWeight: 600,
          textAlign: 'center',
        }}>
          👥 10,000+ Happy Users
        </Typography>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontSize: {
            xs: '0.8rem',
            sm: '0.85rem',
            md: '0.9rem'
          },
          fontWeight: 600,
          textAlign: 'center',
        }}>
          🔒 100% Verified Reviews
        </Typography>
      </Box>
    </Box>
  );
};

export default Testimonials;
