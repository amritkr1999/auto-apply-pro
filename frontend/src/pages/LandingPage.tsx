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
            EasyNaukri is an automated job application and resume matching platform designed to help job seekers streamline their job search. EasyNaukri matches candidate resumes with job descriptions, optimizes ATS keywords, tracks job application pipelines, and manages candidate-authorized recruiter outreach.
          </p>
        </section>

        <section>
          <h2>Permissions & Scopes Used</h2>
          <p>EasyNaukri requests the following permissions for specific application features:</p>
          <ul>
            <li>
              <strong>1. openid, email, profile (Basic Authentication):</strong> Used to verify user identity, create and sign in to your EasyNaukri account, build your candidate profile, and save job preferences securely.
            </li>
            <li>
              <strong>2. https://www.googleapis.com/auth/gmail.send (Gmail Send Permission):</strong> EasyNaukri requests send-only access strictly so job seekers can compose and send candidate-authorized job application & recruiter outreach emails directly from their connected Gmail account. EasyNaukri never reads, accesses, modifies, or deletes non-outreach inbox emails.
            </li>
          </ul>
        </section>

        <section>
          <h2>Sign In with Google</h2>
          <div>
            <Link to="/login">
              <button type="button">Sign in with Google</button>
            </Link>
          </div>
          <p>
            By signing in with Google, you authorize EasyNaukri to verify your identity (<code>openid</code>, <code>email</code>, <code>profile</code>) and request Gmail send permission (<code>https://www.googleapis.com/auth/gmail.send</code>) strictly for sending user-authorized job application outreach emails.
          </p>
          <p>
            For more details on how your data is processed, please read our{" "}
            <Link to="/privacy">Privacy Policy</Link> and{" "}
            <Link to="/terms">Terms of Service</Link>.
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
