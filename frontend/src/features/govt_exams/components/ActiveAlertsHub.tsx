import type { ExamNotification } from "../types/govtExam";
import DynamicCountdownBadge from "./DynamicCountdownBadge";

interface ActiveAlertsHubProps {
  notifications: ExamNotification[];
  loading: boolean;
  onSelectExam: (id: string) => void;
}

export const ActiveAlertsHub: React.FC<ActiveAlertsHubProps> = ({
  notifications,
  loading,
  onSelectExam
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
        <p className="text-4xl">🏛️</p>
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          No matching government exam alerts found
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Try resetting your category or search filters. Our background worker continuously ingests fresh gazettes 24/7.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {notifications.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-400/60 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {item.category}
              </span>
              <DynamicCountdownBadge
                status={item.status}
                daysRemaining={item.daysRemaining}
                countdownTag={item.countdownTag}
              />
            </div>

            <div>
              <h4
                onClick={() => onSelectExam(item.id)}
                className="font-extrabold text-slate-900 dark:text-slate-100 text-base cursor-pointer group-hover:text-amber-500 transition-colors line-clamp-2"
              >
                {item.examName}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {item.organizingBody}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Vacancies:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {item.vacancyCount?.toLocaleString() || "1,000+"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Eligibility:</span>
                <span className="font-medium text-right line-clamp-1">{item.eligibilitySummary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age Limit:</span>
                <span className="font-medium text-right">{item.ageLimitSummary}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              Closing: <span className="text-slate-700 dark:text-slate-200">{item.applicationEndDate}</span>
            </span>

            <button
              onClick={() => onSelectExam(item.id)}
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 hover:opacity-90 transition-opacity"
            >
              View Full Profile →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveAlertsHub;
