import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Language,
  Delete,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Phone,
  Save,
  Warning
} from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../AuthContext';

const AccountSettingsSection = ({ user, onRefresh }) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [settings, setSettings] = useState({
    email_notifications: user?.settings?.email_notifications ?? true,
    sms_notifications: user?.settings?.sms_notifications ?? false,
    marketing_emails: user?.settings?.marketing_emails ?? true,
    push_notifications: user?.settings?.push_notifications ?? true,
    show_phone: user?.settings?.show_phone ?? true,
    show_email: user?.settings?.show_email ?? false,
    language: user?.settings?.language ?? 'en'
  });

  const { callApi, loading } = useApi();
  const { logout } = useAuth();

  const handleSettingsChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const saveSettings = async () => {
    try {
      await callApi('PUT', '/user/settings', settings);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    try {
      await callApi('POST', '/user/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.confirm_password
      });
      setPasswordDialogOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const deleteAccount = async () => {
    if (emailConfirmation !== user?.email) {
      alert('Email confirmation does not match your email address');
      return;
    }

    try {
      await callApi('DELETE', '/user', {
        current_password: deletePassword
      });
      setDeleteAccountDialogOpen(false);
      setEmailConfirmation('');
      setDeletePassword('');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const redirectToSupport = (type) => {
    const message = encodeURIComponent(`I would like to change my ${type}. Please assist me with this request.`);
    window.open(`mailto:support@eunixmac.com?subject=Account Change Request - ${type}&body=${message}`, '_blank');
  };

  const handleEmailChange = () => {
    // For now, allow email changes through profile update
    // In the future, you might want to redirect to support for verification
    const newEmail = prompt('Enter your new email address:');
    if (newEmail && newEmail !== user?.email) {
      // You can implement email change via profile API
      alert('Email change functionality will be implemented. For now, please contact support.');
      redirectToSupport('Email Address');
    }
  };

  const handlePhoneChange = () => {
    const newPhone = prompt('Enter your new phone number:');
    if (newPhone && newPhone !== user?.phone_number) {
      // You can implement phone change via profile API
      alert('Phone number change functionality will be implemented. For now, please contact support.');
      redirectToSupport('Phone Number');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Account Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account preferences and security settings
      </Typography>

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Notifications color="primary" />
                <Typography variant="h6">
                  Notifications
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email_notifications}
                      onChange={(e) => handleSettingsChange('email_notifications', e.target.checked)}
                    />
                  }
                  label="Email notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sms_notifications}
                      onChange={(e) => handleSettingsChange('sms_notifications', e.target.checked)}
                    />
                  }
                  label="SMS notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.marketing_emails}
                      onChange={(e) => handleSettingsChange('marketing_emails', e.target.checked)}
                    />
                  }
                  label="Marketing emails"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.push_notifications}
                      onChange={(e) => handleSettingsChange('push_notifications', e.target.checked)}
                    />
                  }
                  label="Push notifications"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Security color="primary" />
                <Typography variant="h6">
                  Privacy
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.show_phone}
                      onChange={(e) => handleSettingsChange('show_phone', e.target.checked)}
                    />
                  }
                  label="Show phone number to buyers"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.show_email}
                      onChange={(e) => handleSettingsChange('show_email', e.target.checked)}
                    />
                  }
                  label="Show email to buyers"
                />
                
                <TextField
                  select
                  label="Language"
                  value={settings.language}
                  onChange={(e) => handleSettingsChange('language', e.target.value)}
                  SelectProps={{ native: true }}
                  fullWidth
                  size="small"
                >
                  <option value="en">English</option>
                  <option value="pidgin">Pidgin English</option>
                </TextField>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Settings */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveSettings}
              disabled={loading}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>

        {/* Account Security */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Security
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Address"
                    secondary={user?.email}
                  />
                  <Button variant="outlined" size="small" onClick={handleEmailChange}>
                    Change
                  </Button>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={user?.phone_number || 'Not provided'}
                  />
                  <Button variant="outlined" size="small" onClick={handlePhoneChange}>
                    {user?.phone_number ? 'Change' : 'Add'}
                  </Button>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Lock color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password"
                    secondary="Last changed: Never"
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: 1, borderColor: 'error.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Warning color="error" />
                <Typography variant="h6" color="error">
                  Danger Zone
                </Typography>
              </Box>
              
              <Alert severity="error" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. This will permanently delete your account, 
                all your ads, messages, and associated data.
              </Alert>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteAccountDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              fullWidth
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={changePassword} 
            variant="contained" 
            disabled={loading || !passwordData.current_password || !passwordData.new_password}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountDialogOpen} onClose={() => setDeleteAccountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is irreversible!
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Permanently delete your account" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Remove all your ads from the platform" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Delete all your messages and conversations" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Cancel any active boosts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Remove you from affiliate program" />
            </ListItem>
          </List>
          <Typography sx={{ mt: 2 }}>
            Type your email address to confirm: <strong>{user?.email}</strong>
          </Typography>
          <TextField
            placeholder={user?.email}
            value={emailConfirmation}
            onChange={(e) => setEmailConfirmation(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
          <Typography sx={{ mt: 2 }}>
            Enter your password to confirm deletion:
          </Typography>
          <TextField
            type="password"
            placeholder="Enter your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={deleteAccount}
            color="error"
            disabled={loading || !emailConfirmation || emailConfirmation !== user?.email || !deletePassword}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountSettingsSection;