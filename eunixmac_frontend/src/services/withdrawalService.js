import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStats = async () => {
  try {
    const response = await api.get('/withdrawals/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get withdrawal history
 */
export const getWithdrawalHistory = async (page = 1, perPage = 15) => {
  try {
    const response = await api.get('/withdrawals', {
      params: { page, per_page: perPage },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Request a withdrawal
 */
export const requestWithdrawal = async (amount, bankAccountId) => {
  try {
    const response = await api.post('/withdrawals', {
      amount,
      bank_account_id: bankAccountId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get withdrawal details
 */
export const getWithdrawalDetails = async (withdrawalId) => {
  try {
    const response = await api.get(`/withdrawals/${withdrawalId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cancel a withdrawal
 */
export const cancelWithdrawal = async (withdrawalId) => {
  try {
    const response = await api.post(`/withdrawals/${withdrawalId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
