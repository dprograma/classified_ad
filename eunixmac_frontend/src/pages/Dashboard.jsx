import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Tab,
  Tabs,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  useTheme,
  useMediaQuery,
  Container,
  Alert,
  LinearProgress,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Person,
  Store,
  TrendingUp,
  Message,
  Analytics,
  AccountCircle,
  Settings,
  Verified,
  Add,
  Edit,
  Delete,
  Visibility,
  Share,
  Star,
  Payment,
  School,
  Group,
  Notifications,
  Help,
  ExitToApp,
  AttachMoney,
  ShoppingBag,
  BusinessCenter,
  Chat,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

// Sub-components
import ProfileSection from '../components/dashboard/ProfileSection';
import MyAdsSection from '../components/dashboard/MyAdsSection';
import BoostSection from '../components/dashboard/BoostSection';
import MessagesSection from '../components/dashboard/MessagesSection';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import AgentSection from '../components/dashboard/AgentSection';
import AffiliateSection from '../components/dashboard/AffiliateSection';
import EducationalMaterialsSection from '../components/dashboard/EducationalMaterialsSection';
import PaymentHistorySection from '../components/dashboard/PaymentHistorySection';
import AccountSettingsSection from '../components/dashboard/AccountSettingsSection';

// Dashboard navigation items based on jiji.ng structure
const getDashboardNavItems = (user) => [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Analytics />,
    badge: null
  },
  {
    id: 'my-ads',
    label: 'My Ads',
    icon: <Store />,
    badge: user?.ads_count || 0
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <Message />,
    badge: user?.unread_messages || 0
  },
  {
    id: 'boost',
    label: 'Boost Ads',
    icon: <TrendingUp />,
    badge: user?.active_boosts || 0
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <Person />,
    badge: user?.is_verified ? <Verified color="primary" fontSize="small" /> : null
  },
  ...(user?.is_agent ? [{
    id: 'agent',
    label: 'Agent Center',
    icon: <BusinessCenter />,
    badge: user?.pending_materials || 0
  }] : []),
  ...(user?.is_agent ? [{
    id: 'educational-materials',
    label: 'My Materials',
    icon: <School />,
    badge: user?.materials_count || 0
  }] : []),
  ...(user?.is_affiliate ? [{
    id: 'affiliate',
    label: 'Affiliate Program',
    icon: <Group />,
    badge: user?.referral_earnings ? <AttachMoney fontSize="small" color="success" /> : null
  }] : []),
  {
    id: 'payments',
    label: 'Payment History',
    icon: <Payment />,
    badge: null
  },
  {
    id: 'settings',
    label: 'Account Settings',
    icon: <Settings />,
    badge: null
  }
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { callApi } = useApi();
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await callApi('GET', '/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleTabChange = (event, newValue) => {
  //   setActiveTab(newValue);
  // };

  const navItems = getDashboardNavItems(dashboardData?.user || user);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection data={dashboardData} onRefresh={fetchDashboardData} setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileSection user={dashboardData?.user || user} onRefresh={fetchDashboardData} />;
      case 'my-ads':
        return <MyAdsSection ads={dashboardData?.ads || []} onRefresh={fetchDashboardData} />;
      case 'boost':
        return <BoostSection ads={dashboardData?.ads || []} onRefresh={fetchDashboardData} />;
      case 'messages':
        return <MessagesSection conversations={dashboardData?.conversations || []} onRefresh={fetchDashboardData} />;
      case 'analytics':
        return <AnalyticsSection stats={dashboardData?.analytics || {}} />;
      case 'agent':
        return <AgentSection materials={dashboardData?.materials || []} onRefresh={fetchDashboardData} />;
      case 'educational-materials':
        return <EducationalMaterialsSection materials={dashboardData?.materials || []} onRefresh={fetchDashboardData} />;
      case 'affiliate':
        return <AffiliateSection affiliateData={dashboardData?.affiliate || {}} onRefresh={fetchDashboardData} />;
      case 'payments':
        return <PaymentHistorySection payments={dashboardData?.payments || []} />;
      case 'settings':
        return <AccountSettingsSection user={dashboardData?.user || user} onRefresh={fetchDashboardData} />;
      case 'help':
        return <HelpSupportSection />;
      default:
        return <OverviewSection data={dashboardData} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, maxWidth: '100%', width: '100%' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <LinearProgress sx={{ width: '200px' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', minHeight: '80vh', gap: 3 }}>
        {/* Sidebar Navigation */}
        <Box sx={{ 
          width: { xs: '100%', md: '300px' }, 
          flexShrink: 0,
          mb: { xs: 2, md: 0 }
        }}>
          <Paper sx={{ 
            p: 2, 
            position: { md: 'sticky' }, 
            top: { md: '20px' },
            height: 'fit-content'
          }}>
            {/* User Profile Header */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar 
                src={user?.profile_picture} 
                sx={{ width: 56, height: 56 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" noWrap>
                    {user?.name}
                  </Typography>
                  {user?.is_verified && (
                    <Verified color="primary" fontSize="small" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  {user?.is_agent && (
                    <Chip label="Agent" size="small" color="info" />
                  )}
                  {user?.is_affiliate && (
                    <Chip label="Affiliate" size="small" color="success" />
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Navigation Items */}
            <List component="nav" sx={{ p: 0 }}>
              {navItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {typeof item.badge === 'number' && item.badge > 0 ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.badge ? (
                      <Badge badgeContent={item.badge}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: activeTab === item.id ? 600 : 500
                    }}
                  />
                </ListItemButton>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Quick Actions */}
              <ListItemButton 
                onClick={() => setActiveTab('help')}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Help />
                </ListItemIcon>
                <ListItemText 
                  primary="Help & Support" 
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={logout}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </List>
          </Paper>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1,
          minWidth: 0, // Prevents flex item from overflowing
          width: { xs: '100%', md: 'calc(100% - 324px)' }
        }}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            minHeight: '75vh',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {renderTabContent()}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

// Overview Section Component
const OverviewSection = ({ data, onRefresh, setActiveTab }) => {
  // const theme = useTheme();
  const user = data?.user || {};
  const stats = data?.stats || {};
  const { callApi, loading } = useApi();
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [affiliateDialogOpen, setAffiliateDialogOpen] = useState(false);

  const handleBecomeAgent = () => {
    setAgentDialogOpen(true);
  };

  const handleBecomeAffiliate = () => {
    setAffiliateDialogOpen(true);
  };

  const confirmBecomeAgent = async () => {
    try {
      const response = await callApi('POST', '/user/become-agent');
      toast.success('Congratulations! You are now an agent. You can start uploading educational materials.');
      setAgentDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming agent:', error);
      toast.error(error.message || 'Failed to become an agent. Please try again.');
      setAgentDialogOpen(false);
    }
  };

  const confirmBecomeAffiliate = async () => {
    try {
      const response = await callApi('POST', '/user/become-affiliate');
      toast.success('Welcome to our affiliate program! Your unique referral link has been generated.');
      setAffiliateDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming affiliate:', error);
      toast.error(error.message || 'Failed to join affiliate program. Please try again.');
      setAffiliateDialogOpen(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Welcome back, {user.name}! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your account
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Store sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.total_ads || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Ads
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.active_ads || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Ads
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Visibility sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.total_views || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Views
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Message sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {stats.unread_messages || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New Messages
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Account Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Email Verification</Typography>
                <Chip
                  label={user.email_verified_at ? "Verified" : "Pending"}
                  color={user.email_verified_at ? "success" : "warning"}
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Profile Verification</Typography>
                <Chip
                  label={user.is_verified ? "Verified" : "Unverified"}
                  color={user.is_verified ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Agent Status</Typography>
                <Chip
                  label={user.is_agent ? "Active Agent" : "Regular User"}
                  color={user.is_agent ? "info" : "default"}
                  size="small"
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Affiliate Status</Typography>
                <Chip
                  label={user.is_affiliate ? "Active Affiliate" : "Not Enrolled"}
                  color={user.is_affiliate ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                fullWidth
                onClick={() => window.location.href = '/post-ad'}
              >
                Post New Ad
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                fullWidth
                disabled={!stats.active_ads}
                onClick={() => setActiveTab('boost')}
              >
                Boost My Ads
              </Button>
              {!user.is_agent && (
                <Button
                  variant="outlined"
                  startIcon={<BusinessCenter />}
                  fullWidth
                  onClick={handleBecomeAgent}
                  disabled={loading}
                >
                  Become an Agent
                </Button>
              )}
              {!user.is_affiliate && (
                <Button
                  variant="outlined"
                  startIcon={<Group />}
                  fullWidth
                  onClick={handleBecomeAffiliate}
                  disabled={loading}
                >
                  Join Affiliate Program
                </Button>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      {data?.recent_activity && data.recent_activity.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {data.recent_activity.slice(0, 5).map((activity, index) => (
              <ListItem key={index} divider={index < 4}>
                <ListItemText
                  primary={activity.title}
                  secondary={activity.description}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.created_at).toLocaleDateString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Become Agent Confirmation Dialog */}
      <Dialog
        open={agentDialogOpen}
        onClose={() => setAgentDialogOpen(false)}
        aria-labelledby="agent-dialog-title"
        aria-describedby="agent-dialog-description"
      >
        <DialogTitle id="agent-dialog-title">
          Become an Agent
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="agent-dialog-description">
            Are you sure you want to become an agent? As an agent, you will be able to:
            <br />• Upload and sell educational materials
            <br />• Earn commission from sales
            <br />• Access agent-only features and dashboard
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgentDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmBecomeAgent} variant="contained" disabled={loading} autoFocus>
            Yes, Become Agent
          </Button>
        </DialogActions>
      </Dialog>

      {/* Become Affiliate Confirmation Dialog */}
      <Dialog
        open={affiliateDialogOpen}
        onClose={() => setAffiliateDialogOpen(false)}
        aria-labelledby="affiliate-dialog-title"
        aria-describedby="affiliate-dialog-description"
      >
        <DialogTitle id="affiliate-dialog-title">
          Join Affiliate Program
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="affiliate-dialog-description">
            Are you sure you want to join our affiliate program? As an affiliate, you will:
            <br />• Get a unique referral link to share
            <br />• Earn commission for every successful referral
            <br />• Access affiliate tracking and analytics
            <br />• Receive regular commission payouts
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAffiliateDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmBecomeAffiliate} variant="contained" disabled={loading} autoFocus>
            Yes, Join Program
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Help & Support Section Component
const HelpSupportSection = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Help & Support 🛟
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Get help with your account, ads, and platform features
      </Typography>

      {/* FAQ Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Help sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Frequently Asked Questions
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Find answers to common questions about using the platform
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  How do I post an ad?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to "My Ads" section and click "Post New Ad" or use the main navigation menu.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  What is ad boosting?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Boosting makes your ad more visible to potential buyers by featuring it prominently.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  How do I become an agent?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From your dashboard overview, click "Become an Agent" to start selling educational materials.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chat sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Contact Support
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Need personalized help? Our support team is here for you
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📧 Email Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  support@eunixmac.com
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Response within 24 hours
                </Typography>
              </Box>
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  📞 Phone Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +234 800 123 4567
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mon-Fri, 9AM-6PM WAT
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Resources Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Store sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Seller Guide
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Learn how to create effective ads, manage your listings, and maximize sales
            </Typography>
            <Button variant="outlined" size="small">
              View Guide
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <ShoppingBag sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Buyer Safety
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tips for safe buying, avoiding scams, and protecting your personal information
            </Typography>
            <Button variant="outlined" size="small">
              Safety Tips
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <BusinessCenter sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Agent Program
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Everything you need to know about selling educational materials as an agent
            </Typography>
            <Button variant="outlined" size="small">
              Learn More
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Feedback Section */}
      <Card sx={{ p: 3, mt: 4, textAlign: 'center', backgroundColor: 'primary.light' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Still need help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We're here to help! Send us a message and we'll get back to you as soon as possible.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          href="mailto:support@eunixmac.com"
          sx={{ mr: 2 }}
        >
          Send Message
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          href="tel:+2348001234567"
        >
          Call Support
        </Button>
      </Card>
    </Box>
  );
};

export default Dashboard;