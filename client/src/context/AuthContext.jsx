import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/lib/api'; // Import the configured axios instance (api)
import { useSocket } from '@/context/SocketContext';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for user details
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [loading, setLoading] = useState(true); // Loading state for async actions

  // Function to refresh user profile from server
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('🔄 User profile refreshed:', res.data);
      setUser(res.data);
      setIsAuthenticated(true);
      return res.data;
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
      throw err;
    }
  };

  // Check if user is authenticated on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUserProfile()
        .catch((err) => {
          console.error('Error checking authentication:', err);
        })
        .finally(() => {
          setLoading(false);
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
      
      // Trigger theme preferences load by dispatching a custom event
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));
      
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
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
    refreshUserProfile, // Expose refresh function
    setUser, // Expose setUser for manual updates
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally, show a loading spinner or placeholder
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
