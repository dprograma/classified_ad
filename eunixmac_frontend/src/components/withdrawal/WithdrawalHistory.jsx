import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Loop,
  AccessTime,
  CalendarToday,
  AccountBalance,
  AttachMoney
} from '@mui/icons-material';
import { getWithdrawalHistory, cancelWithdrawal } from '../../services/withdrawalService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatCurrency';

const WithdrawalHistory = ({ refreshTrigger }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [currentPage, refreshTrigger]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getWithdrawalHistory(currentPage);
      setWithdrawals(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (err) {
      toast.error('Failed to load withdrawal history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedWithdrawal) return;

    try {
      setCancelling(true);
      await cancelWithdrawal(selectedWithdrawal.id);
      toast.success('Withdrawal cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (err) {
      toast.error(err.error || 'Failed to cancel withdrawal');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: 'warning',
        icon: <Schedule fontSize="small" />,
        label: 'Pending'
      },
      processing: {
        color: 'info',
        icon: <Loop fontSize="small" />,
        label: 'Processing'
      },
      completed: {
        color: 'success',
        icon: <CheckCircle fontSize="small" />,
        label: 'Completed'
      },
      failed: {
        color: 'error',
        icon: <Cancel fontSize="small" />,
        label: 'Failed'
      },
      cancelled: {
        color: 'default',
        icon: <Cancel fontSize="small" />,
        label: 'Cancelled'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  if (loading && withdrawals.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <AccessTime sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Withdrawal History
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Your withdrawal requests will appear here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {withdrawals.map((withdrawal) => (
          <Card
            key={withdrawal.id}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: '4px solid',
              borderLeftColor: withdrawal.status === 'completed' ? 'success.main' :
                               withdrawal.status === 'failed' ? 'error.main' :
                               withdrawal.status === 'processing' ? 'info.main' : 'warning.main',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                {/* Left Side - Amount and Status */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(withdrawal.amount)}
                    </Typography>
                    {getStatusChip(withdrawal.status)}
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Bank:</strong> {withdrawal.bank_account?.bank_name || 'N/A'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      <strong>Account:</strong> {withdrawal.bank_account?.account_number || 'N/A'}
                      ({withdrawal.bank_account?.account_name || 'N/A'})
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(withdrawal.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Right Side - Details */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      bgcolor: 'grey.50',
                      p: 2,
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Gross Amount:
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(withdrawal.amount)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Transfer Fee:
                        </Typography>
                        <Typography variant="body2" color="error.main" fontWeight={600}>
                          -{formatCurrency(withdrawal.fee)}
                        </Typography>
                      </Box>

                      <Divider />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>
                          Net Amount:
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight={700}>
                          {formatCurrency(withdrawal.net_amount)}
                        </Typography>
                      </Box>

                      <Divider />

                      <Typography variant="caption" color="text.disabled">
                        Ref: {withdrawal.reference}
                      </Typography>

                      {withdrawal.reason && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          <Typography variant="caption">
                            <strong>Reason:</strong> {withdrawal.reason}
                          </Typography>
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                </Grid>

                {/* Cancel Button */}
                {withdrawal.status === 'pending' && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelClick(withdrawal)}
                      >
                        Cancel Withdrawal
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => !cancelling && setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Withdrawal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this withdrawal of{' '}
            <strong>{formatCurrency(selectedWithdrawal?.amount || 0)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The amount will be returned to your available balance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
            No, Keep It
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : <Cancel />}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalHistory;
