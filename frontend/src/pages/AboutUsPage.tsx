import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export const AboutUsPage: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-sm font-extrabold">EN</span>
            <span>EasyNaukri</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Banner Section */}
        <div className="mb-12 text-center sm:text-left bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <span>🇮🇳</span>
            <span>Our Story & Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Democratizing Job Search for Millions Across India
          </h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-3xl leading-relaxed">
            EasyNaukri was created to eliminate the exhausting manual grind of job hunting. We build AI-powered tools that automate resume matching, recruiter outreach, and application tracking.
          </p>
        </div>

        {/* Our Journey Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Our Journey</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold mb-4">
                💡
              </div>
              <h3 className="text-xl font-bold mb-3">The Problem We Saw</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Job seekers in India spend hundreds of hours manually browsing job portals, tailoring resumes for every application, writing personalized cold emails to recruiters, and managing messy spreadsheets. Despite high qualifications, many get overlooked due to algorithm filters and sheer application fatigue.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold mb-4">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-3">The EasyNaukri Vision</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                We envisioned a platform where candidates could put their job search on intelligent autopilot. By combining ATS resume optimization, AI match scoring, and automated outreach, EasyNaukri empowers candidates to land 3x more interview callbacks while saving 20+ hours every week.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs">
              Milestones & Evolution
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2024
                </div>
                <div>
                  <h4 className="font-bold text-base">The Initial Prototype</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Started as a personal script to automate resume keyword matching and recruiter email dispatch. Early testers reported a 400% increase in recruiter responses.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-5 h-4"></div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2025
                </div>
                <div>
                  <h4 className="font-bold text-base">Autopilot & Billing Platform</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Launched full Autopilot submission engine, instant UPI/Razorpay subscription tiers, and granular job tracking dashboards for candidates across India.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-5 h-4"></div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2026+
                </div>
                <div>
                  <h4 className="font-bold text-base">Universal Career Passport & Beyond</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Expanding with Learning Space skill roadmaps, recruiter verification, and mobile app tools to support candidates in top tech hubs and tier-2/3 cities alike.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Core Values */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-center sm:text-left">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-bold mb-2 text-base">Precision Automation</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Quality over spam. We match relevant skill vectors so candidates apply only to roles where they genuinely shine.
              </p>
            </div>

            <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-bold mb-2 text-base">Candidate Data Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your data stays strictly under your control. We enforce Google OAuth & AES encryption for total peace of mind.
              </p>
            </div>

            <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-2xl mb-2">🇮🇳</div>
              <h3 className="font-bold mb-2 text-base">Built for Indian Talent</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed to handle the unique fast-paced hiring dynamics, job portals, and salary structures of the Indian market.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Signature Callout */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-rose-500/10 border border-indigo-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-lg my-12 relative overflow-hidden">
          <div className="inline-block p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4">
            <span className="text-3xl">🇮🇳</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Made with ❤️ by an Indian for India
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
            Dedicated to empowering engineers, managers, designers, and job seekers across every state in India to achieve their career dreams effortlessly.
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
            <Link to="/about" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              About Us
            </Link>
            <Link to="/careers" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Careers
            </Link>
            <a
              href="https://www.linkedin.com/company/easynaukri/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/easynaukri.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Instagram
            </a>
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

export default AboutUsPage;
