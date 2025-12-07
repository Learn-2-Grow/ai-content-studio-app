import axiosInstance from '@/lib/axios';
import { ThreadsResponse, ThreadsSummaryResponse } from '@/types/thread.types';

// API endpoint paths
export const threadEndpoints = {
    getThreads: '/threads',
    getSummary: '/threads/summary',
};

// Threads API functions
export const threadsApi = {
    /**
     * Get threads for the authenticated user with pagination
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of threads per page
     */
    getThreads: async (page: number = 1, pageSize: number = 5): Promise<ThreadsResponse> => {
        const response = await axiosInstance.get<ThreadsResponse>(threadEndpoints.getThreads, {
            params: {
                page,
                pageSize,
            },
        });
        return response.data;
    },

    /**
     * Get threads summary statistics
     */
    getSummary: async (): Promise<ThreadsSummaryResponse> => {
        const response = await axiosInstance.get<ThreadsSummaryResponse>(threadEndpoints.getSummary);
        return response.data;
    },
};
