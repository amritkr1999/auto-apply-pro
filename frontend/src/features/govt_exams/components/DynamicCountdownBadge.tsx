import type { ExamStatus } from "../types/govtExam";

interface DynamicCountdownBadgeProps {
  status: ExamStatus;
  daysRemaining?: number;
  countdownTag?: string;
}

export const DynamicCountdownBadge: React.FC<DynamicCountdownBadgeProps> = ({
  status,
  daysRemaining,
  countdownTag
}) => {
  if (status === "CLOSED" || (daysRemaining !== undefined && daysRemaining < 0)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
        <span>🔒</span>
        <span>Application Closed</span>
      </span>
    );
  }

  if (status === "ADMIT_CARD_LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Admit Card Live</span>
      </span>
    );
  }

  if (status === "RESULTS_OUT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40">
        <span>🏆</span>
        <span>Results Declared</span>
      </span>
    );
  }

  const isUrgent = daysRemaining !== undefined && daysRemaining <= 3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs transition-all ${
        isUrgent
          ? "bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse"
          : "bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isUrgent ? "bg-rose-500 animate-ping" : "bg-amber-400"}`} />
      <span>{countdownTag || (daysRemaining !== undefined ? `Closes in ${daysRemaining} Days` : "Apply Now")}</span>
    </span>
  );
};

export default DynamicCountdownBadge;
