import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  DialogActions,
  Drawer,
  SwipeableDrawer,
  AppBar,
  Toolbar
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
  Timeline,
  Menu as MenuIcon,
  Close as CloseIcon,
  AdminPanelSettings,
  Support,
  LibraryBooks
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';
import { globalThrottler } from '../utils/requestThrottle';

// Sub-components
import ProfileSection from '../components/dashboard/ProfileSection';
import MyAdsSection from '../components/dashboard/MyAdsSection';
import MessagesSection from '../components/dashboard/MessagesSection';
import AnalyticsSection from '../components/dashboard/AnalyticsSection';
import AgentSection from '../components/dashboard/AgentSection';
import AffiliateSection from '../components/dashboard/AffiliateSection';
import EducationalMaterialsSection from '../components/dashboard/EducationalMaterialsSection';
import PaymentHistorySection from '../components/dashboard/PaymentHistorySection';
import AccountSettingsSection from '../components/dashboard/AccountSettingsSection';

// Admin components
import AdminMaterialsManagement from '../pages/AdminMaterialsManagement';
import AdminSupportManagement from '../pages/AdminSupportManagement';

// Common components
import StatCard from '../components/common/StatCard';
import ModernStatCard from '../components/common/ModernStatCard';
import EnhancedStatCard from '../components/common/EnhancedStatCard';
import StatCardsContainer from '../components/common/StatCardsContainer';

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

