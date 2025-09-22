import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  Help as HelpIcon,
  ContactSupport,
  QuestionAnswer,
  BugReport,
  Feedback,
  Send,
  CheckCircle
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const Help = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { callApi, loading } = useApi();

  const supportCategories = [
    { value: 'verification', label: 'Profile Verification', icon: <CheckCircle /> },
    { value: 'payment', label: 'Payment Issues', icon: <ContactSupport /> },
    { value: 'technical', label: 'Technical Support', icon: <BugReport /> },
    { value: 'account', label: 'Account Issues', icon: <QuestionAnswer /> },
    { value: 'feedback', label: 'General Feedback', icon: <Feedback /> }
  ];

  const faqData = [
    {
      question: "How do I get my profile verified?",
      answer: "To get your profile verified, please contact our support team with your verification request. Include your full name, valid ID document, and reason for verification. Our team will review your request within 2-3 business days."
    },
    {
      question: "Why is my payment not going through?",
      answer: "Payment issues can occur due to insufficient funds, expired card details, or network issues. Please check your payment method and try again. If the issue persists, contact our support team."
    },
    {
      question: "How can I boost my ads?",
      answer: "You can boost your ads from the 'My Ads' section in your dashboard. Click on the boost icon next to your ad, select a boost package, and complete the payment process."
    },
    {
      question: "How do I become an agent?",
      answer: "To become an agent, go to your dashboard overview and click 'Become an Agent'. This will allow you to upload and sell educational materials on our platform."
    },
    {
      question: "What is the affiliate program?",
      answer: "Our affiliate program allows you to earn commissions by referring new users to our platform. You'll get a unique referral link and earn a percentage of every successful referral."
    },
    {
      question: "How do I delete my account?",
      answer: "Currently, account deletion must be requested through our support team. Please contact us with your account deletion request and we'll process it within 7 business days."
    },
    {
      question: "How do I edit or delete my ads?",
      answer: "Go to your dashboard and select 'My Ads'. Find the ad you want to modify and click the edit or delete button. You can update details, images, and pricing at any time."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including bank cards, bank transfers, and mobile money. All payments are processed securely through our verified payment partners."
    },
    {
      question: "How do I report a suspicious ad or user?",
      answer: "Click the 'Report' button on any ad or user profile. Select the reason for reporting and provide additional details. Our moderation team will review reports within 24 hours."
    },
    {
      question: "Can I promote my ads on social media?",
      answer: "Yes! You can share your ads on social media platforms. Use the share button on your ad to get shareable links for Facebook, Twitter, WhatsApp, and other platforms."
    },
    {
      question: "How do I change my password?",
      answer: "Go to Dashboard > Account Settings > Security. Enter your current password and choose a new one. For security, use a strong password with letters, numbers, and symbols."
    },
    {
      question: "What should I do if I'm locked out of my account?",
      answer: "If you can't access your account, use the 'Forgot Password' link on the login page to reset your password. If issues persist, contact our support team with your account details."
    },
    {
      question: "How long do ads stay active?",
      answer: "Regular ads stay active for 30 days. You can refresh them to extend visibility. Boosted ads have varying durations based on the package you choose (3, 7, or 14 days)."
    },
    {
      question: "Is there a limit to how many ads I can post?",
      answer: "Free accounts can post up to 10 active ads. Verified users can post up to 25 ads. Agents have unlimited posting privileges for educational materials."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await callApi('POST', '/support/contact', {
        category: selectedCategory,
        subject,
        message
      });
      
      setSubmitted(true);
      toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setSelectedCategory('');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Help & Support
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Get help with your account, find answers to common questions, or contact our support team
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <ContactSupport color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Contact Support
              </Typography>
            </Box>

            {submitted ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Message Sent Successfully!
                </Typography>
                <Typography>
                  We've received your support request and will get back to you within 24 hours.
                  Check your email for updates.
                </Typography>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Need help? Send us a message and our support team will assist you.
                </Typography>

                {/* Category Selection */}
                <Typography variant="subtitle2" gutterBottom>
                  What do you need help with?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                  {supportCategories.map((category) => (
                    <Chip
                      key={category.value}
                      icon={category.icon}
                      label={category.label}
                      onClick={() => setSelectedCategory(category.value)}
                      color={selectedCategory === category.value ? "primary" : "default"}
                      variant={selectedCategory === category.value ? "filled" : "outlined"}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>

                <TextField
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  margin="normal"
                  placeholder="Brief description of your issue"
                />

                <TextField
                  fullWidth
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  multiline
                  rows={4}
                  margin="normal"
                  placeholder="Describe your issue in detail..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<Send />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Contact Information */}
            <Typography variant="h6" gutterBottom>
              Other Ways to Reach Us
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Support"
                  secondary="support@classifiedads.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone Support"
                  secondary="+234 800 123 4567 (Mon-Fri, 9AM-6PM WAT)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Office Address"
                  secondary="Lagos, Nigeria"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <HelpIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Frequently Asked Questions
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Find quick answers to common questions about our platform.
            </Typography>

            {faqData.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}

            <Box mt={3} p={3} bgcolor="primary.light" borderRadius={2}>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Still Need Help?
              </Typography>
              <Typography variant="body2" color="primary.dark">
                If you can't find the answer you're looking for in our FAQ, 
                don't hesitate to contact our support team using the form on the left. 
                We're here to help!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Response Time Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Support Response Times
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  &lt; 2hrs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Issues
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  &lt; 24hrs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  General Support
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  2-3 days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account Verification
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Help;