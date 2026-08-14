import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * UserManualModal.jsx
 * Comprehensive In-App User Manual & Guide Modal for EasyNaukri.
 */

export const UserManualModal = ({ isOpen: propsIsOpen, onClose: propsOnClose, initialSection = "1" }) => {
  const navigate = useNavigate();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState("");

  const isModalOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;

  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    }
    setInternalIsOpen(false);
  };

  // Listen for custom "open-user-manual" events on window
  useEffect(() => {
    const handleOpenEvent = (e) => {
      const sectionTarget = e?.detail?.section || "1";
      setActiveSection(sectionTarget);
      setInternalIsOpen(true);
    };

    window.addEventListener("open-user-manual", handleOpenEvent);
    return () => {
      window.removeEventListener("open-user-manual", handleOpenEvent);
    };
  }, []);

  // Keyboard shortcut listener (Esc key to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  // Sidebar Menu Sections Definition
  const sections = [
    {
      id: "1",
      title: "1. Quick Start (5-Minute Setup)",
      shortTitle: "Quick Start",
      icon: "⚡",
      badge: "5 MIN",
    },
    {
      id: "2",
      title: "2. Profile & Resume Setup",
      shortTitle: "Profile & Resume",
      icon: "📄",
      badge: "AI PARSER",
    },
    {
      id: "3",
      title: "3. Email Outreach Modes Explained",
      shortTitle: "Outreach Modes",
      icon: "✉️",
      badge: "CORE",
      subItems: [
        "Option 1: Fully Automated Send",
        "Option 2: Save to Gmail Drafts (Recommended)",
        "Option 3: Gmail Web Compose (Zero permissions)",
      ],
    },
    {
      id: "4",
      title: "4. Reviewing & Editing Outreach Emails",
      shortTitle: "Reviewing Drafts",
      icon: "✍️",
      badge: "WORKFLOW",
    },
    {
      id: "5",
      title: "5. Analytics, Tracking & Daily Limits",
      shortTitle: "Analytics & Limits",
      icon: "📊",
      badge: "SAFETY",
    },
    {
      id: "6",
      title: "6. Troubleshooting & FAQs",
      shortTitle: "FAQs & Support",
      icon: "❓",
      badge: "HELP",
    },
  ];

  // Helper to trigger dashboard navigation / actions
  const handleTryItNow = (actionType) => {
    handleClose();
    if (actionType === "profile") {
      navigate("/profile/settings");
    } else if (actionType === "outreach_tab") {
      navigate("/dashboard");
      setTimeout(() => {
        const outreachTab = document.getElementById("tab-outreach");
        if (outreachTab) outreachTab.click();
        const draftsEl = document.getElementById("drafts-review");
        if (draftsEl) draftsEl.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else if (actionType === "campaign_modal") {
      navigate("/dashboard");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-campaign-modal"));
      }, 150);
    } else if (actionType === "dashboard_top") {
      navigate("/dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredSections = searchQuery
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.subItems && s.subItems.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : sections;

  return (
    <div
      className="fixed inset-0 z-[100000] overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-manual-title"
    >
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              📖
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="user-manual-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  EasyNaukri User Manual & Comprehensive Guide
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Step-by-step master guide for setting up profiles, outreach modes, and automated recruiter dispatch.
              </p>
            </div>
          </div>

          {/* Quick Topic Search & Close */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 text-xs py-1.5 pl-8 pr-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={handleClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close user manual"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Main Body (Left Sidebar + Right Content) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-72 bg-slate-50/50 dark:bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 sm:p-4 overflow-y-auto shrink-0 space-y-1">
            <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Guide Navigation
            </div>
            {filteredSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <div key={sec.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{sec.icon}</span>
                      <span className="truncate">{sec.shortTitle}</span>
                    </div>
                    {sec.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {sec.badge}
                      </span>
                    )}
                  </button>

                  {/* Sub-items for Outreach Modes */}
                  {sec.subItems && (isActive || activeSection === "3") && (
                    <div className="pl-7 pr-2 py-1 space-y-1 border-l-2 border-indigo-200 dark:border-indigo-900 ml-4">
                      {sec.subItems.map((sub, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveSection("3")}
                          className="w-full text-left text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors block truncate"
                        >
                          • {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Keyboard Shortcuts Box in Sidebar */}
            <div className="hidden md:block mt-6 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <span>⌨️ Shortcuts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Close Guide:</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono">Esc</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Approve Draft:</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono">Ctrl+Enter</kbd>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* SECTION 1: QUICK START */}
            {(activeSection === "1" || searchQuery) && (
              <section id="guide-sec-1" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      1. Quick Start (5-Minute Setup)
                    </h3>
                  </div>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                    Fast Track
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Welcome to EasyNaukri! Follow this 5-step quick start flow to set up your profile and dispatch your first AI-personalized recruiter outreach campaign in under 5 minutes.
                </p>

                {/* Step Cards */}
                <div className="grid grid-cols-1 gap-3.5">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Your Base Resume (PDF)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">AI automatically parses your technical skills, work history, and target designation.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Configure Job Preferences & Target Roles</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Specify target role titles (e.g., Software Engineer, Product Manager) and key skills.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Authorize Gmail OAuth or Choose Web Compose</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Connect Gmail for seamless background drafts creation or automated email dispatching.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Select Your Outreach Dispatch Mode</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Choose between Fully Automated Send, Save to Gmail Drafts (Recommended), or Web Compose.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">5</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Launch Outreach Campaign & Review Queue</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Inspect generated cold emails in your dashboard drawer and dispatch your first batch!</p>
                    </div>
                  </div>
                </div>

                {/* Callout Tip Box */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1 text-sm">
                    <span>💡 Pro Tip</span>
                  </div>
                  <p>
                    Keeping your target role and resume updated increases AI match precision and boosts recruiter response rates by up to 35%!
                  </p>
                </div>

                {/* Try It Now Anchor */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTryItNow("dashboard_top")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>Try Quick Start Checklist Now</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 2: PROFILE & RESUME */}
            {(activeSection === "2" || searchQuery) && (
              <section id="guide-sec-2" className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      2. Profile & Resume Setup
                    </h3>
                  </div>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-bold">
                    AI Resume Engine
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your candidate profile powers the EasyNaukri AI matching engine. Uploading your PDF resume unlocks instant parsing, candidate trust score calculation, and custom recruiter cold email generation.
                </p>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🤖</span> AI PDF Resume Parsing
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      When you upload a resume PDF in Profile Settings, our deep neural parser automatically extracts your programming languages, frameworks, target roles, experience level, and education.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🛂</span> Candidate Trust Score
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      Your Universal Career Passport displays a dynamic Trust Score (0% – 100%). Completing your profile preferences (+20%), uploading a base resume (+40%), and connecting a verified Gmail account (+40%) ensures max trust.
                    </p>
                  </div>
                </div>

                {/* Callout Tip Box */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1 text-sm">
                    <span>💡 Pro Tip: Formatting Skills</span>
                  </div>
                  <p>
                    In Profile Settings, you can choose how your skills are presented to recruiters (Comma-separated, Bulleted list, or Highlights).
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTryItNow("profile")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>Configure Profile & Resume Settings</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 3: EMAIL OUTREACH MODES EXPLAINED */}
            {(activeSection === "3" || searchQuery) && (
              <section id="guide-sec-3" className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✉️</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      3. Email Outreach Modes Explained
                    </h3>
                  </div>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full font-bold">
                    3 Flexible Options
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  EasyNaukri offers 3 powerful email outreach dispatch modes to fit your personal workflow, privacy preferences, and control requirements.
                </p>

                {/* Outreach Mode Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Option 1 */}
                  <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-base font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                        <span>⚡ Option 1: Fully Automated Send (Direct Dispatch)</span>
                      </h4>
                      <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full uppercase">
                        Hands-Free
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      EasyNaukri's background scheduler automatically dispatches cold emails to verified HR recruiters directly through your connected Gmail OAuth account according to your scheduled cadence.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                      <li>Requires active Gmail OAuth authorization.</li>
                      <li>Operates automatically in the background at natural 10-30 min intervals.</li>
                      <li>Perfect for maximum speed and hands-free outreach.</li>
                    </ul>
                  </div>

                  {/* Option 2 */}
                  <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl space-y-2 relative overflow-hidden ring-2 ring-emerald-500/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <span>📥 Option 2: Save to Gmail Drafts</span>
                      </h4>
                      <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase">
                        ⭐ Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Instead of sending directly, EasyNaukri creates pre-filled cold emails directly inside your official Gmail Drafts folder (<code className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-mono">mail.google.com/mail/#drafts</code>).
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                      <li>You retain 100% manual review power before sending.</li>
                      <li>Edit cold email wording, add custom attachments, or send with 1 click in Gmail.</li>
                      <li>Best balance between automated AI drafting and total control.</li>
                    </ul>
                  </div>

                  {/* Option 3 */}
                  <div className="p-5 bg-gradient-to-br from-slate-500/5 to-slate-700/5 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>🌐 Option 3: Gmail Web Compose (Zero Permissions)</span>
                      </h4>
                      <span className="text-[10px] font-extrabold bg-slate-600 text-white px-2.5 py-0.5 rounded-full uppercase">
                        Zero Auth
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Opens a single-click <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">mailto:</code> web compose link in your browser tab with recipient HR email, subject line, and cold email body pre-populated.
                    </p>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4">
                      <li>Requires ZERO Gmail API scope permissions or OAuth tokens.</li>
                      <li>Ideal for privacy-conscious candidates using personal or university email accounts.</li>
                    </ul>
                  </div>
                </div>

                {/* Callout Box */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1 text-sm">
                    <span>💡 Pro Tip: Drafts Workflow Guide</span>
                  </div>
                  <p>
                    When using <strong>Save to Gmail Drafts</strong>, all AI-generated cold emails land in <code className="font-mono bg-white/60 dark:bg-slate-800 px-1 rounded">mail.google.com/mail/#drafts</code>. You can open your Gmail app anytime to review, tweak, and send them at your own pace!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTryItNow("campaign_modal")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>Select Email Dispatch Mode Now</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 4: REVIEWING & EDITING OUTREACH EMAILS */}
            {(activeSection === "4" || searchQuery) && (
              <section id="guide-sec-4" className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✍️</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      4. Reviewing & Editing Outreach Emails
                    </h3>
                  </div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-bold">
                    Email Drawer
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Before any cold email is sent, you can easily inspect and edit every word using the built-in Outreach Center drawer on your dashboard.
                </p>

                {/* Workflow Steps */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs sm:text-sm">
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> Step-by-Step Email Review Process:
                  </h4>
                  <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal pl-5">
                    <li>
                      <strong>Switch to Outreach Center:</strong> Click on the <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Outreach Center</code> tab on your candidate dashboard.
                    </li>
                    <li>
                      <strong>Open Review Drawer:</strong> Click on any pending draft or AI job match suggestion row to open the Email Drawer.
                    </li>
                    <li>
                      <strong>Customize Content:</strong> Modify recipient email, CC addresses, subject line, or personalized body text.
                    </li>
                    <li>
                      <strong>Approve & Schedule:</strong> Click <span className="font-bold text-indigo-600 dark:text-indigo-400">Approve & Schedule</span> (or press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono text-[10px]">Ctrl + Enter</kbd>) to move the item to the active queue.
                    </li>
                  </ol>
                </div>

                {/* Pro Tip */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl text-xs text-purple-900 dark:text-purple-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1 text-sm">
                    <span>💡 Pro Tip: Customizing Placeholders</span>
                  </div>
                  <p>
                    EasyNaukri automatically replaces variables like <code className="font-mono bg-purple-100 dark:bg-purple-900 px-1 rounded">{`{{company_name}}`}</code> and <code className="font-mono bg-purple-100 dark:bg-purple-900 px-1 rounded">{`{{recruiter_name}}`}</code> with parsed recruiter metadata.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTryItNow("outreach_tab")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>View Outreach Queue & Drafts</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 5: ANALYTICS, TRACKING & DAILY LIMITS */}
            {(activeSection === "5" || searchQuery) && (
              <section id="guide-sec-5" className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      5. Analytics, Tracking & Daily Limits
                    </h3>
                  </div>
                  <span className="text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full font-bold">
                    Domain Protection
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  EasyNaukri prioritizes email deliverability and sender domain safety. Our built-in rate-limiting system prevents spam triggers while maximizing recruiter open rates.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🛡️</span> Daily Batch Scheduling
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      Default limit of <strong>50 emails/day</strong>. Emails are queued and dispatched at randomized 10–30 minute intervals during business hours.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>📅</span> Skip Weekends Protocol
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      Automatically pauses dispatches on Saturdays and Sundays so your cold emails land in recruiter inboxes during peak weekday working hours.
                    </p>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                  <div className="font-extrabold flex items-center gap-1 text-sm">
                    <span>💡 Pro Tip: Maintaining Email Reputation</span>
                  </div>
                  <p>
                    Never increase your daily limit above 100 emails per day on personal Gmail accounts. Gradual, randomized dispatch ensures 99%+ deliverability directly to recruiter primary inboxes.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTryItNow("dashboard_top")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>View Dashboard Analytics & Metrics</span>
                    <span aria-hidden="true">➔</span>
                  </button>
                </div>
              </section>
            )}

            {/* SECTION 6: TROUBLESHOOTING & FAQS */}
            {(activeSection === "6" || searchQuery) && (
              <section id="guide-sec-6" className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❓</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      6. Troubleshooting & Frequently Asked Questions
                    </h3>
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-bold">
                    FAQ
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Q: What happens if my Gmail OAuth disconnects?</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      If your Google access token expires, click <strong>Connect Gmail</strong> in your Onboarding Checklist or Profile Settings. All your queued items will automatically resume once re-authenticated.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Q: Where do my pre-generated drafts go?</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Drafts appear in your dashboard Outreach Center tab AND directly inside your Gmail Drafts folder (<code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">mail.google.com/mail/#drafts</code>).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Q: How do I change my target job title or vertical?</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Navigate to Profile Settings (`/profile/settings`), update your Target Role field, and click Save. New job matches will reflect your updated target.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Q: Is my Gmail account safe from spam filters?</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      Yes! EasyNaukri strictly enforces human-like randomized delays, daily rate limits, and weekend skips to safeguard your domain reputation.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>Close Manual & Return to Dashboard</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManualModal;
