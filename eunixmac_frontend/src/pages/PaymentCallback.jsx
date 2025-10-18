import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle, Error, TrendingUp } from '@mui/icons-material';
import useApi from '../hooks/useApi';

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const { callApi } = useApi();

  useEffect(() => {
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    const adId = searchParams.get('ad_id');
    const message = searchParams.get('message');
    
    if (status === 'success') {
      setStatus('success');
      setMessage('Payment verified successfully!');
      setPaymentData({
        ad_id: adId,
        reference: reference
      });
    } else if (status === 'error') {
      setStatus('error');
      setMessage(message || 'Payment verification failed');
    } else {
      // Fallback to old verification method if no status param
      const paymentRef = reference || searchParams.get('trxref');
      if (paymentRef) {
        verifyPayment(paymentRef);
      } else {
        setStatus('error');
        setMessage('Payment reference not found in URL');
      }
    }
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your payment...');

      const response = await callApi('POST', '/payments/verify', {
        reference: reference
      });

      if (response && response.data) {
        setStatus('success');
        setMessage(response.message || 'Payment verified successfully!');
        setPaymentData(response.data);
      } else {
        setStatus('error');
        setMessage('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Payment verification failed. Please contact support if money was deducted.'
      );
    }
  };

  const handleContinue = () => {
    if (status === 'success' && paymentData?.ad_id) {
      navigate(`/ads/${paymentData.ad_id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box textAlign="center" py={4}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Payment
            </Typography>
            <Typography color="text.secondary">
              Please wait while we confirm your payment...
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            
            {paymentData && (
              <Card sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Typography variant="h6">Payment Confirmed</Typography>
                  </Box>
                  
                  {paymentData.amount_paid && (
                    <Typography variant="body2" color="text.secondary">
                      Amount paid: ₦{parseFloat(paymentData.amount_paid).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleContinue}
              sx={{ mr: 2 }}
            >
              Continue
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box textAlign="center" py={4}>
            <Error sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="error.main">
              Payment Verification Failed
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Alert>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              If you believe this is an error and money was deducted from your account, 
              please contact our support team with your transaction reference.
            </Typography>
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {renderContent()}
        </Paper>
      </Box>
    </Container>
  );
}

export default PaymentCallback;