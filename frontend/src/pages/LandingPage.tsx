import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div className="font-body min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-heading text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-sm font-extrabold">EN</span>
            <span>EasyNaukri</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
            >
              Sign in with Google
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Hero Section */}
        <section className="text-center mb-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Welcome to EasyNaukri
          </h1>
          <p className="font-body text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            EasyNaukri is an automated job search and resume management platform designed to help job seekers discover matching opportunities, optimize resumes, and track applications effortlessly.
          </p>
        </section>

        {/* Section: OAuth Permissions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            Google OAuth Permissions & Data Usage
          </h2>
          <p className="font-body text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            EasyNaukri requests specific Google OAuth permissions to provide authentication and email dispatch services. Below is a detailed breakdown of what data we access, why we need it, and how it is used:
          </p>

          <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="font-heading p-3 sm:p-4 font-bold text-slate-900 dark:text-slate-100">Scope Name</th>
                  <th className="font-heading p-3 sm:p-4 font-bold text-slate-900 dark:text-slate-100">Permission Type</th>
                  <th className="font-heading p-3 sm:p-4 font-bold text-slate-900 dark:text-slate-100">What Data We Access</th>
                  <th className="font-heading p-3 sm:p-4 font-bold text-slate-900 dark:text-slate-100">Why We Need It</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-body text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">openid</td>
                  <td className="p-3 sm:p-4">Non-sensitive</td>
                  <td className="p-3 sm:p-4">Unique Google User ID (sub)</td>
                  <td className="p-3 sm:p-4">To authenticate user identity securely without creating a separate password.</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">email</td>
                  <td className="p-3 sm:p-4">Non-sensitive</td>
                  <td className="p-3 sm:p-4">Primary Email Address</td>
                  <td className="p-3 sm:p-4">To create your EasyNaukri account, sign you in, and deliver account notifications.</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">profile</td>
                  <td className="p-3 sm:p-4">Non-sensitive</td>
                  <td className="p-3 sm:p-4">Display Name & Profile Picture URL</td>
                  <td className="p-3 sm:p-4">To populate your candidate dashboard profile (Name and Avatar).</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">https://www.googleapis.com/auth/gmail.send</td>
                  <td className="p-3 sm:p-4"><span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded text-xs font-semibold">Restricted</span></td>
                  <td className="p-3 sm:p-4">Ability to compose & send outbound emails</td>
                  <td className="p-3 sm:p-4">To send user-authorized job applications and recruiter outreach emails directly from your connected Gmail address.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">
            Detailed Breakdown by Scope
          </h3>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-heading text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                1. Basic Identity Scopes (openid, email, profile)
              </h4>
              <ul className="font-body list-disc list-inside space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li><strong>What data is requested:</strong> Your primary email address, full name, profile picture URL, and unique Google ID.</li>
                <li><strong>Why we need it:</strong> To allow single sign-on (SSO), populate your user profile, authenticate API requests, and send system account notifications.</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800">
              <h4 className="font-heading text-base sm:text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                2. Gmail Send Scope (https://www.googleapis.com/auth/gmail.send)
              </h4>
              <ul className="font-body list-disc list-inside space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li><strong>What data/permission is requested:</strong> Send-only authorization to dispatch outbound emails through Google's Gmail API on your behalf.</li>
                <li><strong>Why we need it:</strong> EasyNaukri allows candidates to automate job application outreach by sending personalized cover letters and resumes directly to hiring managers from their own Gmail address. Recruiter replies will land directly in your personal Gmail inbox.</li>
                <li><strong>What we DO with this scope:</strong> Construct job outreach emails and send them via the Gmail API strictly when configured and authorized by the user.</li>
                <li><strong>What we NEVER do:</strong> We NEVER read, access, fetch, modify, label, or delete non-outreach inbox emails (<code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">gmail.readonly</code> is not requested).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Data Privacy Guarantees */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            Data Privacy & Security Guarantees
          </h2>
          <ul className="font-body list-disc list-inside space-y-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            <li><strong>User Control:</strong> All outreach emails sent using <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">gmail.send</code> are created based on candidate-approved templates and job parameters.</li>
            <li><strong>Minimal Access:</strong> We strictly request send-only permissions (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">gmail.send</code>) and do not ask for read or delete access to your inbox.</li>
            <li><strong>Data Protection:</strong> OAuth tokens are securely encrypted in transit and at rest, and your personal data is never shared or sold to third parties.</li>
          </ul>
        </section>

        {/* CTA Section */}
        <section className="text-center my-10 p-8 sm:p-10 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-indigo-950/40 rounded-3xl border border-indigo-100 dark:border-slate-800">
          <p className="font-body text-base sm:text-lg mb-6 text-slate-700 dark:text-slate-300 font-medium max-w-xl mx-auto">
            Sign in with Google to securely create your EasyNaukri profile, track your job applications, and save your resume preferences.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
          >
            Sign in with Google
          </Link>
          <p className="font-body mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            By continuing, you agree to our <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Terms of Service</Link>.
          </p>
        </section>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-body">
            &copy; {new Date().getFullYear()} EasyNaukri. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-body">
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
