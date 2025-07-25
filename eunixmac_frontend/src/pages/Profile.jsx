import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper, Stack, Avatar, Grid, Divider, Chip, Tooltip, Badge, useTheme, useMediaQuery, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const Input = styled('input')({
    display: 'none',
});

const GrayTextField = styled(TextField)(({ theme }) => ({
    backgroundColor: '#f5f5f5',
    '& .MuiInputBase-input.Mui-disabled': {
        color: theme.palette.text.disabled,
    },
}));

const StatusChip = ({ label, icon, color }) => (
    <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        sx={{ mr: 1, mb: 1, fontWeight: 500 }}
    />
);

const Profile = () => {
    const { user, setUser } = useAuth();
    const { loading, callApi } = useApi();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
        password_confirmation: '',
        profile_picture: null,
    });
    const [preview, setPreview] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, phone_number: user.phone_number || '' }));
            setPreview(user.profile_picture ? `${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}` : null);
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profile_picture: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCopyReferral = () => {
        if (user?.referral_code) {
            navigator.clipboard.writeText(user.referral_code);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 1500);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        if (formData.phone_number !== user.phone_number) {
            data.append('phone_number', formData.phone_number);
        }
        if (formData.password) {
            data.append('password', formData.password);
            data.append('password_confirmation', formData.password_confirmation);
        }
        if (formData.profile_picture && formData.profile_picture instanceof File) {
            data.append('profile_picture', formData.profile_picture);
        }
        try {
            const updatedUser = await callApi('post', '/api/user/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUser(updatedUser.user);
            toast.success('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        } catch (error) {
            // Error handled by useApi
        }
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
            <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: { xs: 3, md: 4 }, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <label htmlFor="profile-picture-upload">
                                <Input accept="image/*" id="profile-picture-upload" type="file" onChange={handleFileChange} />
                                <Tooltip title="Change profile picture">
                                    <IconButton component="span" sx={{ bgcolor: 'white', boxShadow: 1, p: 0.5 }}>
                                        <EditIcon fontSize="small" color="primary" />
                                    </IconButton>
                                </Tooltip>
                            </label>
                        }
                    >
                        <Avatar
                            src={preview}
                            sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, border: '3px solid #e0e0e0', boxShadow: 2 }}
                        />
                    </Badge>
                    <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, width: '100%' }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
                            {user.name}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            {user.is_verified && <StatusChip label="Verified" icon={<VerifiedUserIcon />} color="success" />}
                            {user.is_admin && <StatusChip label="Admin" icon={<AdminPanelSettingsIcon />} color="warning" />}
                            {user.is_agent && <StatusChip label="Agent" icon={<PersonAddAltIcon />} color="info" />}
                            {user.is_affiliate && <StatusChip label="Affiliate" icon={<GroupAddIcon />} color="secondary" />}
                        </Stack>
                        {user.referral_code && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                                    Referral Code:
                                </Typography>
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 700, letterSpacing: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                    {user.referral_code}
                                </Typography>
                                <Tooltip title={copySuccess ? 'Copied!' : 'Copy'}>
                                    <IconButton size="small" onClick={handleCopyReferral} sx={{ ml: 1 }}>
                                        <ContentCopyIcon fontSize="small" color={copySuccess ? 'success' : 'action'} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Divider sx={{ my: { xs: 2, md: 3 } }} />
                <Box component="form" onSubmit={handleSubmit} autoComplete="off">
                    <Stack spacing={{ xs: 2, md: 3 }}>
                        <GrayTextField
                            label="Name"
                            value={user.name}
                            InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: '0.9rem' } }}
                            variant="filled"
                            helperText="To change your name, please contact support."
                            disabled
                            sx={{ borderRadius: 2 }}
                            InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                        />
                        <GrayTextField
                            label="Email Address"
                            value={user.email}
                            InputProps={{ readOnly: true, disableUnderline: true, style: { fontSize: '0.9rem' } }}
                            variant="filled"
                            helperText="To change your email, please contact support."
                            disabled
                            sx={{ borderRadius: 2 }}
                            InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                        />
                        <TextField
                            label="Phone Number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            variant="outlined"
                            disabled={loading}
                            sx={{ borderRadius: 2 }}
                            InputProps={{ style: { fontSize: '0.9rem' } }}
                            InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                        />
                        <Divider sx={{ my: { xs: 1, md: 2 } }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                            Change Password
                        </Typography>
                        <TextField
                            label="New Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            variant="outlined"
                            disabled={loading}
                            helperText="Leave blank to keep your current password."
                            sx={{ borderRadius: 2 }}
                            InputProps={{ style: { fontSize: '0.9rem' } }}
                            InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                        />
                        <TextField
                            label="Confirm New Password"
                            name="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            variant="outlined"
                            disabled={loading || !formData.password}
                            sx={{ borderRadius: 2 }}
                            InputProps={{ style: { fontSize: '0.9rem' } }}
                            InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                        />
                        <Box sx={{ textAlign: 'right', mt: { xs: 1, md: 2 } }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ py: { xs: 1, md: 1.5 }, px: { xs: 3, md: 4 }, fontWeight: 700, borderRadius: 2, fontSize: { xs: '0.9rem', md: '1rem' } }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile;
