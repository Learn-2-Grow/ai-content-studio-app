import axiosInstance from '@/lib/axios';
import { ThreadDetails, ThreadsResponse, ThreadsSummaryResponse } from '@/types/thread.interface';

// API endpoint paths
export const threadEndpoints = {
    getThreads: '/threads',
    getSummary: '/threads/summary',
    getThreadDetails: (threadId: string) => `/threads/${threadId}`,
};

// Threads API functions
export const threadsApi = {
    /**
     * Get threads for the authenticated user with pagination
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of threads per page
     * @param search - Search query to filter threads by title
     * @param type - Filter threads by type
     * @param status - Filter threads by status
     */
    getThreads: async (
        page: number = 1,
        pageSize: number = 5,
        search?: string,
        type?: string,
        status?: string
    ): Promise<ThreadsResponse> => {
        const params: Record<string, any> = {
            page,
            pageSize,
        };

        if (search) params.search = search;
        if (type) params.type = type;
        if (status) params.status = status;

        const response = await axiosInstance.get<ThreadsResponse>(threadEndpoints.getThreads, {
            params,
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

    getThreadDetails: async (threadId: string): Promise<ThreadDetails> => {
        const response = await axiosInstance.get<ThreadDetails>(threadEndpoints.getThreadDetails(threadId));
        return response.data;
    },
};
