import { useEffect, useState } from "react";
import type { ExamCategory } from "../types/govtExam";
import { fetchQuestionPapers, type ExamQuestionPaper } from "../services/govtExamApi";

interface QuestionPaperVaultProps {
  category?: ExamCategory | "ALL";
}

export const QuestionPaperVault: React.FC<QuestionPaperVaultProps> = ({ category = "ALL" }) => {
  const [papers, setPapers] = useState<ExamQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchQuestionPapers(category, selectedYear)
      .then((data) => {
        if (mounted) {
          setPapers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category, selectedYear]);

  const years: (number | "ALL")[] = ["ALL", 2025, 2024, 2023, 2022, 2021];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📄 Downloadable PDF Question Papers (Year-Wise)</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
              Official Papers & Keys
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Download authentic previous year official question papers and answer keys directly in PDF format.
          </p>
        </div>

        {/* Year Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Year:</span>
          {years.map((y) => (
            <button
              key={String(y)}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === y
                  ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {y === "ALL" ? "All Years" : y}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500">No downloadable PDF question papers found for selected year filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((qp) => (
            <div
              key={qp.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300">
                    Year {qp.year}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {qp.fileSizeMb || "PDF"} • {qp.language || "Bilingual"}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors leading-snug">
                  {qp.examName}
                </h4>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500">
                  📥 {qp.downloadCount?.toLocaleString() || "10,000+"} downloads
                </span>

                <a
                  href={qp.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 hover:opacity-90 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>📄 Download PDF</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionPaperVault;
