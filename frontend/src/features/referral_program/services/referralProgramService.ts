import { API_BASE } from "../../../config/api";
import { apiFetch, getAuthHeaders } from "../../../services/apiClient";

const API_BASE_V1 = `${API_BASE}/v1`;

export interface ReferralRecordDto {
  id: number;
  refereeUserId: number;
  refereeEmailMasked: string;
  referralCode: string;
  status: "PENDING" | "CONVERTED" | "EXPIRED";
  rewardTrialDays: number;
  convertedAt?: string;
  createdAt: string;
}

export interface ReferralDashboardDto {
  referralCode: string;
  referralLink: string;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  earnedTrialDays: number;
  comingSoon: boolean;
  programStatusMessage: string;
  recentReferrals: ReferralRecordDto[];
}

export interface ReferralStatusResponseDto {
  comingSoon: boolean;
  title: string;
  description: string;
  rewardTrialDays: number;
  rewardTriggerCondition: string;
}

export const referralProgramService = {
  async getMyReferralProgram(userId: number): Promise<ReferralDashboardDto> {
    const res = await apiFetch(`${API_BASE_V1}/referral-program/my-program?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to load referral program data");
    }
    return res.json();
  },

  async trackClick(referralCode: string): Promise<void> {
    try {
      await fetch(`${API_BASE_V1}/referral-program/track-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode })
      });
    } catch (e) {
      console.warn("Failed to track referral click", e);
    }
  },

  async getProgramStatus(): Promise<ReferralStatusResponseDto> {
    const res = await fetch(`${API_BASE_V1}/referral-program/status`);
    if (!res.ok) {
      throw new Error("Failed to fetch referral program status");
    }
    return res.json();
  }
};
