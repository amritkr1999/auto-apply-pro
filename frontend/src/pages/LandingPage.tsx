import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6", color: "#111827", backgroundColor: "#ffffff" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", margin: "0 0 8px 0" }}>EasyNaukri</h1>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: "#4b5563" }}>
          Automated Job Application & Resume Matching Platform
        </h2>
      </header>

      <main>
        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Application Purpose</h3>
          <p>
            EasyNaukri is an AI-powered career assistant designed to simplify the job search process for candidates. EasyNaukri helps job seekers match their resumes with job descriptions, optimize ATS keywords, track job application pipelines, and send candidate-initiated job application outreach emails to recruiters.
          </p>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Google OAuth Permissions & Scopes Used</h3>
          <ul>
            <li style={{ marginBottom: "12px" }}>
              <strong>1. Basic Authentication Scopes (openid, email, profile):</strong> To verify user identity, sign in to your EasyNaukri account, create your candidate profile, and save job preferences securely.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong>2. Gmail Send Scope (https://www.googleapis.com/auth/gmail.send):</strong> EasyNaukri requests send-only access to the Gmail API specifically so job seekers can compose, review, and send personalized job application & recruiter outreach emails directly from their connected Gmail account. EasyNaukri never reads, accesses, modifies, or deletes non-outreach inbox emails.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px", padding: "16px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "0" }}>Sign In with Google</h3>
          <p style={{ margin: "16px 0" }}>
            <Link to="/login" style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#4f46e5", color: "#ffffff", fontWeight: "bold", textDecoration: "none", borderRadius: "6px" }}>
              Sign in with Google
            </Link>
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563", margin: "0" }}>
            By signing in with Google, you authorize EasyNaukri to verify your identity (openid, email, profile) and use Gmail send permission (https://www.googleapis.com/auth/gmail.send) strictly to send user-authorized job application outreach emails. Review our{" "}
            <Link to="/privacy" style={{ color: "#4f46e5", fontWeight: "bold" }}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" style={{ color: "#4f46e5", fontWeight: "bold" }}>
              Terms of Service
            </Link>.
          </p>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", fontSize: "14px", color: "#6b7280" }}>
        <p>© {new Date().getFullYear()} EasyNaukri. All rights reserved.</p>
        <p>
          <Link to="/privacy" style={{ color: "#4f46e5" }}>Privacy Policy</Link> | <Link to="/terms" style={{ color: "#4f46e5" }}>Terms of Service</Link>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
