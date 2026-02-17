import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Card, CardContent, CardMedia, Chip, Stack, Button, TextField, Container, CircularProgress, IconButton, Grid, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { NavigateBefore, NavigateNext, Download, ShoppingCart, CheckCircle, MenuBook } from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { getStorageUrl, API_CONFIG } from '../config/api';
import { toast } from 'react-toastify';

// Books & Media category ID
const BOOKS_CATEGORY_ID = 7;

function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { callApi } = useApi();
  const { user, isAuthenticated } = useAuth();

  // Check if this is a book/media item
  const isBook = ad?.category_id === BOOKS_CATEGORY_ID || ad?.category?.id === BOOKS_CATEGORY_ID || ad?.file_path;
  const isOwner = ad?.user_id === user?.id || ad?.user?.id === user?.id;

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

            if (adError.response?.status === 429 && cachedAd) {
              try {
                const parsedAd = JSON.parse(cachedAd);
                setAd(parsedAd);
              } catch (parseError) {
                throw adError;
              }
            } else {
              throw adError;
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

            if (cachedMessages && messagesCacheTimestamp && (now - parseInt(messagesCacheTimestamp)) < 120000) {
              try {
                const parsedMessages = JSON.parse(cachedMessages);
                setMessages(parsedMessages);
              } catch (parseError) {
                const messagesData = await callApi('GET', `/ads/${id}/messages`);
                setMessages(messagesData || []);
                sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
                sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
              }
            } else {
              try {
                const messagesData = await callApi('GET', `/ads/${id}/messages`);
                setMessages(messagesData || []);
                sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
                sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
              } catch (msgError) {
                console.warn('Could not fetch messages:', msgError);
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

  // Check if user has purchased this book
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (isBook && isAuthenticated && !isOwner) {
        try {
          // Try to access the book endpoint - if successful, user has purchased
          await callApi('GET', `/books/${id}`);
          setHasPurchased(true);
        } catch (error) {
          // 403 means not purchased, which is expected
          if (error.response?.status !== 403) {
            console.warn('Error checking purchase status:', error);
          }
          setHasPurchased(false);
        }
      }
    };

    if (ad && isBook) {
      checkPurchaseStatus();
    }
  }, [ad, isBook, isAuthenticated, isOwner, id]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && ad && newMessage.trim()) {
        await callApi('POST', `/ads/${ad.id}/messages`, {
          message: newMessage.trim(),
          receiver_id: ad.user.id,
        });
        setNewMessage('');

        const messagesCacheKey = `ad_messages_${id}`;
        sessionStorage.removeItem(messagesCacheKey);
        sessionStorage.removeItem(`${messagesCacheKey}_timestamp`);

        try {
          const messagesData = await callApi('GET', `/ads/${id}/messages`);
          setMessages(messagesData || []);
          const now = Date.now();
          sessionStorage.setItem(messagesCacheKey, JSON.stringify(messagesData || []));
          sessionStorage.setItem(`${messagesCacheKey}_timestamp`, now.toString());
        } catch (msgError) {
          console.warn('Could not refresh messages:', msgError);
        }
      } else if (!token) {
        toast.error('Please log in to send messages.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleNextImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const handlePrevImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    cleaned = cleaned.replace(/^\+/, '');
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('234') && cleaned.length === 10) {
      cleaned = '234' + cleaned;
    }
    return cleaned;
  };

  const getWhatsAppLink = () => {
    if (!ad?.user?.phone_number) return '#';
    const formattedNumber = formatWhatsAppNumber(ad.user.phone_number);
    const message = encodeURIComponent(`Hi! I'm interested in your ad: "${ad.title}"`);
    return `https://wa.me/${formattedNumber}?text=${message}`;
  };

  const handlePurchaseBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase this item.');
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const response = await callApi('POST', `/books/${id}/pay`);
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPurchasing(false);
      setPurchaseDialogOpen(false);
    }
  };

  const handleDownloadBook = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to download.');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/books/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('You need to purchase this item first.');
          return;
        }
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${ad.title}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started successfully!');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download. Please try again.');
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
        {/* Image Carousel */}
        {(ad.images && ad.images.length > 0) ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="500"
              image={getStorageUrl(ad.images[currentImageIndex].image_path)}
              alt={`${ad.title} - Image ${currentImageIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop&auto=format';
              }}
              sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
            />

            {ad.images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
                  }}
                >
                  <NavigateBefore fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.95)' }
                  }}
                >
                  <NavigateNext fontSize="large" />
                </IconButton>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {currentImageIndex + 1} / {ad.images.length}
                </Box>
              </>
            )}

            {ad.images.length > 1 && (
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Grid container spacing={1}>
                  {ad.images.map((image, index) => (
                    <Grid item xs={2} sm={1.5} md={1.2} key={index}>
                      <Box
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          cursor: 'pointer',
                          border: currentImageIndex === index ? '3px solid #1976d2' : '2px solid transparent',
                          borderRadius: 1,
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <img
                          src={getStorageUrl(image.image_path)}
                          alt={`Thumbnail ${index + 1}`}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&auto=format';
                          }}
                          style={{
                            width: '100%',
                            height: '60px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        ) : ad.preview_image_path ? (
          <CardMedia
            component="img"
            height="500"
            image={getStorageUrl(ad.preview_image_path)}
            alt={ad.title}
            sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
          />
        ) : (
          <CardMedia
            component="img"
            height="500"
            image={isBook ? 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=500&fit=crop&auto=format' : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop&auto=format'}
            alt={ad.title}
            sx={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
          />
        )}

        <CardContent>
          {/* Book/Digital Product CTA Banner */}
          {isBook && !isOwner && (
            <Box
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 2,
                background: hasPurchased
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white'
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <MenuBook sx={{ color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      {hasPurchased ? 'You Own This Item!' : 'Digital Download Available'}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                    {hasPurchased
                      ? 'Click the button to download your purchased content.'
                      : `Get instant access to this digital content for only ₦${Number(ad.price).toLocaleString()}`
                    }
                  </Typography>
                </Box>
                {hasPurchased ? (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Download />}
                    onClick={handleDownloadBook}
                    sx={{
                      backgroundColor: 'white !important',
                      color: '#10b981 !important',
                      borderColor: 'white !important',
                      fontWeight: 600,
                      px: 4,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9) !important',
                        borderColor: 'white !important',
                        color: '#10b981 !important',
                        boxShadow: 'none',
                      },
                      '& .MuiButton-startIcon': { color: '#10b981 !important' },
                    }}
                  >
                    Download Now
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={() => setPurchaseDialogOpen(true)}
                    sx={{
                      backgroundColor: 'white !important',
                      color: '#6366f1 !important',
                      borderColor: 'white !important',
                      fontWeight: 600,
                      px: 4,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9) !important',
                        borderColor: 'white !important',
                        color: '#6366f1 !important',
                        boxShadow: 'none',
                      },
                      '& .MuiButton-startIcon': { color: '#6366f1 !important' },
                    }}
                  >
                    Buy Now - ₦{Number(ad.price).toLocaleString()}
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {/* Owner's Download Button */}
          {isBook && isOwner && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleDownloadBook}
                >
                  Download
                </Button>
              }
            >
              This is your uploaded content. You can download it anytime.
            </Alert>
          )}

          <Typography variant="h4" component="h1" gutterBottom>
            {ad.title}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {ad.price ? `₦${Number(ad.price).toLocaleString()}` : ad.formatted_price || 'Price on request'}
          </Typography>
          <Typography variant="body1" paragraph>
            {ad.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Category: ${ad.category?.name || 'N/A'}`} color="primary" />
            <Chip label={`Location: ${ad.location || 'N/A'}`} color="secondary" />
            <Chip label={`Status: ${ad.status || 'Active'}`} variant="outlined" />
            {isBook && <Chip icon={<MenuBook />} label="Digital Download" color="info" />}
          </Stack>

          {/* Book-specific info */}
          {isBook && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Product Details
              </Typography>
              <Grid container spacing={2}>
                {ad.subject_area && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Subject</Typography>
                    <Typography variant="body2" fontWeight="medium">{ad.subject_area}</Typography>
                  </Grid>
                )}
                {ad.education_level && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Level</Typography>
                    <Typography variant="body2" fontWeight="medium">{ad.education_level}</Typography>
                  </Grid>
                )}
                {ad.language && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Language</Typography>
                    <Typography variant="body2" fontWeight="medium">{ad.language}</Typography>
                  </Grid>
                )}
                {ad.author_info && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Author</Typography>
                    <Typography variant="body2" fontWeight="medium">{ad.author_info}</Typography>
                  </Grid>
                )}
                {ad.year_published && (
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2" color="text.secondary">Year</Typography>
                    <Typography variant="body2" fontWeight="medium">{ad.year_published}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

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
            <Button
              variant="contained"
              color="success"
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Seller
            </Button>
          </Stack>

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
            <Box sx={{ border: '1px solid #ccc', p: 2, height: 200, overflowY: 'auto', mb: 2, borderRadius: 1 }}>
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <Typography key={msg.id} variant="body2" sx={{ mb: 1 }}>
                    <strong>{msg.sender_id === ad.user.id ? ad.user.name : 'You'}:</strong> {msg.message}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                  No messages yet. Start a conversation!
                </Typography>
              )}
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

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>{ad.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {ad.description?.substring(0, 150)}...
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Price:</strong> ₦{Number(ad.price).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                After payment, you will be able to download this item immediately.
              </Typography>
            </Alert>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">Instant download after payment</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">Secure payment via Paystack</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography variant="body2">Download anytime from your account</Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)} disabled={purchasing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePurchaseBook}
            disabled={purchasing}
            startIcon={purchasing ? <CircularProgress size={20} /> : <ShoppingCart />}
          >
            {purchasing ? 'Processing...' : `Pay ₦${Number(ad.price).toLocaleString()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdDetail;
