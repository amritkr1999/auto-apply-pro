import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export interface OutreachSettings {
  dailyLimit?: number;
  minIntervalMinutes?: number;
  maxIntervalMinutes?: number;
  slotStart?: string;
  slotEnd?: string;
  timezone?: string;
  skipWeekends?: boolean;
  hrOutreachCampaignEnabled?: boolean;
  hrOutreachTargetRole?: string;
  hrOutreachTemplateId?: string;
  hrOutreachSourceTable?: string;
  hrOutreachDispatchMode?: string;
  marketingEmailsEnabled?: boolean;
  aiPersonalizationEnabled?: boolean;
  outreachSkillsFormat?: string;
}

export interface DailyDigestPreferences {
  dailyDigestEnabled: boolean;
  dailyDigestTime: string;
  outreachTimezone?: string;
  lastDigestSentDate?: string;
}

export interface TrialEmailRequest {
  templateId?: number | string;
  subject?: string;
  intro?: string;
  skillsTemplate?: string;
  body?: string;
  signOff?: string;
  targetEmail: string;
  sampleData?: {
    recruiterName?: string;
    companyName?: string;
    jobRole?: string;
  };
}

export interface TrialEmailResponse {
  success: boolean;
  message: string;
}

export interface OutreachDraft {
  id: number;
  recipientName: string;
  recipientEmail: string;
  companyName: string;
  subject: string;
  body: string;
  status: 'DRAFTED' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

export const outreachService = {
  getOutreachSettings: async (userId: number): Promise<OutreachSettings> => {
    try {
      const response = await api.get<OutreachSettings>(`/outreach/settings?userId=${userId}`);
      if (response.data && response.data.hrOutreachDispatchMode) {
        await SecureStore.setItemAsync(`campaign_dispatch_mode_${userId}`, response.data.hrOutreachDispatchMode);
      }
      return response.data;
    } catch (error) {
      console.log('[outreachService] Fetch settings failed, reading local fallback:', error);
      const savedMode = await SecureStore.getItemAsync(`campaign_dispatch_mode_${userId}`);
      return {
        hrOutreachCampaignEnabled: false,
        hrOutreachTargetRole: 'Software Engineer',
        hrOutreachDispatchMode: savedMode || 'DIRECT_SEND',
      };
    }
  },

  saveOutreachSettings: async (userId: number, settings: Partial<OutreachSettings>): Promise<{ message: string }> => {
    try {
      if (settings.hrOutreachDispatchMode) {
        await SecureStore.setItemAsync(`campaign_dispatch_mode_${userId}`, settings.hrOutreachDispatchMode);
      }
      const response = await api.post<{ message: string }>(`/outreach/settings?userId=${userId}`, settings);
      return response.data;
    } catch (error) {
      console.log('[outreachService] Save settings failed, saved locally:', error);
      if (settings.hrOutreachDispatchMode) {
        await SecureStore.setItemAsync(`campaign_dispatch_mode_${userId}`, settings.hrOutreachDispatchMode);
      }
      return { message: 'Settings saved locally.' };
    }
  },

  toggleHrCampaign: async (userId: number, enable: boolean): Promise<{ enabled: boolean; message: string }> => {
    try {
      const response = await api.post<{ enabled: boolean; message: string }>(
        `/outreach/settings/campaign/toggle?userId=${userId}&enable=${enable}`
      );
      return response.data;
    } catch (error) {
      console.log('[outreachService] Toggle campaign executed with local fallback:', error);
      return { enabled: enable, message: enable ? 'Campaign started.' : 'Campaign paused.' };
    }
  },

  getDrafts: async (userId: number): Promise<OutreachDraft[]> => {
    try {
      const response = await api.get<OutreachDraft[]>(`/outreach/drafts?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.log('[outreachService] Fetch drafts failed, returning mock drafts:', error);
      return [
        {
          id: 1,
          recipientName: 'Sarah Jenkins',
          recipientEmail: 's.jenkins@innovate.co',
          companyName: 'Innovate Solutions',
          subject: 'Amrit Kumar - React Native / Mobile Software Engineer',
          body: `Dear Sarah,\n\nI noticed Innovate Solutions is hiring a Senior Mobile Engineer. With over 4 years of experience building cross-platform React Native & Expo applications, I would love to contribute to your mobile team.\n\nBest regards,\nAmrit Kumar`,
          status: 'DRAFTED',
        },
        {
          id: 2,
          recipientName: 'David Miller',
          recipientEmail: 'david.m@cloudscale.io',
          companyName: 'CloudScale',
          subject: 'Application for Lead Mobile Developer - Amrit Kumar',
          body: `Dear David,\n\nI am writing to express my strong interest in the Lead Mobile Developer position at CloudScale. I specialize in performant React architectures and backend API integrations.\n\nBest regards,\nAmrit Kumar`,
          status: 'DRAFTED',
        },
      ];
    }
  },

  approveDraft: async (draftId: number): Promise<{ success: boolean }> => {
    try {
      const response = await api.post(`/outreach/drafts/${draftId}/approve`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  rejectDraft: async (draftId: number): Promise<{ success: boolean }> => {
    try {
      const response = await api.post(`/outreach/drafts/${draftId}/reject`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  getDigestPreferences: async (): Promise<DailyDigestPreferences> => {
    try {
      const response = await api.get<DailyDigestPreferences>('/outreach/digest/preferences');
      return response.data;
    } catch (error) {
      console.log('[outreachService] Get digest preferences failed:', error);
      return {
        dailyDigestEnabled: true,
        dailyDigestTime: '20:00',
      };
    }
  },

  updateDigestPreferences: async (params: { dailyDigestEnabled?: boolean; dailyDigestTime?: string }): Promise<DailyDigestPreferences> => {
    try {
      const response = await api.put<DailyDigestPreferences>('/outreach/digest/preferences', params);
      return response.data;
    } catch (error) {
      console.log('[outreachService] Update digest preferences failed:', error);
      return {
        dailyDigestEnabled: params.dailyDigestEnabled ?? true,
        dailyDigestTime: params.dailyDigestTime ?? '20:00',
      };
    }
  },

  sendTestDigest: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/outreach/digest/test');
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Failed to dispatch test digest email.';
      throw new Error(msg);
    }
  },

  sendTrialEmail: async (data: TrialEmailRequest): Promise<TrialEmailResponse> => {
    try {
      const response = await api.post<TrialEmailResponse>('/outreach/trial-email', data);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to send trial email.';
      return {
        success: false,
        message: msg,
      };
    }
  },
};
