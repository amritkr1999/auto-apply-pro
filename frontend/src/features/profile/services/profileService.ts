const API_BASE = "http://localhost:8060/api/v1";

export interface UserAuthData {
  token: string;
  id: number;
  email: string;
  name: string;
  mobile: string;
  role: string;
}

export interface CandidateProfile {
  id?: number;
  userId: number;
  email: string;
  name: string;
  mobile: string;
  skills: string[];
  jobPreferences: Record<string, any>;
  resumeFilename?: string;
  summary?: string;
  education?: any[];
  experience?: any[];
  certifications?: string[];
}

export interface RecruiterProfile {
  id?: number;
  userId: number;
  email: string;
  name: string;
  mobile: string;
  companyId?: number | null;
  companyName?: string | null;
}

export interface CompanyProfile {
  id?: number;
  userId: number;
  email: string;
  name: string;
  industry: string;
  website: string;
  description: string;
}

export const profileService = {
  // Authentication
  async register(requestData: any): Promise<UserAuthData> {
    const response = await fetch(`${API_BASE}/auth/register`, {
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
    const response = await fetch(`${API_BASE}/auth/login`, {
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

  // Profiles
  async getCandidateProfile(userId: number): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE}/profiles/candidate/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to load candidate profile");
    }
    return response.json();
  },

  async updateCandidateProfile(userId: number, profile: CandidateProfile): Promise<CandidateProfile> {
    const response = await fetch(`${API_BASE}/profiles/candidate/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
    const response = await fetch(`${API_BASE}/profiles/candidate/${userId}/resume`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to upload candidate resume");
    }
    return response.json();
  },

  async getRecruiterProfile(userId: number): Promise<RecruiterProfile> {
    const response = await fetch(`${API_BASE}/profiles/recruiter/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to load recruiter profile");
    }
    return response.json();
  },

  async updateRecruiterProfile(userId: number, profile: RecruiterProfile): Promise<RecruiterProfile> {
    const response = await fetch(`${API_BASE}/profiles/recruiter/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update recruiter profile");
    }
    return response.json();
  },

  async getCompanyProfile(userId: number): Promise<CompanyProfile> {
    const response = await fetch(`${API_BASE}/profiles/company/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to load company profile");
    }
    return response.json();
  },

  async updateCompanyProfile(userId: number, profile: CompanyProfile): Promise<CompanyProfile> {
    const response = await fetch(`${API_BASE}/profiles/company/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error("Failed to update company profile");
    }
    return response.json();
  },

  async getSkills(): Promise<{ id: number; name: string }[]> {
    const response = await fetch(`${API_BASE}/skills`);
    if (!response.ok) {
      throw new Error("Failed to load skills list");
    }
    return response.json();
  },
};
