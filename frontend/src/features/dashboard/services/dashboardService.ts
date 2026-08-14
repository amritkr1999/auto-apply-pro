import { API_BASE } from "../../../config/api";
import { apiFetch, getAuthHeaders } from "../../../services/apiClient";

const API_BASE_V1 = `${API_BASE}/v1`;

export interface DailyActivity {
  date: string;
  fullDate: string;
  emailsSent: number;
  questionsSolved: number;
  topicsCompleted: number;
}

export interface DashboardMetrics {
  loginStreak: number;
  lastLoginDate: string;
  totalEmailsSent: number;
  totalQuestionsSolved: number;
  totalTopicsCompleted: number;
  dailyActivity: DailyActivity[];
}

export const dashboardService = {
  async getDashboardMetrics(userId: number): Promise<DashboardMetrics> {
    const response = await apiFetch(`${API_BASE_V1}/dashboard/metrics/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load dashboard metrics");
    }
    return response.json();
  }
};

