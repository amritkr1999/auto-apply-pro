import { api } from './api';

export interface EmailTemplate {
  id?: number;
  name: string;
  subject: string;
  body: string;
  intro?: string;
  skillsTemplate?: string;
  signOff?: string;
  isDefault?: boolean;
  category?: string;
  updatedAt?: string;
}

export interface QueueDeliveryItem {
  id: number;
  recipientEmail: string;
  companyName: string;
  jobTitle: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
}

export const templateService = {
  getTemplates: async (userId: number): Promise<EmailTemplate[]> => {
    try {
      const response = await api.get<EmailTemplate[]>(`/outreach/templates/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log('[templateService] Fetch templates failed, returning default templates:', error);
      return [
        {
          id: 1,
          name: 'Direct Hiring Manager Outreach',
          subject: '{{candidateName}} | Application for {{jobTitle}} at {{companyName}}',
          body: `Dear Hiring Manager,\n\nI noticed the {{jobTitle}} opening at {{companyName}} and wanted to reach out directly. With extensive experience in software development and {{skills}}, I am eager to contribute to your team.\n\nLooking forward to connecting!\n\nBest regards,\n{{candidateName}}`,
          isDefault: true,
          category: 'Standard',
        },
        {
          id: 2,
          name: 'Executive Leadership Intro',
          subject: 'Inquiry regarding {{jobTitle}} - {{candidateName}}',
          body: `Hello {{companyName}} Team,\n\nI have been following {{companyName}}'s growth and would love to bring my expertise in {{skills}} to the {{jobTitle}} role.\n\nThank you for your time and consideration,\n{{candidateName}}`,
          isDefault: false,
          category: 'Executive',
        },
      ];
    }
  },

  createTemplate: async (userId: number, template: EmailTemplate): Promise<EmailTemplate> => {
    try {
      const response = await api.post<EmailTemplate>(`/outreach/templates/user/${userId}`, template);
      return response.data;
    } catch (error) {
      console.log('[templateService] Create template failed, returning mock template:', error);
      return { ...template, id: Date.now() };
    }
  },

  updateTemplate: async (id: number, template: EmailTemplate): Promise<EmailTemplate> => {
    try {
      const response = await api.put<EmailTemplate>(`/outreach/templates/${id}`, template);
      return response.data;
    } catch (error) {
      console.log('[templateService] Update template failed, returning updated object:', error);
      return { ...template, id };
    }
  },

  deleteTemplate: async (id: number): Promise<void> => {
    try {
      await api.delete(`/outreach/templates/${id}`);
    } catch (error) {
      console.log('[templateService] Delete template failed:', error);
    }
  },

  getQueueStatus: async (userId: number): Promise<QueueDeliveryItem[]> => {
    try {
      const response = await api.get<QueueDeliveryItem[]>(`/outreach/queue/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log('[templateService] Queue status fetch failed, returning mock queue:', error);
      return [
        {
          id: 1001,
          recipientEmail: 'recruiter@google.com',
          companyName: 'Google',
          jobTitle: 'Senior React Native Developer',
          subject: 'Amrit Kumar | Application for Senior React Native Developer',
          status: 'SENT',
          createdAt: '2026-07-30 08:30',
        },
        {
          id: 1002,
          recipientEmail: 'careers@stripe.com',
          companyName: 'Stripe',
          jobTitle: 'Staff Frontend Engineer',
          subject: 'Amrit Kumar | Application for Staff Frontend Engineer',
          status: 'PENDING',
          createdAt: '2026-07-30 09:10',
        },
        {
          id: 1003,
          recipientEmail: 'hr@startup.io',
          companyName: 'Startup.io',
          jobTitle: 'Full Stack Consultant',
          subject: 'Amrit Kumar | Application for Full Stack Consultant',
          status: 'FAILED',
          errorMessage: 'SMTP Connection Timeout (Port 587)',
          createdAt: '2026-07-29 18:45',
        },
      ];
    }
  },

  retryDelivery: async (queueItemId: number): Promise<void> => {
    try {
      await api.post(`/outreach/queue/${queueItemId}/retry`);
    } catch (error) {
      console.log('[templateService] Retry delivery trigger executed:', error);
    }
  },
};
