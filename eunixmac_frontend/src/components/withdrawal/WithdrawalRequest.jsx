import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { getUserBankAccounts } from '../../services/bankAccountService';
import { getWithdrawalStats, requestWithdrawal } from '../../services/withdrawalService';
import { Loader2, AlertCircle, CheckCircle, Wallet, TrendingUp } from 'lucide-react';

const WithdrawalRequest = ({ onSuccess }) => {
  const [stats, setStats] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('Failed to load withdrawal data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(formData.amount);

      if (amount < stats.minimum_withdrawal) {
        setError(`Minimum withdrawal amount is ₦${stats.minimum_withdrawal.toLocaleString()}`);
        setSubmitting(false);
        return;
      }

      if (amount > stats.available_balance) {
        setError(`Insufficient balance. Available: ₦${stats.available_balance.toLocaleString()}`);
        setSubmitting(false);
        return;
      }

      await requestWithdrawal(amount, formData.bank_account_id);
      setSuccess('Withdrawal request submitted successfully!');
      setFormData({ ...formData, amount: '' });

      // Reload stats
      const newStats = await getWithdrawalStats();
      setStats(newStats);

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.error || 'Failed to request withdrawal');
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
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please add and verify a bank account before requesting a withdrawal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>
          Withdraw your earnings to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₦{stats?.available_balance?.toLocaleString() || '0'}
                  </p>
                </div>
                <Wallet className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₦{stats?.total_earnings?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bank_account">Bank Account</Label>
            <select
              id="bank_account"
              className="w-full mt-1 p-2 border rounded-md"
              value={formData.bank_account_id}
              onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
              required
            >
              <option value="">Select Bank Account</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number} ({account.account_name})
                  {account.is_primary ? ' (Primary)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Withdrawal Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              min={stats?.minimum_withdrawal || 3000}
              max={stats?.available_balance || 0}
              step="0.01"
              placeholder={`Minimum: ₦${stats?.minimum_withdrawal?.toLocaleString() || '3,000'}`}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum withdrawal: ₦{stats?.minimum_withdrawal?.toLocaleString() || '3,000'}
            </p>
          </div>

          {formData.amount && (
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-semibold">
                  ₦{parseFloat(formData.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfer Fee:</span>
                <span className="font-semibold text-red-600">
                  -₦{stats?.transfer_fee?.toLocaleString() || '50'}
                </span>
              </div>
              <div className="flex justify-between text-base border-t pt-2">
                <span className="font-semibold">You will receive:</span>
                <span className="font-bold text-green-600">
                  ₦{calculateNetAmount().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !formData.amount || !formData.bank_account_id}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Request Withdrawal'
            )}
          </Button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold text-sm mb-2">Processing Information</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Withdrawals are processed automatically via Paystack</li>
            <li>• Transfer fee: ₦{stats?.transfer_fee?.toLocaleString() || '50'} per withdrawal</li>
            <li>• Funds typically arrive within minutes</li>
            <li>• Pending withdrawals: ₦{stats?.pending_withdrawals?.toLocaleString() || '0'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalRequest;
