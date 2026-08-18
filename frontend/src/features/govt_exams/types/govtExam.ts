export type ExamCategory = "UPSC" | "SSC" | "BANKING" | "RAILWAYS" | "DEFENSE" | "STATE_PSC";

export type ExamStatus = "UPCOMING" | "APPLY_NOW" | "ADMIT_CARD_LIVE" | "RESULTS_OUT" | "CLOSED";

export interface ExamSyllabus {
  id: string;
  examId: string;
  stage: string;
  subject: string;
  topics: string; // JSON string array or topic list
  totalMarks?: number;
  durationMinutes?: number;
  negativeMarking?: string;
}

export interface PrepMaterial {
  id: string;
  subjectTag: string;
  title: string;
  resourceType: "TEXT_GUIDE" | "PYQ_BANK" | "VIDEO_LINK" | "PDF_NOTES";
  url: string;
  providerName?: string;
}

export interface ExamNotification {
  id: string;
  examName: string;
  organizingBody: string;
  category: ExamCategory;
  vacancyCount: number;
  applicationStartDate?: string;
  applicationEndDate: string;
  examDate?: string;
  officialPdfUrl?: string;
  applyLink?: string;
  eligibilitySummary?: string;
  ageLimitSummary?: string;
  applicationFeeSummary?: string;
  sourceType?: string;
  status: ExamStatus;
  daysRemaining?: number;
  countdownTag?: string;
  createdAt?: string;
  updatedAt?: string;
  syllabusStages?: ExamSyllabus[];
  prepMaterials?: PrepMaterial[];
}
