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
  DialogActions
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

const AgentSection = ({ materials, onRefresh }) => {
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const { user } = useAuth();
  const { callApi, loading } = useApi();

  const handleBecomeAgent = async () => {
    try {
      await callApi('POST', '/user/become-agent');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming agent:', error);
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
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  fullWidth
                >
                  Earnings Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentSection;