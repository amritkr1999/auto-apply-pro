import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button on primary dashboards to avoid redundant navigation
  const isDashboard = ["/candidate-dashboard", "/recruiter-dashboard", "/company-dashboard"].includes(location.pathname);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback based on user role if there is no history stack
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
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
      <Header />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
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
      <Footer />
    </div>
  );
};

export default Layout;
