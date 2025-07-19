import React from 'react';
import { Box, Container } from '@mui/material';
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedAds from '../components/FeaturedAds';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <Box sx={{ backgroundColor: 'background.default' }}>
            <HeroSection />
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <CategoryGrid />
            </Container>
            <Box sx={{ backgroundColor: '#f5f5f5', py: 6 }}>
                <Container maxWidth="lg">
                    <FeaturedAds />
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <HowItWorks />
            </Container>
            <Box sx={{ backgroundColor: '#f5f5f5', py: 6 }}>
                <Container maxWidth="lg">
                    <Testimonials />
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <CallToAction />
            </Container>
            <Footer />
        </Box>
    );
};

export default LandingPage; 