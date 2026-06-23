import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || "CANDIDATE";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getOverviewPath = () => {
    switch (role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/candidate-dashboard";
    }
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2.5 text-sm font-medium rounded-btn transition-all duration-150 ${
      isActive
        ? "bg-slate-100 text-primary border-l-4 border-primary pl-2"
        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
    }`;

  const anchorStyle = "flex items-center px-3 py-2.5 text-sm font-medium rounded-btn text-slate-600 hover:bg-slate-50 hover:text-primary transition-all duration-150";

  return (
    <aside className="w-[240px] shrink-0 p-4 border-r border-slate-200 bg-white flex flex-col justify-between min-h-[calc(100vh-64px)]">
      <div className="flex-1">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-3">
          Menu ({role.toLowerCase()})
        </h3>
        <nav className="space-y-1">
          <NavLink to={getOverviewPath()} className={linkStyle} end>
            Overview
          </NavLink>

          {role === "CANDIDATE" && (
            <>
              <a href="#applications" className={anchorStyle}>
                Applications
              </a>
              <a href="#saved" className={anchorStyle}>
                Saved Jobs
              </a>
              <NavLink to="/jobs/parse" className={linkStyle}>
                Parse Screenshot
              </NavLink>
              <NavLink to="/outreach/templates" className={linkStyle}>
                Email Templates
              </NavLink>
              <NavLink to="/outreach/draft" className={linkStyle}>
                Draft Outreach
              </NavLink>
            </>
          )}

          {role === "RECRUITER" && (
            <>
              <a href="#outreach" className={anchorStyle}>
                Outreach
              </a>
              <a href="#candidates" className={anchorStyle}>
                Candidates
              </a>
            </>
          )}

          {role === "COMPANY" && (
            <>
              <a href="#jobs" className={anchorStyle}>
                Job Listings
              </a>
              <a href="#recruiters" className={anchorStyle}>
                Recruiters
              </a>
            </>
          )}

          <NavLink to="/candidate/profile" className={linkStyle}>
            Profile Settings
          </NavLink>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-4 rounded-btn border border-rose-200 bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
