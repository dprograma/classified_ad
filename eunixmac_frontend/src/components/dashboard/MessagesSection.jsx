import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Button,
  Chip,
  Divider,
  Badge,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack
} from '@mui/material';
import {
  Send,
  Search,
  Chat,
  AttachFile,
  MoreVert,
  Phone,
  VideoCall,
  Info,
  Block,
  Delete,
  StarBorder,
  Star,
  CheckCircle
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import useApi from '../../hooks/useApi';
import { getStorageUrl } from '../../config/api';
import { useAuth } from '../../AuthContext';

const MessagesSection = ({ conversations, onRefresh }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { callApi, loading } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.ad_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (adId) => {
    try {
      const data = await callApi('GET', `/ads/${adId}/messages`);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        message: newMessage.trim(),
        receiver_id: selectedConversation.other_user.id
      };

      await callApi('POST', `/ads/${selectedConversation.ad_id}/messages`, messageData);
      setNewMessage('');
      fetchMessages(selectedConversation.ad_id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await callApi('PUT', `/conversations/${conversationId}/read`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.other_user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.ad?.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Messages
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Chat with potential buyers and sellers
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Search */}
              <TextField
                placeholder="Search conversations..."
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Conversations List */}
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Chat sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No conversations yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Start chatting when someone contacts you about your ads
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredConversations.map((conversation) => (
                      <ListItem
                        key={conversation.id}
                        button
                        selected={selectedConversation?.id === conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          if (conversation.unread_count > 0) {
                            markAsRead(conversation.id);
                          }
                        }}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={conversation.unread_count || 0}
                            color="error"
                            max={99}
                          >
                            <Avatar
                              src={conversation.other_user?.profile_picture ? 
                                getStorageUrl(conversation.other_user.profile_picture) : null}
                            >
                              {conversation.other_user?.name?.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight="bold" noWrap flex={1}>
                                {conversation.other_user?.name}
                              </Typography>
                              {conversation.other_user?.is_verified && (
                                <CheckCircle color="primary" fontSize="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                Re: {conversation.ad?.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {conversation.last_message?.message || 'No messages yet'}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            {conversation.last_message ? 
                              formatMessageTime(conversation.last_message.created_at) : ''}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardContent sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={selectedConversation.other_user?.profile_picture ? 
                          getStorageUrl(selectedConversation.other_user.profile_picture) : null}
                      >
                        {selectedConversation.other_user?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedConversation.other_user?.name}
                          </Typography>
                          {selectedConversation.other_user?.is_verified && (
                            <CheckCircle color="primary" fontSize="small" />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          About: {selectedConversation.ad?.title}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" onClick={() => setInfoDialogOpen(true)}>
                        <Info />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="text.secondary">
                        No messages in this conversation yet.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Send a message to start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user?.id;
                        return (
                          <Box
                            key={message.id}
                            display="flex"
                            justifyContent={isOwn ? 'flex-end' : 'flex-start'}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                maxWidth: '70%',
                                backgroundColor: isOwn ? 'primary.main' : 'grey.100',
                                color: isOwn ? 'primary.contrastText' : 'text.primary',
                              }}
                            >
                              <Typography variant="body2">
                                {message.message}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  opacity: 0.7,
                                  display: 'block',
                                  textAlign: 'right',
                                  mt: 0.5
                                }}
                              >
                                {formatMessageTime(message.created_at)}
                              </Typography>
                            </Paper>
                          </Box>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </Stack>
                  )}
                </Box>

                {/* Message Input */}
                <CardContent sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      placeholder="Type your message..."
                      fullWidth
                      multiline
                      maxRows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <IconButton color="primary" onClick={sendMessage} disabled={!newMessage.trim() || loading}>
                      <Send />
                    </IconButton>
                  </Box>
                </CardContent>
              </>
            ) : (
              <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box>
                  <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Select a conversation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a conversation from the list to start chatting
                  </Typography>
                </Box>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Conversation Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Conversation Details</DialogTitle>
        <DialogContent>
          {selectedConversation && (
            <Stack spacing={3}>
              {/* User Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={selectedConversation.other_user?.profile_picture ? 
                    getStorageUrl(selectedConversation.other_user.profile_picture) : null}
                  sx={{ width: 60, height: 60 }}
                >
                  {selectedConversation.other_user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">
                      {selectedConversation.other_user?.name}
                    </Typography>
                    {selectedConversation.other_user?.is_verified && (
                      <CheckCircle color="primary" fontSize="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedConversation.other_user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {new Date(selectedConversation.other_user?.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Ad Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  About this ad:
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {selectedConversation.ad?.images?.[0] && (
                    <Avatar
                      src={getStorageUrl(selectedConversation.ad.images[0].image_path)}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  )}
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedConversation.ad?.title}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₦{selectedConversation.ad?.price?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.ad?.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Actions */}
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Phone />}
                  fullWidth
                  disabled={!selectedConversation.other_user?.phone_number}
                >
                  Call {selectedConversation.other_user?.phone_number || 'Not available'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  fullWidth
                  component="a"
                  href={`/ads/${selectedConversation.ad?.id}`}
                  target="_blank"
                >
                  View Ad Details
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MessagesSection;