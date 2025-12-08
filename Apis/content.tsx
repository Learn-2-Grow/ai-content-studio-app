import axiosInstance from '@/lib/axios';
import { Thread } from '@/types/thread.types';

export const contentEndpoints = {
    generateContent: '/content/generate',
    streamContent: '/content/stream',
};

export interface GenerateContentRequest {
    prompt: string;
    contentType: string;
    threadId: string | null;
}

export interface SSEStreamMessage {
    type: 'status' | 'content' | 'error' | 'complete';
    data: {
        contentId?: string;
        threadId?: string;
        status?: string;
        content?: string;
        chunk?: string;
        error?: string;
        thread?: Thread;
    };
}

/**
 * Build SSE URL with query parameters for content generation streaming
 */
export const buildSSEUrl = (data: GenerateContentRequest): string => {
    const params = new URLSearchParams({
        prompt: data.prompt,
        contentType: data.contentType,
        ...(data.threadId && { threadId: data.threadId }),
    });
    return `${contentEndpoints.streamContent}?${params.toString()}`;
};

export const contentApi = {
    /**
     * Legacy method - generates content synchronously (kept for backward compatibility)
     */
    generateContent: async (data: GenerateContentRequest): Promise<Thread> => {
        const response = await axiosInstance.post<Thread>(contentEndpoints.generateContent, data);
        return response.data;
    },

    /**
     * Build SSE URL for streaming content generation
     */
    buildStreamUrl: buildSSEUrl,
};
