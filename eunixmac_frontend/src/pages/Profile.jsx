import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper, Stack, Avatar, Grid, Divider, Chip, Tooltip, Badge, useTheme, useMediaQuery, IconButton, Card, CardContent, Fade, InputAdornment
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import useApi from '../hooks/useApi';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { 
    Edit, 
    VerifiedUser, 
    AdminPanelSettings, 
    PersonAddAlt, 
    GroupAdd, 
    ContentCopy,
    Phone,
    Lock,
    Save,
    Upload
} from '@mui/icons-material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Input = styled('input')({
    display: 'none',
});

const ProfileContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: `
        linear-gradient(135deg, 
            rgba(59, 130, 246, 0.02) 0%, 
            rgba(139, 92, 246, 0.02) 35%,
            rgba(16, 185, 129, 0.02) 70%,
            rgba(59, 130, 246, 0.02) 100%
        )
    `,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const ProfileCard = styled(Card)(({ theme }) => ({
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    overflow: 'visible',
    position: 'relative',
    animation: `${fadeInUp} 0.6s ease-out`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 120,
    height: 120,
    border: '4px solid white',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
    [theme.breakpoints.down('sm')]: {
        width: 100,
        height: 100,
    },
}));

const StatusChip = styled(Chip)(({ theme, color }) => ({
    fontWeight: 600,
    borderRadius: 12,
    height: 32,
    background: color === 'success' 
        ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
        : color === 'warning'
        ? 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)'
        : color === 'info'
        ? 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'
        : 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    color: 'white',
    '& .MuiChip-icon': {
        color: 'white',
    },
    margin: theme.spacing(0.5),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 16,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        transition: 'all 0.3s ease',
        border: '1px solid transparent',
        '&:hover': {
            backgroundColor: 'rgba(248, 250, 252, 1)',
            transform: 'translateY(-1px)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(248, 250, 252, 1)',
            transform: 'translateY(-1px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
        },
    },
    '& .MuiInputLabel-root': {
        fontWeight: 500,
    },
    '& .MuiInputBase-input.Mui-disabled': {
        WebkitTextFillColor: theme.palette.text.disabled,
        backgroundColor: 'rgba(241, 245, 249, 0.8)',
    },
}));

const GradientButton = styled(Button)(({ theme }) => ({
    borderRadius: 16,
    padding: '12px 32px',
    fontWeight: 600,
    textTransform: 'none',
    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
        transform: 'translateY(-2px)',
    },
    '&:disabled': {
        background: 'rgba(0,0,0,0.12)',
        color: 'rgba(0,0,0,0.26)',
        transform: 'none',
        boxShadow: 'none',
    },
}));

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
            const updatedUser = await callApi('post', '/user/profile', data, {
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
        <ProfileContainer>
            <Container maxWidth="lg">
                <Fade in={mounted} timeout={800}>
                    <Grid container spacing={4}>
                        {/* Profile Header Card */}
                        <Grid item xs={12}>
                            <ProfileCard>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: { xs: 'column', md: 'row' }, 
                                        alignItems: { xs: 'center', md: 'flex-start' },
                                        gap: 4,
                                        textAlign: { xs: 'center', md: 'left' }
                                    }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    <label htmlFor="profile-picture-upload">
                                                        <Input accept="image/*" id="profile-picture-upload" type="file" onChange={handleFileChange} />
                                                        <Tooltip title="Change profile picture">
                                                            <IconButton 
                                                                component="span" 
                                                                sx={{ 
                                                                    bgcolor: 'primary.main', 
                                                                    color: 'white',
                                                                    width: 40,
                                                                    height: 40,
                                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                                                    '&:hover': {
                                                                        bgcolor: 'primary.dark',
                                                                        transform: 'scale(1.1)',
                                                                    }
                                                                }}
                                                            >
                                                                <Upload fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </label>
                                                }
                                            >
                                                <StyledAvatar src={preview} />
                                            </Badge>
                                        </Box>
                                        
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                                {user.name}
                                            </Typography>
                                            
                                            <Stack 
                                                direction="row" 
                                                spacing={1} 
                                                flexWrap="wrap" 
                                                sx={{ 
                                                    mb: 3, 
                                                    justifyContent: { xs: 'center', md: 'flex-start' }
                                                }}
                                            >
                                                {user.is_verified && <StatusChip label="Verified" icon={<VerifiedUser />} color="success" />}
                                                {user.is_admin && <StatusChip label="Admin" icon={<AdminPanelSettings />} color="warning" />}
                                                {user.is_agent && <StatusChip label="Agent" icon={<PersonAddAlt />} color="info" />}
                                                {user.is_affiliate && <StatusChip label="Affiliate" icon={<GroupAdd />} color="secondary" />}
                                            </Stack>
                                            
                                            {user.referral_code && (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2,
                                                    justifyContent: { xs: 'center', md: 'flex-start' },
                                                    p: 2,
                                                    borderRadius: 2,
                                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                                    border: '1px solid rgba(59, 130, 246, 0.1)'
                                                }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Referral Code:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: 1, color: 'primary.main' }}>
                                                        {user.referral_code}
                                                    </Typography>
                                                    <Tooltip title={copySuccess ? 'Copied!' : 'Copy referral code'}>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={handleCopyReferral}
                                                            sx={{
                                                                color: copySuccess ? 'success.main' : 'primary.main',
                                                                '&:hover': {
                                                                    backgroundColor: 'primary.light',
                                                                    transform: 'scale(1.1)',
                                                                }
                                                            }}
                                                        >
                                                            <ContentCopy fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </ProfileCard>
                        </Grid>

                        {/* Profile Settings Card */}
                        <Grid item xs={12}>
                            <ProfileCard>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: 'text.primary' }}>
                                        Profile Settings
                                    </Typography>
                                    
                                    <Box component="form" onSubmit={handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <ModernTextField
                                                    fullWidth
                                                    label="Full Name"
                                                    value={user.name}
                                                    disabled
                                                    helperText="Contact support to change your name"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <ModernTextField
                                                    fullWidth
                                                    label="Email Address"
                                                    value={user.email}
                                                    disabled
                                                    helperText="Contact support to change your email"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <ModernTextField
                                                    fullWidth
                                                    label="Phone Number"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Phone color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 2 }}>
                                                    <Typography variant="h6" color="text.secondary" sx={{ px: 2, fontWeight: 600 }}>
                                                        Security Settings
                                                    </Typography>
                                                </Divider>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <ModernTextField
                                                    fullWidth
                                                    label="New Password"
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    helperText="Leave blank to keep current password"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Lock color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <ModernTextField
                                                    fullWidth
                                                    label="Confirm New Password"
                                                    name="password_confirmation"
                                                    type="password"
                                                    value={formData.password_confirmation}
                                                    onChange={handleInputChange}
                                                    disabled={loading || !formData.password}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Lock color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                    <GradientButton
                                                        type="submit"
                                                        size="large"
                                                        disabled={loading}
                                                        startIcon={<Save />}
                                                    >
                                                        {loading ? 'Saving Changes...' : 'Save Changes'}
                                                    </GradientButton>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </CardContent>
                            </ProfileCard>
                        </Grid>
                    </Grid>
                </Fade>
            </Container>
        </ProfileContainer>
    );
};

export default Profile;
