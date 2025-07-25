import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Stack, IconButton, TextField, Button, Collapse, Divider } from '@mui/material';
import { styled } from '@mui/system';
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
  width: '48px',
  height: '48px',
  margin: '0 8px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: '#6C47FF',
    color: 'white',
    transform: 'translateY(-4px) scale(1.1)',
    boxShadow: '0 8px 24px rgba(108,71,255,0.4)',
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
  { label: 'Browse Ads', href: '/ads' },
  { label: 'Post Ad', href: '/post' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Help Center', href: '/help' },
];

const categories = [
  { label: 'Vehicles', href: '/category/vehicles' },
  { label: 'Electronics', href: '/category/electronics' },
  { label: 'Property', href: '/category/property' },
  { label: 'Fashion', href: '/category/fashion' },
  { label: 'Jobs', href: '/category/jobs' },
  { label: 'Services', href: '/category/services' },
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
    if (!newsletter.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setNewsletter('');
    // Show success message (you can implement toast notification here)
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
            gridColumn: { xs: '1', md: '1 / 3' },
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
                  gap: { xs: 2, sm: 1 },
                  alignItems: 'stretch',
                  justifyContent: { xs: 'center', md: 'flex-start' }
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
                    borderRadius: '12px',
                    flex: 1,
                    maxWidth: { xs: '100%', sm: '240px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      color: 'white',
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
                  endIcon={<Send />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                    borderRadius: '12px',
                    padding: {
                      xs: '10px 20px',
                      sm: '8px 16px'
                    },
                    fontSize: {
                      xs: '0.9rem',
                      sm: '0.85rem'
                    },
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(108,71,255,0.4)',
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
              gap: 1,
              flexWrap: 'wrap'
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
    </FooterContainer>
  );
}

export default Footer;
