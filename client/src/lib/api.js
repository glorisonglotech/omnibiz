import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            toast.error('Request timeout. Please check your connection.');
        } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            toast.error('Network error. Please check if the server is running.');
        } else if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            if (status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('token');
                if (window.location.pathname !== '/loginpage') {
                    window.location.href = '/loginpage';
                }
            } else if (status === 403) {
                toast.error('Access denied.');
            } else if (status === 404) {
                toast.error('Resource not found.');
            } else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateUserRole: (userId, roleData) => api.put(`/auth/users/${userId}/role`, roleData),
  assignAdminToClient: (clientId, adminData) => api.put(`/auth/clients/${clientId}/assign-admin`, adminData),
};

// Admin API functions
export const adminAPI = {
  // Orders
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  approveOrder: (orderId, data) => api.put(`/admin/orders/${orderId}/approve`, data),
  verifyOrder: (orderId, data) => api.put(`/admin/orders/${orderId}/verify`, data),
  assignOrder: (orderId, data) => api.put(`/admin/orders/${orderId}/assign`, data),

  // Service Requests
  getAllServiceRequests: (params) => api.get('/admin/service-requests', { params }),
  respondToServiceRequest: (requestId, data) => api.put(`/admin/service-requests/${requestId}/respond`, data),
  updateServiceRequestStatus: (requestId, data) => api.put(`/admin/service-requests/${requestId}/status`, data),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

// Client API functions
export const clientAPI = {
  // Orders
  createOrder: (orderData) => api.post('/client/orders', orderData),
  getMyOrders: (params) => api.get('/client/orders', { params }),
  getOrderDetails: (orderId) => api.get(`/client/orders/${orderId}`),
  updateOrder: (orderId, data) => api.put(`/client/orders/${orderId}`, data),
  submitOrder: (orderId) => api.put(`/client/orders/${orderId}/submit`),
  cancelOrder: (orderId, data) => api.put(`/client/orders/${orderId}/cancel`, data),

  // Service Requests
  createServiceRequest: (requestData) => api.post('/client/service-requests', requestData),
  getMyServiceRequests: (params) => api.get('/client/service-requests', { params }),
  respondToServiceProposal: (requestId, data) => api.put(`/client/service-requests/${requestId}/respond`, data),
  rateService: (requestId, data) => api.put(`/client/service-requests/${requestId}/rate`, data),

  // Dashboard
  getDashboardStats: () => api.get('/client/dashboard-stats'),
};

// Upload API functions
export const uploadAPI = {
  orderAttachments: (formData) => api.post('/upload/order-attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  serviceAttachments: (formData) => api.post('/upload/service-attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  profilePicture: (formData) => api.post('/upload/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  businessDocuments: (formData) => api.post('/upload/business-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  multiple: (formData) => api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (fileUrl) => api.delete('/upload/file', { data: { fileUrl } }),
  getUploadInfo: () => api.get('/upload/info'),
};

export { api };
export default api;
