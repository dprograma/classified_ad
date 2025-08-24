import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, CardMedia, Chip, Stack, Button, TextField, Container, CircularProgress } from '@mui/material';
import BoostAd from '../components/BoostAd';
import useApi from '../hooks/useApi';

function AdDetail() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBoostDialog, setShowBoostDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callApi } = useApi();

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first for ad details
        const adCacheKey = `ad_detail_${id}`;
        const cachedAd = sessionStorage.getItem(adCacheKey);
        const adCacheTimestamp = sessionStorage.getItem(`${adCacheKey}_timestamp`);
        const now = Date.now();
        
        // Use cached ad if it's less than 5 minutes old
        if (cachedAd && adCacheTimestamp && (now - parseInt(adCacheTimestamp)) < 300000) {
          try {
            const parsedAd = JSON.parse(cachedAd);
            setAd(parsedAd);
          } catch (parseError) {
            console.warn('Failed to parse cached ad:', parseError);
            // Continue to fetch from API
          }
        }
        
        // If no cached ad or cache is expired, fetch from API
        if (!cachedAd || !adCacheTimestamp || (now - parseInt(adCacheTimestamp)) >= 300000) {
          try {
            const adData = await callApi('GET', `/ads/${id}`);
            setAd(adData);
            
            // Cache the ad data
            sessionStorage.setItem(adCacheKey, JSON.stringify(adData));
            sessionStorage.setItem(`${adCacheKey}_timestamp`, now.toString());
          } catch (adError) {
            console.error('Error fetching ad:', adError);
            
            // For rate limiting errors, use cached data if available
            if (adError.response?.status === 429 && cachedAd) {
              try {
                const parsedAd = JSON.parse(cachedAd);
                setAd(parsedAd);
              } catch (parseError) {
                throw adError; // Re-throw if can't use cache
              }
            } else {
              throw adError; // Re-throw for other errors
            }
          }
        }
        
        // Fetch messages if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const messagesCacheKey = `ad_messages_${id}`;
            const cachedMessages = sessionStorage.getItem(messagesCacheKey);
            const messagesCacheTimestamp = sessionStorage.getItem(`${messagesCacheKey}_timestamp`);
            
            // Use cached messages if they're less than 2 minutes old
            if (cachedMessages && messagesCacheTimestamp && (now - parseInt(messagesCacheTimestamp)) < 120000) {
              try {
                const parsedMessages = JSON.parse(cachedMessages);
                setMessages(parsedMessages);
              } catch (parseError) {
                // Continue to fetch from API
                const messagesData = await callApi('GET', `/ads/${id}/messages`);
                setMessages(messagesData || []);
                
                // Cache the messages
                sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
                sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
              }
            } else {
              // Fetch fresh messages
              try {
                const messagesData = await callApi('GET', `/ads/${id}/messages`);
                setMessages(messagesData || []);
                
                // Cache the messages
                sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
                sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
              } catch (msgError) {
                console.warn('Could not fetch messages:', msgError);
                // Use cached messages if available, otherwise empty array
                if (cachedMessages) {
                  try {
                    const parsedMessages = JSON.parse(cachedMessages);
                    setMessages(parsedMessages);
                  } catch (parseError) {
                    setMessages([]);
                  }
                } else {
                  setMessages([]);
                }
              }
            }
          } catch (msgError) {
            console.warn('Could not fetch messages:', msgError);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
        setError('Failed to load ad details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdData();
    }
  }, [id]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && ad && newMessage.trim()) {
        await callApi('POST', `/ads/${ad.id}/messages`, {
          message: newMessage.trim(),
          receiver_id: ad.user.id,
        });
        setNewMessage('');
        
        // Invalidate messages cache and re-fetch messages to update the chat
        const messagesCacheKey = `ad_messages_${id}`;
        sessionStorage.removeItem(messagesCacheKey);
        sessionStorage.removeItem(`${messagesCacheKey}_timestamp`);
        
        try {
          const messagesData = await callApi('GET', `/ads/${id}/messages`);
          setMessages(messagesData || []);
          
          // Update cache with fresh messages
          const now = Date.now();
          sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
          sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
        } catch (msgError) {
          console.warn('Could not refresh messages:', msgError);
        }
      } else if (!token) {
        alert('Please log in to send messages.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !ad) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Ad not found'}
          </Typography>
          <Button variant="outlined" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        {(ad.images && ad.images.length > 0) ? (
          <CardMedia
            component="img"
            height="400"
            image={ad.images[0].image_path?.startsWith('http') ? ad.images[0].image_path : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/storage/${ad.images[0].image_path}`}
            alt={ad.title}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&auto=format';
            }}
            sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
          />
        ) : (
          <CardMedia
            component="img"
            height="400"
            image="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&auto=format"
            alt={ad.title}
            sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
          />
        )}
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {ad.title}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {ad.price ? `₦${Number(ad.price).toLocaleString()}` : ad.formatted_price || 'Price on request'}
          </Typography>
          <Typography variant="body1" paragraph>
            {ad.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`Category: ${ad.category?.name || 'N/A'}`} color="primary" />
            <Chip label={`Location: ${ad.location || 'N/A'}`} color="secondary" />
            <Chip label={`Status: ${ad.status || 'Active'}`} variant="outlined" />
            {(ad.is_boosted || ad.is_featured) && <Chip label="Featured" color="success" />}
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
    </Container>
  );
}

export default AdDetail;