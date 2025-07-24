// src/pages/VerifyEmailPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Or your preferred HTTP client

// IMPORTANT: Set this to your backend API's base URL in your environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your email...');
  const verificationAttempted = useRef(false); // Use ref to track if verification has been attempted

  useEffect(() => {
    // Only run the verification logic if it hasn't been attempted yet
    if (verificationAttempted.current) {
      return;
    }
    verificationAttempted.current = true; // Mark that we are attempting verification

    const path = searchParams.get('path');
    const query = searchParams.get('query');

    if (!path || !query) {
      setStatus('Error: Verification link is missing or invalid.');
      return;
    }

    // Reconstruct the full backend verification URL
    const fullVerifyUrl = `${API_BASE_URL}${path}?${query}`;

    const verifyEmail = async () => {
      try {
        await axios.get(fullVerifyUrl);

        setStatus('Success! Your email has been verified. Redirecting to login...');

        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Verification link has expired or is invalid.';
        setStatus(`Error: ${errorMessage} Please request a new one.`);
        console.error('Verification failed:', error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Email Verification</h1>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmailPage;
