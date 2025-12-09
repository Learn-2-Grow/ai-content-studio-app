import axiosInstance from '@/lib/axios';
import { ThreadDetails, ThreadsResponse, ThreadsSummaryResponse } from '@/common/interfaces/thread.interface';

export const threadEndpoints = {
    getThreads: '/threads',
    getSummary: '/threads/summary',
    getThreadDetails: (threadId: string) => `/threads/${threadId}`,
};

export const threadsApi = {
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

    getSummary: async (): Promise<ThreadsSummaryResponse> => {
        const response = await axiosInstance.get<ThreadsSummaryResponse>(threadEndpoints.getSummary);
        return response.data;
    },

    getThreadDetails: async (threadId: string): Promise<ThreadDetails> => {
        const response = await axiosInstance.get<ThreadDetails>(threadEndpoints.getThreadDetails(threadId));
        return response.data;
    },
};
