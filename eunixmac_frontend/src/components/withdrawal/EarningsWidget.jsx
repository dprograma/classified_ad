import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  AttachMoney,
  Schedule
} from '@mui/icons-material';
import { getWithdrawalStats } from '../../services/withdrawalService';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import { formatCurrency } from '../../utils/formatCurrency';

const EarningsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getWithdrawalStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StatCardsContainer
      columns={{ mobile: 2, tablet: 2, desktop: 4 }}
      gap="16px"
    >
      <EnhancedStatCard
        icon={TrendingUp}
        value={formatCurrency(stats?.total_earnings || 0)}
        label="Total Earnings"
        color="#10b981"
        size="medium"
      />

      <EnhancedStatCard
        icon={AccountBalanceWallet}
        value={formatCurrency(stats?.available_balance || 0)}
        label="Available Balance"
        color="#3b82f6"
        size="medium"
      />

      <EnhancedStatCard
        icon={AttachMoney}
        value={formatCurrency(stats?.total_withdrawn || 0)}
        label="Total Withdrawn"
        color="#8b5cf6"
        size="medium"
      />

      <EnhancedStatCard
        icon={Schedule}
        value={formatCurrency(stats?.pending_withdrawals || 0)}
        label="Pending Withdrawals"
        color="#f59e0b"
        size="medium"
      />
    </StatCardsContainer>
  );
};

export default EarningsWidget;
