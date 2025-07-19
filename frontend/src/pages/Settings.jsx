import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress } from '@mui/material';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPassword('');
    setError('');
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // data: { current_password: password } // Uncomment if backend requires password for deletion
      });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Account Management
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleClickOpen}
        >
          Delete Account
        </Button>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Delete Account?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete your account? This action cannot be undone.
              {/* Uncomment the TextField if backend requires password for deletion */}
              {/* <TextField
                autoFocus
                margin="dense"
                id="password"
                label="Enter your password to confirm"
                type="password"
                fullWidth
                variant="standard"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              /> */}
              {error && <Typography color="error.main" sx={{ mt: 2 }}>{error}</Typography>}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteAccount} autoFocus color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Settings;
