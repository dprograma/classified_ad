import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  Add,
  Delete,
  CheckCircle,
  Warning,
  Star,
  StarBorder,
  AccountBalance,
  Info
} from '@mui/icons-material';
import {
  getBanks,
  verifyBankAccount,
  getUserBankAccounts,
  addBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
} from '../../services/bankAccountService';
import { toast } from 'react-toastify';

const BankAccountManagement = () => {
  const [banks, setBanks] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: '',
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    loadBankAccounts();
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const data = await getBanks();
      setBanks(data);
    } catch (err) {
      toast.error('Failed to load banks');
      console.error(err);
    }
  };

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await getUserBankAccounts();
      setBankAccounts(data);
    } catch (err) {
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.account_number || !formData.bank_code) {
      toast.error('Please select a bank and enter account number');
      return;
    }

    setVerifying(true);

    try {
      const result = await verifyBankAccount(formData.account_number, formData.bank_code);
      setFormData({
        ...formData,
        account_name: result.account_name,
      });
      toast.success('Account verified successfully!');
    } catch (err) {
      toast.error(err.error || 'Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addBankAccount(formData);
      toast.success('Bank account added successfully!');
      setShowAddDialog(false);
      setFormData({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
      });
      loadBankAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to add bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      await setPrimaryBankAccount(accountId);
      toast.success('Primary account updated successfully!');
      loadBankAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to set primary account');
    }
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      await deleteBankAccount(accountToDelete.id);
      toast.success('Bank account deleted successfully!');
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      loadBankAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to delete bank account');
    }
  };

  const handleBankChange = (e) => {
    const selectedBank = banks.find((b) => b.code === e.target.value);
    setFormData({
      ...formData,
      bank_code: e.target.value,
      bank_name: selectedBank?.name || '',
    });
  };

  const handleOpenAddDialog = () => {
    setFormData({
      bank_code: '',
      bank_name: '',
      account_number: '',
      account_name: '',
    });
    setShowAddDialog(true);
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
      {/* Header with Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add Bank Account
        </Button>
      </Box>

      {/* Bank Accounts List */}
      {bankAccounts.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <AccountBalance sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Bank Accounts
            </Typography>
            <Typography variant="body2" color="text.disabled" paragraph>
              Add a bank account to request withdrawals.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
            >
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {bankAccounts.map((account) => (
            <Card
              key={account.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: account.is_primary ? 'primary.main' : 'divider',
                borderLeft: '4px solid',
                borderLeftColor: account.is_primary ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Left Side - Account Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {account.bank_name}
                      </Typography>

                      {account.is_primary && (
                        <Chip
                          icon={<Star fontSize="small" />}
                          label="Primary"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}

                      {account.is_verified ? (
                        <Chip
                          icon={<CheckCircle fontSize="small" />}
                          label="Verified"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          icon={<Warning fontSize="small" />}
                          label="Pending Verification"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {account.account_name}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {account.account_number}
                    </Typography>
                  </Box>

                  {/* Right Side - Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!account.is_primary && account.is_verified && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<StarBorder />}
                        onClick={() => handleSetPrimary(account.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(account)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Information Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Bank Account Information
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
          <li>Verified accounts can be used for withdrawals</li>
          <li>Set a primary account for faster withdrawal requests</li>
          <li>You can add multiple bank accounts</li>
          <li>Account verification is instant via Paystack</li>
        </Box>
      </Alert>

      {/* Add Bank Account Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => !submitting && !verifying && setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Bank Account</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddAccount} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              {/* Bank Selection */}
              <FormControl fullWidth>
                <InputLabel>Bank</InputLabel>
                <Select
                  value={formData.bank_code}
                  label="Bank"
                  onChange={handleBankChange}
                  required
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

              {/* Account Number with Verify Button */}
              <Box>
                <TextField
                  fullWidth
                  label="Account Number"
                  type="text"
                  inputProps={{ maxLength: 10 }}
                  placeholder="0123456789"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  required
                />
                <Button
                  variant="outlined"
                  onClick={handleVerifyAccount}
                  disabled={verifying || !formData.bank_code || !formData.account_number}
                  fullWidth
                  sx={{ mt: 1 }}
                  startIcon={verifying ? <CircularProgress size={16} /> : null}
                >
                  {verifying ? 'Verifying...' : 'Verify Account'}
                </Button>
              </Box>

              {/* Account Name (Auto-filled after verification) */}
              {formData.account_name && (
                <TextField
                  fullWidth
                  label="Account Name"
                  value={formData.account_name}
                  disabled
                  sx={{ bgcolor: 'grey.50' }}
                />
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowAddDialog(false)}
            disabled={submitting || verifying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddAccount}
            variant="contained"
            disabled={submitting || verifying || !formData.account_name}
            startIcon={submitting ? <CircularProgress size={16} /> : <Add />}
          >
            {submitting ? 'Adding...' : 'Add Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Bank Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bank account?
          </Typography>
          {accountToDelete && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 2,
                mt: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>Bank:</strong> {accountToDelete.bank_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Account:</strong> {accountToDelete.account_number} ({accountToDelete.account_name})
              </Typography>
            </Paper>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountManagement;
