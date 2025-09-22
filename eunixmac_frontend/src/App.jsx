import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
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
import SearchResults from './pages/SearchResults';
import Help from './pages/Help';
import BuyerSafety from './pages/BuyerSafety';
import SellerGuide from './pages/SellerGuide';
import AgentProgram from './pages/AgentProgram';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import UploadEducationalMaterial from './pages/UploadEducationalMaterial';
import MaterialView from './pages/MaterialView';
import MaterialEdit from './pages/MaterialEdit';
import Categories from './pages/Categories';
import AdDetail from './pages/AdDetail';
import AdminSupportManagement from './pages/AdminSupportManagement';
import AdminMaterialsManagement from './pages/AdminMaterialsManagement';


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
                <Route path="/search" element={<SearchResults />} />
                <Route path="/help" element={<Help />} />
                <Route path="/buyer-safety" element={<BuyerSafety />} />
                <Route path="/seller-guide" element={<SellerGuide />} />
                <Route path="/agent-program" element={<AgentProgram />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/safety" element={<BuyerSafety />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/ads/:id" element={<AdDetail />} />
                <Route
                  path="/educational-materials/upload"
                  element={
                    <PrivateRoute>
                      <UploadEducationalMaterial />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/educational-materials/:id"
                  element={
                    <PrivateRoute>
                      <MaterialView />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/educational-materials/:id/edit"
                  element={
                    <PrivateRoute>
                      <MaterialEdit />
                    </PrivateRoute>
                  }
                />
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
                <Route
                  path="/admin/support"
                  element={
                    <PrivateRoute>
                      <AdminSupportManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/materials"
                  element={
                    <PrivateRoute>
                      <AdminMaterialsManagement />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
            <CookieConsent />
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