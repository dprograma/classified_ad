import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Stack,
  TextField,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Group,
  AttachMoney,
  Share,
  ContentCopy,
  TrendingUp,
  People,
  CheckCircle,
  Info,
  BarChart,
  Calculate,
  TouchApp,
  Timeline
} from '@mui/icons-material';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { useAuth } from '../../AuthContext';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const AffiliateSection = ({ affiliateData, onRefresh }) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [earningsHistoryOpen, setEarningsHistoryOpen] = useState(false);
  const [performanceReportOpen, setPerformanceReportOpen] = useState(false);
  const { user } = useAuth();
  const { callApi, loading } = useApi();

  const handleBecomeAffiliate = async () => {
    try {
      const response = await callApi('POST', '/user/become-affiliate');
      toast.success('Welcome to our affiliate program! Your unique referral link has been generated.');
      setConfirmDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming affiliate:', error);
      toast.error(error.message || 'Failed to join affiliate program. Please try again.');
      setConfirmDialogOpen(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${user?.referral_code || user?.id}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Referral link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy referral link');
    });
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${user?.referral_code || user?.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join this amazing classified ads platform',
        text: 'Check out this great platform for buying and selling!',
        url: referralLink
      });
    } else {
      copyReferralLink();
    }
  };

  if (!user?.is_affiliate) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Affiliate Program
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Earn money by referring new users to our platform
        </Typography>

        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Group sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Join Our Affiliate Program
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Earn 65% commission on the first purchase made by users you refer to our platform.
            </Typography>

            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Affiliate Benefits:
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemText primary="• Earn 65% of first purchase value" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Unique referral link and tracking" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Real-time earnings dashboard" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Monthly payout system" />
                </ListItem>
              </List>
            </Alert>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Info />}
                onClick={() => setInfoDialogOpen(true)}
              >
                Learn More
              </Button>
              <Button
                variant="contained"
                startIcon={<Group />}
                onClick={() => setConfirmDialogOpen(true)}
                disabled={loading}
              >
                Join Program
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Info Dialog */}
        <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Affiliate Program Details</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="success">
                Earn 65% commission on every first purchase made by users you refer!
              </Alert>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  How it works:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Join the program" 
                      secondary="Sign up for our affiliate program for free"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Get your unique link" 
                      secondary="Receive a personalized referral link to share"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Share and earn" 
                      secondary="Share your link and earn 65% on first purchases"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Get paid monthly" 
                      secondary="Receive your earnings every month via bank transfer"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Earning Examples:
                </Typography>
                <Grid container spacing={0}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦650
                        </Typography>
                        <Typography variant="body2">
                          From ₦1,000 boost purchase
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦1,170
                        </Typography>
                        <Typography variant="body2">
                          From ₦1,800 boost purchase
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦2,275
                        </Typography>
                        <Typography variant="body2">
                          From ₦3,500 boost purchase
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setInfoDialogOpen(false);
                handleBecomeAffiliate();
              }}
              disabled={loading}
            >
              Join Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm">
          <DialogTitle>Join Affiliate Program</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to join our affiliate program? Once you join, you'll be able to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Earn 65% commission on referrals" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Get your unique referral link" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Track your earnings and referrals" />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleBecomeAffiliate}
              disabled={loading}
            >
              Yes, Join Program
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  const stats = {
    total_referrals: affiliateData?.total_referrals || 0,
    successful_referrals: affiliateData?.successful_referrals || 0,
    total_earnings: affiliateData?.total_earnings || 0,
    pending_earnings: affiliateData?.pending_earnings || 0
  };

  const referralLink = `${window.location.origin}?ref=${user?.referral_code || user?.id}`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Affiliate Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your referrals and earnings from the affiliate program
      </Typography>

      {/* Affiliate Stats */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={People}
          value={stats.total_referrals}
          label="Total Referrals"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={CheckCircle}
          value={stats.successful_referrals}
          label="Successful Referrals"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={AttachMoney}
          value={`₦${stats.total_earnings.toLocaleString()}`}
          label="Total Earnings"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={TrendingUp}
          value={`₦${stats.pending_earnings.toLocaleString()}`}
          label="Pending Earnings"
          color="#f59e0b"
          size="medium"
        />
      </StatCardsContainer>

      <Grid container spacing={0}>
        {/* Referral Link */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Referral Link
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Share this link to earn 65% commission on first purchases
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  value={referralLink}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
                <IconButton onClick={copyReferralLink}>
                  <ContentCopy />
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={shareReferralLink}
                >
                  Share
                </Button>
              </Stack>
              
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>How it works:</strong> When someone clicks your link and makes their first purchase 
                  (like boosting an ad), you earn 65% of that purchase amount!
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  fullWidth
                  onClick={shareReferralLink}
                >
                  Share Link
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  fullWidth
                  onClick={() => setEarningsHistoryOpen(true)}
                >
                  Earnings History
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                  onClick={() => setPerformanceReportOpen(true)}
                >
                  Performance Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Referrals */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Referrals
          </Typography>
          {affiliateData?.recent_referrals?.length > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Referral tracking interface coming soon...
            </Typography>
          ) : (
            <Alert severity="info">
              You haven't referred anyone yet. Start sharing your referral link to earn commissions!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Earnings History Dialog */}
      <Dialog open={earningsHistoryOpen} onClose={() => setEarningsHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Earnings History</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View your detailed earnings history and commission payments.
          </Typography>
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Referral</TableCell>
                  <TableCell>Purchase Amount</TableCell>
                  <TableCell>Commission Rate</TableCell>
                  <TableCell align="right">Earnings</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affiliateData?.earnings_history?.length > 0 ? (
                  affiliateData.earnings_history.map((earning, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(earning.date).toLocaleDateString()}</TableCell>
                      <TableCell>{earning.referral_email}</TableCell>
                      <TableCell>₦{earning.purchase_amount?.toLocaleString()}</TableCell>
                      <TableCell>65%</TableCell>
                      <TableCell align="right">₦{earning.commission_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={earning.status} 
                          color={earning.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No earnings history yet. Start sharing your referral link to earn commissions!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEarningsHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Performance Report Dialog */}
      <Dialog open={performanceReportOpen} onClose={() => setPerformanceReportOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Performance Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Detailed performance metrics and analytics for your affiliate activities.
          </Typography>
          
          <StatCardsContainer
            columns={{ mobile: 2, tablet: 2, desktop: 4 }}
            gap="16px"
            className="mb-6"
          >
            <EnhancedStatCard
              icon={BarChart}
              value={`${((stats.successful_referrals / Math.max(stats.total_referrals, 1)) * 100).toFixed(1)}%`}
              label="Conversion Rate"
              color="#3b82f6"
              size="medium"
            />

            <EnhancedStatCard
              icon={Calculate}
              value={`₦${stats.total_earnings ? Math.round(stats.total_earnings / Math.max(stats.successful_referrals, 1)) : 0}`}
              label="Avg. Earning per Sale"
              color="#10b981"
              size="medium"
            />

            <EnhancedStatCard
              icon={TouchApp}
              value={affiliateData?.click_count || 0}
              label="Link Clicks"
              color="#06b6d4"
              size="medium"
            />

            <EnhancedStatCard
              icon={Timeline}
              value={`${((stats.total_referrals / Math.max(affiliateData?.click_count, 1)) * 100).toFixed(1)}%`}
              label="Click to Signup"
              color="#f59e0b"
              size="medium"
            />
          </StatCardsContainer>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Share your referral link on social media, forums, and with friends to increase your reach and earnings!
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Monthly Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed monthly analytics coming soon...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerformanceReportOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliateSection;