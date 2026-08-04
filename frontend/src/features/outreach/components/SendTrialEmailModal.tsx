import React, { useState, useEffect } from "react";
import { outreachService, type EmailTemplate } from "../services/outreachService";

interface SendTrialEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
  subject?: string;
  body?: string;
  intro?: string;
  skillsTemplate?: string;
  signOff?: string;
}

export const SendTrialEmailModal: React.FC<SendTrialEmailModalProps> = ({
  isOpen,
  onClose,
  template,
  subject: propSubject,
  body: propBody,
  intro: propIntro,
  skillsTemplate: propSkillsTemplate,
  signOff: propSignOff
}) => {
  const [recipientOption, setRecipientOption] = useState<"own" | "custom">("own");
  const [customEmail, setCustomEmail] = useState("");
  const [sampleRecruiterName, setSampleRecruiterName] = useState("Jane Doe");
  const [sampleCompanyName, setSampleCompanyName] = useState("Acme Corp");
  const [sampleJobRole, setSampleJobRole] = useState("Software Engineer");
  const [showSampleFields, setShowSampleFields] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Get current user email from localStorage
  const currentUser = React.useMemo(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const userEmail = currentUser?.email || "your email address";

  useEffect(() => {
    if (isOpen) {
      setStatus(null);
      setIsSending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetSubject = propSubject || template?.subject || "Application for {{jobRole}} | {{companyName}}";
  const targetIntro = propIntro || template?.intro || "";
  const targetSkills = propSkillsTemplate || template?.skillsTemplate || "";
  const targetBody = propBody || template?.body || "";
  const targetSignOff = propSignOff || template?.signOff || "";

  // Render live preview for user in modal
  const renderPreviewText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\{\{recruiterName\}\}/g, sampleRecruiterName || "Hiring Team")
      .replace(/\{\{hrName\}\}/g, sampleRecruiterName || "Hiring Team")
      .replace(/\{\{companyName\}\}/g, sampleCompanyName || "Acme Corp")
      .replace(/\{\{jobRole\}\}/g, sampleJobRole || "Software Engineer")
      .replace(/\{\{skills\}\}/g, "Java, Spring Boot, React")
      .replace(/\{\{experienceYears\}\}/g, "5")
      .replace(/\{\{candidateName\}\}/g, currentUser?.name || "Alex Candidate")
      .replace(/\{\{candidateMobile\}\}/g, currentUser?.mobile || "+1 (555) 0199")
      .replace(/\{\{candidateEmail\}\}/g, userEmail);
  };

  const previewSubject = `[TRIAL EMAIL] ${renderPreviewText(targetSubject)}`;
  const fullBodySections = [targetIntro, targetSkills, targetBody, targetSignOff].filter(Boolean).join("\n\n");
  const previewBody = renderPreviewText(fullBodySections || targetBody);

  const handleSendTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    let targetEmailAddress = "";
    if (recipientOption === "own") {
      targetEmailAddress = userEmail;
    } else {
      if (!customEmail.trim() || !customEmail.includes("@")) {
        setStatus({ type: "error", message: "Please enter a valid target email address." });
        return;
      }
      targetEmailAddress = customEmail.trim();
    }

    setIsSending(true);
    try {
      const res = await outreachService.sendTrialEmail({
        templateId: template?.id,
        subject: targetSubject,
        intro: targetIntro,
        skillsTemplate: targetSkills,
        body: targetBody,
        signOff: targetSignOff,
        targetEmail: targetEmailAddress,
        sampleData: {
          recruiterName: sampleRecruiterName,
          hrName: sampleRecruiterName,
          companyName: sampleCompanyName,
          jobRole: sampleJobRole
        }
      });

      if (res.success) {
        setStatus({
          type: "success",
          message: res.message || `Trial email sent to ${targetEmailAddress}! Check your inbox.`
        });
      } else {
        setStatus({
          type: "error",
          message: res.message || "Failed to send trial email."
        });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Failed to send trial email."
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Send Trial Verification Email</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verify template layout & placeholder output in your email client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendTrial} className="p-6 overflow-y-auto space-y-5">
          {/* Status Alert */}
          {status && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                status.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {status.type === "success" ? (
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 leading-relaxed">{status.message}</div>
            </div>
          )}

          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Where should the trial email be sent?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  recipientOption === "own"
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="recipientOption"
                  checked={recipientOption === "own"}
                  onChange={() => setRecipientOption("own")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs overflow-hidden">
                  <div className="font-semibold">My Email Address</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  recipientOption === "custom"
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="recipientOption"
                  checked={recipientOption === "custom"}
                  onChange={() => setRecipientOption("custom")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <div className="font-semibold">Custom Email Address</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Specify any recipient ID</div>
                </div>
              </label>
            </div>

            {recipientOption === "custom" && (
              <div className="pt-1 animate-fade-in">
                <input
                  type="email"
                  placeholder="e.g. manager@example.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Sample Variables Customization Toggle */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => setShowSampleFields(!showSampleFields)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Customize Sample Context Data
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                {showSampleFields ? "Hide Options" : "Edit Options"}
              </span>
            </button>

            {showSampleFields && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={sampleCompanyName}
                    onChange={(e) => setSampleCompanyName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Recruiter / HR Name</label>
                  <input
                    type="text"
                    value={sampleRecruiterName}
                    onChange={(e) => setSampleRecruiterName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Target Job Role</label>
                  <input
                    type="text"
                    value={sampleJobRole}
                    onChange={(e) => setSampleJobRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Email Live Preview Card */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Render Preview
            </label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-900 text-slate-100 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto">
              <div className="border-b border-slate-800 pb-1.5 font-bold text-indigo-300">
                Subject: {previewSubject}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-300 text-[10.5px]">
                {previewBody}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending Trial Email...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Trial Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
