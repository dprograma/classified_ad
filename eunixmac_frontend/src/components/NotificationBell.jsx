import { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { getStorageUrl } from '../config/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    minWidth: '360px',
    maxWidth: '400px',
    maxHeight: '480px',
    marginTop: '8px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(108, 71, 255, 0.1)',
    border: '1px solid rgba(108, 71, 255, 0.08)',
  },
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: '16px 20px',
  borderBottom: '1px solid rgba(108, 71, 255, 0.08)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(135deg, rgba(108, 71, 255, 0.03) 0%, rgba(0, 198, 174, 0.03) 100%)',
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    backgroundColor: 'rgba(108, 71, 255, 0.04)',
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const UnreadBadge = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#6C47FF',
  position: 'absolute',
  top: '50%',
  right: '12px',
  transform: 'translateY(-50%)',
}));

const POLLING_INTERVAL = 30000; // Poll every 30 seconds

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Silent API call - no toast on errors to avoid spamming user with timeout notifications
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/messages/unread-count`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout for polling
      });
      setUnreadCount(response.data.unread_count || 0);
      setConversations(response.data.conversations || []);
    } catch (error) {
      // Silently ignore errors - don't show toast for background polling
      console.debug('Notification poll failed:', error.message);
    }
  }, [isAuthenticated]);

  // Initial fetch and polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();

      // Set up polling interval
      const intervalId = setInterval(fetchUnreadCount, POLLING_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Refresh when opening
    fetchUnreadCount();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConversationClick = (conversation) => {
    // Navigate to dashboard messages section with the specific ad
    navigate(`/dashboard?tab=messages&ad=${conversation.ad_id}&sender=${conversation.sender_id}`);
    handleClose();
  };

  const handleViewAll = () => {
    navigate('/dashboard?tab=messages');
    handleClose();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return formatDistanceToNow(new Date(timeString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          ml: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(108, 71, 255, 0.08)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)',
            },
          }}
        >
          <NotificationsIcon sx={{ color: 'text.primary', fontSize: 24 }} />
        </Badge>
      </IconButton>

      <NotificationMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <NotificationHeader>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkReadIcon />}
              onClick={handleViewAll}
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            >
              View All
            </Button>
          )}
        </NotificationHeader>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length > 0 ? (
          <List sx={{ p: 0, maxHeight: '350px', overflowY: 'auto' }}>
            {conversations.map((conversation, index) => (
              <NotificationItem
                key={`${conversation.ad_id}-${conversation.sender_id}`}
                onClick={() => handleConversationClick(conversation)}
                sx={{ position: 'relative' }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={conversation.sender_picture ? getStorageUrl(conversation.sender_picture) : null}
                    sx={{
                      width: 44,
                      height: 44,
                      border: '2px solid rgba(108, 71, 255, 0.1)',
                    }}
                  >
                    {conversation.sender_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {conversation.sender_name}
                      </Typography>
                      <Badge
                        badgeContent={conversation.unread_count}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            minWidth: '16px',
                            height: '16px',
                          },
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem', mb: 0.5 }}
                      >
                        Re: {truncateMessage(conversation.ad_title, 30)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          fontStyle: 'italic',
                        }}
                      >
                        "{truncateMessage(conversation.latest_message, 40)}"
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {formatTime(conversation.latest_message_time)}
                      </Typography>
                    </Box>
                  }
                />
                <UnreadBadge />
              </NotificationItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No new messages
            </Typography>
            <Typography variant="caption" color="text.disabled">
              You're all caught up!
            </Typography>
          </Box>
        )}

        {conversations.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: 'center' }}>
              <Button
                fullWidth
                onClick={handleViewAll}
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  py: 1,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, rgba(108, 71, 255, 0.08) 0%, rgba(0, 198, 174, 0.08) 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(108, 71, 255, 0.15) 0%, rgba(0, 198, 174, 0.15) 100%)',
                  },
                }}
              >
                View All Messages
              </Button>
            </Box>
          </>
        )}
      </NotificationMenu>
    </>
  );
};

export default NotificationBell;
