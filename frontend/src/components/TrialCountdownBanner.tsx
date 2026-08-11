import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const TrialCountdownBanner: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Active Trial State
  if (user.isTrialActive) {
    const daysLeft = user.trialDaysRemaining ?? 15;
    const isUrgent = daysLeft <= 3;

    return (
      <div
        className={`w-full py-2.5 px-4 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs transition-colors ${
          isUrgent
            ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white"
            : "bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-indigo-100 border-b border-indigo-500/20"
        }`}
      >
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="text-base leading-none animate-bounce">🎁</span>
          <span>
            <strong className="font-extrabold underline decoration-amber-400 decoration-2 underline-offset-2">
              15-Day Elite Autopilot Trial Active!
            </strong>{" "}
            You have access to 50 daily applications & priority AI generation.{" "}
            <span className="inline-block bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full font-bold ml-1">
              ⏳ {daysLeft} {daysLeft === 1 ? "Day" : "Days"} Left
            </span>
          </span>
        </div>
        <Link
          to="/pricing"
          className="shrink-0 px-3 py-1 bg-white text-slate-900 font-extrabold rounded-lg hover:bg-slate-100 transition-all shadow-xs text-xs flex items-center gap-1 hover:scale-105"
        >
          <span>Upgrade Subscription</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  // Trial Expired State (Only show if user used trial and has no paid role/isPremium)
  const isPaidUser = user.isPremium || user.role === "PRO" || user.role === "PREMIUM";
  if (user.trialUsed && !user.isTrialActive && !isPaidUser) {
    return (
      <div className="w-full py-2.5 px-4 bg-slate-800 text-slate-200 text-xs font-medium flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">📢</span>
          <span>
            Your <strong className="font-bold text-white">15-Day Elite Trial has ended</strong>. You are currently on the <strong className="text-amber-400 font-bold">Free Tier (15 apps/day limit)</strong>.
          </span>
        </div>
        <Link
          to="/pricing"
          className="shrink-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-xs text-xs"
        >
          Re-unlock 50 Apps/Day
        </Link>
      </div>
    );
  }

  return null;
};

export default TrialCountdownBanner;
