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
  Info
} from '@mui/icons-material';
import { useAuth } from '../../AuthContext';
import useApi from '../../hooks/useApi';
import { toast } from 'react-toastify';

const AgentSection = ({ materials, onRefresh }) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [earningsReportDialogOpen, setEarningsReportDialogOpen] = useState(false);
  const { user } = useAuth();
  const { callApi, loading } = useApi();

  const handleBecomeAgent = async () => {
    try {
      const response = await callApi('POST', '/user/become-agent');
      toast.success('Congratulations! You are now an agent. You can start uploading educational materials.');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming agent:', error);
      toast.error(error.message || 'Failed to become an agent. Please try again.');
    }
  };

  const agentStats = {
    total_materials: materials?.length || 0,
    active_materials: materials?.filter(m => m.status === 'active').length || 0,
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

      {/* Agent Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {agentStats.total_materials}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Materials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {agentStats.active_materials}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Materials
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Analytics sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {agentStats.total_sales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                ₦{agentStats.total_earnings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
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
                  href="/educational-materials/upload"
                >
                  Upload Material
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {materials?.filter(m => m.status === 'approved').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Materials
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {materials?.filter(m => m.status === 'pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {materials?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Downloads
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {materials?.length > 0 ? (
                      (materials.reduce((sum, m) => sum + (m.rating || 0), 0) / materials.length).toFixed(1)
                    ) : '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    ₦{agentStats.total_earnings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="info.main" fontWeight="bold">
                    ₦{Math.round(agentStats.total_earnings * 0.7).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Earnings (70%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="warning.main" fontWeight="bold">
                    ₦{Math.round(agentStats.total_earnings * 0.3).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Platform Fee (30%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ₦{agentStats.total_sales > 0 ? Math.round(agentStats.total_earnings / agentStats.total_sales) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. per Sale
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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