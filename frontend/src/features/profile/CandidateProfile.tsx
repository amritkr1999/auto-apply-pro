import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateProfileView from "./components/CandidateProfileView";
import RecruiterProfileView from "./components/RecruiterProfileView";
import CompanyProfileView from "./components/CompanyProfileView";

export const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  // Provide a mock user fallback for development phase to keep screens open
  const user = userStr ? JSON.parse(userStr) : { id: 1, name: "Guest Developer", role: "CANDIDATE", email: "guest@example.com", mobile: "1234567890", token: "" };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setErrorMsg("Email address does not match your account email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/v1/profiles/delete-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token || ""}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit deletion request.");
      }

      // Success: Log out the user and clear storage
      localStorage.removeItem("user");
      setIsModalOpen(false);
      alert("Your account deletion request has been submitted. You will be logged out. You have 14 days to cancel this request by logging in again.");
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto w-full space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information, roles, and preferences</p>
      </div>

      <div className="bg-white rounded-card shadow-sm border border-slate-200 p-8">
        {renderProfileView()}
      </div>

      {/* Guided Tour Section */}
      <div className="bg-amber-50/50 rounded-card shadow-sm border border-amber-200/60 p-8">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100/80 text-amber-700 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Guided App Tour</h2>
            <p className="text-sm text-slate-600 mt-1">
              Need a refresher on how the dashboard and automation features work? You can restart the onboarding tour anytime.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(`walkthrough_completed_${user.id}`);
                const dashboardPath = user.role === "RECRUITER" 
                  ? "/recruiter-dashboard" 
                  : user.role === "COMPANY" 
                    ? "/company-dashboard" 
                    : "/candidate-dashboard";
                navigate(dashboardPath);
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("start-walkthrough"));
                }, 100);
              }}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-btn transition-colors shadow-sm cursor-pointer"
            >
              Start Guided Tour
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone - GDPR/CCPA Compliant Deletion */}
      <div className="bg-rose-50 rounded-card shadow-sm border border-rose-200 p-8">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-rose-800">Danger Zone</h2>
            <p className="text-sm text-rose-700 mt-1">
              Request permanent deletion of your account and all associated data in accordance with privacy rights (GDPR Art. 17 / CCPA / DPDP).
            </p>
            <p className="text-xs text-rose-500 mt-2">
              Your data will be immediately hidden, and permanently anonymized/purged after a 14-day grace period. You can restore your account at any time within this period.
            </p>
            <button
              type="button"
              onClick={() => {
                setConfirmEmail("");
                setErrorMsg("");
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-btn transition-colors shadow-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <svg className="w-6 h-6 text-rose-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm Account Deletion
              </h3>

              <div className="mt-4 text-sm text-slate-600 space-y-3">
                <p>
                  You are initiating a request to permanently delete your Auto-Apply Pro account.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1.5">
                  <p className="font-semibold text-slate-700">What will happen to my data?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Your resumes and job application history will be permanently deleted.</li>
                    <li>Google OAuth tokens and credentials will be immediately revoked.</li>
                    <li>Outreach drafts and email logs will be purged.</li>
                    <li>All personal profile details will be permanently anonymized.</li>
                  </ul>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  You have a 14-day grace period to cancel this request by logging back in.
                </p>
              </div>

              <form onSubmit={handleDeleteRequest} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="confirm-email-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    To confirm, type your email address: <span className="text-slate-800 font-mono select-all font-bold">{user.email}</span>
                  </label>
                  <input
                    id="confirm-email-input"
                    type="email"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Type your email address"
                    className="w-full px-3 py-2 border border-slate-300 rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-600 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-medium text-sm rounded-btn hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-btn transition-colors disabled:opacity-50 flex items-center shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Requesting...
                      </>
                    ) : (
                      "Confirm Deletion"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CandidateProfile;
