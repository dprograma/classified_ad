import React, { useState, useEffect } from 'react';
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
  Divider,
  CircularProgress,
  Pagination
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
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { format } from 'date-fns';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

const PaymentHistorySection = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spent: 0,
    total_earned: 0,
    total_transactions: 0,
    material_payments: 0,
    affiliate_payments: 0
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });
  const { callApi, loading } = useApi();

  const tabLabels = ['All Payments', 'Materials', 'Affiliate Payouts'];
  const tabFilters = ['all', 'materials', 'affiliate'];

  // Fetch payment statistics
  const fetchStats = async () => {
    try {
      const response = await callApi('GET', '/payments/stats');
      setStats(response);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  // Fetch payments from API
  const fetchPayments = async (page = 1, type = 'all') => {
    try {
      setPaymentsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString()
      });

      if (type !== 'all') {
        params.append('type', type);
      }

      const response = await callApi('GET', `/payments?${params.toString()}`);

      setPayments(response.data);
      setPagination({
        current_page: response.current_page,
        total: response.total,
        per_page: response.per_page,
        last_page: response.last_page
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Load payments when component mounts or tab changes
  useEffect(() => {
    fetchPayments(1, tabFilters[selectedTab]);
  }, [selectedTab]);

  // Load stats when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    fetchPayments(newPage, tabFilters[selectedTab]);
  };

  // Since we're fetching filtered data from API, we just return the payments
  const filterPayments = (type) => {
    return payments || [];
  };

  const getPaymentIcon = (payment) => {
    switch (payment.payable_type) {
      case 'EducationalMaterial':
        return <School color="info" />;
      default:
        return <Payment color="action" />;
    }
  };

  const getPaymentTypeLabel = (payment) => {
    switch (payment.payable_type) {
      case 'Book':
        return 'Book';
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
      // Use direct fetch for blob download
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/${paymentId}/receipt`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('Receipt download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `receipt-${paymentId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };
  
  const currentPayments = filterPayments(tabFilters[selectedTab]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Payment History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track all your transactions and earnings
      </Typography>

      {/* Payment Summary */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="20px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={TrendingUp}
          value={`₦${stats.total_spent.toLocaleString()}`}
          label="Total Spent"
          color="#ef4444"
          size="medium"
          subtitle="Money spent on materials"
        />

        <EnhancedStatCard
          icon={AttachMoney}
          value={`₦${stats.total_earned.toLocaleString()}`}
          label="Total Earned"
          color="#10b981"
          size="medium"
          subtitle="Earnings from affiliate & sales"
        />

        <EnhancedStatCard
          icon={Receipt}
          value={stats.total_transactions}
          label="Total Transactions"
          color="#3b82f6"
          size="medium"
          subtitle="All payment activities"
        />

        <EnhancedStatCard
          icon={School}
          value={stats.material_payments}
          label="Material Payments"
          color="#8b5cf6"
          size="medium"
          subtitle="Ad promotion payments"
        />
      </StatCardsContainer>

      {/* Payment Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => {
            let count = pagination.total;
            if (selectedTab !== index) {
              switch (index) {
                case 0: count = stats.total_transactions; break;
                case 1: count = stats.material_payments; break;
                case 2: count = stats.affiliate_payments; break;
              }
            }
            return (
              <Tab
                key={index}
                label={selectedTab === index ? `${label} (${count})` : label}
              />
            );
          })}
        </Tabs>
      </Card>

      {/* Payments Table */}
      {paymentsLoading ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading payment history...
            </Typography>
          </CardContent>
        </Card>
      ) : currentPayments.length === 0 ? (
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
                          {payment.ad_details && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ad: {payment.ad_details.title} (₦{parseFloat(payment.ad_details.price).toLocaleString()})
                            </Typography>
                          )}
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

      {/* Pagination */}
      {!paymentsLoading && currentPayments.length > 0 && pagination.last_page > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.last_page}
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
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
                {selectedPayment.ad_details && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Associated Ad
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPayment.ad_details.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ad Price: ₦{parseFloat(selectedPayment.ad_details.price).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
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