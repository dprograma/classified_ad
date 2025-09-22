import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  Alert,
  Tooltip,
  Checkbox,
  Menu,
  MenuList,
  MenuItem as MenuListItem,
  Divider,
  CircularProgress,
  Badge
} from '@mui/material';
import EnhancedStatCard from '../components/common/EnhancedStatCard';
import StatCardsContainer from '../components/common/StatCardsContainer';
import {
  Search,
  FilterList,
  Visibility,
  Assignment,
  Reply,
  MoreVert,
  Refresh,
  Download,
  CheckCircle,
  Schedule,
  Warning,
  Error,
  Support,
  TrendingUp,
  Group,
  Timer,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const AdminSupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assigned_to: '',
    search: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [responseType, setResponseType] = useState('public');
  const { callApi, loading } = useApi();

  const statusColors = {
    open: 'primary',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default'
  };

  const priorityColors = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  };

  useEffect(() => {
    fetchTickets();
    fetchStatistics();
    fetchAdminUsers();
  }, [page, rowsPerPage, filters]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
        ...filters
      });

      const response = await callApi('GET', `/admin/support/tickets?${params}`);
      setTickets(response.data);
      setTotalCount(response.total);
    } catch (error) {
      toast.error('Failed to load tickets');
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await callApi('GET', '/admin/support/statistics');
      setStatistics(response);
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await callApi('GET', '/admin/support/admin-users');
      setAdminUsers(response);
    } catch (error) {
      toast.error('Failed to load admin users');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleTicketSelect = (ticketId) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedTickets(tickets.map(ticket => ticket.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const response = await callApi('GET', `/admin/support/tickets/${ticketId}`);
      setSelectedTicket(response);
      setShowTicketDialog(true);
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      await callApi('PUT', `/admin/support/tickets/${ticketId}`, updates);
      toast.success('Ticket updated successfully');
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        handleViewTicket(ticketId);
      }
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const handleAddResponse = async () => {
    if (!newResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await callApi('POST', `/admin/support/tickets/${selectedTicket.id}/responses`, {
        message: newResponse,
        is_internal: responseType === 'internal'
      });
      toast.success('Response added successfully');
      setNewResponse('');
      handleViewTicket(selectedTicket.id);
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const handleBulkAssign = async (assignedTo) => {
    try {
      await callApi('POST', '/admin/support/tickets/bulk-assign', {
        ticket_ids: selectedTickets,
        assigned_to: assignedTo
      });
      toast.success('Tickets assigned successfully');
      setSelectedTickets([]);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to assign tickets');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      await callApi('POST', '/admin/support/tickets/bulk-status', {
        ticket_ids: selectedTickets,
        status: status
      });
      toast.success('Tickets updated successfully');
      setSelectedTickets([]);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update tickets');
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const ticketDate = new Date(date);
    const diffMs = now - ticketDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Support Ticket Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            fetchTickets();
            fetchStatistics();
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <StatCardsContainer
        columns={{ mobile: 2, tablet: 2, desktop: 4 }}
        gap="16px"
        className="mb-6"
      >
        <EnhancedStatCard
          icon={Support}
          value={statistics.total_tickets || 0}
          label="Total Tickets"
          color="#3b82f6"
          size="medium"
        />

        <EnhancedStatCard
          icon={Schedule}
          value={statistics.open_tickets || 0}
          label="Open Tickets"
          color="#f59e0b"
          size="medium"
        />

        <EnhancedStatCard
          icon={Warning}
          value={statistics.urgent_tickets || 0}
          label="Urgent Tickets"
          color="#ef4444"
          size="medium"
        />

        <EnhancedStatCard
          icon={Timer}
          value={`${statistics.average_resolution_time || 0}h`}
          label="Avg Resolution"
          color="#10b981"
          size="medium"
        />
      </StatCardsContainer>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="verification">Verification</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="account">Account</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.assigned_to}
                label="Assigned To"
                onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {adminUsers.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2">
              {selectedTickets.length} ticket(s) selected
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setActionMenu(e.currentTarget)}
            >
              Bulk Actions
            </Button>
            <Menu
              anchorEl={actionMenu}
              open={Boolean(actionMenu)}
              onClose={() => setActionMenu(null)}
            >
              <MenuListItem onClick={() => {
                setActionMenu(null);
                // Show assign dialog
              }}>
                Assign to Admin
              </MenuListItem>
              <MenuListItem onClick={() => {
                setActionMenu(null);
                handleBulkStatusUpdate('in_progress');
              }}>
                Mark In Progress
              </MenuListItem>
              <MenuListItem onClick={() => {
                setActionMenu(null);
                handleBulkStatusUpdate('resolved');
              }}>
                Mark Resolved
              </MenuListItem>
            </Menu>
          </Box>
        </Paper>
      )}

      {/* Tickets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedTickets.length > 0 && selectedTickets.length < tickets.length}
                    checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Ticket</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No tickets found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleTicketSelect(ticket.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {ticket.ticket_number}
                      </Typography>
                      {ticket.responses_count > 0 && (
                        <Badge badgeContent={ticket.responses_count} color="primary">
                          <Reply sx={{ fontSize: 16, ml: 1 }} />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status.replace('_', ' ')}
                        size="small"
                        color={statusColors[ticket.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={priorityColors[ticket.priority]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.assigned_to ? ticket.assigned_to.name : 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTimeAgo(ticket.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Quick assign
                          }}
                        >
                          <Assignment />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Ticket {selectedTicket.ticket_number}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={selectedTicket.status.replace('_', ' ')}
                    color={statusColors[selectedTicket.status]}
                  />
                  <Chip
                    label={selectedTicket.priority}
                    color={priorityColors[selectedTicket.priority]}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {/* Original Message */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Original Message
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>From:</strong> {selectedTicket.user?.name} ({selectedTicket.user?.email})
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Subject:</strong> {selectedTicket.subject}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Category:</strong> {selectedTicket.category}
                    </Typography>
                    <Typography variant="body2">
                      {selectedTicket.message}
                    </Typography>
                  </Paper>

                  {/* Responses */}
                  <Typography variant="h6" gutterBottom>
                    Responses ({selectedTicket.responses?.length || 0})
                  </Typography>
                  {selectedTicket.responses?.map((response, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: response.is_internal ? 'warning.light' : 'background.paper' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2">
                          {response.user?.name}
                          {response.is_internal && (
                            <Chip label="Internal" size="small" color="warning" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(response.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {response.message}
                      </Typography>
                    </Paper>
                  ))}

                  {/* Add Response */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Response
                    </Typography>
                    <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={responseType}
                        label="Type"
                        onChange={(e) => setResponseType(e.target.value)}
                      >
                        <MenuItem value="public">Public Response</MenuItem>
                        <MenuItem value="internal">Internal Note</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Enter your response..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddResponse}
                      disabled={!newResponse.trim()}
                    >
                      Add Response
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  {/* Ticket Actions */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={selectedTicket.status}
                          label="Status"
                          onChange={(e) => handleUpdateTicket(selectedTicket.id, { status: e.target.value })}
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="closed">Closed</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={selectedTicket.priority}
                          label="Priority"
                          onChange={(e) => handleUpdateTicket(selectedTicket.id, { priority: e.target.value })}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel>Assign To</InputLabel>
                        <Select
                          value={selectedTicket.assigned_to?.id || ''}
                          label="Assign To"
                          onChange={(e) => handleUpdateTicket(selectedTicket.id, { assigned_to: e.target.value || null })}
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {adminUsers.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Paper>

                  {/* Ticket Information */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Ticket Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedTicket.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedTicket.updated_at).toLocaleString()}
                        </Typography>
                      </Box>
                      {selectedTicket.resolved_at && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Resolved
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedTicket.resolved_at).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTicketDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminSupportManagement;