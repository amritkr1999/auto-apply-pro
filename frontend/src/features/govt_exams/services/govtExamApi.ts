import type { ExamCategory, ExamNotification, ExamStatus } from "../types/govtExam";

const API_BASE_URL = "/api/v1/govt-exams";

export interface ExamPyq {
  id: string;
  examCategory: ExamCategory;
  subjectTag: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanationText: string;
  examSourceYear: string;
  difficultyLevel: string;
}

export interface ExamQuestionPaper {
  id: string;
  examCategory: ExamCategory;
  examName: string;
  year: number;
  paperType: string;
  pdfUrl: string;
  fileSizeMb?: string;
  language?: string;
  downloadCount?: number;
}

export const fetchGovtExamNotifications = async (
  category?: ExamCategory | "ALL",
  status?: ExamStatus | "ALL",
  query?: string
): Promise<ExamNotification[]> => {
  try {
    const params = new URLSearchParams();
    if (category && category !== "ALL") params.append("category", category);
    if (status && status !== "ALL") params.append("status", status);
    if (query && query.trim()) params.append("query", query.trim());

    const url = `${API_BASE_URL}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch live govt exams from API, serving client-side fallback list:", err);
    return getFallbackExamList(category, status, query);
  }
};

export const fetchGovtExamById = async (id: string): Promise<ExamNotification> => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch exam ${id} from API, returning local fallback profile:`, err);
    return getFallbackExamProfile(id);
  }
};

