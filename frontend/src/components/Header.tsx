import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

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
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={getDashboardPath()} className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
            Auto Apply Pro
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to={getDashboardPath()} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/candidate/profile" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Profile
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {user.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
