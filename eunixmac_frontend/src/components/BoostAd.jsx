import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import axios from 'axios';

function BoostAd({ adId, onClose }) {
  const [amount, setAmount] = useState(0);

  const handleBoost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to boost an ad.');
        return;
      }

      const response = await axios.post(`http://localhost:8000/api/ads/${adId}/boost`, { amount }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data && response.data.data.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      } else {
        alert('Failed to initiate payment.');
      }
    } catch (error) {
      console.error('Error boosting ad:', error);
      alert('Error boosting ad.');
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Boost Ad</DialogTitle>
      <DialogContent>
        <Typography>Select a boosting package:</Typography>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => setAmount(1000)}>7 days (₦1,000)</Button>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => setAmount(1800)}>14 days (₦1,800)</Button>
        <Button variant="outlined" sx={{ m: 1 }} onClick={() => setAmount(3500)}>30 days (₦3,500)</Button>
        <TextField
          label="Custom Amount (₦)"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleBoost} disabled={amount <= 0}>Boost Now</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BoostAd;