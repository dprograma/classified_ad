import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: 'http://localhost:8000/api',
  });

  const callApi = async (method, url, data = null, headers = {}) => {
    setLoading(true);
    try {
      const response = await api({
        method,
        url,
        data,
        headers,
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
