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
import { Gavel, Email, Phone } from '@mui/icons-material';

const TermsOfService = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Gavel sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Terms of Service
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            By using EunixMac Classifieds, you agree to these terms. Please read them carefully.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using EunixMac Classifieds ("the Platform"), you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            2. Description of Service
          </Typography>
          <Typography variant="body1" paragraph>
            EunixMac Classifieds is an online marketplace that allows users to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Post advertisements for goods and services" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Browse and search for items offered by other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate with other users regarding posted items" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Participate in educational material trading as agents" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. User Responsibilities
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Account Registration:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="You must provide accurate and complete information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You are responsible for maintaining the confidentiality of your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You must be at least 18 years old to use this service" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Content Standards:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="All posted content must be accurate and truthful" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Content must not violate any laws or regulations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Prohibited items include illegal goods, weapons, and adult content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You must own or have permission to sell the items you post" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            4. Prohibited Activities
          </Typography>
          <Typography variant="body1" paragraph>
            Users are strictly prohibited from:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Posting false, misleading, or fraudulent advertisements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Attempting to circumvent payment systems or fees" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Harassing, threatening, or abusing other users" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Using automated systems to scrape or harvest data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Posting duplicate or spam advertisements" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Impersonating other individuals or entities" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            5. Fees and Payments
          </Typography>
          <Typography variant="body1" paragraph>
            Our fee structure includes:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Basic Listings"
                secondary="Free for standard classified advertisements"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Boosted Listings"
                secondary="Premium placement fees for enhanced visibility"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Agent Commissions"
                secondary="Commission fees on educational material sales"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Payment Processing"
                secondary="Third-party payment processing fees may apply"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            6. Privacy and Data Protection
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Our use of your personal information is governed by our Privacy Policy,
            which is incorporated into these terms by reference.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            7. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            The Platform and its original content, features, and functionality are owned by EunixMac Classifieds and are
            protected by international copyright, trademark, and other intellectual property laws.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            8. Disclaimer of Warranties
          </Typography>
          <Typography variant="body1" paragraph>
            The Platform is provided "as is" and "as available" without any warranties of any kind. We do not guarantee
            the accuracy, completeness, or usefulness of any information on the Platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            9. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            EunixMac Classifieds shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of the Platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            10. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account immediately, without prior notice, for conduct that we believe
            violates these Terms of Service or is harmful to other users of the Platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            11. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be interpreted and governed in accordance with the laws of the Federal Republic of Nigeria,
            without regard to its conflict of law provisions.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            12. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting
            to the Platform. Your continued use constitutes acceptance of the modified terms.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us:
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" />
              <Typography variant="body2">legal@eunixmac.com</Typography>
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

export default TermsOfService;