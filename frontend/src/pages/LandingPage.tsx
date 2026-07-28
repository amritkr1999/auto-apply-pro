import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div>
      <header>
        <h1>EasyNaukri</h1>
        <p>Automated Job Application & Resume Matching Platform</p>
      </header>

      <main>
        <section>
          <h2>Application Purpose</h2>
          <p>
            EasyNaukri is an AI-powered career assistant designed to help job seekers match their resumes with job descriptions, optimize ATS keywords, track job application pipelines, and send candidate-authorized recruiter outreach emails automatically.
          </p>
        </section>

        <section>
          <h2>Google OAuth Permissions & Data Usage</h2>
          <p>
            EasyNaukri requests specific Google OAuth permissions to provide authentication and email dispatch services. Below is a detailed breakdown of what data we access, why we need it, and how it is used:
          </p>

          <table border={1} cellPadding={8} cellSpacing={0}>
            <thead>
              <tr>
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

        <section>
          <h2>Data Privacy & Security Guarantees</h2>
          <ul>
            <li><strong>User Control:</strong> All outreach emails sent using <code>gmail.send</code> are created based on candidate-approved templates and job parameters.</li>
            <li><strong>Minimal Access:</strong> We strictly request send-only permissions (<code>gmail.send</code>) and do not ask for read or delete access to your inbox.</li>
            <li><strong>Data Protection:</strong> OAuth tokens are securely encrypted in transit and at rest, and your personal data is never shared or sold to third parties.</li>
          </ul>
        </section>

        <section>
          <h2>Sign In with Google</h2>
          <p>
            <Link to="/login">
              <button type="button">Sign in with Google</button>
            </Link>
          </p>
          <p>
            <strong>Permissions Notice:</strong> Signing in with Google authorizes EasyNaukri to verify your identity (<code>openid</code>, <code>email</code>, <code>profile</code>) and grant send-only permission (<code>https://www.googleapis.com/auth/gmail.send</code>) strictly for dispatching candidate-authorized job application outreach emails.
          </p>
          <p>
            By continuing, you agree to our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>
        </section>
      </main>

      <footer>
        <hr />
        <p>
          <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link>
        </p>
        <p>&copy; {new Date().getFullYear()} EasyNaukri. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
