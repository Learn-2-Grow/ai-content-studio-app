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
        const accessToken = localStorage.getItem('accessToken');
        console.log({ accessToken });
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
