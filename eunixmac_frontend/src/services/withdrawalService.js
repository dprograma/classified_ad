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
 * Request a withdrawal against a saved bank account
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
 * Request a withdrawal using bank details supplied at the point of
 * disbursement (already resolved via verifyBankAccount) instead of a
 * previously saved bank account. The backend saves it for future use.
 */
export const requestWithdrawalWithNewBankAccount = async (amount, bankDetails) => {
  try {
    const response = await api.post('/withdrawals', {
      amount,
      bank_name: bankDetails.bank_name,
      bank_code: bankDetails.bank_code,
      account_number: bankDetails.account_number,
      account_name: bankDetails.account_name,
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

/**
 * Admin: list withdrawal requests, optionally filtered by status
 */
export const getAdminWithdrawals = async (page = 1, perPage = 15, status = '') => {
  try {
    const response = await api.get('/admin/withdrawals', {
      params: { page, per_page: perPage, ...(status ? { status } : {}) },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Admin: approve a pending withdrawal (triggers disbursement)
 */
export const approveWithdrawal = async (withdrawalId) => {
  try {
    const response = await api.put(`/admin/withdrawals/${withdrawalId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Admin: reject a pending withdrawal
 */
export const rejectWithdrawal = async (withdrawalId, reason = '') => {
  try {
    const response = await api.put(`/admin/withdrawals/${withdrawalId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
