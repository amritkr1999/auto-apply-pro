import React, { useState, useEffect } from "react";

/**
 * OnboardingChecklistWidget.jsx
 * Interactive Compact User Onboarding Checklist for EasyNaukri Candidate Dashboard.
 * Displays a compact progress bar widget on the dashboard, opening a detail modal on click.
 */

export const OnboardingChecklistWidget = ({
  candidateProfile,
  gmailConnected,
  dispatchMode,
  campaignEnabled,
  sentCount = 0,
  queueCount = 0,
  userId,
  onOpenProfile,
  onConnectGmail,
  onOpenOutreachModes,
  onStartCampaign,
  onOpenUserManual,
}) => {
  // State persistence key prefix
  const storageKeyPrefix = `onboarding_checklist_${userId || "default"}`;

  // Modal open state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Manual check overrides
  const [manualChecks, setManualChecks] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKeyPrefix}_manual_checks`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Auto-dismiss preference when 100% complete
  const [dismissOnComplete, setDismissOnComplete] = useState(() => {
    return localStorage.getItem(`${storageKeyPrefix}_auto_dismiss`) === "true";
  });

  // Explicitly dismissed state
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(`${storageKeyPrefix}_dismissed`) === "true";
  });

  // Dynamic auto completion for each step
  const hasResume = Boolean(
    candidateProfile?.resumeFilename || candidateProfile?.resumeUrl || candidateProfile?.resumeUploadedAt
  );

  const hasTargetRolesAndSkills = Boolean(
    candidateProfile?.jobPreferences?.targetRole ||
    candidateProfile?.jobPreferences?.role ||
    candidateProfile?.jobPreferences?.desiredRole ||
    candidateProfile?.targetRole ||
    (candidateProfile?.skills && candidateProfile.skills.length > 0)
  );

  const isGmailConnected = Boolean(gmailConnected);

  const isModeSelected = Boolean(
    dispatchMode ||
    localStorage.getItem("campaign_dispatch_mode") ||
    localStorage.getItem(`outreach_mode_${userId}`)
  );

  const isCampaignLaunched = Boolean(
    campaignEnabled || sentCount > 0 || queueCount > 0
  );

  // Define steps
  const steps = [
    {
      id: "resume",
      title: "Upload Resume",
      description: "Upload your base resume to enable AI parsing and skills extraction.",
      actionLabel: "Go to Profile",
      onAction: onOpenProfile,
      autoChecked: hasResume,
      icon: "📄",
    },
    {
      id: "roles_skills",
      title: "Set Target Roles & Skills",
      description: "Define your primary job vertical and target role for accurate recruiter matching.",
      actionLabel: "Configure Profile",
      onAction: onOpenProfile,
      autoChecked: hasTargetRolesAndSkills,
      icon: "🎯",
    },
    {
      id: "gmail",
      title: "Connect Gmail Account",
      description: "Authorize Gmail for draft creation or outreach dispatching.",
      actionLabel: "Connect Gmail",
      onAction: onConnectGmail,
      autoChecked: isGmailConnected,
      icon: "✉️",
    },
    {
      id: "outreach_mode",
      title: "Choose Outreach Mode",
      description: "Select between Fully Automated, Gmail Drafts, or Web Compose.",
      actionLabel: "View Modes",
      onAction: onOpenOutreachModes,
      autoChecked: isModeSelected,
      icon: "⚙️",
    },
    {
      id: "first_campaign",
      title: "Launch First Campaign",
      description: "Review generated emails and dispatch your first recruiter outreach batch.",
      actionLabel: "Start Campaign",
      onAction: onStartCampaign,
      autoChecked: isCampaignLaunched,
      icon: "🚀",
    },
  ];

  // Evaluate final check status
  const isStepCompleted = (step) => {
    if (manualChecks[step.id] !== undefined) {
      return manualChecks[step.id];
    }
    return step.autoChecked;
  };

  const completedCount = steps.filter((step) => isStepCompleted(step)).length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const is100Percent = progressPercent === 100;

  // Toggle manual checkmark override
  const handleToggleStepCheck = (stepId, e) => {
    e.stopPropagation();
    setManualChecks((prev) => {
      const step = steps.find((s) => s.id === stepId);
      const currentVal = prev[stepId] !== undefined ? prev[stepId] : step.autoChecked;
      const updated = { ...prev, [stepId]: !currentVal };
      localStorage.setItem(`${storageKeyPrefix}_manual_checks`, JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle auto-dismiss
  const handleToggleDismissOnComplete = () => {
    setDismissOnComplete((prev) => {
      const next = !prev;
      localStorage.setItem(`${storageKeyPrefix}_auto_dismiss`, String(next));
      return next;
    });
  };

  // Handle restore widget
  const handleResetChecklist = () => {
    setIsDismissed(false);
    localStorage.removeItem(`${storageKeyPrefix}_dismissed`);
    setManualChecks({});
    localStorage.removeItem(`${storageKeyPrefix}_manual_checks`);
  };

  // Auto-dismiss if 100% complete and setting is toggled
  if (isDismissed || (is100Percent && dismissOnComplete)) {
    return (
      <div className="mb-6 flex items-center justify-between p-3.5 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 font-medium">
          <span>🎉</span>
          <span>Onboarding 100% Complete! All setup steps finished.</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDetailModalOpen(true)}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer focus:outline-none"
        >
          View Onboarding Steps
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Compact Dashboard Widget Bar */}
      <div
        data-tour="onboarding-checklist"
        onClick={() => setIsDetailModalOpen(true)}
        className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-600/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-lg font-bold shrink-0">
            ✨
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Getting Started with EasyNaukri
              </h3>
              {is100Percent ? (
                <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  100% Complete
                </span>
              ) : (
                <span className="text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                  {completedCount}/{totalCount} Completed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Click to view setup steps & unlock automated recruiter outreach.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-3 min-w-[130px] sm:min-w-[170px]">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 min-w-[36px] text-right">
              {progressPercent}%
            </span>
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 group-hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 group-hover:text-white border border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-600 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>View Details</span>
            <span className="group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Details Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-900 dark:text-slate-100 p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ✨ ONBOARDING CHECKLIST
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {completedCount}/{totalCount} Completed • {progressPercent}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Getting Started with EasyNaukri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Complete these steps to unlock AI cold emails, automated Gmail dispatching, and targeted recruiter outreach.
              </p>

              {/* Progress Bar inside Modal */}
              <div className="mt-4 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps Content List */}
            <div className="overflow-y-auto pr-1 space-y-3 flex-1 scrollbar-thin">
              {steps.map((step, idx) => {
                const completed = isStepCompleted(step);

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                      completed
                        ? "bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-90"
                        : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950/60 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStepCheck(step.id, e)}
                        className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer focus:outline-none ${
                          completed
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-500"
                        }`}
                        title={completed ? "Mark step incomplete" : "Mark step completed"}
                      >
                        {completed ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                            {idx + 1}
                          </span>
                        )}
                      </button>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base select-none">{step.icon}</span>
                          <h4
                            className={`text-sm font-bold tracking-tight ${
                              completed
                                ? "text-slate-600 dark:text-slate-400 line-through"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {step.title}
                          </h4>
                          {completed && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDetailModalOpen(false);
                          if (step.onAction) step.onAction();
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs focus:outline-none cursor-pointer flex items-center gap-1 ${
                          completed
                            ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95"
                        }`}
                      >
                        <span>{step.actionLabel}</span>
                        <span aria-hidden="true">➔</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                {onOpenUserManual && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      onOpenUserManual("1");
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Read Setup Guide 📖
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingChecklistWidget;
