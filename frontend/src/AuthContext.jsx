/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          setIsAuthenticated(true);
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data on initial load:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        } finally {
          setInitialLoad(false);
        }
      } else {
        setInitialLoad(false);
      }
    };

    checkAuthStatus();
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
