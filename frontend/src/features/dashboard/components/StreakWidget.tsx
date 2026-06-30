import React from "react";
import type { DailyActivity } from "../services/dashboardService";

interface StreakWidgetProps {
  loginStreak: number;
  dailyActivity: DailyActivity[];
  loading: boolean;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  loginStreak,
  dailyActivity,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm h-[180px] flex flex-col justify-center items-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Checking your streak...</p>
      </div>
    );
  }

  // Check today's activity (the last element in dailyActivity, index 6)
  const todayActivity = dailyActivity && dailyActivity.length > 0 ? dailyActivity[6] : null;
  const solvedQuestionToday = todayActivity ? todayActivity.questionsSolved > 0 : false;
  const sentEmailToday = todayActivity ? todayActivity.emailsSent > 0 : false;

  // Streak status message
  let motivationMessage = "Log in tomorrow to keep the flame alive!";
  if (loginStreak <= 1) {
    motivationMessage = "Start your everyday learning & outreach journey today!";
  } else if (loginStreak >= 2 && loginStreak <= 4) {
    motivationMessage = "Nice job! Let's build a daily routine!";
  } else if (loginStreak >= 5 && loginStreak <= 9) {
    motivationMessage = "You're on fire! Keep up the momentum!";
  } else if (loginStreak >= 10) {
    motivationMessage = "Unstoppable! You've mastered the daily habit!";
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6 hover:shadow-2xl transition-all duration-300">
      
      {/* Background ambient glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Streak Info Panel */}
      <div className="flex flex-col justify-between flex-1 relative z-10 text-center md:text-left">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
            Everyday Habit
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-3.5">Daily Login Streak</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{motivationMessage}</p>
        </div>

        <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
          <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-inner">
            <svg
              className={`w-14 h-14 ${
                loginStreak > 0 ? "text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)] animate-pulse" : "text-slate-600"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C11.37 2.05 10.74 2.5 10.3 3.12C8.38 5.75 8.08 9.5 9.4 12.18C9.5 12.38 9.27 12.57 9.09 12.44C8.25 11.83 7.7 10.87 7.56 9.85C7.5 9.4 6.94 9.17 6.64 9.5C5.33 10.96 4.5 13 4.5 15.2C4.5 19.34 7.86 22 12 22C16.14 22 19.5 19.34 19.5 15.2C19.5 11.23 16.73 6.6 12 2ZM12 19.5C10.34 19.5 9 18.16 9 16.5C9 15.34 9.77 14.28 10.85 13.9C11.13 13.8 11.3 14.07 11.2 14.34C10.78 15.42 11.33 16.63 12.44 17C12.87 17.15 13.33 17.1 13.71 16.87C14.1 16.64 14.34 16.23 14.34 15.79C14.34 15.03 13.95 14.34 13.3 13.96C13.08 13.83 13.14 13.48 13.39 13.43C14.83 13.16 15.89 11.88 15.89 10.35C15.89 9.87 15.77 9.4 15.54 8.98C15.38 8.68 15.73 8.35 15.98 8.56C17.5 9.9 18 12.27 18 14.5C18 17.26 15.31 19.5 12 19.5Z" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              <span>{loginStreak}</span>
              <span className="text-sm font-semibold text-slate-400">days</span>
            </div>
            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">
              Active Flame
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Daily Checklist */}
      <div className="w-full md:w-[250px] bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4 relative z-10 shadow-inner">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Daily Checklist
          </h4>
          
          <div className="space-y-3.5">
            {/* Task 1: Login */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="text-slate-300 font-medium">Daily App Login</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                Done
              </span>
            </div>

            {/* Task 2: Practice Question */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    solvedQuestionToday
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {solvedQuestionToday ? "✓" : "2"}
                </span>
                <span className={`${solvedQuestionToday ? "text-slate-300 font-medium" : "text-slate-400 font-medium"}`}>
                  Solve Challenge
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  solvedQuestionToday
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {solvedQuestionToday ? "Done" : "0/1 Solved"}
              </span>
            </div>

            {/* Task 3: Email Outreach */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    sentEmailToday
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {sentEmailToday ? "✓" : "3"}
                </span>
                <span className={`${sentEmailToday ? "text-slate-300 font-medium" : "text-slate-400 font-medium"}`}>
                  Outbound Outreach
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  sentEmailToday
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {sentEmailToday ? "Done" : "0/1 Sent"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress summary bar */}
        <div className="border-t border-slate-800/80 pt-3 mt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase mb-1">
            <span>Daily Goal Progress</span>
            <span>{((1 + (solvedQuestionToday ? 1 : 0) + (sentEmailToday ? 1 : 0)) / 3 * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{
                width: `${((1 + (solvedQuestionToday ? 1 : 0) + (sentEmailToday ? 1 : 0)) / 3 * 100)}%`,
              }}
            ></div>
          </div>
        </div>

      </div>

    </div>
  );
};
