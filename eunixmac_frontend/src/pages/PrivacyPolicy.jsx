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
import { Shield, Email } from '@mui/icons-material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Shield sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Privacy Statement
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Eunixma.com.ng Classified Ads App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Effective Date: 11/03/2026
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            We respect your privacy and are committed to protecting your personal data. When you use our classified ads app,
            we (referred to as "we," "us," or "our") collect, use, and share information about you in accordance with this Privacy Policy.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            2. Information We Collect
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Personal Data:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Name, email, phone number, address, payment info (if applicable)" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            Non-Personal Data:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Device info, usage data, location (if permitted)" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
            User Content:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Ads, messages, uploaded files (e.g., ebooks, images)" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. How We Use Your Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Process transactions (ebook sales, ads)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communicate with you and manage accounts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Improve app performance and security" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Show ads that are relevant (using data that is not personal)" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            4. Transmitting Your Data
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Service Providers"
                secondary="Payment processors, analytics, support"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Third-Party Ads"
                secondary="Advertisers (non-personal data)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal Requirements"
                secondary="Law enforcement, court orders"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            5. Proprietary Rights
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="You retain ownership of your content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="You grant us a non-exclusive license to display/use content" />
            </ListItem>
            <ListItem>
              <ListItemText primary="We honor the rights of third parties" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            6. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement reasonable security measures. We report breaches as required.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            7. Your Choices
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Manage settings and preferences" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Opt out of communications that aren't necessary" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            8. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Our app is not intended for children under 18. We don't knowingly collect children's data.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            9. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            This policy may be updated; you will be informed.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ textAlign: 'center', bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            10. Reach Out
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us:
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email color="primary" />
              <Typography variant="body2">Info@eunixma.com.ng</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
