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

export interface ReferralRequestDto {
  id: number;
  userId: number;
  companyName: string;
  companyDomain: string;
  jobId: string;
  jobLink: string;
  jobTitle?: string;
  jobDescription?: string;
  skillsRequired?: string[];
  experienceRequired?: string;
  status: string;
  matchedProfessionals: number;
  createdAt: string;
}

export const referralService = {
  async createReferralRequest(userId: number, companyName: string, jobId: string, jobLink: string): Promise<ReferralRequestDto> {
    const response = await fetch(`${API_BASE}/referrals/request?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ companyName, jobId, jobLink }),
    });
    if (!response.ok) {
      throw new Error("Failed to create referral request");
    }
    return response.json();
  },

  async getReferralRequests(userId: number): Promise<ReferralRequestDto[]> {
    const response = await fetch(`${API_BASE}/referrals/requests?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch referral requests");
    }
    return response.json();
  },

  async getReferralRequest(id: number): Promise<ReferralRequestDto> {
    const response = await fetch(`${API_BASE}/referrals/requests/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch referral request details");
    }
    return response.json();
  }
};
