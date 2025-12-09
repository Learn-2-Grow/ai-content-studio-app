import axiosInstance from "@/lib/axios";
import { SubmitFeedbackResponse } from "./content";

export const sentimentEndpoints = {
    sentimentAnalysis: '/sentiment/analyze',
};

export const sentimentApi = {
    sentimentAnalysis: async (contentId: string, prompt: string): Promise<SubmitFeedbackResponse> => {
        const response = await axiosInstance.post<SubmitFeedbackResponse>(sentimentEndpoints.sentimentAnalysis, {
            contentId,
            prompt,
        });
        return response.data;
    },

};
