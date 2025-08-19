import React from 'react';
import { Button, Stack } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { API_CONFIG } from '../config/api';

const SocialLoginButtons = () => {
    const handleSocialLogin = (provider) => {
        window.location.href = `${API_CONFIG.BASE_URL}/auth/${provider}/redirect`;
    };

    const socialButtons = [
        {
            provider: 'google',
            icon: <GoogleIcon />,
            text: 'Continue with Google',
            styles: {
                bgcolor: '#fff',
                color: '#fff',
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
                    startIcon={button.icon}
                    onClick={() => handleSocialLogin(button.provider)}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        ...button.styles,
                    }}
                >
                    {button.text}
                </Button>
            ))}
        </Stack>
    );
};

export default SocialLoginButtons;
