import axiosInstance from '@/lib/axios';
import { Thread } from '@/types/thread.types';

export const contentEndpoints = {
    generateContent: '/content/generate-content',
};

export interface GenerateContentRequest {
    prompt: string;
    contentType: string;
    threadId: string | null;
}

export const contentApi = {
    generateContent: async (data: GenerateContentRequest): Promise<Thread> => {
        const response = await axiosInstance.post<Thread>(contentEndpoints.generateContent, data);
        return response.data;
    },
};
