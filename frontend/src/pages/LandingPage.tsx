import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export const LandingPage: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* ==================== Navigation Navbar ==================== */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-indigo-600 dark:text-indigo-400 hover:opacity-90 transition-opacity">
            <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl text-base font-extrabold shadow-sm">EN</span>
            <span>EasyNaukri</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <Link to={getDashboardPath()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ==================== Main Verification Landing Section ==================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        
        {/* Hero Section */}
        <section className="text-center bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            ✨ Official Application Homepage
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-white">
            EasyNaukri
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-indigo-200 mb-6 max-w-3xl mx-auto leading-snug">
            Automated Job Application & Resume Matching Platform
          </p>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            EasyNaukri is an AI-powered career assistant designed to streamline job search, optimize resumes for ATS compatibility, track application pipelines, and manage candidate outreach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {user ? (
              <Link to={getDashboardPath()} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-base shadow-lg transition-all">
                Open Dashboard
              </Link>
            ) : (
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base shadow-lg transition-all">
                Sign In with Google
              </Link>
            )}
          </div>

          <p className="mt-6 text-xs sm:text-sm text-indigo-200/90 font-medium max-w-lg mx-auto">
            Sign in with Google to create your EasyNaukri account profile, save job preferences, and sync your resume securely.
          </p>
        </section>

        {/* Section 1: Platform Purpose & Key Features */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <span>🎯</span> Platform Purpose & Features
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              EasyNaukri empowers candidates by automating repetitive career tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Resume Matching</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Extract key skills and match candidate profiles against target job descriptions to maximize hiring potential.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Application Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralized dashboard to track application status, interview schedules, and response rates.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Recruiter Outreach</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Compose, review, and send candidate-initiated outreach emails directly to hiring recruiters.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Google Authentication & Scopes Purpose */}
        <section className="bg-indigo-50/60 dark:bg-indigo-950/40 rounded-3xl p-6 sm:p-10 border border-indigo-200 dark:border-indigo-900/60 space-y-6">
          <div className="border-b border-indigo-200 dark:border-indigo-800/60 pb-4">
            <h2 className="text-2xl font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-2.5">
              <span>🔐</span> Google Integration & OAuth Scopes
            </h2>
            <p className="text-indigo-900/80 dark:text-indigo-300/80 text-sm mt-1">
              Detailed breakdown of why EasyNaukri integrates with Google services.
            </p>
          </div>

          <div className="space-y-4 text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <h3 className="font-bold text-base text-indigo-600 dark:text-indigo-400 mb-1">
                1. Google OAuth Sign-In (`openid`, `email`, `profile`)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Allows job seekers to securely log into EasyNaukri, create their profile, save job preferences, and store resume details safely without maintaining extra passwords.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <h3 className="font-bold text-base text-indigo-600 dark:text-indigo-400 mb-1">
                2. Gmail API Integration (`gmail.send` - Send-only scope)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                EasyNaukri utilizes send-only access to Gmail API solely to allow users to review and send personalized job application emails to recruiters directly from their connected Gmail account. EasyNaukri never reads, modifies, or stores non-outreach inbox messages.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ==================== Footer ==================== */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong>EasyNaukri</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:support@easynaukri.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Contact: support@easynaukri.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
