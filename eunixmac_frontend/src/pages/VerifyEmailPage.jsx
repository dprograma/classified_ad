// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Email, Refresh } from '@mui/icons-material';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null); // null, sending, sent, error
  const [resendMessage, setResendMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (verificationAttempted.current) {
      return;
    }
    verificationAttempted.current = true;

    const path = searchParams.get('path');
    const query = searchParams.get('query');

    if (!path || !query) {
      setStatus('error');
      setMessage('Verification link is missing or invalid.');
      return;
    }

    const fullVerifyUrl = `${API_CONFIG.SERVER_URL}${path}?${query}`;

    const verifyEmail = async () => {
      try {
        await axios.get(fullVerifyUrl);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Verification link has expired or is invalid.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendStatus('error');
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendStatus('sending');
    setResendMessage('');

    try {
      await axios.post(`${API_CONFIG.BASE_URL}/email/resend`, {
        email: resendEmail.trim()
      });
      setResendStatus('sent');
      setResendMessage('A new verification link has been sent to your email. Please check your inbox.');
    } catch (error) {
      setResendStatus('error');
      const errMsg = error.response?.data?.message || 'Failed to resend verification email. Please try again.';
      setResendMessage(errMsg);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Verifying State */}
        {status === 'verifying' && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Your Email
            </Typography>
            <Typography color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          </Box>
        )}

        {/* Success State */}
        {status === 'success' && (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main" sx={{ fontWeight: 600 }}>
              Email Verified!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login page...
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Box>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Box py={4}>
            <Box textAlign="center" sx={{ mb: 4 }}>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="error.main" sx={{ fontWeight: 600 }}>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
            </Box>

            {/* Resend Verification Form */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Email color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Resend Verification Email
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email address below and we will send you a new verification link.
              </Typography>

              <form onSubmit={handleResendVerification}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  disabled={resendStatus === 'sending'}
                />

                {resendStatus === 'sent' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {resendMessage}
                  </Alert>
                )}
                {resendStatus === 'error' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {resendMessage}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={resendStatus === 'sending'}
                  startIcon={resendStatus === 'sending' ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                >
                  {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </form>
            </Box>

            <Box textAlign="center" sx={{ mt: 3 }}>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage;