// Admin navigation items for admin users
const getAdminNavItems = (user) => user?.is_admin ? [
  {
    id: 'admin-materials',
    label: 'Admin Materials',
    icon: <LibraryBooks />,
    badge: null,
    description: 'Manage educational materials'
  },
  {
    id: 'admin-support',
    label: 'Admin Support',
    icon: <Support />,
    badge: null,
    description: 'Manage support tickets'
  }
] : [];

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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'overview';
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const { callApi } = useApi();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const retryTimeoutRef = useRef(null);

  const fetchDashboardData = async (retryCount = 0) => {
    const maxRetries = 2;
    const baseDelay = 3000; // 3 seconds base delay

    // Throttle requests to prevent spam (except for retries)
    if (retryCount === 0 && globalThrottler.shouldThrottle('dashboard', 2000)) {
      console.log('Dashboard request throttled');
      return;
    }

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    try {
      if (retryCount === 0) {
        setLoading(true);
        setError(null);
      }

      const data = await callApi('GET', '/dashboard');
      setDashboardData(data);
      setError(null);
    } catch (error) {
      console.error(`Dashboard API error (attempt ${retryCount + 1}):`, error);

      if (error.response?.status === 429) {
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // 3s, 6s, 12s
          toast.info(`Rate limited. Waiting ${delay / 1000} seconds before retry...`);

          retryTimeoutRef.current = setTimeout(() => {
            fetchDashboardData(retryCount + 1);
          }, delay);
          return;
        } else {
          toast.error('Rate limit exceeded. Please wait several minutes before refreshing.');
          setError('rate_limit');
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        return;
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
        setError('server_error');
      } else {
        toast.error('Failed to load dashboard. Please try again.');
        setError('general');
      }

      // Set fallback data (except for auth errors)
      if (error.response?.status !== 401) {
        setDashboardData({
          user: user || null,
          stats: { total_ads: 0, active_ads: 0, total_views: 0, unread_messages: 0 },
          ads: [],
          conversations: [],
          analytics: {},
          materials: [],
          affiliate: {},
          payments: [],
          recent_activity: []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle URL tab parameter changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  // Separate effect for initial load only
  useEffect(() => {
    fetchDashboardData();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // const handleTabChange = (event, newValue) => {
  //   setActiveTab(newValue);
  // };

  const navItems = getDashboardNavItems(dashboardData?.user || user);
  const adminNavItems = getAdminNavItems(dashboardData?.user || user);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  const renderSidebarContent = () => (
    <Box sx={{ width: '100%' }}>
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
            {user?.is_admin && (
              <Chip label="Admin" size="small" color="error" />
            )}
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
            onClick={() => handleTabChange(item.id)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '& .MuiListItemText-primary': {
                  color: 'white',
                  fontWeight: 600,
                }
              },
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
                '& .MuiListItemText-primary': {
                  color: 'white',
                }
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

        {/* Admin Section */}
        {adminNavItems.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="caption"
              sx={{
                px: 2,
                mb: 1,
                display: 'block',
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />
              Admin Panel
            </Typography>
            {adminNavItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255, 255, 255, 0.8)',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: activeTab === item.id ? 600 : 500
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
              </ListItemButton>
            ))}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Quick Actions */}
        <ListItemButton
          onClick={() => handleTabChange('help')}
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
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection data={dashboardData} onRefresh={fetchDashboardData} setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfileSection user={dashboardData?.user || user} onRefresh={fetchDashboardData} />;
      case 'my-ads':
        return <MyAdsSection ads={dashboardData?.ads || []} onRefresh={fetchDashboardData} />;
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
        return <PaymentHistorySection />;
      case 'settings':
        return <AccountSettingsSection user={dashboardData?.user || user} onRefresh={fetchDashboardData} />;
      case 'help':
        return <HelpSupportSection />;
      case 'admin-materials':
        return <AdminMaterialsManagement />;
      case 'admin-support':
        return <AdminSupportManagement />;
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

  // Error state with retry option
  if (error && !dashboardData) {
    const getErrorMessage = () => {
      switch (error) {
        case 'rate_limit':
          return {
            title: 'Too Many Requests',
            description: 'The server is receiving too many requests. Please wait a moment before trying again.',
            icon: '⏰'
          };
        case 'server_error':
          return {
            title: 'Server Error',
            description: 'There seems to be an issue with the server. Please try again later.',
            icon: '🔧'
          };
        default:
          return {
            title: 'Connection Error',
            description: 'Unable to load dashboard data. Please check your connection and try again.',
            icon: '🔌'
          };
      }
    };

    const errorInfo = getErrorMessage();

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h2" sx={{ mb: 2, fontSize: '3rem' }}>
              {errorInfo.icon}
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {errorInfo.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {errorInfo.description}
            </Typography>
            <Stack spacing={2} direction="row" justifyContent="center">
              <Button
                variant="contained"
                onClick={() => fetchDashboardData(0)}
                disabled={loading}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileNavOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box sx={{
            width: 300,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <Box sx={{
              p: 2,
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflowY: 'auto'
            }}>
              {renderSidebarContent()}
            </Box>
          </Box>
        )}

        {/* Mobile Navigation Drawer */}
        <SwipeableDrawer
          anchor="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onOpen={() => setMobileNavOpen(true)}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton onClick={() => setMobileNavOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            {renderSidebarContent()}
          </Box>
        </SwipeableDrawer>

        {/* Main Content Area */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: { xs: 'calc(100vh - 64px)', md: '100vh' },
          overflow: 'hidden',
          width: '100%'
        }}>
          <Box sx={{
            flex: 1,
            py: { xs: 1, md: 2 },
            px: { xs: 1, md: 2 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto'
          }}>
            <Paper sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              overflow: 'auto',
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              {renderTabContent()}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
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
      await callApi('POST', '/user/become-agent');
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
      await callApi('POST', '/user/become-affiliate');
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
    <Box sx={{
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      margin: '0 auto'
    }}>
      {/* Header Section */}
      <Box sx={{
        mb: { xs: 2, md: 3 },
        textAlign: { xs: 'left', md: 'center' },
        width: '100%'
      }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Welcome back, {user.name}! 👋
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', md: '1rem' },
            lineHeight: 1.6,
            maxWidth: { md: '600px' },
            margin: { md: '0 auto' }
          }}
        >
          Here's what's happening with your account
        </Typography>
      </Box>

      {/* Quick Stats */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
      >
        <EnhancedStatCard
          icon={Store}
          value={stats.total_ads || 0}
          label="Total Ads"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={TrendingUp}
          value={stats.active_ads || 0}
          label="Active Ads"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={Visibility}
          value={stats.total_views || 0}
          label="Total Views"
          color="#06b6d4"
          size="medium"
        />

        <EnhancedStatCard
          icon={Message}
          value={stats.unread_messages || 0}
          label="New Messages"
          color="#f59e0b"
          size="medium"
        />
      </StatCardsContainer>

      {/* Account Status and Quick Actions */}
      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
        sx={{
          mb: { xs: 2, md: 3 },
          width: '100%',
          margin: 0
        }}
      >
        <Grid item xs={12} lg={6}>
          <Card sx={{
            p: { xs: 2, md: 2.5 },
            height: '100%',
            minHeight: { md: 280 }
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Account Status
            </Typography>
            <Stack spacing={{ xs: 2.5, md: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 'fit-content',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', md: '0.9rem' }
                  }}
                >
                  Email Verification
                </Typography>
                <Chip
                  label={user.email_verified_at ? "Verified" : "Pending"}
                  color={user.email_verified_at ? "success" : "warning"}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 'fit-content',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', md: '0.9rem' }
                  }}
                >
                  Profile Verification
                </Typography>
                <Chip
                  label={user.is_verified ? "Verified" : "Unverified"}
                  color={user.is_verified ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 'fit-content',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', md: '0.9rem' }
                  }}
                >
                  Agent Status
                </Typography>
                <Chip
                  label={user.is_agent ? "Active Agent" : "Regular User"}
                  color={user.is_agent ? "info" : "default"}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 'fit-content',
                    fontWeight: 500,
                    fontSize: { xs: '0.875rem', md: '0.9rem' }
                  }}
                >
                  Affiliate Status
                </Typography>
                <Chip
                  label={user.is_affiliate ? "Active Affiliate" : "Not Enrolled"}
                  color={user.is_affiliate ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              {user.is_admin && (
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: 'fit-content',
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', md: '0.9rem' }
                    }}
                  >
                    Admin Status
                  </Typography>
                  <Chip
                    label="Administrator"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 500 }}
                    icon={<AdminPanelSettings fontSize="small" />}
                  />
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{
            p: { xs: 2, md: 2.5 },
            height: '100%',
            minHeight: { md: 280 }
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Stack spacing={{ xs: 2, md: 2.5 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => window.location.href = '/post-ad'}
                sx={{
                  justifyContent: 'flex-start',
                  py: { xs: 1.5, md: 1.75 },
                  fontSize: { xs: '0.875rem', md: '0.9rem' },
                  fontWeight: 500
                }}
              >
                Post New Ad
              </Button>

              {!user.is_agent && (
                <Button
                  variant="outlined"
                  startIcon={<BusinessCenter />}
                  fullWidth
                  onClick={handleBecomeAgent}
                  disabled={loading}
                  sx={{
                    justifyContent: 'flex-start',
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: '0.875rem', md: '0.9rem' },
                    fontWeight: 500
                  }}
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
                  sx={{
                    justifyContent: 'flex-start',
                    py: { xs: 1.5, md: 1.75 },
                    fontSize: { xs: '0.875rem', md: '0.9rem' },
                    fontWeight: 500
                  }}
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
        <Card sx={{
          p: { xs: 2, md: 2.5 },
          mb: { xs: 1, md: 2 }
        }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Recent Activity
          </Typography>
          <List sx={{ p: 0 }}>
            {data.recent_activity.slice(0, 5).map((activity, index) => (
              <ListItem
                key={index}
                divider={index < 4}
                sx={{
                  px: 0,
                  py: { xs: 1.5, md: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 2 }
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: '0.875rem', md: '0.9rem' }
                      }}
                    >
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        mt: 0.5
                      }}
                    >
                      {activity.description}
                    </Typography>
                  }
                  sx={{ flex: 1, m: 0 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.8rem' },
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
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
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Help sx={{ fontSize: { xs: 28, md: 32 }, color: 'primary.main', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Frequently Asked Questions
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
              Find answers to common questions about using the platform
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                  How do I post an ad?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Go to "My Ads" section and click "Post New Ad" or use the main navigation menu.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                  How do I become an agent?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  From your dashboard overview, click "Become an Agent" to start selling educational materials.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Chat sx={{ fontSize: { xs: 28, md: 32 }, color: 'success.main', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Contact Support
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
              Need personalized help? Our support team is here for you
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                  📧 Email Support
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  support@eunixmac.com
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
                  Response within 24 hours
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                  📞 Phone Support
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  +234 800 123 4567
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
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
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open('/seller-guide', '_blank')}
            >
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
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open('/buyer-safety', '_blank')}
            >
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
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open('/agent-program', '_blank')}
            >
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