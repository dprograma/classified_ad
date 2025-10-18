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
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Store,
  PhotoCamera,
  Description,
  TrendingUp,
  AttachMoney,
  Verified,
  Star,
  Visibility,
  Edit,
  Share,
  Schedule,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  Lightbulb
} from '@mui/icons-material';

const SellerGuide = () => {
  const postingSteps = [
    {
      label: 'Choose the Right Category',
      description: 'Select the most appropriate category for your item to reach the right buyers.',
      tips: ['Browse similar items to see which category they use', 'Use subcategories when available']
    },
    {
      label: 'Take High-Quality Photos',
      description: 'Clear, well-lit photos significantly increase your chances of selling.',
      tips: ['Use natural lighting when possible', 'Show multiple angles', 'Include close-ups of important details', 'Clean the item before photographing']
    },
    {
      label: 'Write a Compelling Title',
      description: 'Create a clear, descriptive title that buyers will search for.',
      tips: ['Include brand, model, and key features', 'Keep it under 60 characters', 'Avoid excessive capitalization or special characters']
    },
    {
      label: 'Provide Detailed Description',
      description: 'Include all relevant information to help buyers make informed decisions.',
      tips: ['Mention condition, age, and any defects', 'Include dimensions, specifications', 'Explain why you\'re selling', 'Be honest about any issues']
    },
    {
      label: 'Set a Competitive Price',
      description: 'Research similar items to price competitively while maximizing your return.',
      tips: ['Check completed sales, not just asking prices', 'Consider item condition and market demand', 'Leave room for negotiation']
    }
  ];

  const sellingTips = [
    {
      icon: <PhotoCamera color="primary" />,
      title: "Perfect Your Photos",
      description: "Use good lighting, clean backgrounds, and show multiple angles. Quality photos can increase inquiries by 300%."
    },
    {
      icon: <AttachMoney color="primary" />,
      title: "Price Strategically",
      description: "Research market prices and consider starting slightly higher to allow for negotiation."
    },
    {
      icon: <Description color="primary" />,
      title: "Write Detailed Descriptions",
      description: "Include all relevant details, specifications, and condition information to build buyer confidence."
    },
    {
      icon: <Schedule color="primary" />,
      title: "Respond Quickly",
      description: "Fast responses to inquiries show professionalism and keep buyers engaged."
    },
    {
      icon: <Verified color="primary" />,
      title: "Build Your Reputation",
      description: "Complete transactions professionally to earn positive reviews and verification badges."
    }
  ];

  const bestPractices = [
    {
      category: "Communication",
      practices: [
        "Respond to messages within 24 hours",
        "Be professional and courteous in all interactions",
        "Provide accurate information about availability",
        "Set clear expectations about pickup/delivery"
      ]
    },
    {
      category: "Safety",
      practices: [
        "Meet in public, well-lit locations",
        "Bring a friend when meeting buyers",
        "Trust your instincts about potential buyers",
        "Verify payment before releasing items"
      ]
    },
    {
      category: "Optimization",
      practices: [
        "Refresh your ad every few days to maintain visibility",
        "Update pricing based on market response",
        "Cross-post to multiple platforms if allowed",
        "Use relevant keywords in titles and descriptions"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Store sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Seller's Guide
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Everything you need to know to sell successfully on our platform
        </Typography>
      </Box>

      {/* Quick Start Alert */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ready to Start Selling?
        </Typography>
        <Typography>
          Follow this comprehensive guide to create effective listings, attract buyers, and complete successful transactions.
          Great sellers can earn significant income while helping others find what they need.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* How to Post an Ad */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Edit color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                How to Post an Effective Ad
              </Typography>
            </Box>

            <Stepper orientation="vertical">
              {postingSteps.map((step, index) => (
                <Step key={index} active={true}>
                  <StepLabel>
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      {step.description}
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1} color="primary.main">
                        Pro Tips:
                      </Typography>
                      <List dense>
                        {step.tips.map((tip, tipIndex) => (
                          <ListItem key={tipIndex} sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={tip}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Quick Tips Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 4, position: 'sticky', top: 20 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Lightbulb color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Quick Success Tips
              </Typography>
            </Box>

            <Stack spacing={3}>
              {sellingTips.map((tip, index) => (
                <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    {tip.icon}
                    <Typography variant="subtitle2" fontWeight={600}>
                      {tip.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tip.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Best Practices */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Star color="warning" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Selling Best Practices
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {bestPractices.map((section, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', p: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary.main">
                      {section.category}
                    </Typography>
                    <List dense>
                      {section.practices.map((practice, practiceIndex) => (
                        <ListItem key={practiceIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={practice}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Building Reputation */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Verified color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Building Your Seller Reputation
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              A strong reputation leads to more sales, higher prices, and buyer trust.
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary.main">
                  Profile Verification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete profile verification to get a verified badge and increase buyer confidence.
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main">
                  Positive Reviews
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deliver excellent customer service to earn 5-star reviews from satisfied buyers.
                </Typography>
              </Box>

              <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="warning.main">
                  Response Time
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quick responses to inquiries improve your seller rating and attract more buyers.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Support Contact */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, bgcolor: 'primary.light', borderLeft: 6, borderColor: 'primary.main' }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary.dark">
              Need Help Selling?
            </Typography>
            <Typography variant="body1" color="primary.dark" mb={3}>
              Our support team is here to help you succeed. Contact us for personalized selling advice,
              technical support, or any questions about our platform.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Chip
                icon={<Email />}
                label="support@classifiedads.com"
                clickable
                color="primary"
                onClick={() => window.location.href = 'mailto:support@classifiedads.com?subject=Seller Support'}
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
          Ready to start selling? <strong>Post your first ad</strong> and join thousands of successful sellers on our platform!
        </Typography>
      </Box>
    </Container>
  );
};

export default SellerGuide;