import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfessionalProfileView from "./components/ProfessionalProfileView";
import RecruiterProfileView from "./components/RecruiterProfileView";
import CompanyProfileView from "./components/CompanyProfileView";
import { feedbackService } from "./services/feedbackService";
import { profileService } from "./services/profileService";

export const ProfessionalProfile: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  // Provide a mock user fallback for development phase to keep screens open
  const user = userStr ? JSON.parse(userStr) : { id: 1, name: "Guest Developer", role: "CANDIDATE", email: "guest@example.com", mobile: "1234567890", token: "", avatar: "" };

  const [profileName, setProfileName] = useState(user.name);
  const [profileAvatar, setProfileAvatar] = useState(user.avatar || "");

  const [activeTab, setActiveTab] = useState("profile");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>("");

  useEffect(() => {
    // If the role has changed or details update in localStorage, sync them
    const handleStorageChange = () => {
      const updatedUserStr = localStorage.getItem("user");
      if (updatedUserStr) {
        const u = JSON.parse(updatedUserStr);
        setProfileName(u.name);
        setProfileAvatar(u.avatar || "");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleProfileUpdate = (name: string, avatar: string) => {
    setProfileName(name);
    setProfileAvatar(avatar);
    const updatedUserStr = localStorage.getItem("user");
    if (updatedUserStr) {
      const u = JSON.parse(updatedUserStr);
      u.name = name;
      u.avatar = avatar;
      localStorage.setItem("user", JSON.stringify(u));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfileAvatar(base64String);

      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.avatar = base64String;
        localStorage.setItem("user", JSON.stringify(u));
      }

      // Save to backend immediately
      try {
        if (user.role === "RECRUITER") {
          const current = await profileService.getRecruiterProfile(user.id);
          await profileService.updateRecruiterProfile(user.id, { ...current, avatar: base64String });
        } else if (user.role === "COMPANY") {
          const current = await profileService.getCompanyProfile(user.id);
          await profileService.updateCompanyProfile(user.id, { ...current, avatar: base64String });
        } else {
          const current = await profileService.getCandidateProfile(user.id);
          await profileService.updateCandidateProfile(user.id, { ...current, avatar: base64String });
        }
        // Dispatch custom storage event for header/sidebar updates
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Failed to save avatar photo", err);
        alert("Failed to save profile photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) {
      setFeedbackError("Please select a rating of at least 1 star.");
      return;
    }
    if (!feedbackComment.trim()) {
      setFeedbackError("Please write a short comment about your experience.");
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError("");
    setFeedbackSuccess(false);

    try {
      await feedbackService.submitFeedback(feedbackRating, feedbackComment);
      setFeedbackSuccess(true);
      setFeedbackComment("");
      setFeedbackRating(0);
      localStorage.removeItem("feedback_snoozed_until");
    } catch (err: any) {
      setFeedbackError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
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

  const renderProfileView = () => {
    switch (user.role) {
      case "RECRUITER":
        return <RecruiterProfileView userId={user.id} onProfileUpdate={handleProfileUpdate} />;
      case "COMPANY":
        return <CompanyProfileView userId={user.id} onProfileUpdate={handleProfileUpdate} />;
      default:
        return (
          <ProfessionalProfileView 
            userId={user.id} 
            activeTab={activeTab} 
            onProfileUpdate={handleProfileUpdate} 
          />
        );
    }
  };

  const renderTabContent = () => {
    if (activeTab === "account") {
      return (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Account Preferences</h2>
            <p className="text-sm text-slate-500 mt-1">Manage platform settings, guide tour reminders, and data deletion requests.</p>
          </div>

          {/* Guided Tour Section */}
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-6 sm:p-8 transition-all hover:shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-amber-100/80 text-amber-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Guided App Tour</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Need a refresher on how the dashboard and automation features work? You can restart the onboarding tour anytime.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(`walkthrough_completed_${user.id}`);
                    localStorage.removeItem(`last_tip_dismissed_date_${user.id}`);
                    const dashboardPath = user.role === "RECRUITER" 
                      ? "/recruiter-dashboard" 
                      : user.role === "COMPANY" 
                        ? "/company-dashboard" 
                        : "/dashboard";
                    navigate(dashboardPath);
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("start-walkthrough"));
                    }, 100);
                  }}
                  className="mt-4 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
                >
                  Start Guided Tour
                </button>
              </div>
            </div>
          </div>

          {/* Share Your Feedback Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 transition-all hover:shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.3c-.77-.57-.372-1.81.587-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Share Your Feedback</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your feedback helps us improve EasyNaukri. Share your rating and review with us.
                </p>

                <form onSubmit={handleFeedbackSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Select Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setFeedbackHoverRating(star)}
                          onMouseLeave={() => setFeedbackHoverRating(0)}
                          className="text-2xl focus:outline-none transition-transform hover:scale-120 cursor-pointer"
                        >
                          <span
                            className={
                              star <= (feedbackHoverRating || feedbackRating)
                                ? "text-amber-400"
                                : "text-slate-200"
                            }
                          >
                            ★
                          </span>
                        </button>
                      ))}
                      {feedbackRating > 0 && (
                        <span className="text-xs font-bold text-slate-500 ml-2">
                          {feedbackRating === 5 ? "Excellent!" : feedbackRating === 4 ? "Very Good!" : feedbackRating === 3 ? "Good" : feedbackRating === 2 ? "Fair" : "Poor"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="feedback-comment" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Review Comment
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="What has been your experience using the platform? Any suggestions for improvement?"
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50 resize-none"
                    />
                  </div>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-600 rounded-xl font-medium">
                      Thank you! Your feedback has been submitted successfully.
                    </div>
                  )}

                  {feedbackError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-600 rounded-xl font-medium">
                      {feedbackError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50 flex items-center active:scale-95"
                  >
                    {feedbackSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Danger Zone - GDPR/CCPA Compliant Deletion */}
          <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 sm:p-8 transition-all hover:shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-rose-800">Danger Zone</h3>
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
                  className="mt-4 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return renderProfileView();
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Account & Profile Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your credentials, professional history, and automation parameters.</p>
        </div>
        {user.loginStreak > 0 && (
          <div className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 rounded-2xl shadow-sm text-orange-700">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-bold tracking-tight">
              {user.loginStreak} Day Streak!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card and Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Gradient Banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="px-6 pb-6 text-center relative">
              {/* Profile Photo */}
              <div className="w-28 h-28 border-4 border-white bg-slate-100 shadow-md rounded-full -mt-14 mx-auto relative group overflow-hidden flex items-center justify-center">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={profileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center text-primary text-2xl font-extrabold">
                    {getInitials(profileName)}
                  </div>
                )}
                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white text-[11px] font-bold cursor-pointer">
                  <svg className="w-5 h-5 mb-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Identity Details */}
              <h2 className="text-xl font-bold text-slate-800 mt-4 truncate">{profileName}</h2>
              <span className="inline-flex items-center px-3 py-1 mt-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
                {user.role}
              </span>
              <p className="text-xs text-slate-400 mt-2 truncate font-medium">{user.email}</p>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Settings Menu</h3>
            
            {user.role === "CANDIDATE" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 border-r-0"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <span className="mr-3 text-lg">👤</span>
                  Professional Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "preferences"
                      ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 border-r-0"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <span className="mr-3 text-lg">📄</span>
                  Preferences & Resume
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("scheduling")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "scheduling"
                      ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 border-r-0"
                      : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <span className="mr-3 text-lg">⚙️</span>
                  Outreach & Scheduling
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 border-r-0"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <span className="mr-3 text-lg">👤</span>
                Profile Details
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "account"
                  ? "bg-primary/5 text-primary border-l-4 border-primary pl-3 border-r-0"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <span className="mr-3 text-lg">🔒</span>
              Account & Feedback
            </button>
          </div>
        </div>

        {/* Right Column: Active Tab Content */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 transition-all hover:shadow-md min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <svg className="w-6 h-6 text-rose-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm Account Deletion
              </h3>

              <div className="mt-4 text-sm text-slate-600 space-y-3">
                <p>
                  You are initiating a request to permanently delete your EasyNaukri account.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1.5">
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
                  <label htmlFor="confirm-email-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    To confirm, type your email address: <span className="text-slate-800 font-mono select-all font-bold">{user.email}</span>
                  </label>
                  <input
                    id="confirm-email-input"
                    type="email"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Type your email address"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-600 rounded-xl font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center shadow-sm cursor-pointer active:scale-95"
                  >
                    {isSubmitting ? "Requesting..." : "Confirm Deletion"}
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

export default ProfessionalProfile;
