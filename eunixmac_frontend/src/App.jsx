import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PostAd from './pages/PostAd';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PaymentCallback from './pages/PaymentCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Components
import HeroSection from './components/HeroSection';
import CategoryGrid from './components/CategoryGrid';
import FeaturedAds from './components/FeaturedAds';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';



function Home() {
  return (
    <Box>
      <HeroSection />
      <CategoryGrid />
      <FeaturedAds />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'background.default',
          }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/post-ad"
                  element={
                    <PrivateRoute>
                      <PostAd />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{
              borderRadius: '12px',
              boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;