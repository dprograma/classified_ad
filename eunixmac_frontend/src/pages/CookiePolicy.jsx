import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Cookie, Email, Phone, Settings } from '@mui/icons-material';

const CookiePolicy = () => {
  const cookieTypes = [
    {
      type: "Essential Cookies",
      purpose: "Required for basic website functionality",
      examples: "Session management, security, form submissions",
      retention: "Session or up to 1 year"
    },
    {
      type: "Analytics Cookies",
      purpose: "Help us understand how visitors use our site",
      examples: "Page views, user interactions, error tracking",
      retention: "Up to 2 years"
    },
    {
      type: "Marketing Cookies",
      purpose: "Used to track visitors across websites for advertising",
      examples: "Ad personalization, conversion tracking",
      retention: "Up to 1 year"
    },
    {
      type: "Preference Cookies",
      purpose: "Remember your settings and preferences",
      examples: "Language, theme, layout preferences",
      retention: "Up to 1 year"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Cookie sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Cookie Policy
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            This Cookie Policy explains how EunixMac Classifieds uses cookies and similar technologies when you visit our website.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            What Are Cookies?
          </Typography>
          <Typography variant="body1" paragraph>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website.
            They are widely used to make websites work more efficiently and to provide information to website owners.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            How We Use Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Keep you signed in to your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Remember your preferences and settings" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Understand how you use our website" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Improve our services and user experience" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Protect against fraud and enhance security" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide relevant advertisements" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Types of Cookies We Use
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cookie Type</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Examples</strong></TableCell>
                  <TableCell><strong>Retention</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cookieTypes.map((cookie, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography fontWeight={600} color="primary.main">
                        {cookie.type}
                      </Typography>
                    </TableCell>
                    <TableCell>{cookie.purpose}</TableCell>
                    <TableCell>{cookie.examples}</TableCell>
                    <TableCell>{cookie.retention}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Third-Party Cookies
          </Typography>
          <Typography variant="body1" paragraph>
            We may also use third-party services that place cookies on your device:
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Google Analytics"
                secondary="Helps us understand website usage and improve our services"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Payment Processors"
                secondary="Secure payment processing for transactions"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Social Media Platforms"
                secondary="Enable social sharing and login functionality"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Advertising Partners"
                secondary="Deliver relevant advertisements and measure effectiveness"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Managing Your Cookie Preferences
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Browser Settings:
          </Typography>
          <Typography variant="body1" paragraph>
            Most web browsers allow you to control cookies through their settings. You can:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Block all cookies" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Allow only first-party cookies" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delete existing cookies" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Set preferences for specific websites" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Cookie Consent Banner:
          </Typography>
          <Typography variant="body1" paragraph>
            When you first visit our website, you'll see a cookie consent banner where you can:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Accept all cookies" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Reject non-essential cookies" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Customize your preferences" />
            </ListItem>
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Please note that blocking certain cookies may affect the functionality of our website and your user experience.
            </Typography>
          </Alert>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Local Storage and Similar Technologies
          </Typography>
          <Typography variant="body1" paragraph>
            In addition to cookies, we may use other technologies such as:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Local Storage"
                secondary="Stores data locally in your browser for improved performance"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Session Storage"
                secondary="Temporarily stores data during your browsing session"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Web Beacons"
                secondary="Small graphics used to track user behavior and email opens"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Updates to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons.
            We will notify you of any significant changes by posting the updated policy on our website.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Manage Your Preferences
          </Typography>
          <Typography variant="body1" paragraph>
            You can update your cookie preferences at any time through your browser settings or by contacting us.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" />
              <Typography variant="body2">privacy@eunixmac.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="primary" />
              <Typography variant="body2">+234 800 123 4567</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
            <Settings color="primary" />
            <Typography variant="body2" fontWeight={600}>
              Cookie Preferences Available in Browser Settings
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CookiePolicy;