import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, IconButton, CircularProgress } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../AuthContext';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { loading, callApi } = useApi();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture ? `http://localhost:8000/storage/${user.profile_picture}` : '');
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phone_number);
      setProfilePicture(user.profile_picture ? `http://localhost:8000/storage/${user.profile_picture}` : '');
    }
  }, [user]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setNewProfilePicture(event.target.files[0]);
      setProfilePicture(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel expects PUT for form data updates
    if (name !== user.name) formData.append('name', name);
    if (email !== user.email) formData.append('email', email);
    if (phoneNumber !== user.phone_number) formData.append('phone_number', phoneNumber);
    if (newProfilePicture) formData.append('profile_picture', newProfilePicture);

    try {
      const token = localStorage.getItem('token');
      const response = await callApi('post', '/user/profile', formData, {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      });
      updateUser(response.user);
      toast.success('Profile updated successfully!');
      setNewProfilePicture(null); // Clear the new file after successful upload
    } catch (error) {
      // Error is already handled by the useApi hook
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await callApi('delete', '/user', null, {
          'Authorization': `Bearer ${token}`,
        });
        toast.success('Account deleted successfully.');
        logout();
      } catch (error) {
        // Error is already handled by the useApi hook
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profilePicture}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <input
            accept="image/*"
            id="icon-button-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Profile'}
          </Button>
        </form>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;