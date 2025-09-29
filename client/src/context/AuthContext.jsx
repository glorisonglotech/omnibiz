import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/lib/api'; // Import the configured axios instance (api)

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for user details
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [loading, setLoading] = useState(true); // Loading state for async actions

  // Check if user is authenticated on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use the api instance to send the request
      api
        .get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token to the request
          },
        })
        .then((res) => {
          setUser(res.data);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          console.error('Error checking authentication:', err);
          // Only remove token if it's actually invalid (401), not on connection errors
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
          }
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false); // Once loading is done, update the state
        });
    } else {
      setLoading(false); // If no token, stop loading
    }
  }, []);

  // Login function using the api instance
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Save token to localStorage
      setUser(user); // Set user details in state immediately
      setIsAuthenticated(true); // Set authentication state to true immediately
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUser(null); // Clear user data
    setIsAuthenticated(false); // Set authentication state to false
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally, show a loading spinner or placeholder
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
