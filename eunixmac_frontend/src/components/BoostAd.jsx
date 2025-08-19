import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { CheckCircle, TrendingUp } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';

function BoostAd({ adId, onClose, adTitle }) {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [email, setEmail] = useState('');
  const [pricingOptions, setPricingOptions] = useState([]);
  const [error, setError] = useState('');
  const { callApi, loading } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    fetchPricing();
  }, [user]);

  const fetchPricing = async () => {
    try {
      const data = await callApi('GET', '/ads/boost/pricing');
      setPricingOptions(data.pricing || []);
      if (data.pricing && data.pricing.length > 0) {
        setSelectedPackage(data.pricing[0].days.toString());
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setError('Failed to load pricing options');
    }
  };

  const getSelectedPackageDetails = () => {
    return pricingOptions.find(option => option.days.toString() === selectedPackage);
  };

  const handleBoost = async () => {
    if (!selectedPackage || !email) {
      setError('Please select a package and provide your email');
      return;
    }

    setError('');
    
    try {
      const response = await callApi('POST', `/ads/${adId}/boost`, {
        boost_days: parseInt(selectedPackage),
        email: email
      });

      if (response && response.data && response.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        setError('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error boosting ad:', error);
      setError(error.response?.data?.message || 'Failed to initiate boost payment');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp color="primary" />
          <Typography variant="h6">Boost Your Ad</Typography>
        </Box>
        {adTitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {adTitle}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Boost your ad to get more visibility and reach more potential buyers!
        </Typography>

        {pricingOptions.length === 0 ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Choose Your Boost Package
            </Typography>
            
            <RadioGroup
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              sx={{ mb: 3 }}
            >
              <Grid container spacing={2}>
                {pricingOptions.map((option) => (
                  <Grid item xs={12} md={4} key={option.days}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedPackage === option.days.toString() ? 2 : 1,
                        borderColor: selectedPackage === option.days.toString() ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1
                        }
                      }}
                      onClick={() => setSelectedPackage(option.days.toString())}
                    >
                      {option.days === 30 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: 8,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          BEST VALUE
                        </Box>
                      )}
                      
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <FormControlLabel
                          value={option.days.toString()}
                          control={<Radio />}
                          label=""
                          sx={{ position: 'absolute', top: 8, left: 8, m: 0 }}
                        />
                        
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {option.days} Days
                        </Typography>
                        
                        <Typography variant="h4" sx={{ my: 2 }}>
                          ₦{option.price.toLocaleString()}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="body2">
                            Priority listing
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="body2">
                            Increased visibility
                          </Typography>
                        </Box>
                        
                        {option.days === 30 && (
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2" color="primary">
                              Maximum exposure
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Payment receipt will be sent to this email"
            />

            {selectedPackage && (
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Boost Summary
                  </Typography>
                  <Typography variant="body1">
                    Duration: {getSelectedPackageDetails()?.days} days
                  </Typography>
                  <Typography variant="body1">
                    Total: ₦{getSelectedPackageDetails()?.price.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleBoost}
          variant="contained"
          disabled={!selectedPackage || !email || loading}
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
        >
          {loading ? 'Processing...' : `Boost for ₦${getSelectedPackageDetails()?.price.toLocaleString() || '0'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BoostAd;