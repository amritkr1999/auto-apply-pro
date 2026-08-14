import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MobileAppComingSoonModal from "./MobileAppComingSoonModal";
import { DarkModeToggle } from "./DarkModeToggle";
import { getActiveSubscription, getMyUpiPaymentStatus } from "../features/billing/services/billingService";

interface HeaderProps {
  onMenuClick?: () => void;
}

export type UserTier = "Free" | "Starter" | "Pro" | "Autopilot";

import { useAuth } from "../context/AuthContext";

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>("Free");

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchTier = async () => {
      try {
        const sub = await getActiveSubscription();
        if (sub && (sub.status === "active" || sub.status === "authenticated")) {
          const name = (sub.planName || "").toLowerCase();
          if (name.includes("starter")) {
            setUserTier("Starter");
            return;
          }
          if (name.includes("autopilot") || name.includes("elite")) {
            setUserTier("Autopilot");
            return;
          }
          if (name.includes("pro")) {
            setUserTier("Pro");
            return;
          }
          setUserTier("Pro");
          return;
        }

        const upi = await getMyUpiPaymentStatus().catch(() => null);
        if (upi && (upi.isPremium || upi.role === "PRO" || upi.role === "PREMIUM")) {
          const amt = upi.latestTransaction?.amount || 99;
          if (amt <= 70) {
            setUserTier("Starter");
          } else if (amt > 120) {
            setUserTier("Autopilot");
          } else {
            setUserTier("Pro");
          }
          return;
        }
      } catch (err) {
        console.error("Error detecting user tier:", err);
      }
      setUserTier("Free");
    };

    fetchTier();
  }, [user]);

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

  const renderTierBadge = () => {
    if (user?.isTrialActive) {
      return (
        <Link
          to="/billing"
          className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 dark:from-amber-950/60 dark:to-orange-950/60 border border-amber-500/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider hover:scale-105 transition-all shadow-xs"
          title="15-Day Elite Autopilot Trial Active - Click to view details"
        >
          <span>🚀</span>
          <span>TRIAL ({user.trialDaysRemaining ?? 15}D LEFT)</span>
        </Link>
      );
    }

    if (user?.role && user.role !== "CANDIDATE") {
      return (
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {user.role}
        </span>
      );
    }

    switch (userTier) {
      case "Starter":
        return (
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider hover:bg-emerald-500/20 transition-all shadow-xs"
            title="Starter Plan Active - Click to open Billing Portal"
          >
            <span>⚡</span>
            <span>STARTER</span>
          </Link>
        );
      case "Pro":
        return (
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-950/50 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider hover:bg-indigo-500/20 transition-all shadow-xs"
            title="Candidate Pro Tier - Click to open Billing Portal"
          >
            <span>👑</span>
            <span>PRO</span>
          </Link>
        );
      case "Autopilot":
        return (
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-500/15 to-orange-500/15 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider hover:from-amber-500/25 hover:to-orange-500/25 transition-all shadow-xs"
            title="Elite Autopilot Tier - Click to open Billing Portal"
          >
            <span>🚀</span>
            <span>AUTOPILOT</span>
          </Link>
        );
      case "Free":
      default:
        return (
          <Link
            to="/billing"
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs"
            title="Free Tier - Click to open Billing Portal"
          >
            <span>FREE</span>
          </Link>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-6 shrink-0 min-w-0">
          {user && onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none shrink-0"
              aria-label="Open sidebar menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to={getDashboardPath()} className="hover:opacity-90 transition-opacity flex items-center gap-2.5 shrink-0" aria-label="EasyNaukri Home">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="h-9 w-9 rounded-xl object-contain shadow-xs select-none" />
            <span className="hidden sm:inline-block font-extrabold text-xl tracking-tight text-slate-900 dark:text-white select-none whitespace-nowrap">EasyNaukri</span>
          </Link>
          {user && (
            <nav className="hidden lg:flex items-center gap-6 whitespace-nowrap shrink-0">
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
        
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setShowMobileAppModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs focus:outline-none cursor-pointer"
            title="Download Mobile App"
          >
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="hidden md:inline">Download App</span>
          </button>

          <DarkModeToggle tooltipPosition="bottom" />

          {user && (
            <>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(`walkthrough_completed_${user.id}`);
                  localStorage.removeItem(`last_tip_dismissed_date_${user.id}`);
                  window.dispatchEvent(new CustomEvent("start-walkthrough"));
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:text-amber-800 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-semibold shadow-xs transition-all focus:outline-none cursor-pointer"
                title="Start Guided Tour"
              >
                <span>💡</span>
                <span className="hidden md:inline">Guided Tour</span>
              </button>

              {renderTierBadge()}
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
