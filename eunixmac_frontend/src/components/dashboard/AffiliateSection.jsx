import React, { useState, useEffect } from 'react';
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
  Paper,
  CircularProgress,
  Divider,
  MenuItem,
  InputAdornment
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
  Timeline,
  AccountBalance,
  Payment,
  Wallet
} from '@mui/icons-material';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { useAuth } from '../../AuthContext';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

const ENROLLMENT_FEE = 3000;
const MINIMUM_WITHDRAWAL = 3000;

const AffiliateSection = ({ affiliateData: initialAffiliateData, onRefresh }) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [earningsHistoryOpen, setEarningsHistoryOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [affiliateData, setAffiliateData] = useState(initialAffiliateData);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_code: '',
    bank_account_number: '',
    bank_account_name: ''
  });
  const { user, refreshUser } = useAuth();
  const { callApi, loading } = useApi();
  const [searchParams] = useSearchParams();

  // Check for enrollment callback status
  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'success' && message) {
      toast.success(decodeURIComponent(message));
      if (onRefresh) onRefresh();
      if (refreshUser) refreshUser();
    } else if (status === 'error' && message) {
      toast.error(decodeURIComponent(message));
    }
  }, [searchParams]);

  // Fetch affiliate dashboard data
  useEffect(() => {
    if (user?.is_affiliate) {
      fetchAffiliateDashboard();
    }
  }, [user?.is_affiliate]);

  const fetchAffiliateDashboard = async () => {
    try {
      const response = await callApi('GET', '/affiliate/dashboard');
      setAffiliateData(response);
    } catch (error) {
      console.error('Error fetching affiliate dashboard:', error);
    }
  };

  const fetchBanks = async () => {
    if (banks.length > 0) return;
    setLoadingBanks(true);
    try {
      const response = await callApi('GET', '/affiliate/banks');
      setBanks(response || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks list');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleEnrollAffiliate = async () => {
    try {
      const response = await callApi('POST', '/affiliate/enroll');
      if (response.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling as affiliate:', error);
      toast.error(error.message || 'Failed to initiate enrollment. Please try again.');
    }
  };

  const handleUpdateBankAccount = async () => {
    if (!bankForm.bank_code || !bankForm.bank_account_number || !bankForm.bank_name) {
      toast.error('Please fill in all bank details');
      return;
    }

    try {
      const response = await callApi('POST', '/affiliate/bank-account', bankForm);
      toast.success('Bank account updated successfully');
      setBankDialogOpen(false);
      fetchAffiliateDashboard();
    } catch (error) {
      console.error('Error updating bank account:', error);
      toast.error(error.message || 'Failed to update bank account');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < MINIMUM_WITHDRAWAL) {
      toast.error(`Minimum withdrawal amount is ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`);
      return;
    }

    if (amount > (affiliateData?.available_balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!affiliateData?.bank_account?.account_number) {
      toast.error('Please set up your bank account first');
      setBankDialogOpen(true);
      return;
    }

    try {
      await callApi('POST', '/affiliate/withdraw', { amount });
      toast.success('Withdrawal request submitted successfully');
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      fetchAffiliateDashboard();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    }
  };

  const copyReferralLink = () => {
    const referralLink = affiliateData?.referral_link || `${window.location.origin}/register?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Referral link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy referral link');
    });
  };

  const shareReferralLink = () => {
    const referralLink = affiliateData?.referral_link || `${window.location.origin}/register?ref=${user?.referral_code}`;
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

  const handleBankSelect = (bankCode) => {
    const selectedBank = banks.find(b => b.code === bankCode);
    if (selectedBank) {
      setBankForm(prev => ({
        ...prev,
        bank_code: bankCode,
        bank_name: selectedBank.name
      }));
    }
  };

  // Not an affiliate - show enrollment UI
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Earn <strong>65% commission</strong> on every purchase made by users you refer to our platform.
            </Typography>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Enrollment Fee: ₦{ENROLLMENT_FEE.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                One-time payment to join the affiliate program
              </Typography>
            </Alert>

            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Affiliate Benefits:
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemText primary="• Earn 65% commission on all purchases by referrals" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Unique referral link and tracking" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Real-time earnings dashboard" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Withdraw directly to your bank account" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary={`• Minimum withdrawal: ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`} />
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
                startIcon={<Payment />}
                onClick={() => setConfirmDialogOpen(true)}
                disabled={loading}
              >
                Pay ₦{ENROLLMENT_FEE.toLocaleString()} & Join
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
                Earn 65% commission on every purchase made by users you refer!
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
                      primary="Pay the enrollment fee"
                      secondary={`One-time payment of ₦${ENROLLMENT_FEE.toLocaleString()} to join`}
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
                      secondary="Share your link and earn 65% on all purchases by your referrals"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Withdraw anytime"
                      secondary={`Minimum withdrawal: ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`}
                    />
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Earning Examples:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦6,500
                        </Typography>
                        <Typography variant="body2">
                          From ₦10,000 purchase
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦32,500
                        </Typography>
                        <Typography variant="body2">
                          From ₦50,000 purchase
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₦65,000
                        </Typography>
                        <Typography variant="body2">
                          From ₦100,000 purchase
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
                setConfirmDialogOpen(true);
              }}
            >
              Join Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm">
          <DialogTitle>Confirm Enrollment</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body1">
                You are about to pay <strong>₦{ENROLLMENT_FEE.toLocaleString()}</strong> to join the affiliate program.
              </Typography>
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Once you complete the payment, you'll be able to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Earn 65% commission on all referral purchases" />
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
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Withdraw to your bank account" />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleEnrollAffiliate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            >
              {loading ? 'Processing...' : `Pay ₦${ENROLLMENT_FEE.toLocaleString()}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // User is an affiliate - show dashboard
  const stats = {
    total_referrals: affiliateData?.total_referrals || 0,
    successful_referrals: affiliateData?.successful_referrals || 0,
    total_earnings: affiliateData?.total_earnings || 0,
    pending_earnings: affiliateData?.pending_earnings || 0,
    available_balance: affiliateData?.available_balance || 0,
    total_withdrawn: affiliateData?.total_withdrawn || 0
  };

  const referralLink = affiliateData?.referral_link || `${window.location.origin}/register?ref=${user?.referral_code}`;

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
        columns={{ mobile: 2, tablet: 3, desktop: 6 }}
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
          label="Paid Referrals"
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
          label="Pending"
          color="#f59e0b"
          size="medium"
        />

        <EnhancedStatCard
          icon={Wallet}
          value={`₦${stats.available_balance.toLocaleString()}`}
          label="Available"
          color="#6366f1"
          size="medium"
        />

        <EnhancedStatCard
          icon={Payment}
          value={`₦${stats.total_withdrawn.toLocaleString()}`}
          label="Withdrawn"
          color="#8b5cf6"
          size="medium"
        />
      </StatCardsContainer>

      <Grid container spacing={3}>
        {/* Referral Link */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Referral Link
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Share this link to earn 65% commission on purchases
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
                  <strong>Commission Rate:</strong> {affiliateData?.commission_rate || 65}% of every purchase made by your referrals
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
                Withdraw Earnings
              </Typography>

              {affiliateData?.bank_account?.account_number ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Bank: {affiliateData.bank_account.bank_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Account: {affiliateData.bank_account.account_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Name: {affiliateData.bank_account.account_name}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Set up your bank account to withdraw
                </Alert>
              )}

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Wallet />}
                  fullWidth
                  onClick={() => setWithdrawDialogOpen(true)}
                  disabled={stats.available_balance < MINIMUM_WITHDRAWAL}
                >
                  Withdraw ₦{stats.available_balance.toLocaleString()}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AccountBalance />}
                  fullWidth
                  onClick={() => {
                    fetchBanks();
                    setBankDialogOpen(true);
                  }}
                >
                  {affiliateData?.bank_account?.account_number ? 'Update' : 'Add'} Bank Account
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  fullWidth
                  onClick={() => setEarningsHistoryOpen(true)}
                >
                  Commission History
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Commissions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Commissions
          </Typography>
          {affiliateData?.recent_commissions?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Referred User</TableCell>
                    <TableCell align="right">Purchase</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {affiliateData.recent_commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                      <TableCell>{commission.referred_user}</TableCell>
                      <TableCell align="right">₦{commission.purchase_amount?.toLocaleString()}</TableCell>
                      <TableCell align="right">₦{commission.commission_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={commission.status}
                          color={
                            commission.status === 'paid' ? 'success' :
                            commission.status === 'approved' ? 'primary' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No commissions yet. Start sharing your referral link to earn!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Withdrawals */}
      {affiliateData?.recent_withdrawals?.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Withdrawals
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {affiliateData.recent_withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{withdrawal.reference}</TableCell>
                      <TableCell align="right">₦{parseFloat(withdrawal.amount).toLocaleString()}</TableCell>
                      <TableCell>{withdrawal.bank_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={withdrawal.status}
                          color={
                            withdrawal.status === 'success' ? 'success' :
                            withdrawal.status === 'processing' ? 'info' :
                            withdrawal.status === 'failed' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Earnings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Available Balance: <strong>₦{stats.available_balance.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2">
                Minimum Withdrawal: ₦{MINIMUM_WITHDRAWAL.toLocaleString()}
              </Typography>
            </Alert>

            {affiliateData?.bank_account?.account_number ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Withdrawal Account:</Typography>
                <Typography variant="body2">{affiliateData.bank_account.bank_name}</Typography>
                <Typography variant="body2">{affiliateData.bank_account.account_number}</Typography>
                <Typography variant="body2">{affiliateData.bank_account.account_name}</Typography>
              </Box>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Please set up your bank account first
              </Alert>
            )}

            <TextField
              fullWidth
              label="Withdrawal Amount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
              }}
              helperText={`Minimum: ₦${MINIMUM_WITHDRAWAL.toLocaleString()}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={loading || !affiliateData?.bank_account?.account_number}
            startIcon={loading ? <CircularProgress size={20} /> : <Wallet />}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Account Dialog */}
      <Dialog open={bankDialogOpen} onClose={() => setBankDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {affiliateData?.bank_account?.account_number ? 'Update' : 'Add'} Bank Account
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                select
                fullWidth
                label="Select Bank"
                value={bankForm.bank_code}
                onChange={(e) => handleBankSelect(e.target.value)}
                disabled={loadingBanks}
              >
                {loadingBanks ? (
                  <MenuItem disabled>Loading banks...</MenuItem>
                ) : (
                  banks.map((bank) => (
                    <MenuItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                fullWidth
                label="Account Number"
                value={bankForm.bank_account_number}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                inputProps={{ maxLength: 10 }}
              />

              <TextField
                fullWidth
                label="Account Name"
                value={bankForm.bank_account_name}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_account_name: e.target.value }))}
                helperText="Will be verified with your bank"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateBankAccount}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AccountBalance />}
          >
            {loading ? 'Verifying...' : 'Save Bank Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Earnings History Dialog */}
      <Dialog open={earningsHistoryOpen} onClose={() => setEarningsHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Commission History</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View your detailed commission history.
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Referred User</TableCell>
                  <TableCell align="right">Purchase</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell align="right">Commission</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affiliateData?.recent_commissions?.length > 0 ? (
                  affiliateData.recent_commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                      <TableCell>{commission.referred_user}</TableCell>
                      <TableCell align="right">₦{commission.purchase_amount?.toLocaleString()}</TableCell>
                      <TableCell>65%</TableCell>
                      <TableCell align="right">₦{commission.commission_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={commission.status}
                          color={
                            commission.status === 'paid' ? 'success' :
                            commission.status === 'approved' ? 'primary' :
                            'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No commission history yet. Start sharing your referral link!
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
    </Box>
  );
};

export default AffiliateSection;
