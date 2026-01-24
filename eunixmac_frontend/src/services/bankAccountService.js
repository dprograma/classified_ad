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
 * Get list of Nigerian banks from Paystack
 */
export const getBanks = async () => {
  try {
    const response = await api.get('/bank-accounts/banks');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify bank account number
 */
export const verifyBankAccount = async (accountNumber, bankCode) => {
  try {
    const response = await api.post('/bank-accounts/verify', {
      account_number: accountNumber,
      bank_code: bankCode,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get user's bank accounts
 */
export const getUserBankAccounts = async () => {
  try {
    const response = await api.get('/bank-accounts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add new bank account
 */
export const addBankAccount = async (bankData) => {
  try {
    const response = await api.post('/bank-accounts', bankData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Set bank account as primary
 */
export const setPrimaryBankAccount = async (accountId) => {
  try {
    const response = await api.put(`/bank-accounts/${accountId}/primary`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete bank account
 */
export const deleteBankAccount = async (accountId) => {
  try {
    const response = await api.delete(`/bank-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
