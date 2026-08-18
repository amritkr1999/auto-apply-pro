import { useEffect, useState } from "react";
import type { ExamNotification } from "../types/govtExam";
import { fetchGovtExamById } from "../services/govtExamApi";
import DynamicCountdownBadge from "./DynamicCountdownBadge";
import SyllabusAccordion from "./SyllabusAccordion";
import PrepMaterialLinks from "./PrepMaterialLinks";

interface ExamProfileModalProps {
  examId: string;
  onClose: () => void;
}

export const ExamProfileModal: React.FC<ExamProfileModalProps> = ({ examId, onClose }) => {
  const [exam, setExam] = useState<ExamNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "prep">("overview");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchGovtExamById(examId)
      .then((data) => {
        if (mounted) {
          setExam(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [examId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          {loading || !exam ? (
            <div className="space-y-2 animate-pulse w-full">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {exam.category}
                </span>
                <DynamicCountdownBadge
                  status={exam.status}
                  daysRemaining={exam.daysRemaining}
                  countdownTag={exam.countdownTag}
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {exam.examName}
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Organized by: <span className="font-bold text-slate-700 dark:text-slate-300">{exam.organizingBody}</span>
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        {exam && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 font-bold text-xs border-b-2 transition ${
                activeTab === "overview"
                  ? "border-amber-400 text-slate-900 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview & Dates
            </button>
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`py-3 font-bold text-xs border-b-2 transition ${
                activeTab === "syllabus"
                  ? "border-amber-400 text-slate-900 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Interactive Syllabus ({exam.syllabusStages?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("prep")}
              className={`py-3 font-bold text-xs border-b-2 transition ${
                activeTab === "prep"
                  ? "border-amber-400 text-slate-900 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Open Prep Materials ({exam.prepMaterials?.length || 0})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading || !exam ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
            </div>
          ) : (
            <>
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Grid stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Total Vacancies</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {exam.vacancyCount?.toLocaleString() || "1,000+"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Closing Date</p>
                      <p className="text-xl font-black text-rose-500 mt-1">
                        {exam.applicationEndDate || "Open"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Exam Date</p>
                      <p className="text-xl font-black text-amber-500 mt-1">
                        {exam.examDate || "To be notified"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Source Stream</p>
                      <p className="text-xl font-black text-emerald-500 mt-1">
                        {exam.sourceType === "CRAWLER" ? "Live Crawler" : "API Stream"}
                      </p>
                    </div>
                  </div>

                  {/* Structural Metadata Box */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Structured Requirements & Fee Matrix
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-400">Educational Qualification:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          {exam.eligibilitySummary}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400">Age Limits:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          {exam.ageLimitSummary}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400">Application Fees:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          {exam.applicationFeeSummary}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400">Application Window:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          {exam.applicationStartDate || "Live"} to {exam.applicationEndDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {exam.applyLink && (
                      <a
                        href={exam.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-6 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 transition shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Apply on Official Portal</span>
                        <span>↗</span>
                      </a>
                    )}
                    {exam.officialPdfUrl && (
                      <a
                        href={exam.officialPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-6 rounded-xl text-center font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
                      >
                        <span>📄 Official PDF Notice</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Syllabus */}
              {activeTab === "syllabus" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Structured Exam Syllabus & Topic Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Extracted automatically from official notification PDFs.
                    </p>
                  </div>
                  <SyllabusAccordion stages={exam.syllabusStages} />
                </div>
              )}

              {/* Tab 3: Prep Materials */}
              {activeTab === "prep" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Matched Open Educational Resources & PYQ Banks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Study materials automatically tagged to parsed syllabus topics.
                    </p>
                  </div>
                  <PrepMaterialLinks materials={exam.prepMaterials} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamProfileModal;
