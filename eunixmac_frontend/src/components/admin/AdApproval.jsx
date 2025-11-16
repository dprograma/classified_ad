import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Tooltip, IconButton, Chip
} from '@mui/material';
import { CheckCircleOutline, CheckCircle, HourglassEmpty, Visibility, DoNotDisturb, Cancel, RemoveCircleOutline } from '@mui/icons-material';
import { Pagination, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import useApi from '../../hooks/useApi';
import { formatDistanceToNow } from 'date-fns';
import AdDetailModal from './AdDetailModal';

const AdApproval = () => {
  const [ads, setAds] = useState([]);
  const [error, setError] = useState(null);
  const { loading, callApi } = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAds = async () => {
    setError(null);
    try {
      const response = await callApi('get', `/admin/ads?sort_by=created_at&sort_order=desc&page=${page}&search=${searchQuery}`);
      if (response && response.data) {
        setAds(response.data);
        setTotalPages(response.last_page);
      } else {
        setAds([]);
      }
    } catch (apiError) {
      setError('Failed to fetch ads. Please try again later.');
      console.error("Error fetching ads:", apiError);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchAds();
    }, 500);
    return () => clearTimeout(debounce);
  }, [page, searchQuery]);

  const handleApprove = async (adId) => {
    setError(null);
    try {
      await callApi('put', `/admin/ads/${adId}/approve`);
      fetchAds();
    } catch (apiError) {
      setError(`Failed to approve ad ${adId}. Please try again.`);
      console.error(`Error approving ad ${adId}:`, apiError);
    }
  };

  const handleReject = async (adId) => {
    setError(null);
    try {
      await callApi('put', `/admin/ads/${adId}/reject`);
      fetchAds();
    } catch (apiError) {
      setError(`Failed to reject ad ${adId}. Please try again.`);
      console.error(`Error rejecting ad ${adId}:`, apiError);
    }
  };

  const handleDisapprove = async (adId) => {
    setError(null);
    try {
      await callApi('put', `/admin/ads/${adId}/disapprove`);
      fetchAds();
    } catch (apiError) {
      setError(`Failed to revoke approval for ad ${adId}. Please try again.`);
      console.error(`Error revoking approval for ad ${adId}:`, apiError);
    }
  };

  const handleView = (ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const handleSearchChange = (event) => {
    setPage(1);
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Pending Ads...</Typography>
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (ads.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Ads Found</Typography>
          <Typography color="text.secondary">There are no ads in the system.</Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table stickyHeader aria-label="ads table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ad Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => {
              const isApproved = ad.status === 'active' && ad.approved_at;
              const isRejected = ad.status === 'rejected';
              const isPending = ad.status === 'pending_approval';

              return (
                <TableRow
                  key={ad.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: isRejected ? 0.6 : 1
                  }}
                >
                  <TableCell>
                    {isApproved && (
                      <Tooltip title="Approved">
                        <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                      </Tooltip>
                    )}
                    {isPending && (
                      <Tooltip title="Pending Approval">
                        <CheckCircleOutline sx={{ color: 'grey.400', fontSize: 28 }} />
                      </Tooltip>
                    )}
                    {isRejected && (
                      <Tooltip title="Rejected">
                        <Cancel sx={{ color: 'error.main', fontSize: 28 }} />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{ad.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{ad.category.name}</Typography>
                  </TableCell>
                  <TableCell>{ad.user.name}</TableCell>
                  <TableCell>{ad.formatted_price}</TableCell>
                  <TableCell>
                    <Tooltip title={new Date(ad.created_at).toLocaleString()}>
                      <span>{formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Ad Details">
                      <IconButton size="small" onClick={() => handleView(ad)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {isPending && (
                      <>
                        <Tooltip title="Approve Ad">
                          <IconButton size="small" color="success" onClick={() => handleApprove(ad.id)}>
                            <CheckCircleOutline />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Ad">
                          <IconButton size="small" color="error" onClick={() => handleReject(ad.id)}>
                            <DoNotDisturb />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {isApproved && (
                      <>
                        <Chip
                          label="Approved"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        <Tooltip title="Revoke Approval">
                          <IconButton size="small" color="warning" onClick={() => handleDisapprove(ad.id)}>
                            <RemoveCircleOutline />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {isRejected && (
                      <Chip
                        label="Rejected"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Paper sx={{ mt: 4, overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HourglassEmpty sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">All Ads</Typography>
        </Box>
        <TextField 
          variant="outlined"
          size="small"
          placeholder="Search ads..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {renderContent()}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>
      <AdDetailModal ad={selectedAd} open={isModalOpen} onClose={handleCloseModal} />
    </Paper>
  );
};

export default AdApproval;