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

export default api;
