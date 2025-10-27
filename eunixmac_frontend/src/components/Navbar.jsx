import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem,
  IconButton, InputBase, Paper, useScrollTrigger, Drawer, List,
  ListItem, ListItemText, ListItemIcon, Divider, Chip, Fade
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { getStorageUrl } from '../config/api';

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 24px rgba(108,71,255,0.08)',
  borderBottom: '1.5px solid rgba(108,71,255,0.08)',
  color: theme.palette.text.primary,
  transition: 'background 0.3s',
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: 32,
  boxShadow: '0 2px 8px rgba(108,71,255,0.08)',
  padding: '2px 12px',
  background: '#fff',
  minWidth: 220,
  maxWidth: 340,
  marginLeft: theme.spacing(2),
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
}));

const AccountButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: 'rgba(108, 71, 255, 0.06)',
    borderColor: 'rgba(108, 71, 255, 0.12)',
    transform: 'translateY(-1px)',
  },
}));

const ModernMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    minWidth: '280px',
    marginTop: '8px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(108, 71, 255, 0.08)',
    border: '1px solid rgba(108, 71, 255, 0.08)',
    overflow: 'visible',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '-6px',
      right: '20px',
      width: '12px',
      height: '12px',
      backgroundColor: '#fff',
      borderLeft: '1px solid rgba(108, 71, 255, 0.08)',
      borderTop: '1px solid rgba(108, 71, 255, 0.08)',
      transform: 'rotate(45deg)',
      zIndex: 1,
    },
  },
  '& .MuiList-root': {
    padding: '12px',
  },
}));

const UserInfoSection = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderBottom: '1px solid rgba(108, 71, 255, 0.08)',
  marginBottom: '8px',
  background: 'linear-gradient(135deg, rgba(108, 71, 255, 0.02) 0%, rgba(0, 198, 174, 0.02) 100%)',
  borderRadius: '12px',
  margin: '0 8px 12px 8px',
}));

const ModernMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '2px 0',
  padding: '12px 16px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(108, 71, 255, 0.06)',
    transform: 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
    color: 'rgba(108, 71, 255, 0.7)',
  },
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontSize: '0.95rem',
  },
}));

const LogoutMenuItem = styled(ModernMenuItem)(({ theme }) => ({
  marginTop: '8px',
  borderTop: '1px solid rgba(108, 71, 255, 0.08)',
  paddingTop: '16px',
  '&:hover': {
    backgroundColor: 'rgba(244, 67, 54, 0.06)',
    '& .MuiListItemIcon-root': {
      color: '#f44336',
    },
    '& .MuiListItemText-primary': {
      color: '#f44336',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'rgba(244, 67, 54, 0.7)',
  },
}));

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { callApi } = useApi();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await callApi('post', '/logout', null, {
        'Authorization': `Bearer ${token}`,
      });
      logout();
      toast.success('Logged out successfully.');
      handleClose();
      navigate('/');
    } catch (error) {
      // Error is already handled by the useApi hook
    }
  };

  const handlePostAdClick = () => {
    if (isAuthenticated) {
      navigate('/post-ad');
    } else {
      navigate('/login?redirect=/post-ad');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const navItems = isAuthenticated ? (
    <>
      <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>Dashboard</MenuItem>
      <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>
      <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>Settings</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </>
  ) : (
    <>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
      <Button color="inherit" component={Link} to="/register">
        Sign Up
      </Button>
    </>
  );

  return (
    <GlassAppBar position="sticky" elevation={0} sx={{ zIndex: 1201 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <LogoBox component={Link} to="/" sx={{ mr: 2 }}>
          {/* Modern logo with icon and text */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="30" height="22" rx="6" fill="#6C47FF" />
              <rect x="8" y="12" width="22" height="14" rx="4" fill="#fff" />
              <rect x="12" y="16" width="14" height="6" rx="2" fill="#00C6AE" />
              <circle cx="32" cy="8" r="4" fill="#FFBF00" stroke="#fff" strokeWidth="2" />
            </svg>
          </Box>
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
              color: 'inherit',
              lineHeight: 1,
            }}
          >
            Eunixma
          </Typography>
        </LogoBox>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1, mx: 2 }}>
          <SearchBar elevation={2} component="form" onSubmit={handleSearch}>
            <InputBase
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              sx={{ ml: 1, flex: 1, fontSize: '1.05rem' }}
            />
            <IconButton type="submit" sx={{ p: '10px', color: 'primary.main' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </SearchBar>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePostAdClick}
            sx={{
              mr: 2,
              px: 3,
              py: 1.2,
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: 2,
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': {
                transform: 'scale(1.06)',
                boxShadow: 4,
              },
            }}
          >
            Post Ad
          </Button>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountButton onClick={handleMenu}>
                <Avatar
                  alt={user?.name}
                  src={user?.profile_picture ? getStorageUrl(user.profile_picture) : user?.picture}
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1,
                    border: '2px solid rgba(108, 71, 255, 0.1)',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                />
                <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                  </Typography>
                </Box>
                <ArrowDownIcon
                  sx={{
                    fontSize: 18,
                    color: 'text.secondary',
                    transition: 'transform 0.2s ease-in-out',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </AccountButton>

              <ModernMenu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 200 }}
              >
                <UserInfoSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      alt={user?.name}
                      src={user?.profile_picture ? getStorageUrl(user.profile_picture) : user?.picture}
                      sx={{
                        width: 48,
                        height: 48,
                        mr: 2,
                        border: '3px solid rgba(108, 71, 255, 0.1)'
                      }}
                    />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {user?.name || 'User Name'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        {user?.email}
                      </Typography>
                      <Chip
                        label={user?.role === 'admin' ? 'Administrator' : 'Member'}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: user?.role === 'admin' ? 'rgba(108, 71, 255, 0.1)' : 'rgba(0, 198, 174, 0.1)',
                          color: user?.role === 'admin' ? '#6C47FF' : '#00C6AE',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>
                </UserInfoSection>

                <ModernMenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ModernMenuItem>

                <ModernMenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ModernMenuItem>

                <ModernMenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ModernMenuItem>

                {user?.is_admin && (
                  <ModernMenuItem onClick={() => { navigate('/dashboard?tab=admin-ads'); handleClose(); }}>
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Ads Management" />
                  </ModernMenuItem>
                )}

                <LogoutMenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </LogoutMenuItem>
              </ModernMenu>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ my: 2 }}>
            Classified Ads
          </Typography>
          <List>
            <ListItem component={Link} to="/" onClick={handleDrawerToggle}>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem component={Link} to="/post-ad" onClick={handleDrawerToggle}>
              <ListItemText primary="Post Ad" />
            </ListItem>
            {isAuthenticated ? (
              <>
                <ListItem component={Link} to="/dashboard" onClick={handleDrawerToggle}>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem component={Link} to="/profile" onClick={handleDrawerToggle}>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem component={Link} to="/settings" onClick={handleDrawerToggle}>
                  <ListItemText primary="Settings" />
                </ListItem>
                {user?.is_admin && (
                  <ListItem component={Link} to="/dashboard?tab=admin-ads" onClick={handleDrawerToggle}>
                    <ListItemText primary="Ads Management" />
                  </ListItem>
                )}
                <ListItem onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem component={Link} to="/login" onClick={handleDrawerToggle}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem component={Link} to="/register" onClick={handleDrawerToggle}>
                  <ListItemText primary="Sign Up" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </GlassAppBar>
  );
}

export default Navbar;
