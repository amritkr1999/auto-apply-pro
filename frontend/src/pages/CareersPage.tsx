import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { buildApiUrl } from "../config/api";

export const CareersPage: React.FC = () => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [applicantEmail, setApplicantEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubmit = applicantEmail.trim();

    if (!emailToSubmit || !emailToSubmit.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(buildApiUrl("/v1/public/careers/subscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToSubmit }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEmailSubmitted(true);
        setSuccessMsg(
          data.message ||
            "✨ Thank you! We have received your email. An acknowledgement mail has been sent, and you will be updated with all job opening updates."
        );
      } else {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to the server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity flex items-center gap-2.5 shrink-0" aria-label="EasyNaukri Home">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="h-9 w-9 rounded-xl object-contain shadow-xs select-none" />
            <span className="hidden sm:inline-block font-extrabold text-xl tracking-tight text-slate-900 dark:text-white select-none whitespace-nowrap">EasyNaukri</span>
          </Link>
          <div className="flex items-center gap-4">
            <DarkModeToggle tooltipPosition="bottom" />
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Banner Section */}
        <div className="mb-10 text-center bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <span>💼</span>
            <span>Careers at EasyNaukri</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Join Our Mission
          </h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We are building state-of-the-art AI automation tools to transform how candidates discover, apply for, and land their dream jobs in India.
          </p>
        </div>

        {/* Primary Hiring Announcement Card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-8 sm:p-10 shadow-lg text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-3xl font-extrabold mb-6 shadow-xs">
            🚀
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Hiring Soon!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-6">
            We are currently expanding our core engineering, AI research, and product teams. Open positions for Full-Stack Engineers, AI Engineers, and Product Designers will open shortly.
          </p>

          {/* Early Interest Form */}
          {!emailSubmitted ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleInterestSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="Enter your email for early opening alerts..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Notify Me"
                  )}
                </button>
              </form>
              {errorMsg && (
                <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {errorMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl max-w-md mx-auto text-sm font-semibold leading-relaxed shadow-sm">
              {successMsg}
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                An instant acknowledgement email has been sent to <strong>{applicantEmail}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Culture / Why Work With Us */}
        <section className="mb-12">
          <h3 className="text-xl font-bold tracking-tight mb-6 text-center sm:text-left">
            Why Work With Us?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-bold text-base mb-1">High Ownership</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Take direct charge of features used daily by thousands of active job seekers across India.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="font-bold text-base mb-1">Remote-First</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Work from anywhere in India with flexible hours and a output-focused engineering culture.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="text-2xl mb-2">🤖</div>
              <h4 className="font-bold text-base mb-1">Modern AI Stack</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Build with React 19, TypeScript, Vite, Tailwind, LLM match vectors, and automated pipelines.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Signature Callout */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-rose-500/10 border border-indigo-500/30 rounded-3xl p-8 text-center shadow-md my-8">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Made with ❤️ by an Indian for India 🇮🇳
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg mx-auto">
            Empowering job seekers across India with state-of-the-art career technology.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} EasyNaukri. Made with ❤️ by an Indian for India 🇮🇳
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              About Us
            </Link>
            <Link to="/careers" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Careers
            </Link>
            <Link to="/contact" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Contact Us
            </Link>
            <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CareersPage;
