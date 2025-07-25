import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import SocialLoginButtons from '../components/SocialLoginButtons';
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
      await callApi('post', '/api/register', {
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 0 } }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: { xs: 1, md: 2 }, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Register
          </Typography>
          {/* Social Login Section */}
          <SocialLoginButtons />
          <Divider sx={{ my: { xs: 2, md: 3 } }}>or</Divider>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={{ xs: 2, md: 3 }}>
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
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
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
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
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
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Stack>
            {registrationSuccess && (
              <Typography color="success.main" align="center" sx={{ mt: 2, fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Registration successful! Please check your email for a verification link.
                <Button onClick={handleResendVerification} sx={{ ml: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }} size="small">Resend Email</Button>
              </Typography>
            )}
            <Stack direction="row" justifyContent="space-between" sx={{ mt: { xs: 2, md: 3 } }}>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
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