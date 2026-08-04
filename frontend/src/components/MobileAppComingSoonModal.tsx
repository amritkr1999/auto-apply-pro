import React from "react";

interface MobileAppComingSoonModalProps {
  onClose: () => void;
}

export const MobileAppComingSoonModal: React.FC<MobileAppComingSoonModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8 text-center">
          {/* Phone / App Icon Badge */}
          <div className="mx-auto mb-5 relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-indigo-200/80 dark:border-indigo-800/60">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            Mobile App Coming Soon
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2 flex items-center justify-center gap-2">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="w-8 h-8 rounded-xl object-contain shadow-xs select-none shrink-0" />
            <span>EasyNaukri On The Go!</span>
          </h3>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            We are crafting native iOS and Android apps to give you effortless control over your job application autopilot wherever you are.
          </p>

          {/* Preview Features */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 text-left space-y-3 mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                🔔
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Real-time Push Notifications & Interview Alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                ⚡
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">1-Tap Application Approvals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                🔒
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Biometric Access & Secure Storage</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppComingSoonModal;
