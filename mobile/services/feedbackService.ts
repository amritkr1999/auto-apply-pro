import { api } from './api';

export interface FeedbackRequest {
  rating: number;
  comment: string;
}

export interface FeedbackResponse {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  userRole: string;
  createdAt: string;
}

export interface FeedbackStatusResponse {
  showPopup: boolean;
}

export const feedbackService = {
  submitFeedback: async (rating: number, comment: string): Promise<FeedbackResponse> => {
    const response = await api.post<FeedbackResponse>('/feedback', { rating, comment });
    return response.data;
  },

  getFeedbacks: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get<FeedbackResponse[]>('/feedback');
    return response.data;
  },

  getFeedbackStatus: async (): Promise<FeedbackStatusResponse> => {
    const response = await api.get<FeedbackStatusResponse>('/feedback/status');
    return response.data;
  }
};
