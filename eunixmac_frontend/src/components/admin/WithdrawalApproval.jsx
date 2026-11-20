import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Tooltip, IconButton, Chip, Pagination, TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { CheckCircleOutline, DoNotDisturb, AccountBalanceWallet } from '@mui/icons-material';
import { Search } from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  rejected: 'error',
  cancelled: 'default',
};

const WithdrawalApproval = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);
  const { loading, callApi } = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [withdrawalToReject, setWithdrawalToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchWithdrawals = async () => {
    setError(null);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const response = await callApi('get', `/admin/withdrawals?page=${page}${statusParam}`);
      if (response && response.data) {
        setWithdrawals(response.data);
        setTotalPages(response.last_page);
      } else {
        setWithdrawals([]);
      }
    } catch (apiError) {
      setError('Failed to fetch withdrawals. Please try again later.');
      console.error('Error fetching withdrawals:', apiError);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchWithdrawals();
    }, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleApprove = async (withdrawalId) => {
    setError(null);
    try {
      await callApi('put', `/admin/withdrawals/${withdrawalId}/approve`);
      fetchWithdrawals();
    } catch (apiError) {
      setError(`Failed to approve withdrawal #${withdrawalId}. Please try again.`);
      console.error(`Error approving withdrawal ${withdrawalId}:`, apiError);
    }
  };

  const handleOpenReject = (withdrawal) => {
    setWithdrawalToReject(withdrawal);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleCloseReject = () => {
    setRejectDialogOpen(false);
    setWithdrawalToReject(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!withdrawalToReject) return;
    setError(null);
    try {
      await callApi('put', `/admin/withdrawals/${withdrawalToReject.id}/reject`, { reason: rejectReason });
      handleCloseReject();
      fetchWithdrawals();
    } catch (apiError) {
      setError(`Failed to reject withdrawal #${withdrawalToReject.id}. Please try again.`);
      console.error(`Error rejecting withdrawal ${withdrawalToReject.id}:`, apiError);
    }
  };

  const handleSearchChange = (event) => {
    setPage(1);
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setPage(1);
    setStatusFilter(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.user?.name?.toLowerCase().includes(q) ||
      w.user?.email?.toLowerCase().includes(q) ||
      w.reference?.toLowerCase().includes(q)
    );
  });

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Withdrawals...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (filteredWithdrawals.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Withdrawals Found</Typography>
          <Typography color="text.secondary">There are no withdrawal requests matching this filter.</Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table stickyHeader aria-label="withdrawals table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bank Account</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Requested</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWithdrawals.map((withdrawal) => {
              const isPending = withdrawal.status === 'pending';

              return (
                <TableRow key={withdrawal.id} hover>
                  <TableCell>
                    <Chip
                      label={withdrawal.status}
                      color={STATUS_COLORS[withdrawal.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{withdrawal.user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{withdrawal.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    {withdrawal.bank_account ? (
                      <>
                        <Typography variant="body2">{withdrawal.bank_account.bank_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {withdrawal.bank_account.account_number} ({withdrawal.bank_account.account_name})
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No bank account on file</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(withdrawal.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Net: {formatCurrency(withdrawal.net_amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={new Date(withdrawal.created_at).toLocaleString()}>
                      <span>{formatDistanceToNow(new Date(withdrawal.created_at), { addSuffix: true })}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {isPending ? (
                      <>
                        <Tooltip title="Approve & Disburse">
                          <IconButton size="small" color="success" onClick={() => handleApprove(withdrawal.id)}>
                            <CheckCircleOutline />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => handleOpenReject(withdrawal)}>
                            <DoNotDisturb />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      withdrawal.reason && (
                        <Tooltip title={withdrawal.reason}>
                          <Typography variant="caption" color="text.secondary">{withdrawal.reason}</Typography>
                        </Tooltip>
                      )
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Paper sx={{ mt: 4, overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWallet sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">Withdrawal Requests</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name, email, reference..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      {renderContent()}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>

      <Dialog open={rejectDialogOpen} onClose={handleCloseReject} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Withdrawal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {withdrawalToReject?.user?.name} requested {formatCurrency(withdrawalToReject?.amount)}.
            Optionally explain why this is being rejected — the user will be able to see this.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReject}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject}>
            Reject Withdrawal
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WithdrawalApproval;
