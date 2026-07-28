import React from "react";
import { Link } from "react-router-dom";

export const LandingPage: React.FC = () => {
  return (
    <div style={{ padding: "24px 16px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "900px", margin: "0 auto", lineHeight: "1.6", color: "#111827", backgroundColor: "#ffffff" }}>
      
      {/* Header Bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "900", margin: "0", color: "#4f46e5" }}>EasyNaukri</h1>
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0", color: "#4b5563" }}>
            Automated Job Application & Resume Matching Platform
          </h2>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "16px", alignItems: "center" }}>
          <Link to="/privacy" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: "#4f46e5", fontWeight: "600", textDecoration: "none", fontSize: "14px" }}>Terms of Service</Link>
          <Link to="/login" style={{ padding: "8px 16px", backgroundColor: "#4f46e5", color: "#ffffff", fontWeight: "bold", textDecoration: "none", borderRadius: "6px", fontSize: "14px" }}>Sign In</Link>
        </div>
      </header>

      <main>
        {/* Purpose Section */}
        <section style={{ marginBottom: "24px", backgroundColor: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "0" }}>Application Functionality & Purpose</h3>
          <p style={{ margin: "0" }}>
            EasyNaukri is an AI-powered career assistant designed to simplify the job search process for candidates. EasyNaukri helps job seekers match their resumes with job descriptions, optimize ATS keywords, track job application pipelines, and manage candidate-initiated recruiter outreach.
          </p>
        </section>

        {/* Product Screenshot Mockup (Resolves Issue #1) */}
        <section style={{ marginBottom: "32px", textAlign: "center" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px", textAlign: "left" }}>Product Interface & Dashboard Overview</h3>
          <p style={{ fontSize: "14px", color: "#4b5563", textAlign: "left", marginBottom: "16px" }}>
            Below is an illustrative preview of the EasyNaukri candidate dashboard, showing ATS matching scores, application pipeline queues, and recruiter email outreach management:
          </p>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <img 
              src="/dashboard_mockup.png" 
              alt="EasyNaukri Application Dashboard Interface Mockup" 
              style={{ width: "100%", height: "auto", display: "block" }} 
            />
          </div>
        </section>

        {/* Scopes Section */}
        <section style={{ marginBottom: "32px", backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "8px", border: "1px solid #dcfce7" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "0", color: "#166534" }}>Google OAuth Permissions & Scopes Used</h3>
          <ul style={{ paddingLeft: "20px", margin: "0" }}>
            <li style={{ marginBottom: "12px" }}>
              <strong>1. Basic Authentication Scopes (openid, email, profile):</strong> To verify user identity, sign in to your EasyNaukri account, create your candidate profile, and save job preferences securely.
            </li>
            <li>
              <strong>2. Gmail Send Scope (https://www.googleapis.com/auth/gmail.send):</strong> EasyNaukri requests send-only access specifically so job seekers can compose, review, and send personalized job application & recruiter outreach emails directly from their connected Gmail account. EasyNaukri never reads, accesses, modifies, or deletes non-outreach inbox emails.
            </li>
          </ul>
        </section>

        {/* Google Sign In CTA Section */}
        <section style={{ marginBottom: "32px", padding: "24px", border: "2px solid #4f46e5", borderRadius: "12px", textAlign: "center", backgroundColor: "#faf5ff" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "0" }}>Sign In & Access Account</h3>
          <p style={{ margin: "16px 0" }}>
            <Link to="/login" style={{ display: "inline-block", padding: "12px 28px", backgroundColor: "#4f46e5", color: "#ffffff", fontWeight: "bold", textDecoration: "none", borderRadius: "8px", fontSize: "16px" }}>
              Sign in with Google
            </Link>
          </p>
          <p style={{ fontSize: "14px", color: "#4b5563", margin: "0", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
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

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", fontSize: "14px", color: "#6b7280", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ margin: "0" }}>© {new Date().getFullYear()} <strong>EasyNaukri</strong>. All rights reserved.</p>
          <p style={{ margin: "4px 0 0 0" }}>Contact: <a href="mailto:support@easynaukri.online" style={{ color: "#4f46e5" }}>support@easynaukri.online</a></p>
        </div>
        <div>
          <Link to="/privacy" style={{ color: "#4f46e5", fontWeight: "600" }}>Privacy Policy</Link> | <Link to="/terms" style={{ color: "#4f46e5", fontWeight: "600" }}>Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
