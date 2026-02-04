import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { getUserBankAccounts } from '../../services/bankAccountService';
import { getWithdrawalStats, requestWithdrawal } from '../../services/withdrawalService';
import { toast } from 'react-toastify';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { formatCurrency } from '../../utils/formatCurrency';

const WithdrawalRequest = ({ onSuccess }) => {
  const [stats, setStats] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    bank_account_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, accountsData] = await Promise.all([
        getWithdrawalStats(),
        getUserBankAccounts(),
      ]);
      setStats(statsData);

      // Filter for verified accounts only
      const verifiedAccounts = accountsData.filter((acc) => acc.is_verified);
      setBankAccounts(verifiedAccounts);

      // Auto-select primary account
      const primaryAccount = verifiedAccounts.find((acc) => acc.is_primary);
      if (primaryAccount) {
        setFormData((prev) => ({ ...prev, bank_account_id: primaryAccount.id }));
      }
    } catch (err) {
      toast.error('Failed to load withdrawal data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);

      if (amount < stats.minimum_withdrawal) {
        toast.error(`Minimum withdrawal amount is ${formatCurrency(stats.minimum_withdrawal)}`);
        setSubmitting(false);
        return;
      }

      if (amount > stats.available_balance) {
        toast.error(`Insufficient balance. Available: ${formatCurrency(stats.available_balance)}`);
        setSubmitting(false);
        return;
      }

      await requestWithdrawal(amount, formData.bank_account_id);
      toast.success('Withdrawal request submitted successfully!');
      setFormData({ ...formData, amount: '' });

      // Reload stats
      const newStats = await getWithdrawalStats();
      setStats(newStats);

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.error || 'Failed to request withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const fee = stats?.transfer_fee || 0;
    return Math.max(0, amount - fee);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Bank Account Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please add and verify a bank account before requesting a withdrawal.
          </Typography>
          <Button variant="contained" href="#" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Balance Overview Cards */}
      <StatCardsContainer
        columns={{ mobile: 1, tablet: 2, desktop: 2 }}
        gap="16px"
        sx={{ mb: 4 }}
      >
        <EnhancedStatCard
          icon={AccountBalanceWallet}
          value={formatCurrency(stats?.available_balance || 0)}
          label="Available Balance"
          color="#3b82f6"
          size="large"
        />
        <EnhancedStatCard
          icon={TrendingUp}
          value={formatCurrency(stats?.total_earnings || 0)}
          label="Total Earnings"
          color="#10b981"
          size="large"
        />
      </StatCardsContainer>

      {/* Withdrawal Form */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Request Withdrawal
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Bank Account Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Bank Account</InputLabel>
                  <Select
                    value={formData.bank_account_id}
                    label="Bank Account"
                    onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                    required
                  >
                    {bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_number} ({account.account_name})
                        {account.is_primary ? ' (Primary)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount Input */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Withdrawal Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                  helperText={`Minimum withdrawal: ${formatCurrency(stats?.minimum_withdrawal || 3000)}`}
                  required
                  inputProps={{
                    min: stats?.minimum_withdrawal || 3000,
                    max: stats?.available_balance || 0,
                    step: 0.01
                  }}
                />
              </Grid>

              {/* Calculation Summary */}
              {formData.amount && (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: 'grey.50',
                      p: 2,
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Withdrawal Amount:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(parseFloat(formData.amount))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Transfer Fee:
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        -{formatCurrency(stats?.transfer_fee || 50)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight={600}>
                        You will receive:
                      </Typography>
                      <Typography variant="body1" color="success.main" fontWeight={700}>
                        {formatCurrency(calculateNetAmount())}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting || !formData.amount || !formData.bank_account_id}
                  sx={{ py: 1.5 }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      Processing...
                    </>
                  ) : (
                    'Request Withdrawal'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Processing Information */}
          <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Processing Information
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
              <li>Withdrawals are processed automatically via Paystack</li>
              <li>Transfer fee: {formatCurrency(stats?.transfer_fee || 50)} per withdrawal</li>
              <li>Funds typically arrive within minutes</li>
              <li>Pending withdrawals: {formatCurrency(stats?.pending_withdrawals || 0)}</li>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WithdrawalRequest;
