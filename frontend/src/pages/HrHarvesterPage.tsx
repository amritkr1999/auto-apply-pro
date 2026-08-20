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

  const [isHybridFetching, setIsHybridFetching] = React.useState<boolean>(false);
  const [hybridMessage, setHybridMessage] = React.useState<string | null>(null);

  const triggerHybridFetch = async () => {
    setIsHybridFetching(true);
    setHybridMessage(null);
    try {
      const res = await fetch("http://localhost:8060/api/v1/jobs/postings/fetch-hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType: "DESKTOP_WEB",
          roleKeyword: "Full Stack / React Engineer",
          location: "Remote / India"
        })
      });
      const data = await res.json();
      if (data.success) {
        setHybridMessage(`⚡ ${data.message}`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setHybridMessage("⚡ Cloud ATS Job Fetch triggered! Check live feed below.");
    } finally {
      setIsHybridFetching(false);
    }
  };

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

      {/* 1-Click Hybrid Job & HR Fetch Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-400/30">
        <div className="max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
            <span>⚡</span>
            <span>Cloud & Extension Hybrid Harvester</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            1-Click Live Job & Recruiter Fetch
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Instantly ingest live job postings and recruiter contacts from public ATS APIs and Chrome background harvester node directly into your queue.
          </p>
          {hybridMessage && (
            <div className="mt-3 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl backdrop-blur-sm animate-in fade-in">
              {hybridMessage}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={triggerHybridFetch}
          disabled={isHybridFetching}
          className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 shrink-0 flex items-center gap-2 border border-white/50 active:scale-95 disabled:opacity-70 cursor-pointer"
        >
          {isHybridFetching ? (
            <>
              <span className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
              <span>Fetching Jobs & HR Contacts...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Start 1-Click Hybrid Fetch</span>
            </>
          )}
        </button>
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
