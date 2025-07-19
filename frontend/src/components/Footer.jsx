import React, { useState } from 'react';
import { Box, Typography, Container, Stack, IconButton, TextField, Button, Collapse } from '@mui/material';
import { styled } from '@mui/system';
import { Facebook, Twitter, Instagram, LinkedIn, ExpandLess, ExpandMore } from '@mui/icons-material';

const FooterContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.background.accent,
  color: theme.palette.common.white,
  padding: theme.spacing(8, 0, 4, 0),
  marginTop: 'auto',
}));

const FooterLink = styled('a')(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.secondary.main,
  },
}));

const quickLinks = [
  { label: 'Home', href: '#' },
  { label: 'Browse Ads', href: '#' },
  { label: 'Post Ad', href: '#' },
  { label: 'Contact Us', href: '#' },
];

function Footer() {
  const [newsletter, setNewsletter] = useState('');
  const [mobileOpen, setMobileOpen] = useState({ quickLinks: false, contact: false });
  const isMobile = window.innerWidth < 600;

  const handleToggle = (section) => {
    setMobileOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 6,
          }}
        >
          {/* About Section */}
          <Box sx={{ flex: 1, mb: { xs: 4, md: 0 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              About Us
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Your go-to platform for buying and selling. Connecting communities, one ad at a time.
            </Typography>
            {/* Newsletter Signup */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1 }}>
                Subscribe to our newsletter
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Your email"
                  variant="outlined"
                  value={newsletter}
                  onChange={(e) => setNewsletter(e.target.value)}
                  sx={{ bgcolor: '#fff', borderRadius: 2, minWidth: 0, flex: 1 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Button variant="contained" color="secondary" sx={{ borderRadius: 2, px: 3 }}>
                  Subscribe
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, cursor: isMobile ? 'pointer' : 'default' }} onClick={() => isMobile && handleToggle('quickLinks')}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Quick Links
              </Typography>
              {isMobile && (mobileOpen.quickLinks ? <ExpandLess /> : <ExpandMore />)}
            </Stack>
            <Collapse in={!isMobile || mobileOpen.quickLinks} timeout="auto" unmountOnExit>
              <Stack spacing={1}>
                {quickLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                ))}
              </Stack>
            </Collapse>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, cursor: isMobile ? 'pointer' : 'default' }} onClick={() => isMobile && handleToggle('contact')}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Contact Info
              </Typography>
              {isMobile && (mobileOpen.contact ? <ExpandLess /> : <ExpandMore />)}
            </Stack>
            <Collapse in={!isMobile || mobileOpen.contact} timeout="auto" unmountOnExit>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Email: info@classifiedads.com</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Phone: +1 234 567 8900</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Address: 123 Ad Street, City, Country</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <IconButton color="inherit" href="#" sx={{ color: 'white' }}><Facebook /></IconButton>
                <IconButton color="inherit" href="#" sx={{ color: 'white' }}><Twitter /></IconButton>
                <IconButton color="inherit" href="#" sx={{ color: 'white' }}><Instagram /></IconButton>
                <IconButton color="inherit" href="#" sx={{ color: 'white' }}><LinkedIn /></IconButton>
              </Stack>
            </Collapse>
          </Box>
        </Box>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', mt: 6, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} Classified Ads. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  );
}

export default Footer;
