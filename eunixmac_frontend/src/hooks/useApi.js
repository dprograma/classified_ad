import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, callApi };
};

export default useApi;
