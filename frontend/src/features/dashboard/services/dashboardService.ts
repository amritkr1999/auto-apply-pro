const API_BASE = "http://localhost:8060/api/v1";

const getAuthHeaders = (): Record<string, string> => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        return {
          "Authorization": `Bearer ${user.token}`
        };
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  return {};
};

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
    const response = await fetch(`${API_BASE}/dashboard/metrics/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load dashboard metrics");
    }
    return response.json();
  }
};
