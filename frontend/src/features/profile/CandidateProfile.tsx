import React from "react";
import CandidateProfileView from "./components/CandidateProfileView";
import RecruiterProfileView from "./components/RecruiterProfileView";
import CompanyProfileView from "./components/CompanyProfileView";

export const CandidateProfile: React.FC = () => {
  const userStr = localStorage.getItem("user");
  // Provide a mock user fallback for development phase to keep screens open
  const user = userStr ? JSON.parse(userStr) : { id: 1, name: "Guest Developer", role: "CANDIDATE", email: "guest@example.com", mobile: "1234567890" };

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
    <section className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information, roles, and preferences</p>
      </div>

      <div className="bg-white rounded-card shadow-sm border border-slate-200 p-8">
        {renderProfileView()}
      </div>
    </section>
  );
};

export default CandidateProfile;
