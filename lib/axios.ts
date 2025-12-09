import appConfig from '@/config/app.config';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
    baseURL: appConfig.ACS_Endpoint,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

let isRefreshing = false;
const failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve(token!);
    });
    failedQueue.length = 0;
};

const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

const getErrorMessage = (status: number): string => {
    const messages: Record<number, string> = {
        401: 'Unauthorized. Please login again.',
        403: 'Access forbidden. You don\'t have permission.',
        404: 'Resource not found.',
    };
    return messages[status] || (status >= 500 ? 'Server error. Please try again later.' : 'An unexpected error occurred');
};

const handleRefreshToken = async (originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }): Promise<string> => {

    console.log('handleRefreshToken', originalRequest);

    if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        clearAuth();
        throw new Error('No refresh token available');
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
        const response = await axios.post(`${appConfig.ACS_Endpoint}/auth/refresh`, { refreshToken });
        const responseData = response.data;
        const newAccessToken = responseData?.tokens?.access || responseData?.accessToken || '';
        const newRefreshToken = responseData?.tokens?.refresh || responseData?.refreshToken || refreshToken;

        if (!newAccessToken) {
            throw new Error('No access token in refresh response');
        }

        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken !== refreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        return newAccessToken;
    } catch (err) {
        processQueue(err, null);
        clearAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw err;
    } finally {
        isRefreshing = false;
    }
};

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined' && !config.url?.includes('/auth/refresh')) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

        if (error.response) {
            const { status, data } = error.response;
            const errorMessage = (data as any)?.message || (data as any)?.error || getErrorMessage(status);

            if (status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
                if (typeof window === 'undefined') {
                    return Promise.reject(error);
                }

                try {
                    const newToken = await handleRefreshToken(originalRequest);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    return Promise.reject({
                        ...error,
                        message: 'Session expired. Please login again.',
                        userMessage: 'Session expired. Please login again.',
                    });
                }
            }

            if (status === 401) {
                clearAuth();
            }

            console.error('API Error:', { status, data, url: originalRequest?.url });
            (error as any).userMessage = errorMessage;
        } else if (error.request) {
            const networkMessages: Record<string, string> = {
                ECONNABORTED: 'Request timeout. Please check your connection and try again.',
                ERR_NETWORK: 'Network error. Please check your internet connection.',
            };
            const errorMessage = networkMessages[error.code || ''] || 'No response from server. Please try again later.';
            console.error('Network Error:', { code: error.code, message: error.message, url: originalRequest?.url });
            (error as any).userMessage = errorMessage;
        } else {
            const errorMessage = error.message || 'An unexpected error occurred';
            console.error('Request Setup Error:', error.message);
            (error as any).userMessage = errorMessage;
        }

        return Promise.reject({
            ...error,
            message: (error as any).userMessage,
            userMessage: (error as any).userMessage,
        });
    }
);

export default axiosInstance;
