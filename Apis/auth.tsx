import axiosInstance from '@/lib/axios';

// API endpoint paths
export const authEndpoints = {
    login: '/auth/login',
    register: '/auth/register',
};

// Auth API functions
export const authApi = {
    /**
     * Login user
     */
    login: async (email: string, password: string) => {
        const response = await axiosInstance.post(authEndpoints.login, {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Register new user
     */
    register: async (name: string, email: string, password: string) => {
        const response = await axiosInstance.post(authEndpoints.register, {
            name,
            email,
            password,
        });
        return response.data;
    },
};
