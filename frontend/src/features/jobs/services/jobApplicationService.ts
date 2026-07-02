import { buildApiUrl } from "../../../config/api";

const API_BASE = buildApiUrl("/job-applications");

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

export interface JobApplication {
  id?: number;
  companyName: string;
  jobTitle: string;
  sourcePlatform?: string;
  status: "WISHLIST" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  currentRound?: string;
  location?: string;
  salaryDetails?: string;
  jobUrl?: string;
  notes?: string;
  appliedAt?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplicationStats {
  totalApplications: number;
  activeInterviews: number;
  offersReceived: number;
  rejectionsCount: number;
  overallResponseRate: number;
  platformResponseRates: Record<string, number>;
  platformApplicationsCount: Record<string, number>;
}

export const jobApplicationService = {
  getApplications: async (userId: number): Promise<JobApplication[]> => {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load applications");
    return res.json();
  },

  getStats: async (userId: number): Promise<JobApplicationStats> => {
    const res = await fetch(`${API_BASE}/user/${userId}/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load stats");
    return res.json();
  },

  createApplication: async (userId: number, application: JobApplication): Promise<JobApplication> => {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(application),
    });
    if (!res.ok) throw new Error("Failed to create application");
    return res.json();
  },

  updateApplication: async (id: number, application: JobApplication): Promise<JobApplication> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(application),
    });
    if (!res.ok) throw new Error("Failed to update application");
    return res.json();
  },

  updateStatus: async (id: number, status: string): Promise<JobApplication> => {
    const res = await fetch(`${API_BASE}/${id}/status?status=${status}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },

  deleteApplication: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete application");
  }
};
