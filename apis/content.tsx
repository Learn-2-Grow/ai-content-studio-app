import { Thread } from '@/common/interfaces/thread.interface';
import axiosInstance from '@/lib/axios';

export const contentEndpoints = {
    generateContent: '/content/generate',
    streamContent: '/content/stream',
    updateContent: '/content',
};

export interface GenerateContentRequest {
    prompt: string;
    contentType: string;
    threadId: string | null;
    sentiment?: 'positive' | 'neutral' | 'negative';
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

export const buildSSEUrl = (data: GenerateContentRequest): string => {
    const params = new URLSearchParams({
        prompt: data.prompt,
        contentType: data.contentType,
        ...(data.threadId && { threadId: data.threadId }),
    });
    return `${contentEndpoints.streamContent}?${params.toString()}`;
};

export interface SubmitFeedbackResponse {
    sentiment: 'positive' | 'neutral' | 'negative';
    message?: string;
}

export const contentApi = {
    generateContent: async (data: GenerateContentRequest): Promise<Thread> => {
        const response = await axiosInstance.post<Thread>(contentEndpoints.generateContent, data);
        return response.data;
    },

    updateContent: async (contentId: string, data: any): Promise<void> => {
        await axiosInstance.patch(`${contentEndpoints.updateContent}/${contentId}`, data);
    },

    buildStreamUrl: buildSSEUrl,
};
