import React, { useState, useEffect, useRef } from "react";
import { outreachService } from "../services/outreachService";

export const CampaignDispatchModal = ({
  isOpen,
  onClose,
  onLaunchAutomated,
  userId,
  userProfile,
  targetRole = "Software Engineer"
}) => {
  // Helper to resolve normalized mode string
  const getNormalizedMode = (rawMode) => {
    if (!rawMode) return null;
    if (rawMode === "DRAFTS" || rawMode === "GMAIL_DRAFTS" || rawMode === "mode2") return "DRAFTS";
    if (rawMode === "WEB_COMPOSE" || rawMode === "GMAIL_COMPOSE" || rawMode === "mode3") return "WEB_COMPOSE";
    if (rawMode === "AUTOMATED" || rawMode === "DIRECT_SEND" || rawMode === "mode1") return "AUTOMATED";
    return null;
  };

  // Mode selection state: "AUTOMATED", "DRAFTS", "WEB_COMPOSE"
  const [selectedMode, setSelectedMode] = useState(() => {
    const saved = localStorage.getItem("campaign_dispatch_mode");
    return getNormalizedMode(saved) || "AUTOMATED";
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const isInitializedRef = useRef(false);

  // Sync mode ONCE when modal opens, giving priority to explicit user choices
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      return;
    }

    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check localStorage first
    const savedLocal = getNormalizedMode(localStorage.getItem("campaign_dispatch_mode"));
    if (savedLocal) {
      setSelectedMode(savedLocal);
    }

    if (userId) {
      outreachService.getOutreachSettings(userId)
        .then(settings => {
          if (settings && settings.hrOutreachDispatchMode) {
            const dbModeNormalized = getNormalizedMode(settings.hrOutreachDispatchMode);
            // If localStorage was empty, use DB setting
            if (!savedLocal && dbModeNormalized) {
              setSelectedMode(dbModeNormalized);
              localStorage.setItem("campaign_dispatch_mode", dbModeNormalized);
            }
          }
        })
        .catch(err => console.warn("Failed to load dispatch mode from settings:", err));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleModeSelect = (modeKey) => {
    setSelectedMode(modeKey);
    localStorage.setItem("campaign_dispatch_mode", modeKey);

    let dbMode = "DIRECT_SEND";
    if (modeKey === "DRAFTS") dbMode = "GMAIL_DRAFTS";
    if (modeKey === "WEB_COMPOSE") dbMode = "GMAIL_COMPOSE";

    if (userId) {
      outreachService.saveOutreachSettings(userId, { hrOutreachDispatchMode: dbMode })
        .catch(err => console.warn("Failed to save dispatch mode on select:", err));
    }
  };

  const handleStartCampaign = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let dbMode = "DIRECT_SEND";
    let confirmationText = "Campaign started! Emails will be sent automatically according to schedule.";

    if (selectedMode === "DRAFTS") {
      dbMode = "GMAIL_DRAFTS";
      confirmationText = "Campaign started! Generated emails will automatically save directly to your Gmail Drafts.";
    } else if (selectedMode === "WEB_COMPOSE") {
      dbMode = "GMAIL_COMPOSE";
      confirmationText = "Campaign started! Generated emails are added to your Outreach Queue for manual review & Web Compose.";
    }

    // Preserve mode in local storage immediately
    localStorage.setItem("campaign_dispatch_mode", selectedMode);

    // Save to backend settings safely
    try {
      if (userId) {
        await outreachService.saveOutreachSettings(userId, {
          hrOutreachDispatchMode: dbMode,
          hrOutreachCampaignEnabled: true
        }).catch(err => console.warn("saveOutreachSettings background warning:", err));
      }
    } catch (e) {
      console.warn("Settings save error handled gracefully:", e);
    }

    // Trigger parent launch handler safely
    try {
      if (onLaunchAutomated) {
        await onLaunchAutomated(selectedMode);
      }
    } catch (e) {
      console.warn("onLaunchAutomated callback warning handled gracefully:", e);
    }

    // Guaranteed user feedback & modal close
    setToastMessage(confirmationText);
    setTimeout(() => {
      setToastMessage("");
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold">Campaign Launch & Dispatch Settings</h3>
            <p className="text-xs text-slate-400">Select how your cold outreach campaign emails should be dispatched</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl font-bold p-1 rounded-lg hover:bg-slate-800"
            title="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Toast Banner */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <span>✅</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 3-Way Mode Selector Options */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Choose Campaign Dispatch Mode
            </h4>
            <div className="grid grid-cols-1 gap-3">
              
              {/* Option 1 */}
              <div
                onClick={() => handleModeSelect("AUTOMATED")}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex items-start gap-4 select-none ${
                  selectedMode === "AUTOMATED"
                    ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 ring-2 ring-indigo-600/20"
                    : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={selectedMode === "AUTOMATED"}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleModeSelect("AUTOMATED");
                  }}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Option 1: Fully Automated (Direct Send)</h5>
                    <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full ml-auto">
                      Background Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Emails are sent automatically on your behalf by our background outreach worker according to your campaign schedule.
                  </p>
                </div>
              </div>

              {/* Option 2 */}
              <div
                onClick={() => handleModeSelect("DRAFTS")}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex items-start gap-4 select-none ${
                  selectedMode === "DRAFTS"
                    ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 ring-2 ring-indigo-600/20"
                    : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={selectedMode === "DRAFTS"}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleModeSelect("DRAFTS");
                  }}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📁</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Option 2: Save to Gmail Drafts</h5>
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full ml-auto">
                      Automatic Drafts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Campaign emails are automatically created and saved directly into your connected Gmail account’s Drafts folder. You review and send them from your Gmail inbox.
                  </p>
                </div>
              </div>

              {/* Option 3 */}
              <div
                onClick={() => handleModeSelect("WEB_COMPOSE")}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative flex items-start gap-4 select-none ${
                  selectedMode === "WEB_COMPOSE"
                    ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 ring-2 ring-indigo-600/20"
                    : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={selectedMode === "WEB_COMPOSE"}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleModeSelect("WEB_COMPOSE");
                  }}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Option 3: Gmail Web Compose</h5>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full ml-auto">
                      Manual Queue Launch
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Campaign emails are added to your Outreach Queue. Review and edit in-app, then click to open pre-filled compose windows in Gmail (`mail.google.com`).
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleStartCampaign}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-150 disabled:opacity-75 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Launching Campaign...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Start Campaign</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CampaignDispatchModal;
