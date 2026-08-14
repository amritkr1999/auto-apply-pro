import React, { useState, useEffect } from "react";

/**
 * OnboardingChecklistWidget.jsx
 * Interactive User Onboarding Checklist for EasyNaukri Candidate Dashboard.
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

  // Collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(`${storageKeyPrefix}_collapsed`) === "true";
  });

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

  // Calculate dynamic auto completion for each step
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

  // Evaluate final check status (auto or manual override)
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

  // Toggle collapsed
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(`${storageKeyPrefix}_collapsed`, String(next));
      return next;
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

  // Handle manual dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`${storageKeyPrefix}_dismissed`, "true");
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
      <div className="mb-6 flex items-center justify-between p-3 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 font-medium">
          <span>🎉</span>
          <span>Onboarding 100% Complete! All setup steps finished.</span>
        </div>
        <button
          type="button"
          onClick={handleResetChecklist}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer focus:outline-none"
        >
          View Onboarding Steps
        </button>
      </div>
    );
  }

  return (
    <div
      data-tour="onboarding-checklist"
      className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 relative"
    >
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50/50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ✨ ONBOARDING CHECKLIST
              </span>
              {is100Percent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                  READY TO OUTREACH
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Getting Started with EasyNaukri
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Complete these steps to unlock AI cold emails, automated Gmail dispatching, and targeted recruiter outreach.
            </p>
          </div>

          {/* Action Buttons & Manual Guide Trigger */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {onOpenUserManual && (
              <button
                type="button"
                onClick={() => onOpenUserManual("1")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Open Comprehensive User Manual & Guide"
              >
                <span>📖</span>
                <span>User Manual</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleCollapse}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none cursor-pointer"
              aria-label={isCollapsed ? "Expand Checklist" : "Minimize Checklist"}
              title={isCollapsed ? "Expand Checklist" : "Minimize Checklist"}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Visual Progress Bar Header */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300">
              {completedCount}/{totalCount} Completed • {progressPercent}%
            </span>
            <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dismissOnComplete}
                onChange={handleToggleDismissOnComplete}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Dismiss when 100% complete</span>
            </label>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Checklist Content Body */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-3 bg-white dark:bg-slate-900">
          {steps.map((step, idx) => {
            const completed = isStepCompleted(step);

            return (
              <div
                key={step.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                  completed
                    ? "bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-90"
                    : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950/60 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleStepCheck(step.id, e)}
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer focus:outline-none ${
                      completed
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-500"
                    }`}
                    title={completed ? "Mark step incomplete" : "Mark step completed"}
                    aria-label={`Toggle check for ${step.title}`}
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

                {/* Step Action Button */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => step.onAction && step.onAction()}
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

          {/* Footer Controls & Manual Guide Link */}
          <div className="pt-3 mt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span>Need help?</span>
              {onOpenUserManual && (
                <button
                  type="button"
                  onClick={() => onOpenUserManual("1")}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Read 5-Minute Setup Guide 📖
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
            >
              Hide widget for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklistWidget;
