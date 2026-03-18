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
import { Gavel } from '@mui/icons-material';

const TermsOfService = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Gavel sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Terms and Conditions
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Eunixma Classified Ads App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Effective Date: 11/03/2026
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1">
            By using our app, you agree to these Terms and Conditions. Please read them carefully.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Eunixma.com.ng, a classified ads platform for buying and selling goods and other services.
            You ("you" or "user") accept these terms and conditions by using our app.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            2. Definitions
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary='"User"'
                secondary="Anyone who uses our app"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='"Ad"'
                secondary="A listing posted by a user to buy or sell goods/services"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='"Transaction"'
                secondary="A sale or purchase made through our app"
              />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            3. Eligibility
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Users must be 18 years or older" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Users are obligated to adhere to all applicable laws" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            4. User Responsibilities
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Provide accurate and complete information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Check that advertisements adhere to our Content Guidelines" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Not engage in prohibited activities (e.g., fraud, harassment)" />
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            5. Guidelines for Content
          </Typography>
          <Typography variant="body1" paragraph>
            Ads should not:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Contain prohibited content (e.g., explicit, hate speech)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Infringe on intellectual property rights" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Promote illegal activities" />
            </ListItem>
          </List>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            Users retain ownership of their content and grant us a non-exclusive license.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            6. Payments and Transactions
          </Typography>
          <Typography variant="body1" paragraph>
            Our app makes it easier for buyers and sellers to connect. Payments are handled directly between users,
            with exceptions on intellectual property added to the website, with the settlement of agreed royalty.
            Users agree to comply with payment policies.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            7. Disclaimer and Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            We don't guarantee accuracy or reliability of ads. We are not responsible for any losses or damages caused by using our app.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            8. Data Protection
          </Typography>
          <Typography variant="body1" paragraph>
            We collect and use data as described in our Privacy Policy. Users agree to our data practices.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            9. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend accounts for violating these Terms.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            10. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            Nigerian law applies to these Terms. Arbitration will be used to settle disputes in Nigeria.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            11. Amendments and Updates
          </Typography>
          <Typography variant="body1" paragraph>
            We may update these Terms; users will be notified.
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2, fontWeight: 500 }}>
            By using our app, you agree to these Terms and Conditions.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
