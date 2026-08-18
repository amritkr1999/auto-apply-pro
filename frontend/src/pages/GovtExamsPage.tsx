import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { DarkModeToggle } from "../components/DarkModeToggle";
import type { ExamCategory, ExamNotification, ExamStatus } from "../features/govt_exams/types/govtExam";
import { fetchGovtExamNotifications } from "../features/govt_exams/services/govtExamApi";
import SmartFilterBar from "../features/govt_exams/components/SmartFilterBar";
import ActiveAlertsHub from "../features/govt_exams/components/ActiveAlertsHub";
import ExamProfileModal from "../features/govt_exams/components/ExamProfileModal";
import PyqPracticeBank from "../features/govt_exams/components/PyqPracticeBank";
import QuestionPaperVault from "../features/govt_exams/components/QuestionPaperVault";

export const GovtExamsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ExamStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchGovtExamNotifications(selectedCategory, selectedStatus, searchQuery)
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <SEOHead
        title="Central & State Government Exams Portal | EasyNaukri"
        description="Autonomous recruitment ingestion engine tracking UPSC, SSC, IBPS, RRB, and State PSC notifications with automated syllabus breakdowns and dynamic closing date alerts."
        canonicalUrl="https://easynaukri.online/government-exams"
      />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/branding/easynaukri_logo.png"
              alt="EasyNaukri Logo"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              EasyNaukri <span className="text-amber-500 font-black text-xs uppercase ml-1 px-2 py-0.5 rounded bg-amber-400/20">Govt Portal</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Link
              to="/sarkari-naukri-alerts"
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
            >
              Age Calculator & Tools
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl border border-indigo-900/40">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Autonomous Ingestion Engine Active
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Zero Human Interference
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Central & State <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Govt Exams Hub</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Track official recruitment notices, vacancies, eligibility criteria, and syllabus topic weightage automatically scraped and parsed from UPSC, SSC, IBPS, RRB, and State PSC gazettes.
            </p>

            {/* Ingestion stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Active Trackers</p>
                <p className="text-lg font-extrabold text-white">28 State PSCs + Central</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Automated Pipeline</p>
                <p className="text-lg font-extrabold text-amber-400">PDFBox Metadata</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Failover Protection</p>
                <p className="text-lg font-extrabold text-emerald-400">RapidAPI Circuit</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Open Materials</p>
                <p className="text-lg font-extrabold text-white">Auto Subject Tagged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <SmartFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Active Alerts Hub Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏛️ Active Recruitment Notifications</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">
                {notifications.length} Openings
              </span>
            </h2>

            <button
              onClick={loadData}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>🔄 Refresh Stream</span>
            </button>
          </div>

          <ActiveAlertsHub
            notifications={notifications}
            loading={loading}
            onSelectExam={(id) => setActiveModalId(id)}
          />
        </div>

        {/* Previous Year Questions Practice Bank */}
        <PyqPracticeBank category={selectedCategory} />

        {/* Downloadable Year-Wise Question Papers PDF Vault */}
        <QuestionPaperVault category={selectedCategory} />
      </main>

      {/* Selected Exam Profile Modal */}
      {activeModalId && (
        <ExamProfileModal
          examId={activeModalId}
          onClose={() => setActiveModalId(null)}
        />
      )}
    </div>
  );
};

export default GovtExamsPage;
