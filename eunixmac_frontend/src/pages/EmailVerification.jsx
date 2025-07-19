import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const EmailVerification = () => {
  const { id, hash } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/email/verify/${id}/${hash}`);
        setVerificationStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setVerificationStatus('failed');
        setMessage(error.response?.data?.message || 'Email verification failed.');
      }
    };

    verifyEmail();
  }, [id, hash]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Email Verification
      </Typography>
      {
        verificationStatus === 'verifying' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>Verifying your email...</Typography>
          </Box>
        )
      }
      {
        verificationStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )
      }
      {
        verificationStatus === 'failed' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )
      }
    </Box>
  );
};

export default EmailVerification;
