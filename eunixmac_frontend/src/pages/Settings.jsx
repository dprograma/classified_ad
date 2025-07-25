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
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: { xs: 2, md: 3 } }}>
        Settings
      </Typography>
      <Paper sx={{ p: { xs: 3, md: 5 }, maxWidth: 600, width: '100%', mx: 'auto', borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, mb: { xs: 2, md: 3 } }}>
          Account Management
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleClickOpen}
          sx={{ py: { xs: 1, md: 1.2 }, px: { xs: 2, md: 3 }, fontSize: { xs: '0.9rem', md: '1rem' } }}
        >
          Delete Account
        </Button>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            {"Delete Account?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
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
                InputProps={{ style: { fontSize: '0.9rem' } }}
                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
              /> */}
              {error && <Typography color="error.main" sx={{ mt: 2, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>{error}</Typography>}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, md: 2 } }}>
            <Button onClick={handleClose} sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>Cancel</Button>
            <Button onClick={handleDeleteAccount} autoFocus color="error" disabled={loading} sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
              {loading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Settings;
