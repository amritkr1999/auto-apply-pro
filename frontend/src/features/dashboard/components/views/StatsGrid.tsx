import React from "react";

interface StatsGridProps {
  totalApplications: number;
  pendingApprovalCount: number;
  suggestionCount: number;
  sentCount: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalApplications,
  pendingApprovalCount,
  suggestionCount,
  sentCount,
}) => {
  const stats = [
    {
      label: "Total Applications",
      value: `${totalApplications} tracking`,
      icon: "📁",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-100 dark:border-blue-900/40",
    },
    {
      label: "Pending Approval",
      value: `${pendingApprovalCount} drafts`,
      icon: "⏳",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-900/40",
    },
    {
      label: "Match Suggestions",
      value: `${suggestionCount} items`,
      icon: "🎯",
      color: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-100 dark:border-indigo-900/40",
    },
    {
      label: "Sent Emails",
      value: `${sentCount} dispatched`,
      icon: "📧",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-900/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={`bg-white dark:bg-slate-900 rounded-card p-5 border ${stat.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-4`}
        >
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {stat.label}
            </h3>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {stat.value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shrink-0`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
