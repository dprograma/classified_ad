import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedAds from '../components/FeaturedAds';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import CompactSearch from '../components/CompactSearch';

const LandingPage = () => {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamic spacing based on viewport
    const getResponsiveSpacing = (width) => {
        if (width < 480) return { section: '48px', container: '16px' };
        if (width < 768) return { section: '64px', container: '24px' };
        if (width < 1024) return { section: '80px', container: '32px' };
        return { section: '96px', container: '40px' };
    };

    const spacing = getResponsiveSpacing(windowWidth);

    return (
        <Box sx={{ 
            backgroundColor: 'background.default',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Hero Section - Full width */}
            <HeroSection />

            {/* Compact Search Section */}
            <Box
                component="section"
                sx={{
                    // paddingY: { xs: 4, md: 6 },
                    background: 'linear-gradient(135deg, rgba(108,71,255,0.03) 0%, rgba(0,198,174,0.03) 100%)',
                    position: 'relative',
                }}
            >
            </Box>
            
            {/* Category Grid Section */}
            <Box 
                component="section"
                sx={{ 
                    // paddingY: spacing.section,
                    position: 'relative',
                    background: 'linear-gradient(180deg, rgba(108,71,255,0.01) 0%, rgba(0,198,174,0.01) 100%)',
                }}
            >
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        paddingX: {
                            xs: spacing.container,
                            sm: spacing.container,
                            md: spacing.container,
                            lg: spacing.container
                        }
                    }}
                >
                    <CategoryGrid />
                </Container>
            </Box>
            
            {/* Featured Ads Section */}
            <Box 
                component="section"
                sx={{ 
                    // paddingY: spacing.section,
                    background: 'linear-gradient(180deg, rgba(245,245,245,0.5) 0%, rgba(250,250,250,0.8) 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.2) 50%, transparent 100%)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,198,174,0.2) 50%, transparent 100%)',
                    }
                }}
            >
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        paddingX: {
                            xs: spacing.container,
                            sm: spacing.container,
                            md: spacing.container,
                            lg: spacing.container
                        }
                    }}
                >
                    <FeaturedAds />
                </Container>
            </Box>
            
            {/* How It Works Section */}
            <Box 
                component="section"
                sx={{ 
                    paddingY: spacing.section,
                    position: 'relative',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
                }}
            >
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        paddingX: {
                            xs: spacing.container,
                            sm: spacing.container,
                            md: spacing.container,
                            lg: spacing.container
                        }
                    }}
                >
                    <HowItWorks />
                </Container>
            </Box>
            
            {/* Testimonials Section */}
            <Box 
                component="section"
                sx={{ 
                    paddingY: spacing.section,
                    background: 'linear-gradient(180deg, rgba(245,245,245,0.5) 0%, rgba(250,250,250,0.8) 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(108,71,255,0.2) 50%, transparent 100%)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,198,174,0.2) 50%, transparent 100%)',
                    }
                }}
            >
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        paddingX: {
                            xs: spacing.container,
                            sm: spacing.container,
                            md: spacing.container,
                            lg: spacing.container
                        }
                    }}
                >
                    <Testimonials />
                </Container>
            </Box>
            
            {/* Call to Action Section */}
            <Box 
                component="section"
                sx={{ 
                    paddingY: spacing.section,
                    position: 'relative',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
                }}
            >
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        paddingX: {
                            xs: spacing.container,
                            sm: spacing.container,
                            md: spacing.container,
                            lg: spacing.container
                        }
                    }}
                >
                    <CallToAction />
                </Container>
            </Box>

            {/* Floating Background Elements */}
            <Box sx={{
                position: 'fixed',
                top: '20%',
                right: '-100px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108,71,255,0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: -1,
                animation: 'float 20s ease-in-out infinite',
                '@keyframes float': {
                    '0%, 100%': {
                        transform: 'translateY(0px) rotate(0deg)',
                    },
                    '50%': {
                        transform: 'translateY(-30px) rotate(180deg)',
                    },
                },
            }} />

            <Box sx={{
                position: 'fixed',
                bottom: '30%',
                left: '-80px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,198,174,0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: -1,
                animation: 'float 25s ease-in-out infinite reverse',
            }} />

            <Box sx={{
                position: 'fixed',
                top: '60%',
                left: '10%',
                width: '120px',
                height: '120px',
                borderRadius: '30%',
                background: 'radial-gradient(circle, rgba(108,71,255,0.03) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: -1,
                animation: 'float 30s ease-in-out infinite',
            }} />
        </Box>
    );
};

export default LandingPage;