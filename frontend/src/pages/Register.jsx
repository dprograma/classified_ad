import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Google as GoogleIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

function Register() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { loading, callApi } = useApi();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegistrationSuccess(false);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await callApi('post', '/register', {
        name,
        email,
        phone_number: phoneNumber,
        password,
        password_confirmation: confirmPassword,
      });
      setRegistrationSuccess(true);
      toast.success('Registration successful! Please check your email for a verification link.');
    } catch (error) {
      // Error is already handled by the useApi hook
    }
  };

  const handleResendVerification = async () => {
    try {
      await callApi('post', '/email/resend', { email });
      toast.success('Verification email resent!');
    } catch (error) {
      // Error is already handled by the useApi hook
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: 2 }}>
            Register
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
              Sign up with Google
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
              Sign up with Facebook
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
              Sign up with Twitter
            </Button>
          </Stack>
          <Divider sx={{ my: 3 }}>or</Divider>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <TextField
                required
                fullWidth
                id="phone_number"
                label="Phone Number"
                name="phone_number"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Stack>
            {registrationSuccess && (
              <Typography color="success.main" align="center" sx={{ mt: 2, fontWeight: 500 }}>
                Registration successful! Please check your email for a verification link.
                <Button onClick={handleResendVerification} sx={{ ml: 1 }} size="small">Resend Email</Button>
              </Typography>
            )}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/forgot-password">Forgot password?</Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;