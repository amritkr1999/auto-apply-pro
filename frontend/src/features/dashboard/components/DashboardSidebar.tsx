import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// --- SVG Icons Components ---
const OverviewIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const GovtIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6M9 7h1m-1 4h1m4-4h1m-1 4h1" />
  </svg>
);

const ApplicationsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SavedJobsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const ParseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HarvesterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TemplatesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const OutreachIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ProfileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BillingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CandidatesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ListingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const RecruitersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface DashboardSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

import { useAuth } from "../../../context/AuthContext";
import ReferralProgramModal from "../../referral_program/components/ReferralProgramModal";

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isMobile = false, onClose, onLogout }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const role = user?.role || "CANDIDATE";

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      if (onClose) onClose();
      navigate("/");
    }
  };

  const getOverviewPath = () => {
    switch (role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/dashboard";
    }
  };

  const minimizedState = isMobile ? false : isMinimized;
  const iconClass = minimizedState ? "w-5 h-5 shrink-0" : "w-5 h-5 mr-3 shrink-0";

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `relative group flex items-center ${minimizedState ? "justify-center px-2" : "px-3"} py-2.5 text-sm font-medium rounded-btn transition-all duration-150 ${
      isActive
        ? "bg-slate-100 dark:bg-slate-800 text-primary border-l-4 border-primary pl-2"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
    }`;

  const anchorStyle = `relative group flex items-center ${minimizedState ? "justify-center px-2" : "px-3"} py-2.5 text-sm font-medium rounded-btn text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-all duration-150`;

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const SidebarTooltip: React.FC<{ label: string }> = ({ label }) => {
    if (!minimizedState) return null;
    return (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-slate-100 text-xs font-medium tracking-wide rounded-lg shadow-xl border border-slate-700/50 dark:border-slate-700/60 whitespace-nowrap opacity-0 scale-95 translate-x-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-150 ease-out pointer-events-none z-[100] flex items-center">
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900/95 dark:bg-slate-800/95 border-l border-b border-slate-700/50 dark:border-slate-700/60 rotate-45" />
        <span className="relative z-10">{label}</span>
      </div>
    );
  };

  return (
    <aside
      data-tour="sidebar-nav"
      className={`${
      isMobile 
        ? "w-full h-full" 
        : minimizedState ? "w-[72px] overflow-visible" : "w-[240px] overflow-y-auto"
    } shrink-0 p-4 ${
      isMobile ? "" : "border-r border-slate-200 dark:border-slate-800 h-full"
    } bg-white dark:bg-slate-900 flex flex-col justify-between transition-all duration-300`}>
      <div className="flex-1 overflow-visible">
        {/* Sidebar Toggle & Header */}
        <div className={`flex items-center ${minimizedState ? "justify-center" : "justify-between"} mb-6`}>
          {!minimizedState && (
            <div className="flex items-center gap-2">
              <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="w-6 h-6 rounded-md object-contain shadow-xs select-none shrink-0" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Menu ({role.toLowerCase()})
              </h3>
            </div>
          )}
          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="relative group p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {minimizedState ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                </svg>
              )}
              <SidebarTooltip label={minimizedState ? "Expand Sidebar" : "Minimize Sidebar"} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 overflow-visible">
          <NavLink to={getOverviewPath()} className={linkStyle} end onClick={handleLinkClick}>
            <OverviewIcon className={iconClass} />
            {!minimizedState && <span>Overview</span>}
            <SidebarTooltip label="Overview" />
          </NavLink>

          {role === "CANDIDATE" && (
            <>
              <NavLink to="/opportunities/tracker" className={linkStyle} onClick={handleLinkClick}>
                <ApplicationsIcon className={iconClass} />
                {!minimizedState && <span>Opportunity Tracker</span>}
                <SidebarTooltip label="Opportunity Tracker" />
              </NavLink>
              <NavLink to="/sarkari-naukri" className={linkStyle} onClick={handleLinkClick}>
                <GovtIcon className={iconClass} />
                {!minimizedState && (
                  <span className="flex items-center justify-between w-full">
                    <span>Sarkari Naukri</span>
                    <span className="bg-amber-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">Soon</span>
                  </span>
                )}
                <SidebarTooltip label="Sarkari Naukri (Coming Soon)" />
              </NavLink>
              <a href="#saved" className={anchorStyle} onClick={handleLinkClick}>
                <SavedJobsIcon className={iconClass} />
                {!minimizedState && <span>Saved Jobs</span>}
                <SidebarTooltip label="Saved Jobs" />
              </a>
              <NavLink to="/opportunities/import" className={linkStyle} onClick={handleLinkClick}>
                <ParseIcon className={iconClass} />
                {!minimizedState && <span>AI Job Parser</span>}
                <SidebarTooltip label="AI Job Parser" />
              </NavLink>
              <NavLink to="/opportunities/harvester" className={linkStyle} onClick={handleLinkClick}>
                <HarvesterIcon className={iconClass} />
                {!minimizedState && <span>HR Harvester</span>}
                <SidebarTooltip label="HR Harvester" />
              </NavLink>
              <NavLink to="/outreach/templates" className={linkStyle} onClick={handleLinkClick}>
                <TemplatesIcon className={iconClass} />
                {!minimizedState && <span>Email Templates</span>}
                <SidebarTooltip label="Email Templates" />
              </NavLink>
              <NavLink to="/outreach/draft" className={linkStyle} onClick={handleLinkClick}>
                <OutreachIcon className={iconClass} />
                {!minimizedState && <span>Draft Outreach</span>}
                <SidebarTooltip label="Draft Outreach" />
              </NavLink>
              <NavLink to="/billing/portal" className={linkStyle} onClick={handleLinkClick}>
                <BillingIcon className={iconClass} />
                {!minimizedState && <span>Billing</span>}
                <SidebarTooltip label="Billing" />
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  setIsReferralModalOpen(true);
                  if (handleLinkClick) handleLinkClick();
                }}
                className={anchorStyle}
              >
                <span className="text-lg leading-none shrink-0">🎁</span>
                {!minimizedState && (
                  <span className="flex items-center justify-between w-full ml-3">
                    <span>Refer & Earn</span>
                    <span className="bg-amber-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">Soon</span>
                  </span>
                )}
                <SidebarTooltip label="Refer & Earn (Coming Soon)" />
              </button>
            </>
          )}

          {role === "RECRUITER" && (
            <>
              <a href="#outreach" className={anchorStyle} onClick={handleLinkClick}>
                <OutreachIcon className={iconClass} />
                {!minimizedState && <span>Outreach</span>}
                <SidebarTooltip label="Outreach" />
              </a>
              <a href="#candidates" className={anchorStyle} onClick={handleLinkClick}>
                <CandidatesIcon className={iconClass} />
                {!minimizedState && <span>Candidates</span>}
                <SidebarTooltip label="Candidates" />
              </a>
            </>
          )}

          {role === "COMPANY" && (
            <>
              <a href="#jobs" className={anchorStyle} onClick={handleLinkClick}>
                <ListingsIcon className={iconClass} />
                {!minimizedState && <span>Job Listings</span>}
                <SidebarTooltip label="Job Listings" />
              </a>
              <a href="#recruiters" className={anchorStyle} onClick={handleLinkClick}>
                <RecruitersIcon className={iconClass} />
                {!minimizedState && <span>Recruiters</span>}
                <SidebarTooltip label="Recruiters" />
              </a>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <NavLink to="/admin/telemetry" className={linkStyle} onClick={handleLinkClick}>
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {!minimizedState && <span>AI Telemetry</span>}
                <SidebarTooltip label="AI Telemetry" />
              </NavLink>
            </>
          )}

          <NavLink to="/profile/settings" data-tour="sidebar-profile" className={linkStyle} onClick={handleLinkClick}>
            <ProfileIcon className={iconClass} />
            {!minimizedState && <span>Profile Settings</span>}
            <SidebarTooltip label="Profile Settings" />
          </NavLink>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className={`relative group flex items-center justify-center ${minimizedState ? "w-10 h-10 p-0" : "w-full py-2.5 px-4"} rounded-btn border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors text-sm mx-auto`}
        >
          <LogoutIcon className="w-5 h-5 shrink-0" />
          {!minimizedState && <span className="ml-2">Logout</span>}
          <SidebarTooltip label="Logout" />
        </button>
      </div>

      {user?.id && (
        <ReferralProgramModal
          userId={user.id}
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
        />
      )}
    </aside>
  );
};

export default DashboardSidebar;
