// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthContext provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for user details
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [loading, setLoading] = useState(true); // Loading state for async actions

  // Example: Checking if a user is authenticated on page load (using localStorage or API)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch(err => {
          console.error(err);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
