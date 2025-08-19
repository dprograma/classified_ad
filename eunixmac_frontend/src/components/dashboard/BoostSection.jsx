import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TrendingUp,
  Star,
  Schedule,
  Visibility,
  AttachMoney,
  Info,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import { getStorageUrl } from '../../config/api';
import BoostAd from '../BoostAd';

const BoostSection = ({ ads, onRefresh }) => {
  const [boostPricing, setBoostPricing] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { callApi, loading } = useApi();

  useEffect(() => {
    fetchBoostPricing();
  }, []);

  const fetchBoostPricing = async () => {
    try {
      const data = await callApi('GET', '/ads/boost/pricing');
      setBoostPricing(data.pricing || []);
    } catch (error) {
      console.error('Error fetching boost pricing:', error);
    }
  };

  // Filter ads by boost status
  const activeBoosts = ads?.filter(ad => 
    ad.is_boosted && ad.boost_expires_at && new Date(ad.boost_expires_at) > new Date()
  ) || [];

  const expiredBoosts = ads?.filter(ad => 
    ad.is_boosted && ad.boost_expires_at && new Date(ad.boost_expires_at) <= new Date()
  ) || [];

  const eligibleAds = ads?.filter(ad => 
    !ad.is_boosted && ad.status === 'active'
  ) || [];

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getBoostProgress = (expiresAt, createdAt) => {
    if (!expiresAt || !createdAt) return 0;
    const total = new Date(expiresAt) - new Date(createdAt);
    const remaining = new Date(expiresAt) - new Date();
    return Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ad Boost
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Boost your ads to get more visibility and reach more buyers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Info />}
          onClick={() => setInfoDialogOpen(true)}
        >
          How it Works
        </Button>
      </Box>

      {/* Boost Pricing Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {boostPricing.map((option) => (
          <Grid item xs={12} md={4} key={option.days}>
            <Card 
              sx={{ 
                textAlign: 'center',
                border: option.days === 30 ? 2 : 1,
                borderColor: option.days === 30 ? 'primary.main' : 'divider',
                position: 'relative'
              }}
            >
              {option.days === 30 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 16,
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
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" fontWeight="bold" mb={1}>
                  {option.days} Days
                </Typography>
                <Typography variant="h3" fontWeight="bold" mb={2}>
                  ₦{option.price.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Get priority placement for {option.days} days
                </Typography>
                <Stack spacing={1} alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Priority listing</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Increased visibility</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">Featured badge</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active Boosts */}
      {activeBoosts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Boosts ({activeBoosts.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeBoosts.map((ad) => {
                    const daysRemaining = getDaysRemaining(ad.boost_expires_at);
                    const progress = getBoostProgress(ad.boost_expires_at, ad.created_at);
                    
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={ad.images?.[0] ? getStorageUrl(ad.images[0].image_path) : null}
                              variant="rounded"
                              sx={{ width: 50, height: 50 }}
                            >
                              {ad.title.charAt(0)}
                            </Avatar>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1" fontWeight="bold">
                                  {ad.title}
                                </Typography>
                                <Star color="primary" fontSize="small" />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                ₦{ad.price?.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Boosted"
                            color="primary"
                            icon={<TrendingUp />}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: '100px' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress}
                              color={daysRemaining <= 2 ? 'warning' : 'primary'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(progress)}% complete
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {daysRemaining} days left
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(ad.boost_expires_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Visibility fontSize="small" color="action" />
                            <Typography variant="body2">
                              {ad.views_count || 0} views
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Eligible Ads */}
      {eligibleAds.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ads Ready to Boost ({eligibleAds.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select an ad below to boost it and increase its visibility
            </Typography>
            <Grid container spacing={2}>
              {eligibleAds.map((ad) => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        src={ad.images?.[0] ? getStorageUrl(ad.images[0].image_path) : null}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        {ad.title.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="bold" noWrap>
                          {ad.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₦{ad.price?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<TrendingUp />}
                      fullWidth
                      onClick={() => {
                        setSelectedAd(ad);
                        setBoostDialogOpen(true);
                      }}
                    >
                      Boost Ad
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Expired Boosts */}
      {expiredBoosts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expired Boosts ({expiredBoosts.length})
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              These ads had boost campaigns that have expired. You can boost them again to regain priority placement.
            </Alert>
            <Grid container spacing={2}>
              {expiredBoosts.slice(0, 6).map((ad) => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        src={ad.images?.[0] ? getStorageUrl(ad.images[0].image_path) : null}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        {ad.title.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="bold" noWrap>
                          {ad.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expired {new Date(ad.boost_expires_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      fullWidth
                      onClick={() => {
                        setSelectedAd(ad);
                        setBoostDialogOpen(true);
                      }}
                    >
                      Boost Again
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {eligibleAds.length === 0 && activeBoosts.length === 0 && expiredBoosts.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No ads available for boosting
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              You need to have active ads to use the boost feature. Post an ad first!
            </Typography>
            <Button variant="contained" href="/post-ad">
              Post New Ad
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Boost Dialog */}
      {boostDialogOpen && selectedAd && (
        <BoostAd
          adId={selectedAd.id}
          adTitle={selectedAd.title}
          onClose={() => {
            setBoostDialogOpen(false);
            setSelectedAd(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>How Ad Boost Works</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Boosting your ads increases their visibility and helps them reach more potential buyers.
            </Alert>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Benefits of Boosting:
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Your ads appear at the top of search results
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Featured badge makes your ads stand out
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Increased visibility leads to more inquiries
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Boost multiple ads simultaneously
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Pricing Options:
              </Typography>
              <Grid container spacing={2}>
                {boostPricing.map((option) => (
                  <Grid item xs={4} key={option.days}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="h6" color="primary">
                        {option.days} Days
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ₦{option.price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BoostSection;