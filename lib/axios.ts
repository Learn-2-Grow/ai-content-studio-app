import appConfig from '@/config/app.config';
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: appConfig.ACS_Endpoint,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle different types of errors
        let errorMessage = 'An unexpected error occurred';

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            errorMessage = data?.message || data?.error || `Server error (${status})`;

            // Handle specific status codes
            if (status === 401) {
                errorMessage = 'Unauthorized. Please login again.';
                // Optionally clear token and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                }
            } else if (status === 403) {
                errorMessage = 'Access forbidden. You don\'t have permission.';
            } else if (status === 404) {
                errorMessage = 'Resource not found.';
            } else if (status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            console.error('API Error:', {
                status,
                data: error.response.data,
                url: error.config?.url,
            });

            // Attach user-friendly message to error
            error.userMessage = errorMessage;

        } else if (error.request) {
            // Request was made but no response received
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection and try again.';
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = 'No response from server. Please try again later.';
            }

            console.error('Network Error:', {
                code: error.code,
                message: error.message,
                url: error.config?.url,
            });

            // Attach user-friendly message to error
            error.userMessage = errorMessage;

        } else {
            // Error setting up the request
            errorMessage = error.message || 'An unexpected error occurred';
            console.error('Request Setup Error:', error.message);
            error.userMessage = errorMessage;
        }

        // Return a normalized error object
        return Promise.reject({
            ...error,
            message: errorMessage,
            userMessage: errorMessage,
        });
    }
);

export default axiosInstance;
