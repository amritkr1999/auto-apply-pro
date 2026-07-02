import { API_BASE } from "../../../config/api";

const API_BASE_V1 = `${API_BASE}/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        return {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        };
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  return {
    "Content-Type": "application/json"
  };
};

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
    const response = await fetch(`${API_BASE_V1}/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to submit feedback");
    }
    return response.json();
  },

  getFeedbacks: async (): Promise<FeedbackResponse[]> => {
    const response = await fetch(`${API_BASE_V1}/feedback`);
    if (!response.ok) {
      throw new Error("Failed to fetch feedbacks");
    }
    return response.json();
  },

  getFeedbackStatus: async (): Promise<FeedbackStatusResponse> => {
    const response = await fetch(`${API_BASE_V1}/feedback/status`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to check feedback eligibility status");
    }
    return response.json();
  }
};
