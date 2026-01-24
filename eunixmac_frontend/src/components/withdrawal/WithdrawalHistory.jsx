import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { getWithdrawalHistory, cancelWithdrawal } from '../../services/withdrawalService';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

const WithdrawalHistory = ({ refreshTrigger }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      setError('Failed to load withdrawal history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId) => {
    if (!confirm('Are you sure you want to cancel this withdrawal?')) {
      return;
    }

    try {
      await cancelWithdrawal(withdrawalId);
      loadWithdrawals();
    } catch (err) {
      setError(err.error || 'Failed to cancel withdrawal');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      processing: { variant: 'default', icon: Loader2, label: 'Processing' },
      completed: { variant: 'success', icon: CheckCircle, label: 'Completed' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' },
      cancelled: { variant: 'outline', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && withdrawals.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal History</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No withdrawal history yet.</p>
            <p className="text-sm mt-2">Your withdrawal requests will appear here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold">
                            ₦{parseFloat(withdrawal.amount).toLocaleString()}
                          </span>
                          {getStatusBadge(withdrawal.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Bank:</strong> {withdrawal.bank_account?.bank_name || 'N/A'}
                          </p>
                          <p>
                            <strong>Account:</strong>{' '}
                            {withdrawal.bank_account?.account_number || 'N/A'} (
                            {withdrawal.bank_account?.account_name || 'N/A'})
                          </p>
                          <p>
                            <strong>Fee:</strong> -₦{parseFloat(withdrawal.fee).toLocaleString()}
                          </p>
                          <p>
                            <strong>Net Amount:</strong> ₦
                            {parseFloat(withdrawal.net_amount).toLocaleString()}
                          </p>
                          <p>
                            <strong>Reference:</strong> {withdrawal.reference}
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(withdrawal.created_at)}
                          </p>
                          {withdrawal.reason && (
                            <p className="text-red-600">
                              <strong>Reason:</strong> {withdrawal.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {withdrawal.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelWithdrawal(withdrawal.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistory;
