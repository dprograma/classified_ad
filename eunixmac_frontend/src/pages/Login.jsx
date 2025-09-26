import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack, Divider, Fade, IconButton, InputAdornment } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SocialLoginButtons from '../components/SocialLoginButtons';
import useApi from '../hooks/useApi';

const slideInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AuthContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    linear-gradient(135deg, 
      rgba(59, 130, 246, 0.05) 0%, 
      rgba(139, 92, 246, 0.05) 35%,
      rgba(16, 185, 129, 0.05) 70%,
      rgba(59, 130, 246, 0.05) 100%
    )
  `,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'><defs><pattern id=\'grid\' width=\'50\' height=\'50\' patternUnits=\'userSpaceOnUse\'><path d=\'M 50 0 L 0 0 0 50\' fill=\'none\' stroke=\'rgba(59,130,246,0.05)\' stroke-width=\'1\'/></pattern></defs><rect width=\'100%\' height=\'100%\' fill=\'url(%23grid)\'/></svg>") center/100px 100px',
    pointerEvents: 'none',
  },
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  width: '100%',
  maxWidth: 480,
  animation: `${slideInAnimation} 0.6s ease-out`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    margin: theme.spacing(2),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(248, 250, 252, 1)',
      transform: 'translateY(-1px)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(248, 250, 252, 1)',
      transform: 'translateY(-1px)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { loading, callApi } = useApi();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      const errorMessages = {
        'provider_error': 'Authentication failed. Please try again.',
        'account_exists': 'An account with this email already exists. Please log in normally.',
        'invalid_provider': 'Invalid authentication provider.',
      };
      // Use toast from useApi hook or create a simple alert
      alert(errorMessages[error] || 'Authentication failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/login');
    } else if (token) {
      try {
        // Assuming the token is a JWT, we can decode it to get user info
        // In a real app, you'd probably want to make another API call to get user details
        const user = JSON.parse(atob(token.split('.')[1]));
        login(user, token);
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Failed to parse authentication token:', error);
        alert('Authentication failed. Please try again.');
        // Clean up URL
        window.history.replaceState({}, document.title, '/login');
      }
    }
  }, [location, login, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await callApi('post', '/login', {
        email,
        password,
      });
      login(response.user, response.access_token);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled by the useApi hook
    }
  };

  return (
    <AuthContainer>
      <Fade in={mounted} timeout={800}>
        <AuthPaper elevation={0}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Sign in to continue to your account
            </Typography>
          </Box>

          <SocialLoginButtons />
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              or continue with email
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <StyledTextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <StyledTextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: 'none',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.26)',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ mt: 3 }}
              spacing={1}
            >
              <Typography 
                variant="body2" 
                component={Link} 
                to="/forgot-password"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Typography 
                  component={Link} 
                  to="/register"
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </Typography>
              </Typography>
            </Stack>
          </Box>
        </AuthPaper>
      </Fade>
    </AuthContainer>
  );
}

export default Login;
