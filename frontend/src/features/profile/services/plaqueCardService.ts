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

export interface PlaqueCardWidget {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  isEnabled: boolean;
  order: number;
}

export interface PlaqueCardConfig {
  id?: number;
  themeConfig: Record<string, any>;
  settings: Record<string, any>;
  elements: PlaqueCardWidget[];
}

export interface PublicPlaqueCardResponse {
  card: PlaqueCardConfig;
  userId?: number;
  name: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
  professionalVertical: string;
  summary?: string;
  skills: string[];
  education?: any[];
  experience?: any[];
  achievements?: any[];
  githubUsername?: string;
  githubProfileUrl?: string;
  linkedinProfileUrl?: string;
  linkedinName?: string;
  leetcodeUsername?: string;
  githubStats?: Record<string, any>;
  leetcodeStats?: Record<string, any>;
}

export interface PlaqueCardContactData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export const plaqueCardService = {
  async getMyPlaqueCard(): Promise<PlaqueCardConfig> {
    const response = await fetch(`${API_BASE_V1}/plaque-card/my-card`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load candidate plaque card configuration");
    }
    return response.json();
  },

  async updateMyPlaqueCard(config: PlaqueCardConfig): Promise<PlaqueCardConfig> {
    const response = await fetch(`${API_BASE_V1}/plaque-card/my-card`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error("Failed to save plaque card configuration");
    }
    return response.json();
  },

  async getPublicPlaqueCard(username: string): Promise<PublicPlaqueCardResponse> {
    const response = await fetch(`${API_BASE_V1}/public/plaque-card/${username}`);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = "Plaque card profile not found";
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },

  async sendContactMessage(username: string, contactData: PlaqueCardContactData): Promise<any> {
    const response = await fetch(`${API_BASE_V1}/public/plaque-card/${username}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contactData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = "Failed to send contact inquiry";
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  }
};
