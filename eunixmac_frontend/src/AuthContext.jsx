/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_CONFIG } from './config/api';

const AuthContext = createContext(null);

// Create the axios instance outside the component
const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // 30 second timeout to prevent indefinite hanging
  headers: {
    'Accept': 'application/json',
  }
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await authApi.get('/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setIsAuthenticated(true);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus().finally(() => setInitialLoad(false));
  }, []); // Empty dependency array since we're only checking on mount

  // Re-sync the user whenever this tab regains focus/visibility. Covers
  // flows like Paystack checkout, which can redirect back in a different
  // tab/window than the one the user started from — leaving this tab's
  // in-memory user (e.g. is_affiliate, is_verified) stale otherwise.
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  if (initialLoad) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, refreshUser: checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
