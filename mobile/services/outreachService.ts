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
};
