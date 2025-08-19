import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  IconButton,
  Stack
} from '@mui/material';
import {
  Edit,
  Camera,
  Verified,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  BusinessCenter,
  Group,
  Security,
  Badge
} from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import { getStorageUrl } from '../../config/api';

const ProfileSection = ({ user, onRefresh }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone_number: user?.phone_number || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const { callApi, loading } = useApi();

  const handleEditProfile = async () => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });
      
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      }

      await callApi('POST', '/user/profile', formData, {
        'Content-Type': 'multipart/form-data'
      });
      
      setEditDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleBecomeAgent = async () => {
    try {
      await callApi('POST', '/user/become-agent');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming agent:', error);
    }
  };

  const handleBecomeAffiliate = async () => {
    try {
      await callApi('POST', '/user/become-affiliate');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error becoming affiliate:', error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account information and verification status
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="flex-start" gap={3} mb={3}>
                <Box position="relative">
                  <Avatar
                    src={user?.profile_picture ? getStorageUrl(user.profile_picture) : null}
                    sx={{ width: 100, height: 100, fontSize: '2rem' }}
                  >
                    {user?.name?.charAt(0)}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                    size="small"
                  >
                    <Camera fontSize="small" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </IconButton>
                </Box>

                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" fontWeight="bold">
                      {user?.name}
                    </Typography>
                    {user?.is_verified && (
                      <Verified color="primary" />
                    )}
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    {user?.bio || 'No bio provided'}
                  </Typography>

                  <Stack direction="row" spacing={1} mb={2}>
                    {user?.is_agent && (
                      <Chip label="Agent" color="info" icon={<BusinessCenter />} />
                    )}
                    {user?.is_affiliate && (
                      <Chip label="Affiliate" color="success" icon={<Group />} />
                    )}
                    {user?.is_verified && (
                      <Chip label="Verified" color="primary" icon={<Verified />} />
                    )}
                  </Stack>

                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Information */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={user?.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={user?.phone_number || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Location"
                        secondary={user?.location || 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status & Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Verification Status */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verification Status
                </Typography>
                
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Email</Typography>
                    <Chip
                      label={user?.email_verified_at ? "Verified" : "Pending"}
                      color={user?.email_verified_at ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Profile</Typography>
                    <Chip
                      label={user?.is_verified ? "Verified" : "Unverified"}
                      color={user?.is_verified ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                  
                  {!user?.is_verified && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Badge />}
                      onClick={() => setVerificationDialogOpen(true)}
                    >
                      Get Verified
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Account Upgrade */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Upgrade
                </Typography>
                
                <Stack spacing={1}>
                  {!user?.is_agent && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BusinessCenter />}
                      onClick={handleBecomeAgent}
                      disabled={loading}
                    >
                      Become an Agent
                    </Button>
                  )}
                  
                  {!user?.is_affiliate && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Group />}
                      onClick={handleBecomeAffiliate}
                      disabled={loading}
                    >
                      Join Affiliate Program
                    </Button>
                  )}

                  {user?.is_agent && user?.is_affiliate && (
                    <Alert severity="success">
                      You have access to all account features!
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Statistics
                </Typography>
                
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total Ads</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.ads_count || 0}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Active Ads</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.active_ads_count || 0}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total Views</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.total_views || 0}
                    </Typography>
                  </Box>
                  
                  {user?.is_affiliate && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Referrals</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {user?.referral_count || 0}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={profileData.phone_number}
              onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
            />
            <TextField
              label="Location"
              fullWidth
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={3}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            />
            
            {profileImage && (
              <Alert severity="info">
                Profile picture will be updated after saving
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained" disabled={loading}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Verification</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Profile verification is done by our admin team. Please contact support with your ID or business proof to get verified.
          </Alert>
          <Typography variant="body2">
            Verified accounts get:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Trust badge on your profile and ads" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Higher visibility in search results" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Access to premium features" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.open('/help', '_blank')}>
            Contact Support
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSection;