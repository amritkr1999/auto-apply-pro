import React from "react";

interface StatsGridProps {
  totalApplications: number;
  pendingApprovalCount: number;
  suggestionCount: number;
  sentCount: number;
  onCardClick?: (cardType: "total" | "pending" | "suggestions" | "sent") => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalApplications,
  pendingApprovalCount,
  suggestionCount,
  sentCount,
  onCardClick,
}) => {
  const stats = [
    {
      type: "total" as const,
      label: "Total Applications",
      value: `${totalApplications} tracking`,
      icon: "📁",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-100 dark:border-blue-900/40",
      cta: "View send queue",
    },
    {
      type: "pending" as const,
      label: "Pending Approval",
      value: `${pendingApprovalCount} drafts`,
      icon: "⏳",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-900/40",
      cta: "Review email drafts",
    },
    {
      type: "suggestions" as const,
      label: "Match Suggestions",
      value: `${suggestionCount} items`,
      icon: "🎯",
      color: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-100 dark:border-indigo-900/40",
      cta: "Review match suggestions",
    },
    {
      type: "sent" as const,
      label: "Sent Emails",
      value: `${sentCount} dispatched`,
      icon: "📧",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-900/40",
      cta: "View sent history",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div 
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => onCardClick?.(stat.type)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCardClick?.(stat.type);
            }
          }}
          className={`group bg-white dark:bg-slate-900 rounded-card p-5 border ${stat.borderColor} shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900`}
          aria-label={`View details for ${stat.label}, ${stat.value}`}
        >
          <div className="space-y-1.5 min-w-0 flex-1">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
              {stat.label}
            </h3>
            <p className="text-2xl font-black text-slate-800 dark:text-white truncate">
              {stat.value}
            </p>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {stat.cta} <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-200`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
