import { api } from './api';

export type ApplicationStatus = 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id?: number;
  companyName: string;
  jobTitle: string;
  sourcePlatform?: string;
  status: ApplicationStatus;
  currentRound?: string;
  location?: string;
  salaryDetails?: string;
  jobUrl?: string;
  notes?: string;
  appliedAt?: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplicationStats {
  totalApplications: number;
  activeInterviews: number;
  offersReceived: number;
  rejectionsCount: number;
  overallResponseRate: number;
  platformResponseRates?: Record<string, number>;
  platformApplicationsCount?: Record<string, number>;
}

export const jobTrackerService = {
  getApplications: async (userId: number): Promise<JobApplication[]> => {
    try {
      const response = await api.get<JobApplication[]>(`/job-applications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Fetch failed, returning mock applications:', error);
      return [
        {
          id: 1,
          companyName: 'Google',
          jobTitle: 'Senior React Native Developer',
          sourcePlatform: 'LinkedIn',
          status: 'INTERVIEWING',
          currentRound: 'System Design Round',
          location: 'Mountain View, CA (Hybrid)',
          salaryDetails: '$180,000 - $220,000',
          jobUrl: 'https://careers.google.com/jobs/123',
          notes: 'Met hiring manager on LinkedIn. Technical interview scheduled for Friday.',
          appliedAt: '2026-07-20',
          followUpDate: '2026-08-01',
        },
        {
          id: 2,
          companyName: 'Stripe',
          jobTitle: 'Staff Frontend Engineer',
          sourcePlatform: 'Instahyre',
          status: 'OFFER',
          currentRound: 'Offer Negotiation',
          location: 'San Francisco, CA',
          salaryDetails: '$210,000 + Equity',
          jobUrl: 'https://stripe.com/jobs/456',
          notes: 'Verbal offer received. Reviewing equity terms.',
          appliedAt: '2026-07-10',
        },
        {
          id: 3,
          companyName: 'Vercel',
          jobTitle: 'Mobile Software Engineer',
          sourcePlatform: 'LinkedIn',
          status: 'APPLIED',
          currentRound: 'Recruiter Screen',
          location: 'Remote',
          salaryDetails: '$160,000',
          jobUrl: 'https://vercel.com/careers/mobile',
          notes: 'Applied with custom resume and cover letter.',
          appliedAt: '2026-07-25',
        },
        {
          id: 4,
          companyName: 'Meta',
          jobTitle: 'Product Engineer',
          sourcePlatform: 'Naukri',
          status: 'WISHLIST',
          location: 'Menlo Park, CA',
          salaryDetails: '$190,000',
          notes: 'Saved for upcoming batch application.',
        },
        {
          id: 5,
          companyName: 'Amazon',
          jobTitle: 'Software Development Engineer II',
          sourcePlatform: 'Indeed',
          status: 'REJECTED',
          notes: 'Role closed internally.',
          appliedAt: '2026-06-15',
        },
      ];
    }
  },

  getStats: async (userId: number): Promise<JobApplicationStats> => {
    try {
      const response = await api.get<JobApplicationStats>(`/job-applications/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Fetch stats failed, returning mock stats:', error);
      return {
        totalApplications: 24,
        activeInterviews: 4,
        offersReceived: 1,
        rejectionsCount: 3,
        overallResponseRate: 20.8,
        platformResponseRates: { LinkedIn: 25.0, Instahyre: 33.3, Naukri: 10.0 },
      };
    }
  },

  createApplication: async (userId: number, application: JobApplication): Promise<JobApplication> => {
    try {
      const response = await api.post<JobApplication>(`/job-applications/user/${userId}`, application);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Create failed, returning local mock:', error);
      return {
        ...application,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
    }
  },

  updateApplication: async (id: number, application: JobApplication): Promise<JobApplication> => {
    try {
      const response = await api.put<JobApplication>(`/job-applications/${id}`, application);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Update failed, returning updated object:', error);
      return { ...application, id };
    }
  },

  updateStatus: async (id: number, status: ApplicationStatus): Promise<JobApplication> => {
    try {
      const response = await api.put<JobApplication>(`/job-applications/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Update status failed, returning mocked response:', error);
      return { id, companyName: 'Job', jobTitle: 'Role', status };
    }
  },

  deleteApplication: async (id: number): Promise<void> => {
    try {
      await api.delete(`/job-applications/${id}`);
    } catch (error) {
      console.log('[jobTrackerService] Delete failed, mock soft delete executed:', error);
    }
  },

  importJobs: async (userId: number, payload: { type: 'URL' | 'TEXT' | 'CSV'; content: string }): Promise<{ importedCount: number }> => {
    try {
      const response = await api.post(`/job-applications/user/${userId}/import`, payload);
      return response.data;
    } catch (error) {
      console.log('[jobTrackerService] Import failed, returning mock success:', error);
      return { importedCount: 1 };
    }
  },
};
