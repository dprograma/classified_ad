import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config/api';

/**
 * Hook for API calls that may take longer (up to 60 seconds)
 * Use this for endpoints known to be slow: featured ads on initial load, etc.
 */
const useSlowApi = () => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 60000, // 60 second timeout for slow endpoints
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
      // Don't show toast for rate limiting errors - let components handle them
      if (error.response?.status !== 429) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, callApi };
};

export default useSlowApi;
