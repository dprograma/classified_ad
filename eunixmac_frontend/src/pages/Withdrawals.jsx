import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fade,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  AccountBalanceWallet,
  History,
  AccountBalance,
  Home,
  NavigateNext
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import EarningsWidget from '../components/withdrawal/EarningsWidget';
import WithdrawalRequest from '../components/withdrawal/WithdrawalRequest';
import WithdrawalHistory from '../components/withdrawal/WithdrawalHistory';
import BankAccountManagement from '../components/withdrawal/BankAccountManagement';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Fade in={true} timeout={500}>
          <Box sx={{ py: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

const Withdrawals = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const handleWithdrawalSuccess = () => {
    // Trigger refresh of history
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 3 }}
          >
            <MuiLink
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: 20 }} />
              Home
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/dashboard"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Dashboard
            </MuiLink>
            <Typography color="text.primary">Withdrawals</Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Earnings & Withdrawals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your book sales earnings and withdraw funds to your bank account
            </Typography>
          </Box>

          {/* Earnings Overview */}
          <Box sx={{ mb: 4 }}>
            <EarningsWidget />
          </Box>

          {/* Tabs Section */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                }
              }}
            >
              <Tab
                icon={<AccountBalanceWallet />}
                iconPosition="start"
                label="Request Withdrawal"
              />
              <Tab
                icon={<History />}
                iconPosition="start"
                label="Withdrawal History"
              />
              <Tab
                icon={<AccountBalance />}
                iconPosition="start"
                label="Bank Accounts"
              />
            </Tabs>

            <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
              <TabPanel value={activeTab} index={0}>
                <WithdrawalRequest onSuccess={handleWithdrawalSuccess} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <WithdrawalHistory refreshTrigger={refreshTrigger} />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <BankAccountManagement />
              </TabPanel>
            </Box>
          </Paper>
        </Container>
  );
};

export default Withdrawals;
