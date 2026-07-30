import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import MobileAppComingSoonModal from "./MobileAppComingSoonModal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          {user && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to={getDashboardPath()} className="text-xl font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-2">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-sm font-extrabold">EN</span>
            <span>EasyNaukri</span>
          </Link>
          {user && (
            <nav className="hidden lg:flex items-center gap-6">
              <Link to={getDashboardPath()} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/profile/settings" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/learning" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                Learning Space
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowMobileAppModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm focus:outline-none cursor-pointer"
            title="Download Mobile App"
          >
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="hidden xs:inline">Download App</span>
            <span className="xs:hidden">App</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
            aria-label="Toggle dark mode"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user && (
            <>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(`walkthrough_completed_${user.id}`);
                  localStorage.removeItem(`last_tip_dismissed_date_${user.id}`);
                  window.dispatchEvent(new CustomEvent("start-walkthrough"));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:text-amber-800 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-semibold shadow-sm transition-all focus:outline-none cursor-pointer"
                title="Start Guided Tour"
              >
                <span>💡</span>
                <span className="hidden sm:inline">Guided Tour</span>
              </button>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </>
          )}
        </div>
      </div>
      {showMobileAppModal && (
        <MobileAppComingSoonModal onClose={() => setShowMobileAppModal(false)} />
      )}
    </header>
  );
};

export default Header;
