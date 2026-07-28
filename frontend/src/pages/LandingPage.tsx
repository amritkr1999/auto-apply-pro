import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          EasyNaukri
        </div>
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/login" style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "#fff", borderRadius: "0.375rem", textDecoration: "none", fontWeight: 500 }}>
            Sign in with Google
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" }}>
        <section style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Welcome to EasyNaukri</h1>
          <p style={{ fontSize: "1.125rem", color: "#4b5563", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
            EasyNaukri is an automated job search and resume management platform designed to help job seekers discover matching opportunities, optimize resumes, and streamline application workflows.
          </p>
        </section>

        <section>
          <h2>Google OAuth Permissions & Data Usage</h2>
          <p>
            EasyNaukri requests specific Google OAuth permissions to provide authentication and email dispatch services. Below is a detailed breakdown of what data we access, why we need it, and how it is used:
          </p>

          <table border={1} cellPadding={8} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse", margin: "1.5rem 0" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th>Scope Name</th>
                <th>Permission Type</th>
                <th>What Data We Access</th>
                <th>Why We Need It</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>openid</code></td>
                <td>Non-sensitive</td>
                <td>Unique Google User ID (sub)</td>
                <td>To authenticate user identity securely without creating a separate password.</td>
              </tr>
              <tr>
                <td><code>email</code></td>
                <td>Non-sensitive</td>
                <td>Primary Email Address</td>
                <td>To create your EasyNaukri account, sign you in, and deliver account notifications.</td>
              </tr>
              <tr>
                <td><code>profile</code></td>
                <td>Non-sensitive</td>
                <td>Display Name & Profile Picture URL</td>
                <td>To populate your candidate dashboard profile (Name and Avatar).</td>
              </tr>
              <tr>
                <td><code>https://www.googleapis.com/auth/gmail.send</code></td>
                <td>Restricted</td>
                <td>Ability to compose & send outbound emails</td>
                <td>To send user-authorized job applications and recruiter outreach emails directly from your connected Gmail address.</td>
              </tr>
            </tbody>
          </table>

          <h3>Detailed Breakdown by Scope</h3>

          <h4>1. Basic Identity Scopes (openid, email, profile)</h4>
          <ul>
            <li><strong>What data is requested:</strong> Your primary email address, full name, profile picture URL, and unique Google ID.</li>
            <li><strong>Why we need it:</strong> To allow single sign-on (SSO), populate your user profile, authenticate API requests, and send system account notifications.</li>
          </ul>

          <h4>2. Gmail Send Scope (https://www.googleapis.com/auth/gmail.send)</h4>
          <ul>
            <li><strong>What data/permission is requested:</strong> Send-only authorization to dispatch outbound emails through Google's Gmail API on your behalf.</li>
            <li><strong>Why we need it:</strong> EasyNaukri allows candidates to automate job application outreach by sending personalized cover letters and resumes directly to hiring managers from their own Gmail address. Recruiter replies will land directly in your personal Gmail inbox.</li>
            <li><strong>What we DO with this scope:</strong> Construct job outreach emails and send them via the Gmail API strictly when configured and authorized by the user.</li>
            <li><strong>What we NEVER do:</strong> We NEVER read, access, fetch, modify, label, or delete non-outreach inbox emails (<code>gmail.readonly</code> is not requested).</li>
          </ul>
        </section>

        <section style={{ margin: "2rem 0" }}>
          <h2>Data Privacy & Security Guarantees</h2>
          <ul>
            <li><strong>User Control:</strong> All outreach emails sent using <code>gmail.send</code> are created based on candidate-approved templates and job parameters.</li>
            <li><strong>Minimal Access:</strong> We strictly request send-only permissions (<code>gmail.send</code>) and do not ask for read or delete access to your inbox.</li>
            <li><strong>Data Protection:</strong> OAuth tokens are securely encrypted in transit and at rest, and your personal data is never shared or sold to third parties.</li>
          </ul>
        </section>

        <section style={{ textAlign: "center", margin: "3rem 0", padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem" }}>
          <p style={{ fontSize: "1.05rem", marginBottom: "1rem", color: "#334155", fontWeight: 500 }}>
            Sign in with Google to securely create your EasyNaukri profile, track your job applications, and save your resume preferences.
          </p>
          <p>
            <Link to="/login">
              <button type="button" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", fontWeight: 600, backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}>
                Sign in with Google
              </button>
            </Link>
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
            By continuing, you agree to our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>
        </section>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1rem", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ marginBottom: "0.5rem" }}>
          <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link>
        </p>
        <p>&copy; 2026 EasyNaukri. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
