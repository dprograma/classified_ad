import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Stack, IconButton, TextField, Button, Collapse, Divider, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/system';
import useApi from '../hooks/useApi';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  ExpandLess, 
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';

const FooterContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  color: theme.palette.common.white,
  padding: theme.spacing(8, 0, 4, 0),
  marginTop: 'auto',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(108,71,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,198,174,0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
}));

const FooterLink = styled('a')(({ theme }) => ({
  color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  position: 'relative',
  display: 'inline-block',
  '&:hover': {
    color: '#00C6AE',
    transform: 'translateX(4px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '0',
    height: '2px',
    bottom: '-2px',
    left: '0',
    backgroundColor: '#00C6AE',
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.8)',
  width: '44px',
  height: '44px',
  margin: '0 4px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '50%',
  '&:hover': {
    backgroundColor: '#6C47FF',
    color: 'white',
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 4px 12px rgba(108,71,255,0.3)',
  },
  '&:nth-of-type(2):hover': {
    backgroundColor: '#1DA1F2',
  },
  '&:nth-of-type(3):hover': {
    backgroundColor: '#E4405F',
  },
  '&:nth-of-type(4):hover': {
    backgroundColor: '#0077B5',
  },
}));

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Browse Categories', href: '/categories' },
  { label: 'Search Ads', href: '/search' },
  { label: 'Post Ad', href: '/post-ad' },
  { label: 'Help Center', href: '/help' },
];