export const fetchGovtPyqs = async (
  category?: ExamCategory | "ALL",
  subjectTag?: string
): Promise<ExamPyq[]> => {
  try {
    const params = new URLSearchParams();
    if (category && category !== "ALL") params.append("category", category);
    if (subjectTag && subjectTag !== "ALL") params.append("subjectTag", subjectTag);

    const res = await fetch(`${API_BASE_URL}/pyqs?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch PYQs from API, returning fallback PYQ bank:", err);
    return getFallbackPyqList(category, subjectTag);
  }
};

export const fetchQuestionPapers = async (
  category?: ExamCategory | "ALL",
  year?: number | "ALL"
): Promise<ExamQuestionPaper[]> => {
  try {
    const params = new URLSearchParams();
    if (category && category !== "ALL") params.append("category", category);
    if (year && year !== "ALL") params.append("year", year.toString());

    const res = await fetch(`${API_BASE_URL}/question-papers?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch question papers from API, returning fallback paper vault:", err);
    return getFallbackQuestionPapers(category, year);
  }
};

const getFallbackExamList = (
  category?: ExamCategory | "ALL",
  status?: ExamStatus | "ALL",
  query?: string
): ExamNotification[] => {
  const fallbackList: ExamNotification[] = [
    {
      id: "ssc-cgl-2026",
      examName: "SSC Combined Graduate Level (CGL) Exam 2026",
      organizingBody: "Staff Selection Commission (SSC)",
      category: "SSC",
      vacancyCount: 14500,
      applicationStartDate: "2026-08-01",
      applicationEndDate: "2026-08-30",
      examDate: "2026-10-15",
      officialPdfUrl: "https://ssc.gov.in/notices",
      applyLink: "https://ssc.gov.in",
      eligibilitySummary: "Bachelor's Degree in any discipline",
      ageLimitSummary: "18 to 30 Years",
      applicationFeeSummary: "₹100 (Gen/OBC) / Exempted (SC/ST/Female)",
      sourceType: "CRAWLER",
      status: "APPLY_NOW",
      daysRemaining: 12,
      countdownTag: "Application Closes in 12 Days"
    },
    {
      id: "upsc-cse-2026",
      examName: "UPSC Civil Services Examination 2026 (IAS / IPS / IFS)",
      organizingBody: "Union Public Service Commission (UPSC)",
      category: "UPSC",
      vacancyCount: 1050,
      applicationStartDate: "2026-08-10",
      applicationEndDate: "2026-08-20",
      examDate: "2026-11-20",
      officialPdfUrl: "https://upsc.gov.in",
      applyLink: "https://upsconline.nic.in",
      eligibilitySummary: "Graduate in any discipline",
      ageLimitSummary: "21 to 32 Years (6 Attempts for UR)",
      applicationFeeSummary: "₹100 (Gen/OBC) / Free (Female/SC/ST)",
      sourceType: "CRAWLER",
      status: "APPLY_NOW",
      daysRemaining: 2,
      countdownTag: "Application Closes in 2 Days"
    },
    {
      id: "rrb-ntpc-2026",
      examName: "RRB NTPC Non-Technical Popular Categories 2026",
      organizingBody: "Railway Recruitment Board (RRB)",
      category: "RAILWAYS",
      vacancyCount: 11550,
      applicationStartDate: "2026-08-05",
      applicationEndDate: "2026-09-05",
      examDate: "2026-12-10",
      officialPdfUrl: "https://rrbcdg.gov.in",
      applyLink: "https://rrbcdg.gov.in",
      eligibilitySummary: "12th Pass / Graduate depending on post",
      ageLimitSummary: "18 to 33 Years",
      applicationFeeSummary: "₹500 (₹400 refunded after CBT-1)",
      sourceType: "CRAWLER",
      status: "APPLY_NOW",
      daysRemaining: 18,
      countdownTag: "Closing on 2026-09-05"
    },
    {
      id: "ibps-po-xv",
      examName: "IBPS PO / Management Trainee XV Recruitment",
      organizingBody: "Institute of Banking Personnel Selection (IBPS)",
      category: "BANKING",
      vacancyCount: 4200,
      applicationStartDate: "2026-08-12",
      applicationEndDate: "2026-08-22",
      examDate: "2026-09-30",
      officialPdfUrl: "https://ibps.in",
      applyLink: "https://ibps.in",
      eligibilitySummary: "Graduate in any stream + Computer Literacy",
      ageLimitSummary: "20 to 30 Years",
      applicationFeeSummary: "₹850 (Gen/OBC) / ₹175 (SC/ST/PWBD)",
      sourceType: "CRAWLER",
      status: "APPLY_NOW",
      daysRemaining: 4,
      countdownTag: "Application Closes in 4 Days"
    }
  ];

  return fallbackList.filter((item) => {
    if (category && category !== "ALL" && item.category !== category) return false;
    if (status && status !== "ALL" && item.status !== status) return false;
    if (query && query.trim()) {
      const q = query.toLowerCase();
      return (
        item.examName.toLowerCase().includes(q) ||
        item.organizingBody.toLowerCase().includes(q)
      );
    }
    return true;
  });
};

const getFallbackExamProfile = (id: string): ExamNotification => {
  const base = getFallbackExamList().find((e) => e.id === id) || getFallbackExamList()[0];
  return {
    ...base,
    syllabusStages: [
      {
        id: "s1",
        examId: id,
        stage: "Tier 1 / CBT-1",
        subject: "Quantitative Aptitude",
        topics: JSON.stringify([
          "Ratio & Proportion, Percentages, Profit & Loss",
          "Data Interpretation (Bar Graphs, Pie Charts)",
          "Algebra, Geometry & Trigonometric Identities",
          "Speed, Distance, Time & Work Problems"
        ]),
        totalMarks: 50,
        durationMinutes: 60,
        negativeMarking: "-0.50 Marks"
      }
    ],
    prepMaterials: [
      {
        id: "pm1",
        subjectTag: "Quantitative Aptitude",
        title: "Fast-Track Arithmetic & Data Interpretation Guide",
        resourceType: "TEXT_GUIDE",
        url: "https://archive.org/details/fast-track-objective-arithmetic",
        providerName: "Open Educational Archive"
      }
    ]
  };
};

const getFallbackPyqList = (
  category?: ExamCategory | "ALL",
  subjectTag?: string
): ExamPyq[] => {
  const pyqs: ExamPyq[] = [
    {
      id: "pyq-1",
      examCategory: "UPSC",
      subjectTag: "POLITY",
      questionText: "Which Article of the Indian Constitution empowers the President of India to issue Ordinances during recess of Parliament?",
      optionA: "Article 110",
      optionB: "Article 123",
      optionC: "Article 213",
      optionD: "Article 356",
      correctOption: "B",
      explanationText: "Article 123 of the Constitution grants the President legislative power to promulgate ordinances when either of the two Houses of Parliament is not in session. Article 213 grants ordinance power to State Governors.",
      examSourceYear: "UPSC CSE 2024 / SSC CGL",
      difficultyLevel: "MEDIUM"
    },
    {
      id: "pyq-2",
      examCategory: "RAILWAYS",
      subjectTag: "QUANT",
      questionText: "A train 180 meters long passes a telegraph pole in 9 seconds. What is the speed of the train in kilometers per hour (km/h)?",
      optionA: "54 km/h",
      optionB: "72 km/h",
      optionC: "60 km/h",
      optionD: "80 km/h",
      correctOption: "B",
      explanationText: "1. Speed in m/s = Distance / Time = 180m / 9s = 20 m/s.\n2. Convert m/s to km/h by multiplying by (18/5): 20 * (18/5) = 72 km/h.",
      examSourceYear: "RRB NTPC CBT-1 2024",
      difficultyLevel: "EASY"
    }
  ];

  return pyqs.filter((p) => {
    if (category && category !== "ALL" && p.examCategory !== category) return false;
    if (subjectTag && subjectTag !== "ALL" && !p.subjectTag.toLowerCase().includes(subjectTag.toLowerCase())) return false;
    return true;
  });
};

const getFallbackQuestionPapers = (
  category?: ExamCategory | "ALL",
  year?: number | "ALL"
): ExamQuestionPaper[] => {
  const papers: ExamQuestionPaper[] = [
    {
      id: "qp-1",
      examCategory: "UPSC",
      examName: "UPSC Civil Services Prelims 2024 (General Studies Paper-1)",
      year: 2024,
      paperType: "Official Question Paper & Keys",
      pdfUrl: "https://upsc.gov.in/sites/default/files/CSP-2024-GS-Paper-1.pdf",
      fileSizeMb: "3.2 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 12450
    },
    {
      id: "qp-2",
      examCategory: "UPSC",
      examName: "UPSC Civil Services Prelims 2024 (CSAT Paper-2)",
      year: 2024,
      paperType: "Official Question Paper",
      pdfUrl: "https://upsc.gov.in/sites/default/files/CSP-2024-CSAT-Paper-2.pdf",
      fileSizeMb: "2.8 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 9820
    },
    {
      id: "qp-3",
      examCategory: "SSC",
      examName: "SSC CGL Tier-1 Official Question Paper with Answer Keys 2024",
      year: 2024,
      paperType: "Question Paper + Answer Key",
      pdfUrl: "https://ssc.gov.in/notices/cgl_2024_tier1_paper.pdf",
      fileSizeMb: "4.1 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 28400
    },
    {
      id: "qp-4",
      examCategory: "SSC",
      examName: "SSC CGL Tier-1 2023 All Shift Question Papers Collection",
      year: 2023,
      paperType: "Question Paper Master Bank",
      pdfUrl: "https://ssc.gov.in/notices/cgl_2023_all_shifts.pdf",
      fileSizeMb: "8.5 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 34120
    },
    {
      id: "qp-5",
      examCategory: "RAILWAYS",
      examName: "RRB NTPC CBT-1 Master Question Paper with Official Keys 2024",
      year: 2024,
      paperType: "Question Paper + Key",
      pdfUrl: "https://rrbcdg.gov.in/papers/rrb_ntpc_2024_cbt1.pdf",
      fileSizeMb: "5.0 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 19500
    },
    {
      id: "qp-6",
      examCategory: "BANKING",
      examName: "IBPS PO Prelims 2024 Official Memory Based Question Paper",
      year: 2024,
      paperType: "Question Paper + Solutions",
      pdfUrl: "https://ibps.in/papers/ibps_po_2024_prelims.pdf",
      fileSizeMb: "2.1 MB",
      language: "English",
      downloadCount: 15300
    },
    {
      id: "qp-7",
      examCategory: "STATE_PSC",
      examName: "MPPSC State Services Prelims 2024 General Studies Paper-1",
      year: 2024,
      paperType: "Official Question Paper",
      pdfUrl: "https://mppsc.mp.gov.in/papers/mppsc_2024_gs1.pdf",
      fileSizeMb: "3.4 MB",
      language: "Bilingual (English & Hindi)",
      downloadCount: 8900
    }
  ];

  return papers.filter((qp) => {
    if (category && category !== "ALL" && qp.examCategory !== category) return false;
    if (year && year !== "ALL" && qp.year !== year) return false;
    return true;
  });
};
