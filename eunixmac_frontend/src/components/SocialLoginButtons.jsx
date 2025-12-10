import React, { useState } from 'react';
import { Button, Stack, CircularProgress, Box, Typography, Divider } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { API_CONFIG } from '../config/api';
import { toast } from 'react-toastify';

const SocialLoginButtons = () => {
    const [loadingProvider, setLoadingProvider] = useState(null);

    const handleSocialLogin = (provider) => {
        try {
            setLoadingProvider(provider);

            // Validate API configuration
            if (!API_CONFIG.BASE_URL) {
                toast.error('Application configuration error. Please contact support.');
                setLoadingProvider(null);
                return;
            }

            // Small delay to show loading state
            setTimeout(() => {
                const redirectUrl = `${API_CONFIG.BASE_URL}/auth/${provider}/redirect`;

                // Log the redirect for debugging
                console.log(`Redirecting to: ${redirectUrl}`);

                // Redirect to social provider
                window.location.href = redirectUrl;
            }, 500);
        } catch (error) {
            console.error('Social login error:', error);
            toast.error('Failed to initiate social login. Please try again.');
            setLoadingProvider(null);
        }
    };

    const socialButtons = [
        {
            provider: 'google',
            icon: <GoogleIcon />,
            text: 'Continue with Google',
            styles: {
                bgcolor: '#fff',
                color: '#5f6368',
                border: '1px solid #dadce0',
                '&:hover': {
                    bgcolor: '#f8f9fa',
                    borderColor: '#d2e3fc',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
                },
            },
        },
        {
            provider: 'facebook',
            icon: <FacebookIcon />,
            text: 'Continue with Facebook',
            styles: {
                bgcolor: '#1877F2',
                color: '#fff',
                '&:hover': {
                    bgcolor: '#166fe5',
                },
            },
        },
        // Uncomment when Twitter/X is fully configured
        // {
        //     provider: 'twitter',
        //     icon: <TwitterIcon />,
        //     text: 'Continue with X (Twitter)',
        //     styles: {
        //         bgcolor: '#000',
        //         color: '#fff',
        //         '&:hover': {
        //             bgcolor: '#333',
        //         },
        //     },
        // },
    ];

    return (
        <Box>
            <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                    Or continue with
                </Typography>
            </Divider>

            <Stack spacing={2}>
                {socialButtons.map((button) => (
                    <Button
                        key={button.provider}
                        fullWidth
                        variant="contained"
                        startIcon={loadingProvider === button.provider ? <CircularProgress size={20} /> : button.icon}
                        onClick={() => handleSocialLogin(button.provider)}
                        disabled={loadingProvider !== null}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            ...button.styles,
                            '&:disabled': {
                                opacity: 0.6,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loadingProvider === button.provider ? 'Connecting...' : button.text}
                    </Button>
                ))}
            </Stack>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 2,
                    px: 2,
                    lineHeight: 1.5
                }}
            >
                By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
        </Box>
    );
};

export default SocialLoginButtons;
