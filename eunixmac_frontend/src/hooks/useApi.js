import { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 30000, // 30 second timeout to prevent indefinite hanging
    headers: {
        'Accept': 'application/json',
    }
  });

  // Use an interceptor to add the token to every request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const callApi = async (method, url, data = null, headers = {}) => {
    setLoading(true);
    try {
      // The interceptor will automatically add the auth header
      const response = await api({
        method,
        url,
        data,
        headers, // Allows for additional headers like for file uploads
      });
      return response.data;
    } catch (error) {
      // Don't show toast here - let components handle their own user-friendly messages
      // This prevents duplicate toasts when components have their own error handling
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';

      // Attach the error message to the error object for components to use
      error.message = errorMessage;

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, callApi };
};

export default useApi;
