import React from "react";
import { Link } from "react-router-dom";
import CandidateProfileView from "./components/CandidateProfileView";
import RecruiterProfileView from "./components/RecruiterProfileView";
import CompanyProfileView from "./components/CompanyProfileView";
import "./profile.css";

export const CandidateProfile: React.FC = () => {
  const userStr = localStorage.getItem("user");
  // Provide a mock user fallback for development phase to keep screens open
  const user = userStr ? JSON.parse(userStr) : { id: 1, name: "Guest Developer", role: "CANDIDATE", email: "guest@example.com", mobile: "1234567890" };

  if (false && !user) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#cbd5e1" }}>
        <h2>Session Expired</h2>
        <p>Please log in to manage your profile settings.</p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 15,
            padding: "8px 16px",
            background: "#4f46e5",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Back to Login
        </Link>
      </div>
    );
  }

  const renderProfileView = () => {
    switch (user.role) {
      case "RECRUITER":
        return <RecruiterProfileView userId={user.id} />;
      case "COMPANY":
        return <CompanyProfileView userId={user.id} />;
      default:
        return <CandidateProfileView userId={user.id} />;
    }
  };

  return (
    <section className="profile-root">
      <div className="profile-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>My Profile Settings</h1>
          <p className="muted">Manage your personal information, roles and credentials</p>
        </div>
      </div>

      <div
        className="profile-container"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        {renderProfileView()}
      </div>
    </section>
  );
};

export default CandidateProfile;
