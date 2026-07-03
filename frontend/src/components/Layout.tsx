import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import DashboardSidebar from "../features/dashboard/components/DashboardSidebar";
import WalkthroughTour from "./WalkthroughTour";
import FeedbackModal from "../features/profile/components/FeedbackModal";
import { feedbackService } from "../features/profile/services/feedbackService";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) return;

    // Check if feedback is snoozed
    const snoozedUntil = localStorage.getItem("feedback_snoozed_until");
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
      return;
    }

    const checkFeedbackStatus = async () => {
      try {
        const status = await feedbackService.getFeedbackStatus();
        if (status.showPopup) {
          setShowFeedbackModal(true);
        }
      } catch (err) {
        console.error("Failed to check feedback status", err);
      }
    };

    // Delay check for better UX after layout settles
    const timer = setTimeout(() => {
      checkFeedbackStatus();
    }, 2500);

    return () => clearTimeout(timer);
  }, [userStr]);

  // Hide the back button on primary dashboards to avoid redundant navigation
  const isDashboard = ["/candidate-dashboard", "/recruiter-dashboard", "/company-dashboard"].includes(location.pathname);

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
        navigate("/candidate-dashboard");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-color text-base-text font-sans">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      {user && <WalkthroughTour />}
      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
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
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-full overflow-y-auto mt-4">
              <DashboardSidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-grow flex w-full mx-auto">
        {/* Desktop Persistent Sidebar (hidden on mobile) */}
        {user && (
          <div className="hidden lg:block sticky top-16 h-[calc(100vh-64px)] shrink-0">
            <DashboardSidebar />
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-1 min-w-0 flex flex-col py-8 px-4 sm:px-6 lg:px-8 xl:px-12">
          {!isDashboard && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors gap-1.5 focus:outline-none"
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
