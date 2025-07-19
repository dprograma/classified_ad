import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, CardMedia, Chip, Stack, Button, TextField } from '@mui/material';
import axios from 'axios';
import BoostAd from '../components/BoostAd';

function AdDetail() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ads/${id}`);
        setAd(response.data);
      } catch (error) {
        console.error('Error fetching ad:', error);
      }
    };

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`http://localhost:8000/api/ads/${id}/messages`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchAd();
    fetchMessages();
  }, [id]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && ad) {
        await axios.post(`http://localhost:8000/api/ads/${ad.id}/messages`, {
          message: newMessage,
          receiver_id: ad.user.id,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNewMessage('');
        // Re-fetch messages to update the chat
        const response = await axios.get(`http://localhost:8000/api/ads/${id}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please log in.');
    }
  };

  if (!ad) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 4, p: 2 }}>
      <Card>
        {ad.images.length > 0 && (
          <CardMedia
            component="img"
            height="400"
            image={`http://localhost:8000/storage/${ad.images[0].image_path}`}
            alt={ad.title}
            sx={{ objectFit: 'contain' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {ad.title}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ₦{ad.price}
          </Typography>
          <Typography variant="body1" paragraph>
            {ad.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip label={`Category: ${ad.category.name}`} color="primary" />
            <Chip label={`Location: ${ad.location}`} color="secondary" />
            <Chip label={`Status: ${ad.status}`} variant="outlined" />
            {ad.is_boosted && <Chip label="Boosted" color="success" />}
          </Stack>

          <Typography variant="h6" gutterBottom>
            Seller Information
          </Typography>
          <Typography variant="body2">
            Name: {ad.user.name}
          </Typography>
          <Typography variant="body2">
            Email: {ad.user.email}
          </Typography>
          <Typography variant="body2">
            Phone: {ad.user.phone_number}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" href={`tel:${ad.user.phone_number}`}>Call Seller</Button>
            <Button variant="contained" color="success" href={`https://wa.me/${ad.user.phone_number}`} target="_blank">WhatsApp Seller</Button>
            <Button variant="contained" onClick={() => setShowBoostDialog(true)}>Boost Ad</Button>
          </Stack>

          {showBoostDialog && (
            <BoostAd
              adId={ad.id}
              onClose={() => setShowBoostDialog(false)}
              onBoostSuccess={() => {
                setShowBoostDialog(false);
                // Optionally re-fetch ad details to show it's boosted
              }}
            />
          )}

          {ad.custom_fields && ad.custom_fields.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details
              </Typography>
              {ad.custom_fields.map((field) => (
                <Typography key={field.id} variant="body2">
                  {field.field_name}: {field.field_value}
                </Typography>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Chat with Seller</Typography>
            <Box sx={{ border: '1px solid #ccc', p: 2, height: 200, overflowY: 'auto', mb: 2 }}>
              {messages.map((msg) => (
                <Typography key={msg.id} variant="body2">
                  <strong>{msg.sender_id === ad.user.id ? ad.user.name : 'You'}:</strong> {msg.message}
                </Typography>
              ))}
            </Box>
            <TextField
              fullWidth
              label="Type your message"
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleSendMessage}>Send</Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}

export default AdDetail;