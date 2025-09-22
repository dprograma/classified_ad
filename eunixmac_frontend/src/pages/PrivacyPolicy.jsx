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
  Alert
} from '@mui/material';
import { Shield, Email, Phone } from '@mui/icons-material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Shield sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Privacy Policy
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            This Privacy Policy describes how EunixMac Classifieds collects, uses, and protects your personal information
            when you use our platform.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account, post an ad,
            or contact us for support.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Personal Information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Name and contact information (email, phone number)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Profile information and photos" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment information (processed securely by third parties)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication preferences" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Usage Information:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Device information and IP address" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Browser type and operating system" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Pages visited and time spent on our platform" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Search queries and interactions with ads" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to provide, maintain, and improve our services:
          </Typography>

          <List>
            <ListItem>
              <ListItemText primary="Process and facilitate transactions" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate with you about your account and services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Provide customer support" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Improve our platform and develop new features" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Detect and prevent fraud and abuse" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Send marketing communications (with your consent)" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="With other users"
                secondary="When you post ads, your profile information may be visible to other users"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Service providers"
                secondary="Third-party companies that help us operate our platform (payment processors, hosting services)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal requirements"
                secondary="When required by law or to protect our rights and the safety of our users"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Business transfers"
                secondary="In the event of a merger, acquisition, or sale of assets"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
            internet is 100% secure.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            5. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>

          <List>
            <ListItem>
              <ListItemText primary="Access and update your personal information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Delete your account and personal data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Opt-out of marketing communications" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Request a copy of your data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Object to processing of your data" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            6. Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar technologies to enhance your experience, analyze site usage, and assist in our
            marketing efforts. You can manage your cookie preferences in your browser settings.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            7. Updates to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
            new policy on this page and updating the "Last updated" date.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us:
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" />
              <Typography variant="body2">privacy@eunixmac.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone color="primary" />
              <Typography variant="body2">+234 800 123 4567</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;