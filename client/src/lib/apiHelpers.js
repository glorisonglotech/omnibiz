import api from './api';
import { toast } from 'sonner';

/**
 * Enhanced API Helpers for Real-Time Data Fetching
 * All functions include error handling and loading states
 */

// ============ TEAM & EMPLOYEES ============
export const teamAPI = {
  // Get all employees with real-time data
  getAll: async () => {
    try {
      const response = await api.get('/team');
      return response.data;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  // Get single employee
  getById: async (id) => {
    try {
      const response = await api.get(`/team/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Create employee
  create: async (employeeData) => {
    try {
      const response = await api.post('/team', employeeData);
      toast.success('Employee added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add employee');
      throw error;
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const response = await api.put(`/team/${id}`, employeeData);
      toast.success('Employee updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update employee');
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const response = await api.delete(`/team/${id}`);
      toast.success('Employee deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete employee');
      throw error;
    }
  },

  // Get team statistics
  getStats: async () => {
    try {
      const response = await api.get('/team/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        monthlyPayroll: 0,
        departments: []
      };
    }
  }
};

// ============ LOCATIONS ============
export const locationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },

  create: async (locationData) => {
    try {
      const response = await api.post('/locations', locationData);
      toast.success('Location added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add location');
      throw error;
    }
  },

  update: async (id, locationData) => {
    try {
      const response = await api.put(`/locations/${id}`, locationData);
      toast.success('Location updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update location');
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/locations/${id}`);
      toast.success('Location deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete location');
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/locations/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching location stats:', error);
      return {
        totalLocations: 0,
        activeLocations: 0,
        totalEmployees: 0,
        totalRevenue: 0
      };
    }
  }
};

// ============ AI INSIGHTS ============
export const aiInsightsAPI = {
  getInsights: async () => {
    try {
      const response = await api.get('/ai/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return [];
    }
  },

  getRecommendations: async () => {
    try {
      const response = await api.get('/ai/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  generateInsights: async () => {
    try {
      const response = await api.post('/ai/generate-insights');
      toast.success('New AI insights generated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to generate insights');
      throw error;
    }
  },

  getPredictions: async (type) => {
    try {
      const response = await api.get(`/ai/predictions/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return null;
    }
  }
};

// ============ ACTIVITIES & HISTORY ============
export const activityAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/activities', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/activities/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        totalActivities: 0,
        userActions: 0,
        systemEvents: 0,
        criticalEvents: 0
      };
    }
  },

  export: async (format = 'csv') => {
    try {
      const response = await api.get(`/activities/export?format=${format}`, {
        responseType: 'blob'
      });
      toast.success('Activity history exported!');
      return response.data;
    } catch (error) {
      toast.error('Failed to export history');
      throw error;
    }
  }
};

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnread: async () => {
    try {
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      toast.success('All notifications marked as read');
      return response.data;
    } catch (error) {
      toast.error('Failed to mark notifications as read');
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to delete notification');
      throw error;
    }
  }
};

// ============ SEARCH ============
export const searchAPI = {
  search: async (query, filters = {}) => {
    try {
      const response = await api.get('/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed. Please try again.');
      return {
        products: [],
        orders: [],
        customers: [],
        transactions: [],
        locations: [],
        appointments: [],
        documents: []
      };
    }
  },

  searchByCategory: async (category, query) => {
    try {
      const response = await api.get(`/search/${category}`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching ${category}:`, error);
      return [];
    }
  }
};

// ============ SUBSCRIPTIONS ============
export const subscriptionsAPI = {
  getCurrent: async () => {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  },

  upgrade: async (planId) => {
    try {
      const response = await api.post('/subscriptions/upgrade', { planId });
      toast.success('Subscription upgraded successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to upgrade subscription');
      throw error;
    }
  },

  cancel: async () => {
    try {
      const response = await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled');
      return response.data;
    } catch (error) {
      toast.error('Failed to cancel subscription');
      throw error;
    }
  },

  getUsage: async () => {
    try {
      const response = await api.get('/subscriptions/usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching usage:', error);
      return null;
    }
  }
};

// ============ PROFILE ============
export const profileAPI = {
  get: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  update: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Avatar updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to upload avatar');
      throw error;
    }
  },

  getActivity: async () => {
    try {
      const response = await api.get('/user/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  getConnections: async () => {
    try {
      const response = await api.get('/user/connections');
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  },

  getSkills: async () => {
    try {
      const response = await api.get('/user/skills');
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  },

  updateSkills: async (skills) => {
    try {
      const response = await api.put('/user/skills', { skills });
      toast.success('Skills updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update skills');
      throw error;
    }
  },

  updateSettings: async (section, settings) => {
    try {
      const response = await api.put('/user/settings', { section, settings });
      return response.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }
};

// ============ PAYMENTS ============
export const paymentsAPI = {
  initiateMpesa: async (phoneNumber, amount, description) => {
    try {
      const response = await api.post('/payments/mpesa/initiate', {
        phoneNumber,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      const errorMsg = error.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  },

  checkMpesaStatus: async (transactionId) => {
    try {
      const response = await api.get(`/payments/mpesa/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  createPayPalOrder: async (amount, currency, description) => {
    try {
      const response = await api.post('/payments/paypal/create-order', {
        amount,
        currency,
        description
      });
      return response.data;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      toast.error('Failed to create PayPal order');
      throw error;
    }
  },

  capturePayPalOrder: async (orderID) => {
    try {
      const response = await api.post('/payments/paypal/capture-order', { orderID });
      toast.success('Payment completed successfully!');
      return response.data;
    } catch (error) {
      console.error('PayPal capture error:', error);
      toast.error('Payment capture failed');
      throw error;
    }
  },

  getPaymentHistory: async (filters = {}) => {
    try {
      const response = await api.get('/payments/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }
};

// ============ DASHBOARD STATS ============
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/dashboard/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  getChartData: async (type, period = '30d') => {
    try {
      const response = await api.get(`/dashboard/charts/${type}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return null;
    }
  }
};

// ============ HELP & SUPPORT ============
export const supportAPI = {
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/support/tickets', ticketData);
      toast.success('Support ticket created!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create ticket');
      throw error;
    }
  },

  getTickets: async () => {
    try {
      const response = await api.get('/support/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  },

  getTicketById: async (id) => {
    try {
      const response = await api.get(`/support/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  updateTicket: async (id, updateData) => {
    try {
      const response = await api.put(`/support/tickets/${id}`, updateData);
      toast.success('Ticket updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update ticket');
      throw error;
    }
  },

  getFAQs: async () => {
    try {
      const response = await api.get('/support/faqs');
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  },

  getSupportAgents: async () => {
    try {
      const response = await api.get('/support/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching support agents:', error);
      // Return default agent if API fails
      return [
        {
          id: 1,
          name: 'Support Team',
          role: 'Customer Support',
          avatar: '/api/placeholder/40/40',
          status: 'online',
          rating: 4.9,
          specialties: ['General Support', 'Technical Help']
        }
      ];
    }
  },

  sendMessage: async (ticketId, message) => {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
      return response.data;
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  }
};

// ============ PRODUCTS ============
export const productsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/products', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      toast.success('Product created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create product');
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      toast.success('Product updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    }
  }
};

// ============ ORDERS ============
export const ordersAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  create: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      toast.success('Order created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create order');
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update order status');
      throw error;
    }
  }
};

export default {
  team: teamAPI,
  locations: locationsAPI,
  aiInsights: aiInsightsAPI,
  activity: activityAPI,
  notifications: notificationsAPI,
  search: searchAPI,
  subscriptions: subscriptionsAPI,
  profile: profileAPI,
  payments: paymentsAPI,
  dashboard: dashboardAPI,
  support: supportAPI,
  products: productsAPI,
  orders: ordersAPI
};
