import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Link,
  Collapse,
  IconButton,
  Stack
} from '@mui/material';
import { Cookie, Settings, Close, ExpandMore, ExpandLess } from '@mui/icons-material';
import { styled } from '@mui/system';

const CookieBanner = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  padding: theme.spacing(2),
  boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
  zIndex: 9999,
  border: '1px solid rgba(255,255,255,0.1)',
}));

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState({
    essential: false,
    analytics: false,
    marketing: false,
    preferences: false
  });

  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    savePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());

    // Set actual cookies based on preferences
    if (prefs.analytics) {
      // Enable analytics cookies
      console.log('Analytics cookies enabled');
    }
    if (prefs.marketing) {
      // Enable marketing cookies
      console.log('Marketing cookies enabled');
    }
    if (prefs.preferences) {
      // Enable preference cookies
      console.log('Preference cookies enabled');
    }
  };

  const handlePreferenceChange = (type) => (event) => {
    if (type === 'essential') return; // Can't disable essential cookies

    setPreferences(prev => ({
      ...prev,
      [type]: event.target.checked
    }));
  };

  const toggleDetails = (type) => {
    setShowDetails(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const cookieTypes = [
    {
      type: 'essential',
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      details: 'Essential cookies enable core functionality such as page navigation, access to secure areas, and basic features. The website cannot function properly without these cookies.',
      required: true
    },
    {
      type: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      details: 'Analytics cookies collect information about how you use our website, such as which pages you visit and if you experience any errors. This data helps us improve our website performance.',
      required: false
    },
    {
      type: 'marketing',
      title: 'Marketing Cookies',
      description: 'These cookies are used to deliver advertisements more relevant to you.',
      details: 'Marketing cookies track your activity across websites to build a profile of your interests and show you relevant adverts on other websites.',
      required: false
    },
    {
      type: 'preferences',
      title: 'Preference Cookies',
      description: 'These cookies remember your settings and preferences.',
      details: 'Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or region.',
      required: false
    }
  ];

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <CookieBanner>
        <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: '300px' }}>
              <Cookie sx={{ fontSize: 32, color: '#00C6AE' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  We use cookies
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                  By clicking "Accept All", you consent to our use of cookies. {' '}
                  <Link
                    href="/cookies"
                    sx={{ color: '#00C6AE', textDecoration: 'underline' }}
                    target="_blank"
                  >
                    Read our Cookie Policy
                  </Link>
                </Typography>
              </Box>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: 'fit-content' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowSettings(true)}
                startIcon={<Settings />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Customize
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRejectAll}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Reject All
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleAcceptAll}
                sx={{
                  color: 'white',
                  background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                    color: 'white',
                  }
                }}
              >
                Accept All
              </Button>
            </Stack>
          </Box>
        </Box>
      </CookieBanner>

      {/* Cookie Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cookie color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Cookie Preferences
            </Typography>
          </Box>
          <IconButton onClick={() => setShowSettings(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We use different types of cookies to optimize your experience on our website.
            You can choose which categories of cookies to allow.
          </Typography>

          <FormGroup>
            {cookieTypes.map((cookie) => (
              <Box key={cookie.type} sx={{ mb: 2 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: preferences[cookie.type] ? 'primary.light' : 'grey.50'
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {cookie.title}
                      {cookie.required && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'error.main' }}>
                          (Required)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cookie.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => toggleDetails(cookie.type)}
                    >
                      {showDetails[cookie.type] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences[cookie.type]}
                          onChange={handlePreferenceChange(cookie.type)}
                          disabled={cookie.required}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                </Box>

                <Collapse in={showDetails[cookie.type]}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: '0 0 8px 8px' }}>
                    <Typography variant="body2" color="text.secondary">
                      {cookie.details}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            You can change these settings at any time by visiting our{' '}
            <Link href="/cookies" target="_blank">Cookie Policy</Link> page.
            Please note that disabling some cookies may affect the functionality of our website.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleRejectAll} color="inherit">
            Reject All
          </Button>
          <Button onClick={handleAcceptAll} color="inherit">
            Accept All
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
            sx={{
              color: 'white',
              background: 'linear-gradient(135deg, #6C47FF 0%, #00C6AE 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a3de6 0%, #00a693 100%)',
                color: 'white',
              }
            }}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent;