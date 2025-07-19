import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchAds = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/ads', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAds(response.data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    fetchUsers();
    fetchAds();
  }, []);

  const handleVerifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/admin/users/${userId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map(user => user.id === userId ? { ...user, is_verified: true } : user));
      alert('User verified!');
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Failed to verify user.');
    }
  };

  const handleApproveAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/admin/ads/${adId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds(ads.map(ad => ad.id === adId ? { ...ad, status: 'active' } : ad));
      alert('Ad approved!');
    } catch (error) {
      console.error('Error approving ad:', error);
      alert('Failed to approve ad.');
    }
  };

  const handleRejectAd = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/admin/ads/${adId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds(ads.map(ad => ad.id === adId ? { ...ad, status: 'rejected' } : ad));
      alert('Ad rejected!');
    } catch (error) {
      console.error('Error rejecting ad:', error);
      alert('Failed to reject ad.');
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>Admin Dashboard</Typography>

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>Users</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Affiliate</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.is_verified ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.is_agent ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.is_affiliate ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {!user.is_verified && (
                    <Button variant="contained" size="small" onClick={() => handleVerifyUser(user.id)}>
                      Verify
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>Ads</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Posted By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.id}</TableCell>
                <TableCell>{ad.title}</TableCell>
                <TableCell>{ad.status}</TableCell>
                <TableCell>{ad.user ? ad.user.name : 'N/A'}</TableCell>
                <TableCell>
                  {ad.status !== 'active' && (
                    <Button variant="contained" size="small" onClick={() => handleApproveAd(ad.id)} sx={{ mr: 1 }}>
                      Approve
                    </Button>
                  )}
                  {ad.status !== 'rejected' && (
                    <Button variant="outlined" color="error" size="small" onClick={() => handleRejectAd(ad.id)}>
                      Reject
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdminDashboard;