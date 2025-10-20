import { createContext, useContext, useState, useEffect } from 'react';
import { customerAPI } from '@/lib/api';
import { toast } from 'sonner';

const CustomerAuthContext = createContext({});

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if customer is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Temporarily set token in axios
      const response = await customerAPI.getProfile();
      setCustomer(response.data.customer);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Customer auth check failed:', error);
      localStorage.removeItem('customerToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await customerAPI.login(credentials);
      const { customer, token, storeOwner } = response.data;
      
      // Store customer token separately from user token
      localStorage.setItem('customerToken', token);
      
      setCustomer(customer);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${customer.name}!`);
      return { success: true, customer, storeOwner };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await customerAPI.register(registrationData);
      const { customer, token, storeOwner } = response.data;
      
      // Store customer token
      localStorage.setItem('customerToken', token);
      
      setCustomer(customer);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! Please verify your email.');
      return { success: true, customer, storeOwner };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear customer-specific cart before logging out
    const customerToken = localStorage.getItem('customerToken');
    if (customerToken) {
      try {
        const payload = JSON.parse(atob(customerToken.split('.')[1]));
        const cartKey = `cart_items_${payload.id || payload.email || 'guest'}`;
        localStorage.removeItem(cartKey);
      } catch (e) {
        console.error('Error clearing cart:', e);
      }
    }
    
    localStorage.removeItem('customerToken');
    setCustomer(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await customerAPI.updateProfile(profileData);
      setCustomer(response.data.customer);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    customer,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthContext;
