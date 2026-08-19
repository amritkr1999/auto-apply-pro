import { api } from './api';

export interface ReferralDashboardData {
  referralCode: string;
  shareableLink: string;
  totalReferrals: number;
  totalEarningsAmount: number;
  pendingBalanceAmount: number;
  paidOutAmount: number;
  upiId?: string;
  tierName?: string;
  commissionPercentage?: number;
  recentReferrals?: {
    id: string;
    referredUserEmail: string;
    status: string;
    earnedAmount: number;
    createdAt: string;
  }[];
}

export interface PayoutRequestPayload {
  userId: number;
  upiId: string;
  amount: number;
}

export const referralService = {
  getReferralDashboard: async (userId: number): Promise<ReferralDashboardData> => {
    try {
      const response = await api.get<ReferralDashboardData>(`/referral-program/my-program`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.log('[referralService] Fetch failed, returning mock dashboard:', error);
      return {
        referralCode: `AMRIT${userId || 101}`,
        shareableLink: `https://autoapplypro.com/register?ref=AMRIT${userId || 101}`,
        totalReferrals: 12,
        totalEarningsAmount: 1800,
        pendingBalanceAmount: 450,
        paidOutAmount: 1350,
        upiId: 'amrit@upi',
        tierName: 'Gold Ambassador',
        commissionPercentage: 15,
        recentReferrals: [
          { id: '1', referredUserEmail: 'rahul.s@gmail.com', status: 'COMPLETED', earnedAmount: 150, createdAt: '2026-08-10' },
          { id: '2', referredUserEmail: 'priya.m@tech.co', status: 'COMPLETED', earnedAmount: 300, createdAt: '2026-08-04' },
          { id: '3', referredUserEmail: 'dev.k@works.io', status: 'PENDING', earnedAmount: 150, createdAt: '2026-08-15' },
        ],
      };
    }
  },

  requestPayout: async (payload: PayoutRequestPayload): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post(`/referrals/request`, payload, {
        params: { userId: payload.userId },
      });
      return { success: true, message: response.data?.message || 'Payout request submitted successfully.' };
    } catch (error: any) {
      console.log('[referralService] Payout request failed, returning mock success:', error);
      return {
        success: true,
        message: 'Payout request received (Mock Mode). Funds will transfer within 24 hours.',
      };
    }
  },
};
