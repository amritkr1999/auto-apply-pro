import React from 'react';
import { Link } from 'react-router-dom';

export const CookiePolicy = () => {
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
        <div className="mb-10 text-center sm:text-left bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Official Policy Document
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Cookie Policy</h1>
          <p className="text-indigo-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            This Cookie Policy explains how EasyNaukri uses cookies and similar local storage technologies to recognize you when you visit our web application.
          </p>
          <div className="mt-6 pt-4 border-t border-indigo-800/50 flex flex-wrap items-center gap-4 text-xs text-indigo-300">
            <span><strong>Effective Date:</strong> August 20, 2026</span>
            <span>•</span>
            <span><strong>Platform:</strong> EasyNaukri</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8">
          {/* Key Highlights Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
            <h2 className="text-emerald-900 dark:text-emerald-300 font-bold text-lg mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Minimal & Privacy-First Approach
            </h2>
            <p className="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed">
              <strong>EasyNaukri uses only strictly necessary operational cookies and local storage tokens.</strong> We do not deploy invasive third-party cross-site advertising trackers or sell browsing data.
            </p>
          </div>

          {/* Section 1: What Are Cookies? */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">1. What Are Cookies and Web Storage?</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Cookies are small data files placed on your computer or mobile device when you visit a website. Browser Local Storage and Session Storage are modern web standard technologies that allow web applications to store information locally within your browser securely.
              </p>
            </div>
          </section>

          {/* Section 2: Categories of Storage & Cookies We Use */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">2. Cookies and Storage Used by EasyNaukri</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">A. Strictly Necessary / Essential Storage</h3>
                <p>
                  These storage items are essential for you to navigate EasyNaukri and use its security features (e.g. Google OAuth authentication tokens, active session validation, and dark mode theme preferences). Without these, core services cannot function properly.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">B. Functional & Preference Storage</h3>
                <p>
                  We store local preferences (such as selected candidate filters, saved drafts, or UI theme choices) to provide a personalized and continuous experience across visits.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Managing Cookies & Opt-Out */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">3. How to Manage or Disable Cookies</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and secure dashboard areas may be restricted.
              </p>
            </div>
          </section>

          {/* Section 4: Contact & Inquiries */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">4. Contact Us</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                If you have questions about our use of cookies or other storage technologies, please contact us at:
              </p>
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 w-fit">
                <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Cookie & Privacy Support</div>
                <a href="mailto:support@easynaukri.online" className="hover:underline">support@easynaukri.online</a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} EasyNaukri. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookie-policy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Cookie Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Contact Us
            </Link>
            <Link to="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;
