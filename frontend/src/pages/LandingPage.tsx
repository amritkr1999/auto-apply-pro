import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-between p-6 font-sans transition-colors duration-200">
      <main className="max-w-2xl w-full my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
        
        {/* App Header & Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            EasyNaukri
          </h1>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-lg sm:text-xl">
            Automated Job Application & Resume Matching Platform
          </p>
        </div>

        {/* App Purpose */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <span>🎯</span> Application Purpose
          </h2>
          <p>
            EasyNaukri is an AI-powered career assistant designed to simplify the job search process for candidates. EasyNaukri helps job seekers match their resumes with job descriptions, optimize ATS keywords, track job application pipelines, and send candidate-initiated job application emails to recruiters.
          </p>
        </div>

        {/* Google Permissions & Scopes Breakdown */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-900/60 text-sm space-y-4">
          <h2 className="font-extrabold text-indigo-950 dark:text-indigo-200 text-base flex items-center gap-2">
            <span>🔐</span> Google OAuth Permissions & Scopes Used
          </h2>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                1. Basic Authentication Scopes (`openid`, `email`, `profile`)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                <strong>Purpose:</strong> To verify user identity, sign in to your EasyNaukri account, create your user profile, and save job preferences securely.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                2. Gmail Send Scope (`https://www.googleapis.com/auth/gmail.send`)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
                <strong>Specific Purpose:</strong> EasyNaukri requests <strong>send-only access</strong> to the Gmail API specifically so job seekers can compose, review, and send personalized job application & recruiter outreach emails directly from their own connected Gmail account.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                🔒 <strong>Privacy Guarantee:</strong> EasyNaukri uses send-only permission exclusively to dispatch candidate-authorized emails. EasyNaukri never reads, accesses, modifies, or deletes non-outreach emails in your inbox.
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Button Section with Explicit Permission Notice & Links */}
        <div className="text-center space-y-4 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-base"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            By signing in with Google, you authorize EasyNaukri to verify your identity (`openid`, `email`, `profile`) and use Gmail send permission (`gmail.send`) strictly to send user-authorized job application outreach emails. Review our{" "}
            <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Terms of Service
            </Link>.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto text-center text-xs text-slate-500 dark:text-slate-400 py-4 flex flex-wrap items-center justify-center gap-6">
        <span>© {new Date().getFullYear()} <strong>EasyNaukri</strong></span>
        <span>•</span>
        <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
};

export default LandingPage;