const categories = [
  { label: 'Vehicles', href: '/search?category=vehicles' },
  { label: 'Electronics', href: '/search?category=electronics' },
  { label: 'Property', href: '/search?category=property' },
  { label: 'Fashion', href: '/search?category=fashion' },
  { label: 'Jobs', href: '/search?category=jobs' },
  { label: 'All Categories', href: '/categories' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Safety Tips', href: '/safety' },
];

function Footer() {
  const [newsletter, setNewsletter] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [mobileOpen, setMobileOpen] = useState({ 
    quickLinks: false, 
    categories: false,
    contact: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { callApi } = useApi();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleToggle = (section) => {
    setMobileOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletter.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletter.trim())) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await callApi('POST', '/newsletter/subscribe', { 
        email: newsletter.trim() 
      });
      setNewsletter('');
      setSnackbar({ open: true, message: 'Successfully subscribed to newsletter!', severity: 'success' });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to subscribe. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponsivePadding = (width) => {
    if (width < 480) return { x: '16px', y: '48px' };
    if (width < 768) return { x: '24px', y: '56px' };
    if (width < 1024) return { x: '32px', y: '64px' };
    return { x: '40px', y: '72px' };
  };

  const padding = getResponsivePadding(windowWidth);

  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr 1fr', 
              md: 'repeat(4, 1fr)' 
            },
            gap: { xs: 4, sm: 5, md: 6 },
            marginBottom: { xs: 6, md: 8 },
          }}
        >
          {/* About Section */}
          <Box sx={{
            gridColumn: { xs: '1', md: '1 / 2' },
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <Typography 
              variant="h5" 
              component="h3"
              sx={{ 
                fontWeight: 800,
                marginBottom: '16px',
                fontSize: {
                  xs: '1.3rem',
                  sm: '1.4rem',
                  md: '1.5rem'
                },
                background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              EunixMac Classifieds
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '24px',
                lineHeight: 1.6,
                fontSize: {
                  xs: '0.9rem',
                  sm: '0.95rem',
                  md: '1rem'
                },
                maxWidth: { xs: '100%', md: '90%' }
              }}
            >
              Nigeria's premier online marketplace connecting buyers and sellers across the country. 
              Safe, secure, and trusted by thousands of users.
            </Typography>

            {/* Newsletter Signup */}
            <Box sx={{ marginBottom: '24px' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '12px',
                  fontSize: {
                    xs: '1rem',
                    sm: '1.1rem',
                    md: '1.2rem'
                  },
                  fontWeight: 600,
                }}
              >
                Stay Updated
              </Typography>
              
              <Box
                component="form"
                onSubmit={handleNewsletterSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 1.5 },
                  alignItems: 'stretch',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  marginBottom: { xs: 2, sm: 0 }
                }}
              >
                <TextField
                  size="small"
                  placeholder="Enter your email"
                  variant="outlined"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    flex: 1,
                    maxWidth: { xs: '100%', sm: '200px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      color: 'white',
                      height: '40px',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00C6AE',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '8px 12px',
                      fontSize: '0.875rem'
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.7)',
                      opacity: 1,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  endIcon={<Send sx={{ fontSize: '16px' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                    borderRadius: '8px',
                    height: '40px',
                    padding: {
                      xs: '8px 16px',
                      sm: '8px 16px'
                    },
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: '120px' },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(108,71,255,0.3)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </Box>
            </Box>

            {/* Social Media */}
            <Box sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
              gap: 0.5,
              flexWrap: 'wrap',
              marginTop: { xs: 2, sm: 1 }
            }}>
              <SocialButton href="#" aria-label="Facebook">
                <Facebook />
              </SocialButton>
              <SocialButton href="#" aria-label="Twitter">
                <Twitter />
              </SocialButton>
              <SocialButton href="#" aria-label="Instagram">
                <Instagram />
              </SocialButton>
              <SocialButton href="#" aria-label="LinkedIn">
                <LinkedIn />
              </SocialButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ 
                marginBottom: '16px',
                cursor: isMobile ? 'pointer' : 'default',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }} 
              onClick={() => isMobile && handleToggle('quickLinks')}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.2rem',
                    md: '1.3rem'
                  },
                  color: 'rgba(255,255,255,0.95)'
                }}
              >
                Quick Links
              </Typography>
              {isMobile && (mobileOpen.quickLinks ? <ExpandLess /> : <ExpandMore />)}
            </Stack>
            
            <Collapse in={!isMobile || mobileOpen.quickLinks} timeout="auto" unmountOnExit>
              <Stack 
                spacing={2} 
                sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
              >
                {quickLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Collapse>
          </Box>

          {/* Categories */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ 
                marginBottom: '16px',
                cursor: isMobile ? 'pointer' : 'default',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }} 
              onClick={() => isMobile && handleToggle('categories')}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.2rem',
                    md: '1.3rem'
                  },
                  color: 'rgba(255,255,255,0.95)'
                }}
              >
                Categories
              </Typography>
              {isMobile && (mobileOpen.categories ? <ExpandLess /> : <ExpandMore />)}
            </Stack>
            
            <Collapse in={!isMobile || mobileOpen.categories} timeout="auto" unmountOnExit>
              <Stack 
                spacing={2} 
                sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
              >
                {categories.map((link) => (
                  <FooterLink key={link.label} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Collapse>
          </Box>

          {/* Contact Info */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1} 
              sx={{ 
                marginBottom: '16px',
                cursor: isMobile ? 'pointer' : 'default',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }} 
              onClick={() => isMobile && handleToggle('contact')}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.2rem',
                    md: '1.3rem'
                  },
                  color: 'rgba(255,255,255,0.95)'
                }}
              >
                Contact Info
              </Typography>
              {isMobile && (mobileOpen.contact ? <ExpandLess /> : <ExpandMore />)}
            </Stack>
            
            <Collapse in={!isMobile || mobileOpen.contact} timeout="auto" unmountOnExit>
              <Stack 
                spacing={2} 
                sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Email sx={{ fontSize: '18px', color: '#00C6AE' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    info@eunixmac.com
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Phone sx={{ fontSize: '18px', color: '#00C6AE' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    +234 800 123 4567
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <LocationOn sx={{ fontSize: '18px', color: '#00C6AE' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Lagos, Nigeria
                  </Typography>
                </Box>
              </Stack>
            </Collapse>
          </Box>
        </Box>

        <Divider sx={{ 
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: { xs: 4, md: 5 }
        }} />

        {/* Legal Links */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 2, sm: 3, md: 4 },
          marginBottom: { xs: 3, md: 4 }
        }}>
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.label}>
              <FooterLink href={link.href} style={{ fontSize: '0.85rem' }}>
                {link.label}
              </FooterLink>
              {index < legalLinks.length - 1 && (
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  display: { xs: 'none', sm: 'block' }
                }}>
                  |
                </Typography>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Copyright */}
        <Box sx={{ 
          textAlign: 'center',
          paddingTop: { xs: 3, md: 4 },
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              fontSize: {
                xs: '0.8rem',
                sm: '0.85rem',
                md: '0.9rem'
              },
              lineHeight: 1.5
            }}
          >
            © {new Date().getFullYear()} EunixMac Classifieds. All rights reserved.
            <br />
            <Box component="span" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
              Made with ❤️ in Nigeria
            </Box>
          </Typography>
        </Box>
      </Container>
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FooterContainer>
  );
}

export default Footer;
