import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack, Divider } from '@mui/material';
import { useAuth } from '../AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SocialLoginButtons from '../components/SocialLoginButtons';
import useApi from '../hooks/useApi';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { loading, callApi } = useApi();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Assuming the token is a JWT, we can decode it to get user info
      // In a real app, you'd probably want to make another API call to get user details
      const user = JSON.parse(atob(token.split('.')[1]));
      login(user, token);
      navigate(from, { replace: true });
    }
  }, [location, login, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await callApi('post', '/api/login', {
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 0 } }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: { xs: 1, md: 2 }, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Login
          </Typography>
          {/* Social Login Section */}
          <SocialLoginButtons />
          <Divider sx={{ my: { xs: 2, md: 3 } }}>or</Divider>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={{ xs: 2, md: 3 }}>
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
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
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
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ py: { xs: 1, md: 1.5 }, fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, borderRadius: 2, boxShadow: 2 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: { xs: 2, md: 3 } }}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                <Link to="/forgot-password">Forgot password?</Link>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
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
