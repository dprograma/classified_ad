import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  BusinessCenter,
  School,
  AttachMoney,
  Analytics,
  Upload,
  CheckCircle,
  Info,
  Schedule,
  Download,
  Star,
  TrendingUp,
  AccountBalance,
  Calculate,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EnhancedStatCard from '../common/EnhancedStatCard';
import StatCardsContainer from '../common/StatCardsContainer';
import EarningsWidget from '../withdrawal/EarningsWidget';
import { useAuth } from '../../AuthContext';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const AgentSection = ({ materials, onRefresh }) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [earningsReportDialogOpen, setEarningsReportDialogOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const { callApi, loading } = useApi();
  const navigate = useNavigate();

  const handleBecomeAgent = async () => {
    try {
      const response = await callApi('POST', '/user/become-agent');

      // Update user in context with the returned user data
      if (response.user) {
        updateUser(response.user);
      }

      toast.success('Congratulations! You are now an agent. You can start uploading educational materials.');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming agent:', error);

      // Handle "already an agent" case gracefully
      if (error.message && error.message.includes('already an agent')) {
        toast.info('You are already an agent!');
        // Force refresh user data to sync state
        if (onRefresh) onRefresh();
      } else {
        toast.error(error.message || 'Failed to become an agent. Please try again.');
      }
    }
  };

  const agentStats = {
    total_materials: materials?.length || 0,
    active_materials: materials?.filter(m => m.status === 'approved').length || 0,
    total_sales: materials?.reduce((sum, m) => sum + (m.sales_count || 0), 0) || 0,
    total_earnings: materials?.reduce((sum, m) => sum + (m.total_earnings || 0), 0) || 0
  };

  if (!user?.is_agent) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Agent Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Become an agent to upload and sell educational materials
        </Typography>

        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <BusinessCenter sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Become an Agent
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join our agent program to upload and sell educational materials like past questions, ebooks, and publications.
            </Typography>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Agent Benefits:
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemText primary="• Upload and sell educational materials" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Earn money from each sale" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Access to agent dashboard and analytics" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText primary="• Priority support and verification" />
                </ListItem>
              </List>
            </Alert>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<Info />}
                onClick={() => setInfoDialogOpen(true)}
              >
                Learn More
              </Button>
              <Button
                variant="contained"
                startIcon={<BusinessCenter />}
                onClick={handleBecomeAgent}
                disabled={loading}
              >
                Become Agent
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Info Dialog */}
        <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Agent Program Information</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Alert severity="info">
                Our agent program allows qualified users to upload and sell educational materials on our platform.
              </Alert>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  What you can sell:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Past Questions" 
                      secondary="Exam past questions for various subjects and levels"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="E-books" 
                      secondary="Educational books and study materials"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Publications" 
                      secondary="Research papers, journals, and academic publications"
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  How it works:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Apply to become an agent" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Get approved by our team" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Upload your educational materials" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Set prices and earn from sales" />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setInfoDialogOpen(false);
                handleBecomeAgent();
              }}
              disabled={loading}
            >
              Apply Now
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Agent Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your educational materials and track sales performance
      </Typography>

      {/* Earnings Widget */}
      <Box sx={{ mb: 4 }}>
        <EarningsWidget />
      </Box>

      {/* Agent Stats */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={School}
          value={agentStats.total_materials}
          label="Total Materials"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={CheckCircle}
          value={agentStats.active_materials}
          label="Active Materials"
          color="#10b981"
          size="medium"
        />

        <EnhancedStatCard
          icon={Analytics}
          value={agentStats.total_sales}
          label="Total Sales"
          color="#06b6d4"
          size="medium"
        />

        <EnhancedStatCard
          icon={AttachMoney}
          value={`₦${agentStats.total_earnings.toLocaleString()}`}
          label="Total Earnings"
          color="#f59e0b"
          size="medium"
        />
      </StatCardsContainer>

      {/* Quick Actions */}
      <Grid container spacing={0}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Materials
              </Typography>
              {materials?.length > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Material management interface coming soon...
                </Typography>
              ) : (
                <Alert severity="info">
                  You haven't uploaded any materials yet. Start by uploading your first educational material.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  fullWidth
                  onClick={() => navigate('/books/upload')}
                >
                  Upload Material
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AccountBalanceWallet />}
                  fullWidth
                  onClick={() => navigate('/withdrawals')}
                  color="success"
                >
                  Manage Withdrawals
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  fullWidth
                  onClick={() => setAnalyticsDialogOpen(true)}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  fullWidth
                  onClick={() => setEarningsReportDialogOpen(true)}
                >
                  Earnings Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onClose={() => setAnalyticsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Agent Analytics</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Detailed analytics and performance metrics for your educational materials.
          </Typography>
          
          {/* Performance Overview */}
          <StatCardsContainer
            columns={{ mobile: 2, tablet: 2, desktop: 4 }}
            gap="16px"
            className="mb-6"
          >
            <EnhancedStatCard
              icon={CheckCircle}
              value={materials?.filter(m => m.status === 'approved').length || 0}
              label="Approved Materials"
              color="#10b981"
              size="medium"
            />

            <EnhancedStatCard
              icon={Schedule}
              value={materials?.filter(m => m.status === 'pending').length || 0}
              label="Pending Review"
              color="#f59e0b"
              size="medium"
            />

            <EnhancedStatCard
              icon={Download}
              value={materials?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0}
              label="Total Downloads"
              color="#06b6d4"
              size="medium"
            />

            <EnhancedStatCard
              icon={Star}
              value={materials?.length > 0 ? (
                (materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length).toFixed(1)
              ) : '0.0'}
              label="Average Rating"
              color="#8b5cf6"
              size="medium"
            />
          </StatCardsContainer>

          {/* Material Performance Table */}
          <Typography variant="h6" gutterBottom>
            Material Performance
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Downloads</TableCell>
                  <TableCell align="right">Earnings</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials && materials.length > 0 ? (
                  materials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell>{material.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={material.type} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={material.status} 
                          size="small"
                          color={
                            material.status === 'approved' ? 'success' :
                            material.status === 'pending' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">{material.download_count || 0}</TableCell>
                      <TableCell align="right">₦{(material.earnings || 0).toLocaleString()}</TableCell>
                      <TableCell>{material.rating || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No materials uploaded yet. Upload your first educational material to see analytics.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Earnings Report Dialog */}
      <Dialog open={earningsReportDialogOpen} onClose={() => setEarningsReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Earnings Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Detailed breakdown of your earnings from educational material sales.
          </Typography>
          
          {/* Earnings Summary */}
          <StatCardsContainer
            columns={{ mobile: 2, tablet: 2, desktop: 4 }}
            gap="16px"
            className="mb-6"
          >
            <EnhancedStatCard
              icon={AttachMoney}
              value={`₦${agentStats.total_earnings.toLocaleString()}`}
              label="Total Earnings"
              color="#10b981"
              size="medium"
            />

            <EnhancedStatCard
              icon={TrendingUp}
              value={`₦${Math.round(agentStats.total_earnings * 0.7).toLocaleString()}`}
              label="Net Earnings (70%)"
              color="#3b82f6"
              size="medium"
            />

            <EnhancedStatCard
              icon={AccountBalance}
              value={`₦${Math.round(agentStats.total_earnings * 0.3).toLocaleString()}`}
              label="Platform Fee (30%)"
              color="#f59e0b"
              size="medium"
            />

            <EnhancedStatCard
              icon={Calculate}
              value={`₦${agentStats.total_sales > 0 ? Math.round(agentStats.total_earnings / agentStats.total_sales) : 0}`}
              label="Avg. per Sale"
              color="#06b6d4"
              size="medium"
            />
          </StatCardsContainer>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Agent earnings are calculated as 70% of the sale price. 
              The remaining 30% covers platform maintenance, payment processing, and support.
            </Typography>
          </Alert>

          {/* Recent Earnings */}
          <Typography variant="h6" gutterBottom>
            Recent Earnings
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Sale Price</TableCell>
                  <TableCell align="right">Your Earnings</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials && materials.some(m => m.recent_sales?.length > 0) ? (
                  materials.flatMap(m => m.recent_sales || []).map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.material_title}</TableCell>
                      <TableCell align="right">₦{sale.price?.toLocaleString()}</TableCell>
                      <TableCell align="right">₦{Math.round(sale.price * 0.7).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sale.payout_status || 'Pending'} 
                          size="small"
                          color={sale.payout_status === 'paid' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No earnings yet. Upload and sell educational materials to start earning.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEarningsReportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentSection;