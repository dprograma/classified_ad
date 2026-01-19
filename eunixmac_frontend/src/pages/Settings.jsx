import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Divider,
  Stack,
  Alert,
  MenuItem,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  AccountBalance,
  Delete as DeleteIcon,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const { callApi, loading } = useApi();
  const [error, setError] = useState('');

  // Bank account state
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [bankAccount, setBankAccount] = useState(null);
  const [loadingBankAccount, setLoadingBankAccount] = useState(true);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    bank_code: '',
    bank_account_number: '',
    bank_account_name: ''
  });

  // Fetch bank account on mount
  useEffect(() => {
    fetchBankAccount();
  }, []);

  const fetchBankAccount = async () => {
    try {
      setLoadingBankAccount(true);
      const response = await callApi('GET', '/user/bank-account');
      setBankAccount(response.bank_account);
      if (response.bank_account?.bank_code) {
        setBankForm({
          bank_name: response.bank_account.bank_name || '',
          bank_code: response.bank_account.bank_code || '',
          bank_account_number: response.bank_account.account_number || '',
          bank_account_name: response.bank_account.account_name || ''
        });
      }
    } catch (error) {
      console.error('Error fetching bank account:', error);
    } finally {
      setLoadingBankAccount(false);
    }
  };

  const fetchBanks = async () => {
    if (banks.length > 0) return;
    setLoadingBanks(true);
    try {
      const response = await callApi('GET', '/user/banks');
      setBanks(response || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks list');
    } finally {
      setLoadingBanks(false);
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

  const handleUpdateBankAccount = async () => {
    if (!bankForm.bank_code || !bankForm.bank_account_number || !bankForm.bank_name) {
      toast.error('Please fill in all bank details');
      return;
    }

    try {
      const response = await callApi('POST', '/user/bank-account', bankForm);
      toast.success('Bank account updated successfully');
      setBankAccount(response.bank_account);
      setBankDialogOpen(false);
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error updating bank account:', error);
    }
  };

  const handleOpenBankDialog = () => {
    fetchBanks();
    setBankDialogOpen(true);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPassword('');
    setError('');
  };

  const handleDeleteAccount = async () => {
    setError('');
    try {
      await callApi('DELETE', '/user', {
        current_password: password
      });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: { xs: 2, md: 3 } }}>
        Settings
      </Typography>

      {/* Bank Account Section */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <AccountBalance color="primary" />
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Bank Account
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add your bank account to receive payments from sales on the platform.
        </Typography>

        {loadingBankAccount ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : bankAccount?.account_number ? (
          <Card variant="outlined" sx={{ mb: 3, borderColor: 'success.light' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <CheckCircle color="success" fontSize="small" />
                <Chip label="Verified" color="success" size="small" />
              </Stack>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Bank</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{bankAccount.bank_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{bankAccount.account_number}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{bankAccount.account_name}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
            No bank account added yet. Add your bank account to receive payments from buyers.
          </Alert>
        )}

        <Button
          variant={bankAccount?.account_number ? 'outlined' : 'contained'}
          startIcon={<AccountBalance />}
          onClick={handleOpenBankDialog}
          sx={{ py: { xs: 1, md: 1.2 }, px: { xs: 2, md: 3 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
        >
          {bankAccount?.account_number ? 'Update Bank Account' : 'Add Bank Account'}
        </Button>
      </Paper>

      {/* Account Management Section */}
      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DeleteIcon color="error" />
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Account Management
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Permanently delete your account and all associated data.
        </Typography>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteDialogOpen}
          sx={{ py: { xs: 1, md: 1.2 }, px: { xs: 2, md: 3 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
        >
          Delete Account
        </Button>
      </Paper>

      {/* Bank Account Dialog */}
      <Dialog
        open={bankDialogOpen}
        onClose={() => setBankDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {bankAccount?.account_number ? 'Update Bank Account' : 'Add Bank Account'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your bank account will be verified with Paystack to ensure accuracy.
            </Alert>

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
                placeholder="10-digit account number"
              />

              <TextField
                fullWidth
                label="Account Name"
                value={bankForm.bank_account_name}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_account_name: e.target.value }))}
                helperText="Enter your account name as it appears on your bank account. This will be verified."
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
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

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, mb: 2 }}>
            Are you sure you want to delete your account? This action cannot be undone. All your ads, messages, and data will be permanently deleted.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Enter your password to confirm"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error.main" sx={{ mt: 2, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, md: 2 } }}>
          <Button onClick={handleDeleteDialogClose} sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading || !password}
            sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
