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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  BusinessCenter,
  School,
  AttachMoney,
  TrendingUp,
  Upload,
  Download,
  Analytics,
  Verified,
  CheckCircle,
  Star,
  Group,
  Timeline,
  MonetizationOn,
  Assignment,
  Support,
  Phone,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AgentProgram = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <AttachMoney color="success" />,
      title: "Earn Commission",
      description: "Earn 70% commission on every educational material sold through your account."
    },
    {
      icon: <Upload color="primary" />,
      title: "Easy Upload Process",
      description: "Simple drag-and-drop interface to upload and manage your educational content."
    },
    {
      icon: <Analytics color="info" />,
      title: "Detailed Analytics",
      description: "Track your sales, earnings, and performance with comprehensive dashboard analytics."
    },
    {
      icon: <Verified color="warning" />,
      title: "Agent Verification",
      description: "Get verified agent status with special badge to build trust with buyers."
    },
    {
      icon: <Support color="secondary" />,
      title: "Dedicated Support",
      description: "Access to dedicated agent support team for technical and sales assistance."
    },
    {
      icon: <TrendingUp color="success" />,
      title: "Marketing Support",
      description: "Your materials get promoted through our marketing channels and featured listings."
    }
  ];

  const requirements = [
    "Must be 18 years or older",
    "Valid email address and phone number",
    "Ability to create or source quality educational materials",
    "Basic computer skills for uploading and managing content",
    "Commitment to providing accurate and helpful educational content",
    "Agreement to our agent terms and conditions"
  ];

  const materialTypes = [
    {
      type: "Academic Courses",
      description: "University-level courses, tutorials, and study materials",
      examples: ["Programming courses", "Business studies", "Engineering materials", "Science tutorials"]
    },
    {
      type: "Professional Skills",
      description: "Career development and professional skill building content",
      examples: ["Digital marketing", "Project management", "Leadership training", "Soft skills"]
    },
    {
      type: "Technical Training",
      description: "Hands-on technical skills and certification preparation",
      examples: ["Software tutorials", "IT certifications", "Technical documentation", "Tool training"]
    },
    {
      type: "Creative Arts",
      description: "Creative skills, design, and artistic development materials",
      examples: ["Graphic design", "Music production", "Writing workshops", "Photography courses"]
    }
  ];

  const commissionStructure = [
    { tier: "Starter Agent", sales: "0 - 10", commission: "60%", benefits: "Basic support" },
    { tier: "Bronze Agent", sales: "11 - 50", commission: "65%", benefits: "Priority listing" },
    { tier: "Silver Agent", sales: "51 - 100", commission: "70%", benefits: "Featured materials" },
    { tier: "Gold Agent", sales: "101 - 200", commission: "75%", benefits: "Premium support" },
    { tier: "Platinum Agent", sales: "200+", commission: "80%", benefits: "All benefits + bonuses" }
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "Join the Program",
      description: "Click 'Become an Agent' in your dashboard or contact our support team."
    },
    {
      step: 2,
      title: "Account Verification",
      description: "Complete the verification process by providing required documentation."
    },
    {
      step: 3,
      title: "Upload Your First Material",
      description: "Create your first educational material listing with detailed description and pricing."
    },
    {
      step: 4,
      title: "Start Earning",
      description: "Once approved, your materials go live and you start earning from sales."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <BusinessCenter sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Agent Program
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Monetize your knowledge by selling educational materials on our platform
        </Typography>
      </Box>

      {/* Program Overview */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Turn Your Expertise Into Income
        </Typography>
        <Typography>
          Join our agent program to share your knowledge and earn money by creating and selling
          educational materials. From courses to tutorials, help others learn while building a
          sustainable income stream.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Benefits */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Star color="warning" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Agent Program Benefits
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', p: 2 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      {benefit.icon}
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Commission Structure */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <MonetizationOn color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Commission Structure
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              Our tiered commission system rewards top-performing agents with higher earnings and exclusive benefits.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Agent Tier</strong></TableCell>
                    <TableCell><strong>Monthly Sales</strong></TableCell>
                    <TableCell><strong>Commission Rate</strong></TableCell>
                    <TableCell><strong>Additional Benefits</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionStructure.map((tier, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography fontWeight={600} color="primary.main">
                          {tier.tier}
                        </Typography>
                      </TableCell>
                      <TableCell>{tier.sales}</TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="success.main">
                          {tier.commission}
                        </Typography>
                      </TableCell>
                      <TableCell>{tier.benefits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Requirements */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 4, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Assignment color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Requirements
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              To join our agent program, you must meet these basic requirements:
            </Typography>

            <List dense>
              {requirements.map((requirement, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={requirement}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Material Types */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <School color="info" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Types of Books
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" mb={3}>
              We accept a wide variety of books across different categories:
            </Typography>

            <Grid container spacing={3}>
              {materialTypes.map((material, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary.main">
                      {material.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {material.description}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      Examples:
                    </Typography>
                    <Box>
                      {material.examples.map((example, exampleIndex) => (
                        <Chip
                          key={exampleIndex}
                          label={example}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Getting Started */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Timeline color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                How to Get Started
              </Typography>
            </Box>

            <Stack spacing={3}>
              {gettingStartedSteps.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 3 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {step.step}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Box mt={4} textAlign="center">
              <Button
                variant="contained"
                size="large"
                startIcon={<BusinessCenter />}
                onClick={() => navigate('/dashboard')}
                sx={{ px: 4, py: 1.5 }}
              >
                Join Agent Program
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Success Stories */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Group color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Success Stories
              </Typography>
            </Box>

            <Stack spacing={3}>
              <Box sx={{ p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  ₦2.5M+ Earned
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our top agents have earned over ₦2.5 million by sharing their expertise through quality educational materials.
                </Typography>
              </Box>

              <Box sx={{ p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  500+ Active Agents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join a thriving community of educators, professionals, and content creators making money from their knowledge.
                </Typography>
              </Box>

              <Box sx={{ p: 3, bgcolor: 'warning.light', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  10,000+ Students Helped
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our agents have helped over 10,000 students and professionals advance their careers through quality education.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Support Contact */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4, bgcolor: 'primary.light', borderLeft: 6, borderColor: 'primary.main' }}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary.dark">
              Ready to Become an Agent?
            </Typography>
            <Typography variant="body1" color="primary.dark" mb={3}>
              Have questions about our agent program? Our dedicated agent support team is here to help you
              get started and succeed. Contact us for more information or assistance with your application.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Chip
                icon={<Email />}
                label="agents@classifiedads.com"
                clickable
                color="primary"
                onClick={() => window.location.href = 'mailto:agents@classifiedads.com?subject=Agent Program Inquiry'}
              />
              <Chip
                icon={<Phone />}
                label="+234 800 123 4567"
                clickable
                color="primary"
                onClick={() => window.location.href = 'tel:+2348001234567'}
              />
              <Button
                variant="contained"
                startIcon={<BusinessCenter />}
                onClick={() => navigate('/dashboard')}
              >
                Apply Now
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Message */}
      <Box mt={4} textAlign="center">
        <Typography variant="body1" color="text.secondary">
          Start your journey as an educational content creator today and turn your expertise into a rewarding income stream!
        </Typography>
      </Box>
    </Container>
  );
};

export default AgentProgram;