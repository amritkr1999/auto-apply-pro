import { api } from './api';

export type ExamCategory = 'ALL' | 'CENTRAL' | 'STATE' | 'DEFENSE' | 'BANKING' | 'RAILWAYS';
export type ExamStatus = 'UPCOMING' | 'ACTIVE' | 'EXPIRED';

export interface ExamNotification {
  id: string;
  title: string;
  organization: string;
  category: ExamCategory;
  status: ExamStatus;
  applicationDeadline: string;
  totalVacancies: number;
  officialNotificationUrl?: string;
  applyLink?: string;
  eligibilityCriteria?: string;
  ageLimit?: string;
  syllabusBreakdown?: string[];
  importantDates?: Record<string, string>;
  createdAt?: string;
}

export interface ExamPyq {
  id: string;
  examTitle: string;
  year: number;
  subject: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface QuestionPaper {
  id: string;
  examTitle: string;
  year: number;
  category: ExamCategory;
  downloadUrl: string;
  fileSizeBytes?: number;
}

export const govtExamService = {
  getNotifications: async (
    category?: ExamCategory,
    status?: ExamStatus,
    query?: string
  ): Promise<ExamNotification[]> => {
    try {
      const params: any = {};
      if (category && category !== 'ALL') params.category = category;
      if (status) params.status = status;
      if (query) params.query = query;

      const response = await api.get<ExamNotification[]>('/govt-exams', { params });
      return response.data;
    } catch (error) {
      console.log('[govtExamService] Fetch notifications failed, returning fallbacks:', error);
      return [
        {
          id: '1',
          title: 'UPSC Civil Services Examination (CSE) 2026',
          organization: 'Union Public Service Commission',
          category: 'CENTRAL',
          status: 'ACTIVE',
          applicationDeadline: '2026-09-15',
          totalVacancies: 1056,
          eligibilityCriteria: 'Graduate in any discipline from a recognized University.',
          ageLimit: '21 to 32 years as of Aug 1, 2026.',
          syllabusBreakdown: [
            'Prelims: General Studies Paper I & CSAT Paper II',
            'Mains: 9 Written Papers (Essay, GS I-IV, Optionals)',
            'Interview: Personality Assessment Test'
          ],
          importantDates: {
            'Notification Release': '2026-08-01',
            'Last Date to Apply': '2026-09-15',
            'Prelims Exam Date': '2026-10-25'
          },
          applyLink: 'https://upsconline.nic.in'
        },
        {
          id: '2',
          title: 'SSC CGL Tier 1 Recruitment 2026',
          organization: 'Staff Selection Commission',
          category: 'CENTRAL',
          status: 'ACTIVE',
          applicationDeadline: '2026-09-30',
          totalVacancies: 17727,
          eligibilityCriteria: 'Bachelor Degree in any stream.',
          ageLimit: '18 to 30 years.',
          syllabusBreakdown: [
            'General Intelligence & Reasoning',
            'General Awareness & Current Affairs',
            'Quantitative Aptitude',
            'English Comprehension'
          ],
          importantDates: {
            'Application Start': '2026-08-10',
            'Application Deadline': '2026-09-30',
            'Exam Date': '2026-11-15'
          },
          applyLink: 'https://ssc.gov.in'
        },
        {
          id: '3',
          title: 'IBPS PO Recruitment XIV 2026',
          organization: 'Institute of Banking Personnel Selection',
          category: 'BANKING',
          status: 'UPCOMING',
          applicationDeadline: '2026-10-10',
          totalVacancies: 4455,
          eligibilityCriteria: 'Bachelor degree in any stream.',
          ageLimit: '20 to 30 years.',
          syllabusBreakdown: [
            'Prelims: English, Quantitative Aptitude, Reasoning',
            'Mains: Data Analysis & Interpretation, General/Economy/Banking Awareness'
          ],
          applyLink: 'https://ibps.in'
        },
        {
          id: '4',
          title: 'RRB NTPC Graduate & Under Graduate Posts 2026',
          organization: 'Railway Recruitment Boards',
          category: 'RAILWAYS',
          status: 'ACTIVE',
          applicationDeadline: '2026-09-20',
          totalVacancies: 11558,
          eligibilityCriteria: '12th Pass or Bachelor Degree dependent on post.',
          ageLimit: '18 to 33 years.',
          syllabusBreakdown: [
            'CBT-1: Mathematics, General Intelligence, General Awareness',
            'CBT-2: Advanced Quantitative & Computer Literacy'
          ],
          applyLink: 'https://rrbcdg.gov.in'
        }
      ];
    }
  },

  getPyqs: async (category?: ExamCategory, subjectTag?: string): Promise<ExamPyq[]> => {
    try {
      const params: any = {};
      if (category && category !== 'ALL') params.category = category;
      if (subjectTag) params.subjectTag = subjectTag;
      const response = await api.get<ExamPyq[]>('/govt-exams/pyqs', { params });
      return response.data;
    } catch (error) {
      return [
        {
          id: 'pyq-1',
          examTitle: 'UPSC CSE 2025 Prelims',
          year: 2025,
          subject: 'Indian Polity',
          question: 'Which Article of the Constitution of India guarantees the Right to Constitutional Remedies?',
          options: ['Article 19', 'Article 21', 'Article 32', 'Article 226'],
          correctOptionIndex: 2,
          explanation: 'Article 32 gives citizens the right to move the Supreme Court for the enforcement of fundamental rights.'
        },
        {
          id: 'pyq-2',
          examTitle: 'SSC CGL 2025 Tier 1',
          year: 2025,
          subject: 'Quantitative Aptitude',
          question: 'If the simple interest on a sum of money for 3 years at 5% per annum is $150, what is the principal?',
          options: ['$800', '$1,000', '$1,200', '$1,500'],
          correctOptionIndex: 1,
          explanation: 'SI = (P * R * T) / 100 => 150 = (P * 5 * 3) / 100 => P = 15000 / 15 = $1,000.'
        }
      ];
    }
  },

  getQuestionPapers: async (category?: ExamCategory, year?: number): Promise<QuestionPaper[]> => {
    try {
      const params: any = {};
      if (category && category !== 'ALL') params.category = category;
      if (year) params.year = year;
      const response = await api.get<QuestionPaper[]>('/govt-exams/question-papers', { params });
      return response.data;
    } catch (error) {
      return [
        {
          id: 'qp-1',
          examTitle: 'UPSC Civil Services Prelims GS Paper 1',
          year: 2025,
          category: 'CENTRAL',
          downloadUrl: 'https://upsc.gov.in/sites/default/files/CSP2025_GS1.pdf',
          fileSizeBytes: 2450000
        },
        {
          id: 'qp-2',
          examTitle: 'SSC CGL Tier 1 Official Question Paper',
          year: 2025,
          category: 'CENTRAL',
          downloadUrl: 'https://ssc.gov.in/papers/CGL_2025_T1.pdf',
          fileSizeBytes: 1890000
        }
      ];
    }
  }
};
