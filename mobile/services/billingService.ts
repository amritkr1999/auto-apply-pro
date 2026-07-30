import { api } from './api';

export interface PlanTier {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  isPopular?: boolean;
  aiTokenLimit: string;
  outreachLimit: string;
}

export interface SubscriptionStatus {
  planName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'TRIAL';
  renewsOn?: string;
  currentPeriodEnd?: string;
}

export const billingService = {
  getPlans: async (): Promise<PlanTier[]> => {
    try {
      const response = await api.get<PlanTier[]>('/billing/plans');
      return response.data;
    } catch (error) {
      console.log('[billingService] Fetch plans failed, returning mock plans:', error);
      return [
        {
          id: 'free',
          name: 'Starter',
          priceMonthly: '$0',
          priceYearly: '$0',
          aiTokenLimit: '10,000 / mo',
          outreachLimit: '15 / day',
          features: ['Manual Job Application Tracker', 'Standard Email Templates', 'Basic AI Resume Parsing'],
        },
        {
          id: 'pro',
          name: 'Professional Pro',
          priceMonthly: '$19',
          priceYearly: '$180',
          isPopular: true,
          aiTokenLimit: '250,000 / mo',
          outreachLimit: 'Unlimited',
          features: [
            'Unlimited AI Email Generation',
            'Full Kanban Pipeline & Import Tools',
            'Multi-template Management',
            'Priority SMTP Delivery Queue',
            'Learning Hub Access',
          ],
        },
        {
          id: 'enterprise',
          name: 'Career Acceleration',
          priceMonthly: '$49',
          priceYearly: '$450',
          aiTokenLimit: '1,000,000 / mo',
          outreachLimit: 'Unlimited',
          features: [
            'Dedicated Recruiter Outreach Assistant',
            'Custom Domain SMTP Integration',
            '1-on-1 Interview Coaching',
            'All Pro Features Included',
          ],
        },
      ];
    }
  },

  getSubscriptionStatus: async (userId: number): Promise<SubscriptionStatus> => {
    try {
      const response = await api.get<SubscriptionStatus>(`/billing/user/${userId}/status`);
      return response.data;
    } catch (error) {
      console.log('[billingService] Fetch status failed, returning mock status:', error);
      return {
        planName: 'Professional Pro',
        status: 'ACTIVE',
        renewsOn: '2026-08-28',
      };
    }
  },

  getStripePortalUrl: async (userId: number): Promise<string> => {
    try {
      const response = await api.post<{ url: string }>(`/billing/user/${userId}/stripe-portal`);
      return response.data.url;
    } catch (error) {
      console.log('[billingService] Stripe portal session creation mock:', error);
      return 'https://billing.stripe.com/p/login/test';
    }
  },
};
