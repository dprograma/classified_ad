import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import {
  getBanks,
  verifyBankAccount,
  getUserBankAccounts,
  addBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
} from '../../services/bankAccountService';
import { Loader2, Plus, Trash2, CheckCircle, AlertCircle, Star } from 'lucide-react';

const BankAccountManagement = () => {
  const [banks, setBanks] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      console.error('Failed to load banks:', err);
    }
  };

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await getUserBankAccounts();
      setBankAccounts(data);
    } catch (err) {
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.account_number || !formData.bank_code) {
      setError('Please select a bank and enter account number');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const result = await verifyBankAccount(formData.account_number, formData.bank_code);
      setFormData({
        ...formData,
        account_name: result.account_name,
      });
      setSuccess('Account verified successfully!');
    } catch (err) {
      setError(err.error || 'Failed to verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await addBankAccount(formData);
      setSuccess('Bank account added successfully!');
      setShowAddForm(false);
      setFormData({
        bank_code: '',
        bank_name: '',
        account_number: '',
        account_name: '',
      });
      loadBankAccounts();
    } catch (err) {
      setError(err.error || 'Failed to add bank account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      await setPrimaryBankAccount(accountId);
      setSuccess('Primary account updated successfully!');
      loadBankAccounts();
    } catch (err) {
      setError(err.error || 'Failed to set primary account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      await deleteBankAccount(accountId);
      setSuccess('Bank account deleted successfully!');
      loadBankAccounts();
    } catch (err) {
      setError(err.error || 'Failed to delete bank account');
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Bank Accounts</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </div>
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

          {showAddForm && (
            <Card className="mb-6 border-2">
              <CardContent className="pt-6">
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <div>
                    <Label htmlFor="bank">Bank</Label>
                    <select
                      id="bank"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.bank_code}
                      onChange={handleBankChange}
                      required
                    >
                      <option value="">Select Bank</option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="account_number"
                        type="text"
                        maxLength="10"
                        placeholder="0123456789"
                        value={formData.account_number}
                        onChange={(e) =>
                          setFormData({ ...formData, account_number: e.target.value })
                        }
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyAccount}
                        disabled={verifying || !formData.bank_code || !formData.account_number}
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </div>

                  {formData.account_name && (
                    <div>
                      <Label htmlFor="account_name">Account Name</Label>
                      <Input
                        id="account_name"
                        type="text"
                        value={formData.account_name}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting || !formData.account_name}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Bank Account'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No bank accounts added yet.</p>
              <p className="text-sm mt-2">Add a bank account to request withdrawals.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <Card key={account.id} className={account.is_primary ? 'border-blue-500' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.bank_name}</h3>
                          {account.is_primary && (
                            <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </span>
                          )}
                          {account.is_verified ? (
                            <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{account.account_name}</p>
                        <p className="text-sm text-gray-500">{account.account_number}</p>
                      </div>
                      <div className="flex gap-2">
                        {!account.is_primary && account.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetPrimary(account.id)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccountManagement;
