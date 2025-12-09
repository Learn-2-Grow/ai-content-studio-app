import axiosInstance from '@/lib/axios';

export const authEndpoints = {
    login: '/auth/login',
    register: '/auth/register',
};

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await axiosInstance.post(authEndpoints.login, {
            email,
            password,
        });
        return response.data;
    },

    register: async (name: string, email: string, password: string) => {
        const response = await axiosInstance.post(authEndpoints.register, {
            name,
            email,
            password,
        });
        return response.data;
    },
};
