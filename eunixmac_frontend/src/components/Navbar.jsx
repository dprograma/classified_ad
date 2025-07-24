import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, InputBase, Paper, useScrollTrigger } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/system';

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

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { callApi } = useApi();
  const [anchorEl, setAnchorEl] = React.useState(null);
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
      await callApi('post', '/api/logout', null, {
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

  return (
    <GlassAppBar position="sticky" elevation={0} sx={{ zIndex: 1201 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
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
            Classified Ads
          </Typography>
        </LogoBox>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1, mx: 2 }}>
          <SearchBar elevation={2}>
            <InputBase
              placeholder="What are you looking for?"
              sx={{ ml: 1, flex: 1, fontSize: '1.05rem' }}
            />
            <IconButton type="submit" sx={{ p: '10px', color: 'primary.main' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </SearchBar>
        </Box>
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
            <IconButton onClick={handleMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.name} src={user?.profile_picture ? `http://localhost:8000/storage/${user.profile_picture}` : user?.picture} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>Dashboard</MenuItem>
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
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
      </Toolbar>
    </GlassAppBar>
  );
}

export default Navbar;
