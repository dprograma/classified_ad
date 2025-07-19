import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Stack } from '@mui/material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const { loading, callApi } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await callApi('post', '/reset-password', {
                email,
                password,
                password_confirmation,
                token,
            });
            toast.success(response.message);
            navigate('/login');
        } catch (error) {
            // Error is already handled by the useApi hook
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: 5, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: 2 }}>
                        Reset Password
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={3}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="password_confirmation"
                                label="Confirm New Password"
                                type="password"
                                id="password_confirmation"
                                autoComplete="new-password"
                                value={password_confirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ py: 1.5, fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, boxShadow: 2 }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ResetPassword;
