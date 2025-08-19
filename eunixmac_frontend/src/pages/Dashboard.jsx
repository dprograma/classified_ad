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
  Tooltip
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
        return <OverviewSection data={dashboardData} />;
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
      default:
        return <OverviewSection data={dashboardData} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <LinearProgress sx={{ width: '200px' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
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
                <Box display="flex" gap={1} mt={1}>
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
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
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
                      fontWeight: activeTab === item.id ? 600 : 400
                    }}
                  />
                </ListItemButton>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Quick Actions */}
              <ListItemButton onClick={() => window.open('/help', '_blank')}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Help />
                </ListItemIcon>
                <ListItemText primary="Help & Support" />
              </ListItemButton>
              
              <ListItemButton onClick={logout}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {renderTabContent()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Overview Section Component
const OverviewSection = ({ data }) => {
  // const theme = useTheme();
  const user = data?.user || {};
  const stats = data?.stats || {};

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
              >
                Boost My Ads
              </Button>
              {!user.is_agent && (
                <Button
                  variant="outlined"
                  startIcon={<BusinessCenter />}
                  fullWidth
                >
                  Become an Agent
                </Button>
              )}
              {!user.is_affiliate && (
                <Button
                  variant="outlined"
                  startIcon={<Group />}
                  fullWidth
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
    </Box>
  );
};

export default Dashboard;