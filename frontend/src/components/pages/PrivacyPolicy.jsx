import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-indigo-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            At EasyNaukri, your trust and data privacy are fundamental to everything we build. This policy details how we handle, store, and protect your information.
          </p>
          <div className="mt-6 pt-4 border-t border-indigo-800/50 flex flex-wrap items-center gap-4 text-xs text-indigo-300">
            <span><strong>Effective Date:</strong> July 26, 2026</span>
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
              Key Privacy Commitment
            </h2>
            <p className="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed">
              <strong>EasyNaukri does NOT sell, rent, or share your personal data with third parties for marketing purposes.</strong> We collect only essential user details required to provide seamless authentication and core career tools.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                EasyNaukri follows a minimal data collection principle. We collect basic user information when you authenticate on our platform:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 my-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">Google OAuth Information:</strong> When signing in using Google OAuth, we collect your <strong>Full Name</strong> and <strong>Email Address</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">Profile & Career Data:</strong> Resume information and job application preferences that you voluntarily provide to manage your profile and automate applications.
                  </div>
                </div>
              </div>
              <p>
                We do not collect sensitive demographic data, credit card details directly (all billing is processed by PCI-compliant payment gateways), or non-essential telemetry.
              </p>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">2. How We Use Your Information</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Your basic information is used purely for the following core purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-200">
                <li><strong>Authentication:</strong> Verifying your identity safely via Google OAuth so you can log into EasyNaukri.</li>
                <li><strong>Profile Management:</strong> Setting up and managing your user account and personal job preferences.</li>
                <li><strong>Application Functionality:</strong> Allowing you to track, automate, and manage job applications effectively.</li>
                <li><strong>Communication:</strong> Sending critical operational updates, transactional notices, or account notifications.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Data Sharing & Non-Disclosure */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">3. Data Sharing & Zero Third-Party Sale</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We maintain a strict stance against commercializing user data:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <p>
                  <strong>No Data Sales:</strong> EasyNaukri does <em>never</em> sell, trade, rent, or lease your personal information (including name and email address) to third-party data brokers or ad networks.
                </p>
                <p>
                  <strong>Service Providers:</strong> We only work with trusted cloud infrastructure providers (such as Google Cloud / Firebase) operating under strict data confidentiality agreements strictly necessary for hosting the service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Google API Services User Data & Limited Use Disclosure */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">4. Google API Services User Data & Limited Use Disclosure</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                EasyNaukri's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Google API Services User Data Policy</a>, including the <strong>Limited Use</strong> requirements.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 my-4 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">Requested Scopes:</strong> We request <code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-700 dark:text-indigo-300">https://www.googleapis.com/auth/gmail.send</code> and <code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-700 dark:text-indigo-300">https://www.googleapis.com/auth/gmail.compose</code>.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">Purpose & Usage:</strong> These permissions are used exclusively to allow candidates to create email drafts in their Gmail account (<code className="font-mono text-xs">gmail.compose</code>) and send candidate-approved outreach emails (<code className="font-mono text-xs">gmail.send</code>) directly from their connected Gmail account upon explicit user action.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">No Reading / Inbox Access:</strong> EasyNaukri does NOT request read or search access (<code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">gmail.readonly</code> is not requested). We never read, view, scan, store, or analyze your personal emails or inbox content.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">No Data Transfer or AI Training:</strong> Google user data is not transferred to third parties (except as necessary to provide service features), nor is it used for serving advertisements or training Generalized AI/ML models.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security & Storage */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">4. Data Security</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                We employ industry-standard technical and organizational security measures to protect your information against unauthorized access, loss, or alteration. All data transmission between your browser and EasyNaukri is encrypted using Transport Layer Security (TLS/HTTPS).
              </p>
            </div>
          </section>

          {/* Section 5: Your Rights & Data Deletion */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">5. Your Data Rights & Deletion</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                You retain full control over your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 dark:text-slate-200">
                <li><strong>Access & Update:</strong> You can view and edit your profile details at any time in Account Settings.</li>
                <li><strong>Account Deletion:</strong> You have the right to request permanent deletion of your account and associated data (under GDPR, CCPA, and DPDP frameworks). You can trigger account deletion directly in your profile settings or by contacting us.</li>
                <li><strong>Right to Complain / Appeal:</strong> If you believe that our processing of your personal data infringes applicable data protection laws (including GDPR), you have the right to lodge a complaint or appeal with your relevant Data Protection Authority (DPA) or supervisory body.</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Contact Us */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">6. Contact & Inquiries</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or how EasyNaukri processes your personal data, please reach out to us at:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Support & Privacy</div>
                  <a href="mailto:support@easynaukri.online" className="hover:underline">support@easynaukri.online</a>
                </div>
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Customer Care</div>
                  <a href="mailto:care@easynaukri.online" className="hover:underline">care@easynaukri.online</a>
                </div>
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                  <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1 font-sans">Security & Tech</div>
                  <a href="mailto:tech@easynaukri.online" className="hover:underline">tech@easynaukri.online</a>
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
            <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
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

export default PrivacyPolicy;
