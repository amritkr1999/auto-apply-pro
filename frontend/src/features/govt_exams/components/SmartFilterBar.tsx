import type { ExamCategory, ExamStatus } from "../types/govtExam";

interface SmartFilterBarProps {
  selectedCategory: ExamCategory | "ALL";
  onSelectCategory: (cat: ExamCategory | "ALL") => void;
  selectedStatus: ExamStatus | "ALL";
  onSelectStatus: (st: ExamStatus | "ALL") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SmartFilterBar: React.FC<SmartFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange
}) => {
  const categories: { label: string; value: ExamCategory | "ALL" }[] = [
    { label: "All Sectors", value: "ALL" },
    { label: "UPSC", value: "UPSC" },
    { label: "SSC", value: "SSC" },
    { label: "Banking (IBPS/SBI)", value: "BANKING" },
    { label: "Railways (RRB)", value: "RAILWAYS" },
    { label: "Defense (CDS/NDA)", value: "DEFENSE" },
    { label: "State PSCs", value: "STATE_PSC" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search exam name, department, or vacancy (e.g. CGL, IAS, NTPC)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value as ExamStatus | "ALL")}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLY_NOW">Apply Now (Active)</option>
            <option value="UPCOMING">Upcoming / Gazette</option>
            <option value="ADMIT_CARD_LIVE">Admit Card Live</option>
            <option value="RESULTS_OUT">Results Out</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Domain Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelectCategory(cat.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.value
                ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartFilterBar;
