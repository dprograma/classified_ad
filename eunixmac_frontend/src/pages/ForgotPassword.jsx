import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Stack } from '@mui/material';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { loading, callApi } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await callApi('post', '/forgot-password', { email });
            toast.success(response.message);
        } catch (error) {
            // Error is already handled by the useApi hook
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f7f8fa 60%, #e6f0ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 0 } }}>
            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 4px 32px rgba(108,71,255,0.10)' }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 800, mb: { xs: 1, md: 2 }, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        Forgot Password
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={{ xs: 2, md: 3 }}>
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
                                InputProps={{ style: { fontSize: '0.9rem' } }}
                                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ py: { xs: 1, md: 1.5 }, fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, borderRadius: 2, boxShadow: 2 }}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
