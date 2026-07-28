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
            EasyNaukri is an AI-powered career assistant designed to help candidates match their resumes with job descriptions, optimize ATS keywords, track job applications, and send user-authorized recruiter outreach emails automatically.
          </p>
        </section>

        <section>
          <h2>Permissions Requested and Their Purpose</h2>
          <ul>
            <li>
              <strong>openid, email, profile</strong>: Used to verify user identity, create your EasyNaukri account, authenticate sign-in, and manage your candidate profile and job preferences securely.
            </li>
            <li>
              <strong>https://www.googleapis.com/auth/gmail.send</strong>: Used strictly to send candidate-authorized job application and recruiter outreach emails directly from your connected Gmail account. EasyNaukri never reads, accesses, modifies, or deletes non-outreach inbox emails.
            </li>
          </ul>
        </section>

        <section>
          <h2>Sign In</h2>
          <p>
            <Link to="/login">
              <button type="button">Sign in with Google</button>
            </Link>
          </p>
          <p>
            <strong>Permissions Notice:</strong> Signing in with Google authorizes EasyNaukri to verify your identity (<code>openid</code>, <code>email</code>, <code>profile</code>) and grants send-only access (<code>https://www.googleapis.com/auth/gmail.send</code>) strictly for dispatching your job application outreach emails.
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
