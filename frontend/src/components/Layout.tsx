import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import TrialCountdownBanner from "./TrialCountdownBanner";
import DashboardSidebar from "../features/dashboard/components/DashboardSidebar";
import WalkthroughTour from "./WalkthroughTour";
import FeedbackModal from "../features/profile/components/FeedbackModal";
import { feedbackService } from "../features/profile/services/feedbackService";

import { useAuth } from "../context/AuthContext";

import NetworkStatusNotifier from "./NetworkStatusNotifier";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const performLogout = () => {
    logout();
    setShowFeedbackModal(false);
    navigate("/");
  };

  const handleLogoutRequest = async () => {
    if (!user) {
      performLogout();
      return;
    }

    // Check if user has opted out of feedback
    const feedbackOptOut = localStorage.getItem("feedback_opt_out");
    if (feedbackOptOut === "true") {
      performLogout();
      return;
    }

    try {
      const status = await feedbackService.getFeedbackStatus();
      if (status.showPopup) {
        setShowFeedbackModal(true);
      } else {
        performLogout();
      }
    } catch (err) {
      console.error("Failed to check feedback status, logging out", err);
      performLogout();
    }
  };

  // Hide the back button on primary dashboards to avoid redundant navigation
  const isDashboard = ["/dashboard", "/recruiter-dashboard", "/company-dashboard"].includes(location.pathname);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback based on user role if there is no history stack
      if (user?.role === "RECRUITER") {
        navigate("/recruiter-dashboard");
      } else if (user?.role === "COMPANY") {
        navigate("/company-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-color dark:bg-slate-950 text-base-text dark:text-slate-100 font-sans transition-colors">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <TrialCountdownBanner />
      <NetworkStatusNotifier />
      {user && <WalkthroughTour />}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onLogout={performLogout}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && user && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 pt-5 pb-4 animate-in slide-in-from-left duration-300 border-r border-slate-200 dark:border-slate-800">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-full overflow-y-auto mt-4">
              <DashboardSidebar
                isMobile
                onClose={() => setMobileMenuOpen(false)}
                onLogout={handleLogoutRequest}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-grow flex w-full mx-auto">
        {/* Desktop Persistent Sidebar (hidden on mobile) */}
        {user && (
          <div className="hidden lg:block sticky top-16 h-[calc(100vh-64px)] shrink-0 z-30">
            <DashboardSidebar onLogout={handleLogoutRequest} />
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-1 min-w-0 flex flex-col py-8 px-4 sm:px-6 lg:px-8 xl:px-12">
          {!isDashboard && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors gap-1.5 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
