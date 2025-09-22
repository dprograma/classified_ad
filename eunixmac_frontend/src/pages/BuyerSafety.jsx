import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Warning,
  CheckCircle,
  Block,
  Report,
  Phone,
  Email,
  Shield,
  Lock,
  Visibility,
  LocationOn,
  Payment,
  MoneyOff
} from '@mui/icons-material';

const BuyerSafety = () => {
  const safetyTips = [
    {
      icon: <Visibility color="primary" />,
      title: "Meet in Public Places",
      description: "Always meet sellers in well-lit, public locations with good visibility and foot traffic."
    },
    {
      icon: <LocationOn color="primary" />,
      title: "Inspect Before Buying",
      description: "Thoroughly examine items before making payment. Test functionality if applicable."
    },
    {
      icon: <Payment color="primary" />,
      title: "Use Secure Payment Methods",
      description: "Prefer cash transactions or verified digital payment methods. Avoid wire transfers."
    },
    {
      icon: <Shield color="primary" />,
      title: "Trust Your Instincts",
      description: "If something feels wrong or too good to be true, walk away from the deal."
    },
    {
      icon: <VerifiedUser color="primary" />,
      title: "Verify Seller Identity",
      description: "Check seller profiles, ratings, and verification status before making contact."
    },
    {
      icon: <Lock color="primary" />,
      title: "Protect Personal Information",
      description: "Never share sensitive personal information like passwords or full financial details."
    }
  ];

  const redFlags = [
    "Prices significantly below market value",
    "Seller insists on immediate payment",
    "Requests for wire transfers or untraceable payments",
    "Unwillingness to meet in person or provide phone number",
    "Poor grammar or communication in messages",
    "Pressure to complete transaction quickly",
    "Requests for personal financial information",
    "Stories that seem too elaborate or emotional"
  ];

  const scamTypes = [
    {
      title: "Advance Fee Fraud",
      description: "Seller asks for upfront payment before showing the item, then disappears with your money."
    },
    {
      title: "Fake Payment Confirmations",
      description: "Fraudulent screenshots or emails claiming payment has been sent when it hasn't."
    },
    {
      title: "Overpayment Scams",
      description: "Buyer sends more than asking price and requests refund of difference via different method."
    },
    {
      title: "Phishing Attempts",
      description: "Fake websites or emails designed to steal your login credentials or financial information."
    },
    {
      title: "Rental Scams",
      description: "Fake property listings with requests for deposits before viewing the actual property."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Buyer Safety Guide
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Essential tips and guidelines to help you buy safely on our platform
        </Typography>
      </Box>

      {/* Important Notice */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Safety is Our Priority
        </Typography>
        <Typography>
          While we work hard to maintain a safe marketplace, your vigilance is the best protection.
          Follow these guidelines to ensure secure transactions and protect yourself from potential scams.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Safety Tips */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CheckCircle color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Essential Safety Tips
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {safetyTips.map((tip, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', p: 2 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      {tip.icon}
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {tip.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tip.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Red Flags */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Warning color="error" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Warning Signs (Red Flags)
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Be cautious if you encounter any of these warning signs:
            </Typography>

            <List dense>
              {redFlags.map((flag, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Block color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={flag}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Common Scams */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Report color="warning" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Common Scam Types
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Stay informed about these common fraudulent schemes:
            </Typography>

            <Stack spacing={2}>
              {scamTypes.map((scam, index) => (
                <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {scam.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {scam.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Transaction Security */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <MoneyOff color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Secure Transaction Guidelines
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Payment sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Payment Methods
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use cash, bank transfers, or verified payment apps. Avoid wire transfers or cryptocurrency for unknown sellers.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <LocationOn sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Meeting Locations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Meet in busy public places like shopping centers, coffee shops, or police station parking lots during daylight hours.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <VerifiedUser sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep records of all communications, screenshots of ads, and receipts of transactions for your protection.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Report Issues */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, bgcolor: 'error.light', borderLeft: 6, borderColor: 'error.main' }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="error.dark">
              Report Suspicious Activity
            </Typography>
            <Typography variant="body1" color="error.dark" mb={3}>
              If you encounter any suspicious behavior, scams, or safety concerns, please report them immediately to help protect other users.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Chip
                icon={<Email />}
                label="support@classifiedads.com"
                clickable
                color="primary"
                onClick={() => window.location.href = 'mailto:support@classifiedads.com?subject=Safety Report'}
              />
              <Chip
                icon={<Phone />}
                label="+234 800 123 4567"
                clickable
                color="primary"
                onClick={() => window.location.href = 'tel:+2348001234567'}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Message */}
      <Box mt={4} textAlign="center">
        <Typography variant="body1" color="text.secondary">
          Remember: Being cautious and following these guidelines doesn't guarantee 100% safety,
          but it significantly reduces your risk when buying on our platform.
        </Typography>
      </Box>
    </Container>
  );
};

export default BuyerSafety;