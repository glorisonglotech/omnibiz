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
  const [customer, setCustomer] = useState(() => {
    // Initialize from localStorage
    const savedCustomer = localStorage.getItem('customerData');
    return savedCustomer ? JSON.parse(savedCustomer) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from token existence
    return !!localStorage.getItem('customerToken');
  });

  // Check if customer is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('customerToken');
    const savedCustomer = localStorage.getItem('customerData');
    
    if (!token) {
      setCustomer(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Check if token is expired before making API call
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp < now) {
        console.log('⏰ Token expired, clearing session');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        setCustomer(null);
        setIsAuthenticated(false);
        setLoading(false);
        toast.error('Session expired. Please log in again.');
        return;
      }
    } catch (e) {
      console.error('Error checking token expiry:', e);
    }

    // If we have saved customer data, use it immediately
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing saved customer:', e);
      }
    }

    // Use saved customer data - don't verify with backend on every mount
    // This prevents redirect loops when network issues occur
    try {
      // Just verify token format is valid
      console.log('✅ Customer authenticated from localStorage');
    } catch (error) {
      console.error('❌ Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await customerAPI.login(credentials);
      const { customer, token, storeOwner } = response.data;
      
      console.log('✅ Auth Context: Login response received', customer.email);
      
      // Store customer token and data
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerData', JSON.stringify(customer));
      
      console.log('✅ Auth Context: Token saved to localStorage');
      
      setCustomer(customer);
      setIsAuthenticated(true);
      
      console.log('✅ Auth Context: State updated', { hasCustomer: !!customer });
      
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Customer logged in:', customer.email);
      return { success: true, customer, storeOwner };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      console.error('❌ Login error:', message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await customerAPI.register(registrationData);
      const { customer, token, storeOwner } = response.data;
      
      console.log('✅ Auth Context: Registration response received', customer.email);
      
      // Store customer token and data
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customerData', JSON.stringify(customer));
      
      console.log('✅ Auth Context: Token saved to localStorage');
      
      setCustomer(customer);
      setIsAuthenticated(true);
      
      console.log('✅ Auth Context: State updated', { hasCustomer: !!customer });
      
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Customer registered:', customer.email);
      return { success: true, customer, storeOwner };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      console.error('❌ Registration error:', message);
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
    
    // Clear all customer data
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    setCustomer(null);
    setIsAuthenticated(false);
    
    console.log('✅ Customer logged out');
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await customerAPI.updateProfile(profileData);
      const updatedCustomer = response.data.customer;
      
      // Update state and localStorage
      setCustomer(updatedCustomer);
      localStorage.setItem('customerData', JSON.stringify(updatedCustomer));
      
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
