import React, { useState } from 'react';
import { Button, Stack, CircularProgress } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { API_CONFIG } from '../config/api';

const SocialLoginButtons = () => {
    const [loadingProvider, setLoadingProvider] = useState(null);

    const handleSocialLogin = (provider) => {
        setLoadingProvider(provider);
        // Add a small delay to show loading state
        setTimeout(() => {
            window.location.href = `${API_CONFIG.BASE_URL}/auth/${provider}/redirect`;
        }, 500);
    };

    const socialButtons = [
        {
            provider: 'google',
            icon: <GoogleIcon />,
            text: 'Continue with Google',
            styles: {
                bgcolor: '#fff',
                color: '#fff',
                border: '1px solid #dadce0',
                '&:hover': {
                    bgcolor: '#f2f2f2',
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
                    bgcolor: '#166eab',
                },
            },
        },
    ];

    return (
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
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        ...button.styles,
                        '&:disabled': {
                            opacity: 0.6,
                        },
                    }}
                >
                    {loadingProvider === button.provider ? 'Connecting...' : button.text}
                </Button>
            ))}
        </Stack>
    );
};

export default SocialLoginButtons;
