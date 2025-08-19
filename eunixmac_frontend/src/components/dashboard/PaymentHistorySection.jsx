import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Stack,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Divider
} from '@mui/material';
import {
  Payment,
  Receipt,
  Download,
  Visibility,
  TrendingUp,
  School,
  Group,
  AttachMoney,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';
import useApi from '../../hooks/useApi';

const PaymentHistorySection = ({ payments }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const { callApi, loading } = useApi();

  // Filter payments by type
  const filterPayments = (type) => {
    if (!payments) return [];
    
    switch (type) {
      case 'boost':
        return payments.filter(p => p.payable_type === 'AdBoost');
      case 'materials':
        return payments.filter(p => p.payable_type === 'EducationalMaterial');
      case 'affiliate':
        return payments.filter(p => p.type === 'affiliate_payout');
      default:
        return payments;
    }
  };

  const getPaymentIcon = (payment) => {
    switch (payment.payable_type) {
      case 'AdBoost':
        return <TrendingUp color="primary" />;
      case 'EducationalMaterial':
        return <School color="info" />;
      default:
        return <Payment color="action" />;
    }
  };

  const getPaymentTypeLabel = (payment) => {
    switch (payment.payable_type) {
      case 'AdBoost':
        return 'Ad Boost';
      case 'EducationalMaterial':
        return 'Educational Material';
      default:
        return payment.type || 'Payment';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Schedule fontSize="small" />;
      case 'failed':
      case 'cancelled':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await callApi('GET', `/payments/${paymentId}/receipt`, null, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const tabLabels = ['All Payments', 'Ad Boosts', 'Materials', 'Affiliate Payouts'];
  const tabFilters = ['all', 'boost', 'materials', 'affiliate'];
  
  const currentPayments = filterPayments(tabFilters[selectedTab]);

  // Calculate totals
  const totalSpent = payments?.reduce((sum, p) => 
    p.status === 'success' && (p.payable_type === 'AdBoost' || p.payable_type === 'EducationalMaterial') 
      ? sum + parseFloat(p.amount) : sum, 0) || 0;

  const totalEarned = payments?.reduce((sum, p) => 
    p.status === 'success' && p.type === 'affiliate_payout' 
      ? sum + parseFloat(p.amount) : sum, 0) || 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Payment History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track all your transactions and earnings
      </Typography>

      {/* Payment Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AttachMoney sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ₦{totalSpent.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₦{totalEarned.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Receipt sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {payments?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={index}
              label={`${label} (${filterPayments(tabFilters[index]).length})`}
            />
          ))}
        </Tabs>
      </Card>

      {/* Payments Table */}
      {currentPayments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Payment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No payments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTab === 0 ? "You haven't made any payments yet." : `No ${tabLabels[selectedTab].toLowerCase()} found.`}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                          {getPaymentIcon(payment)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {payment.reference}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.description || getPaymentTypeLabel(payment)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPaymentTypeLabel(payment)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color={
                        payment.type === 'affiliate_payout' ? 'success.main' : 'text.primary'
                      }>
                        {payment.type === 'affiliate_payout' ? '+' : '-'}₦{parseFloat(payment.amount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                        icon={getStatusIcon(payment.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(payment.created_at), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setReceiptDialogOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        {payment.status === 'success' && (
                          <IconButton
                            size="small"
                            onClick={() => downloadReceipt(payment.id)}
                            disabled={loading}
                          >
                            <Download />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Receipt/Details Dialog */}
      <Dialog open={receiptDialogOpen} onClose={() => setReceiptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Stack spacing={3}>
              <Alert severity="info">
                Transaction Reference: {selectedPayment.reference}
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedPayment.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getPaymentTypeLabel(selectedPayment)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={
                    selectedPayment.type === 'affiliate_payout' ? 'success.main' : 'text.primary'
                  }>
                    {selectedPayment.type === 'affiliate_payout' ? '+' : '-'}₦{parseFloat(selectedPayment.amount).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedPayment.status}
                    color={getStatusColor(selectedPayment.status)}
                    size="small"
                    icon={getStatusIcon(selectedPayment.status)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedPayment.created_at), 'MMMM dd, yyyy - HH:mm:ss')}
                  </Typography>
                </Grid>
              </Grid>
              
              {selectedPayment.metadata && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Additional Details
                    </Typography>
                    <pre style={{ 
                      fontSize: '0.875rem', 
                      backgroundColor: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '4px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(selectedPayment.metadata, null, 2)}
                    </pre>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>
            Close
          </Button>
          {selectedPayment?.status === 'success' && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => downloadReceipt(selectedPayment.id)}
              disabled={loading}
            >
              Download Receipt
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistorySection;