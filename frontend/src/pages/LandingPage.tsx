import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-between p-6 font-sans transition-colors duration-200">
      <main className="max-w-xl w-full my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6">
        {/* App Name */}
        <h1 className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
          EasyNaukri
        </h1>

        {/* Purpose of App */}
        <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-100 text-lg sm:text-xl">
            Automated Job Application & Resume Matching Platform
          </p>
          <p>
            EasyNaukri is an AI-powered career assistant that helps job seekers match their resumes with job descriptions, optimize ATS keywords, track job application pipelines, and manage recruiter outreach.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            Sign in with Google to create your account profile, save job preferences, and sync your resume securely.
          </p>
        </div>

        {/* Sign In Button */}
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-block w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-base"
          >
            Sign In with Google
          </Link>
        </div>
      </main>

      {/* Footer with Terms of Use & Privacy Policy */}
      <footer className="w-full max-w-xl mx-auto text-center text-xs text-slate-500 dark:text-slate-400 py-4 flex flex-wrap items-center justify-center gap-6">
        <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
          Terms of Use
        </Link>
      </footer>
    </div>
  );
};

export default LandingPage;
