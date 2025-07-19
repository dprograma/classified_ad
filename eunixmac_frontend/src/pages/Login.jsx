import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack, Divider } from '@mui/material';
import { useAuth } from '../AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Google as GoogleIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import useApi from '../hooks/useApi';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { loading, callApi } = useApi();

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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: 2 }}>
            Login
          </Typography>
          {/* Social Login Section */}
          <Stack spacing={2} direction="column" sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                color: '#4285F4',
                borderColor: '#4285F4',
                fontWeight: 700,
                '&:hover': { background: 'rgba(66,133,244,0.08)', borderColor: '#4285F4' },
              }}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              sx={{
                color: '#1877F3',
                borderColor: '#1877F3',
                fontWeight: 700,
                '&:hover': { background: 'rgba(24,119,243,0.08)', borderColor: '#1877F3' },
              }}
            >
              Sign in with Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TwitterIcon />}
              sx={{
                color: '#1DA1F2',
                borderColor: '#1DA1F2',
                fontWeight: 700,
                '&:hover': { background: 'rgba(29,161,242,0.08)', borderColor: '#1DA1F2' },
              }}
            >
              Sign in with Twitter
            </Button>
          </Stack>
          <Divider sx={{ my: 3 }}>or</Divider>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, boxShadow: 2 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <Link to="/forgot-password">Forgot password?</Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/register">Create an account</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
