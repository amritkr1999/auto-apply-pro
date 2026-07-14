import { API_BASE } from "../../../config/api";

const API_BASE_V1 = `${API_BASE}/v1`;

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

export interface UserAuthData {
  token: string;
  id: number;
  email: string;
  name: string;
  mobile: string;
  officialEmail?: string;
  role: string;
  isPendingDeletion: boolean;
  avatar?: string;
}

export interface CandidateProfile {
  id?: number;
  userId: number;
  email: string;
  name: string;
  mobile: string;
  officialEmail?: string;
  skills: string[];
  jobPreferences: Record<string, any>;
  resumeFilename?: string;
  summary?: string;
  education?: any[];
  experience?: any[];
  certifications?: string[];
  githubUsername?: string;
  githubProfileUrl?: string;
  linkedinProfileUrl?: string;
  linkedinName?: string;
  avatar?: string;
  isProfilePublic?: boolean;
  username?: string;
  githubStats?: Record<string, any>;
  leetcodeStats?: Record<string, any>;
  leetcodeUsername?: string;
  isVerified?: boolean;
  professionalVertical?: string;
  achievements?: AchievementCard[];
  excludedCompanies?: string[];
  isDefault?: boolean;
  profileName?: string;
}

export interface AchievementCard {
  id?: number;
  title: string;
  description: string;
  category: string;
  badgeUrl?: string;
  trustScore?: number;
  isVerified?: boolean;
}

export interface PublicProfile {
  username: string;
  name: string;
  summary?: string;
  avatar?: string;
  isVerified: boolean;
  skills: string[];
  professionalVertical: string;
  evidenceMetrics?: Record<string, any>;
  highlights?: AchievementCard[];
  // Legacy compatibility fields
  githubUsername?: string;
  githubProfileUrl?: string;
  linkedinProfileUrl?: string;
  linkedinName?: string;
  githubStats?: Record<string, any>;
  leetcodeStats?: Record<string, any>;
  leetcodeUsername?: string;
}

export interface RecruiterProfile {
  id?: number;
  userId: number;
  email: string;
  name: string;
  mobile: string;
  officialEmail?: string;
  companyId?: number | null;
  companyName?: string | null;
  avatar?: string;
}

export interface CompanyProfile {
  id?: number;
  userId: number;
  email: string;
  officialEmail?: string;
  name: string;
  industry: string;
  website: string;
  description: string;
  avatar?: string;
}

export const profileService = {
  // Authentication
  async register(requestData: any): Promise<UserAuthData> {
    const response = await fetch(`${API_BASE_V1}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.token || "Registration failed");
    }
    return response.json();
  },

  async login(requestData: any): Promise<UserAuthData> {
    const response = await fetch(`${API_BASE_V1}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.token || "Login failed");
    }
    return response.json();
  },

  async forgotPassword(email: string): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to process forgot password request.");
    }
    return data;
  },

  async resetPassword(requestData: any): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password.");
    }
    return data;
  },

  // Profiles
  async getCandidateProfile(userId: number): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load candidate profile");
    }
    return response.json();
  },

  async getCandidateProfileById(userId: number, profileId: number): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/profile/${profileId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load candidate profile version");
    }
    return response.json();
  },

  async updateCandidateProfile(userId: number, profile: CandidateProfile): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update candidate profile");
    }
    return response.json();
  },

  async uploadCandidateResume(userId: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/resume`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload candidate resume");
    }
    return response.json();
  },

  async syncCandidateProfile(userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/resume/sync`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to sync candidate profile from resume");
    }
    return response.json();
  },

  async getRecruiterProfile(userId: number): Promise<RecruiterProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/recruiter/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load recruiter profile");
    }
    return response.json();
  },

  async updateRecruiterProfile(userId: number, profile: RecruiterProfile): Promise<RecruiterProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/recruiter/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update recruiter profile");
    }
    return response.json();
  },

  async getCompanyProfile(userId: number): Promise<CompanyProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/company/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load company profile");
    }
    return response.json();
  },

  async updateCompanyProfile(userId: number, profile: CompanyProfile): Promise<CompanyProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/company/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update company profile");
    }
    return response.json();
  },

  async getSkills(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(`${API_BASE_V1}/skills`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load skills list");
    }
    return response.json();
  },

  async getGithubConnectUrl(userId: number): Promise<string> {
    const response = await fetch(`${API_BASE_V1}/auth/connect/github?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to get GitHub redirect URL");
    }
    return response.text();
  },

  async disconnectGithub(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/auth/disconnect/github?userId=${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to disconnect GitHub");
    }
    return response.json();
  },

  async getLinkedinConnectUrl(userId: number): Promise<string> {
    const response = await fetch(`${API_BASE_V1}/auth/connect/linkedin?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to get LinkedIn redirect URL");
    }
    return response.text();
  },

  async disconnectLinkedin(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/auth/disconnect/linkedin?userId=${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to disconnect LinkedIn");
    }
    return response.json();
  },

  async getPublicProfile(username: string): Promise<PublicProfile> {
    const response = await fetch(`${API_BASE_V1}/public/profile/${username}`);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = "Profile not found or private";
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_V1}/public/profile/check-username?username=${username}`);
      if (!response.ok) return false;
      const data = await response.json();
      return !!data.available;
    } catch {
      return false;
    }
  },

  async getCandidateProfiles(userId: number): Promise<CandidateProfile[]> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load candidate profiles");
    }
    return response.json();
  },

  async createCandidateProfile(userId: number, profileName: string): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/create?profileName=${encodeURIComponent(profileName)}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to create candidate profile");
    }
    return response.json();
  },

  async selectDefaultProfile(userId: number, profileId: number): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/select/${profileId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to set default profile");
    }
    return response.json();
  },

  async deleteCandidateProfile(userId: number, profileId: number): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/profile/${profileId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to delete candidate profile");
    }
    return response.json();
  },

  async updateCandidateProfileById(userId: number, profileId: number, profile: CandidateProfile): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/profile/${profileId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update candidate profile");
    }
    return response.json();
  },

  async uploadCandidateResumeById(userId: number, profileId: number, file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/profile/${profileId}/resume`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload candidate resume");
    }
    return response.json();
  },

  async syncCandidateProfileById(userId: number, profileId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_V1}/profiles/candidate/${userId}/profile/${profileId}/resume/sync`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to sync candidate profile from resume");
    }
    return response.json();
  },
};
