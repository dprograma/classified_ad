import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import EarningsWidget from '../components/withdrawal/EarningsWidget';
import WithdrawalRequest from '../components/withdrawal/WithdrawalRequest';
import WithdrawalHistory from '../components/withdrawal/WithdrawalHistory';
import BankAccountManagement from '../components/withdrawal/BankAccountManagement';

const Withdrawals = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWithdrawalSuccess = () => {
    // Trigger refresh of history
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Earnings & Withdrawals</h1>
        <p className="text-gray-600">
          Manage your book sales earnings and withdraw funds to your bank account
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="mb-8">
        <EarningsWidget />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="mt-6">
          <WithdrawalRequest onSuccess={handleWithdrawalSuccess} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <WithdrawalHistory refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <BankAccountManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Withdrawals;
