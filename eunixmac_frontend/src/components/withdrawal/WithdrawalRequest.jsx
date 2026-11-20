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
import { getUserBankAccounts, getBanks, verifyBankAccount } from '../../services/bankAccountService';
import { getWithdrawalStats, requestWithdrawal, requestWithdrawalWithNewBankAccount } from '../../services/withdrawalService';
import { toast } from 'react-toastify';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { formatCurrency } from '../../utils/formatCurrency';

const WithdrawalRequest = ({ onSuccess }) => {
  const [stats, setStats] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [useNewBankAccount, setUseNewBankAccount] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    bank_account_id: '',
  });

  const [newBankData, setNewBankData] = useState({
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, accountsData, banksData] = await Promise.all([
        getWithdrawalStats(),
        getUserBankAccounts(),
        getBanks(),
      ]);
      setStats(statsData);
      setBanks(banksData);

      // Filter for verified accounts only
      const verifiedAccounts = accountsData.filter((acc) => acc.is_verified);
      setBankAccounts(verifiedAccounts);

      if (verifiedAccounts.length === 0) {
        // Nothing saved yet - go straight to the inline bank-account form.
        setUseNewBankAccount(true);
      } else {
        // Auto-select primary account
        const primaryAccount = verifiedAccounts.find((acc) => acc.is_primary);
        if (primaryAccount) {
          setFormData((prev) => ({ ...prev, bank_account_id: primaryAccount.id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load withdrawal data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankChange = (e) => {
    const selectedBank = banks.find((b) => b.code === e.target.value);
    setNewBankData({
      ...newBankData,
      bank_code: e.target.value,
      bank_name: selectedBank?.name || '',
      account_name: '',
    });
  };

  const handleVerifyNewAccount = async () => {
    if (!newBankData.account_number || !newBankData.bank_code) {
      toast.error('Please select a bank and enter the account number');
      return;
    }

    setVerifyingAccount(true);

    try {
      const result = await verifyBankAccount(newBankData.account_number, newBankData.bank_code);
      setNewBankData((prev) => ({ ...prev, account_name: result.account_name }));
      toast.success('Account verified successfully!');
    } catch (err) {
      toast.error(err.error || 'Failed to verify account');
    } finally {
      setVerifyingAccount(false);
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

      if (useNewBankAccount) {
        if (!newBankData.account_name) {
          toast.error('Please verify the bank account before submitting');
          setSubmitting(false);
          return;
        }
        await requestWithdrawalWithNewBankAccount(amount, newBankData);
      } else {
        await requestWithdrawal(amount, formData.bank_account_id);
      }

      toast.success('Withdrawal request submitted! It will be reviewed by an admin before funds are disbursed.');
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
              {bankAccounts.length > 0 && (
                <Grid item xs={12}>
                  {!useNewBankAccount ? (
                    <>
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
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => setUseNewBankAccount(true)}
                      >
                        Use a different bank account
                      </Button>
                    </>
                  ) : (
                    <Button size="small" onClick={() => setUseNewBankAccount(false)}>
                      Use a saved bank account instead
                    </Button>
                  )}
                </Grid>
              )}

              {useNewBankAccount && (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Bank Account for Disbursement
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Bank</InputLabel>
                          <Select
                            value={newBankData.bank_code}
                            label="Bank"
                            onChange={handleBankChange}
                            required={useNewBankAccount}
                          >
                            <MenuItem value="">
                              <em>Select Bank</em>
                            </MenuItem>
                            {banks.map((bank) => (
                              <MenuItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Account Number"
                          inputProps={{ maxLength: 10 }}
                          placeholder="0123456789"
                          value={newBankData.account_number}
                          onChange={(e) =>
                            setNewBankData({ ...newBankData, account_number: e.target.value, account_name: '' })
                          }
                          required={useNewBankAccount}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleVerifyNewAccount}
                          disabled={verifyingAccount || !newBankData.bank_code || !newBankData.account_number}
                          fullWidth
                          sx={{ mt: 1 }}
                          startIcon={verifyingAccount ? <CircularProgress size={16} /> : null}
                        >
                          {verifyingAccount ? 'Verifying...' : 'Verify Account'}
                        </Button>
                      </Grid>
                      {newBankData.account_name && (
                        <Grid item xs={12}>
                          <Alert severity="success" icon={<CheckCircle fontSize="small" />}>
                            {newBankData.account_name}
                          </Alert>
                        </Grid>
                      )}
                      {!newBankData.account_name && bankAccounts.length === 0 && (
                        <Grid item xs={12}>
                          <Alert severity="warning" icon={<Warning fontSize="small" />}>
                            Verify this account before submitting — it will be saved for future withdrawals too.
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

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
                  disabled={
                    submitting ||
                    !formData.amount ||
                    (useNewBankAccount ? !newBankData.account_name : !formData.bank_account_id)
                  }
                  sx={{ py: 1.5 }}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      Submitting...
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
              <li>Withdrawal requests are reviewed by an admin before funds are sent</li>
              <li>Once approved, transfers go out via Paystack, typically arriving within minutes</li>
              <li>Transfer fee: {formatCurrency(stats?.transfer_fee || 50)} per withdrawal</li>
              <li>Pending withdrawals: {formatCurrency(stats?.pending_withdrawals || 0)}</li>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WithdrawalRequest;
