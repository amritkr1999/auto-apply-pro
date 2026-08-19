import { api } from './api';

export interface HrTarget {
  id: number;
  name: string;
  email: string;
  companyName: string;
  designation?: string;
  linkedinUrl?: string;
  source?: string;
  outreachStatus?: 'DISCOVERED' | 'DRAFTED' | 'SENT' | 'REPLIED';
  createdAt?: string;
}

export interface HarvesterSettings {
  userId: number;
  enabled: boolean;
  targetTitles: string[];
  targetLocations: string[];
  scrapedCountThisMonth: number;
  monthlyQuota: number;
}

export const hrHarvesterService = {
  getScrapedHrs: async (): Promise<HrTarget[]> => {
    try {
      const response = await api.get<HrTarget[]>('/hrs');
      return response.data;
    } catch (error) {
      console.log('[hrHarvesterService] Fetch hrs failed, returning fallbacks:', error);
      return [
        {
          id: 1,
          name: 'Ananya Sharma',
          email: 'ananya.sharma@techcorp.com',
          companyName: 'TechCorp Solutions',
          designation: 'Senior Talent Acquisition Manager',
          linkedinUrl: 'https://linkedin.com/in/ananyasharma',
          source: 'LinkedIn Harvester',
          outreachStatus: 'DISCOVERED',
        },
        {
          id: 2,
          name: 'Michael Chen',
          email: 'm.chen@innovate.io',
          companyName: 'Innovate.io',
          designation: 'Lead Engineering Recruiter',
          linkedinUrl: 'https://linkedin.com/in/michaelchen',
          source: 'Naukri Harvester',
          outreachStatus: 'DRAFTED',
        },
        {
          id: 3,
          name: 'Sara Williams',
          email: 'sara.w@growthlabs.com',
          companyName: 'Growth Labs',
          designation: 'People Ops Director',
          source: 'Direct Web Harvest',
          outreachStatus: 'SENT',
        },
      ];
    }
  },

  getHarvesterSettings: async (userId: number): Promise<HarvesterSettings> => {
    try {
      const response = await api.get<HarvesterSettings>(`/hrs/settings?userId=${userId}`);
      return response.data;
    } catch (error) {
      return {
        userId,
        enabled: true,
        targetTitles: ['Senior React Native Developer', 'Software Engineer', 'Frontend Lead'],
        targetLocations: ['Remote', 'San Francisco', 'Bengaluru', 'New York'],
        scrapedCountThisMonth: 142,
        monthlyQuota: 500,
      };
    }
  },

  createHrTarget: async (target: Partial<HrTarget>): Promise<HrTarget> => {
    try {
      const response = await api.post<HrTarget>('/hrs', target);
      return response.data;
    } catch (error) {
      return {
        id: Date.now(),
        name: target.name || 'HR Contact',
        email: target.email || 'hr@company.com',
        companyName: target.companyName || 'Target Company',
        designation: target.designation || 'Recruiter',
        outreachStatus: 'DISCOVERED',
      };
    }
  },
};
