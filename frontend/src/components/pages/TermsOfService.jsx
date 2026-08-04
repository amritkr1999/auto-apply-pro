import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
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
        {/* Hero Header Section */}
        <div className="mb-10 text-center sm:text-left bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-indigo-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            Welcome to EasyNaukri. Please review these terms carefully, as they govern your use of our career management and job automation platform.
          </p>
          <div className="mt-6 pt-4 border-t border-indigo-800/50 flex flex-wrap items-center gap-4 text-xs text-indigo-300">
            <span><strong>Last Updated:</strong> July 26, 2026</span>
            <span>•</span>
            <span><strong>Platform:</strong> EasyNaukri</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                By creating an account, accessing, or using EasyNaukri, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
              </p>
              <p>
                We reserve the right to modify or update these terms at any time. Material changes will be communicated via email or platform announcements. Your continued use of EasyNaukri after changes are posted constitutes acceptance of the revised terms.
              </p>
            </div>
          </section>

          {/* Section 2: User Accounts & Registration */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">2. User Accounts & Responsibilities</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                To utilize core features of EasyNaukri, you must register for an account using authentic credentials or Google OAuth authentication.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-200">
                <li><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and keep your profile updated.</li>
                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities occurring under your account.</li>
                <li><strong>Single Account:</strong> Users are limited to one active account per individual. Maintaining duplicate accounts for fraudulent activity is strictly prohibited.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Acceptable Use & Conduct */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">3. Acceptable Use & Prohibited Conduct</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                EasyNaukri is designed to streamline career advancement and job applications. When using the platform, you agree NOT to:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Upload misleading, fraudulent, or falsified resume content, work experience, or identity details.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Use automated scripts, bots, or unauthorized scrapers to overload, exploit, or bypass platform limits.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Interfere with or disrupt system infrastructure, server security, or network connectivity.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Harass, spam, or transmit unauthorized outreach messages to employers or other users.</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Service Availability & Modifications */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">4. Service Availability & Modifications</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We continuously improve EasyNaukri to deliver optimal performance. Consequently:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-200">
                <li>We strive for 99.9% platform availability, but do not guarantee uninterrupted access due to planned maintenance, cloud updates, or unforeseen outages.</li>
                <li>We reserve the right to enhance, modify, or temporarily suspend specific features or services with or without prior notice.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">5. Intellectual Property Rights</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                <strong>User Ownership:</strong> You retain complete ownership rights over your uploaded resumes, cover letters, and personal career documents.
              </p>
              <p>
                <strong>Platform Ownership:</strong> EasyNaukri owns all proprietary software code, logos, designs, branding, algorithms, and interface elements. You are granted a non-exclusive, non-transferable license to access and use the service solely for personal career purposes.
              </p>
            </div>
          </section>

          {/* Section 6: Account Termination Rules */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">6. Account Termination</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                <strong>Termination by You:</strong> You may request the deletion of your account and removal of personal data at any time via your account settings or by contacting support.
              </p>
              <p>
                <strong>Termination by Us:</strong> We reserve the right to suspend or terminate accounts that breach these Terms of Service, engage in fraudulent behavior, or violate applicable laws without prior notice.
              </p>
            </div>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">7. Disclaimer & Limitation of Liability</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                EasyNaukri is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to maximize job search efficiency, we do not guarantee specific employment offers, interviews, or hiring outcomes.
              </p>
              <p>
                To the maximum extent permitted by applicable law, EasyNaukri shall not be liable for indirect, incidental, or consequential damages arising out of your use of the platform.
              </p>
            </div>
          </section>

          {/* Section 8: Contact Information */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">8. Questions & Contact</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                If you have questions or legal inquiries regarding these Terms of Service, please contact our legal and support team:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Legal & Support</div>
                  <a href="mailto:support@easynaukri.online" className="hover:underline">support@easynaukri.online</a>
                </div>
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Billing & Invoices</div>
                  <a href="mailto:invoices@easynaukri.online" className="hover:underline">invoices@easynaukri.online</a>
                </div>
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
            <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Terms of Service
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

export default TermsOfService;
