import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HarvesterToggleCard } from "../features/opportunities/components/HarvesterToggleCard";
import { JobPostingFeedSection } from "../features/opportunities/components/JobPostingFeedSection";
import ExtensionDownloadSection from "../features/opportunities/components/ExtensionDownloadSection";

export const HrHarvesterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHarvesterActive = location.pathname.includes("harvester");
  const isParserActive = location.pathname.includes("import") || location.pathname.includes("parser");

  return (
    <div className="max-w-[1050px] mx-auto w-full px-4 py-8 space-y-8">
      {/* Top Segment Tab Navigation Bar */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 inline-flex items-center gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/opportunities/import")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              isParserActive
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <span>📸</span>
            <span>AI Multi-Screenshot Job Parser</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/opportunities/harvester")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              isHarvesterActive
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/80 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            <span>⚡</span>
            <span>Automated Background HR Harvester</span>
          </button>
        </div>
      </div>

      {/* Hero Header Banner Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/20 border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-center sm:text-left">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Automated Background Harvester Node
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
              Automated Background HR Harvester
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Silently extract recruiter contact details across LinkedIn, Naukri, Indeed, and Foundit. Discovered HR emails are stored permanently in your outreach vault, while candidate job updates cycle through a 20-day feed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 shrink-0 w-full sm:w-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-2xl shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Portals</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">4 Active</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-2xl shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feed Retention</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">20 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Harvester Node Settings Card */}
      <HarvesterToggleCard />

      {/* Live Job Updates & Recruiter Feed */}
      <JobPostingFeedSection />

      {/* Chrome Extension Installation Setup */}
      <ExtensionDownloadSection />
    </div>
  );
};

export default HrHarvesterPage;
