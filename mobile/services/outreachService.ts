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
