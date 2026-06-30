import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
        return "/candidate-dashboard";
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          {user && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to={getDashboardPath()} className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
            Auto Apply Pro
          </Link>
          {user && (
            <nav className="hidden lg:flex items-center gap-6">
              <Link to={getDashboardPath()} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/candidate/profile" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Profile
              </Link>
              <Link to="/learning" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Learning Space
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
