import { useState } from "react";
import type { ExamSyllabus } from "../types/govtExam";

interface SyllabusAccordionProps {
  stages?: ExamSyllabus[];
}

export const SyllabusAccordion: React.FC<SyllabusAccordionProps> = ({ stages }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!stages || stages.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Official syllabus details are currently being cataloged by our AI pipeline.
        </p>
      </div>
    );
  }

  const parseTopics = (topicsStr: string): string[] => {
    try {
      if (topicsStr.startsWith("[")) {
        return JSON.parse(topicsStr);
      }
      return topicsStr.split("\n").filter(Boolean);
    } catch {
      return [topicsStr];
    }
  };

  return (
    <div className="space-y-3">
      {stages.map((stg, idx) => {
        const isOpen = expandedIndex === idx;
        const topicList = parseTopics(stg.topics);

        return (
          <div
            key={stg.id || idx}
            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/60 transition-all"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isOpen ? null : idx)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-amber-400/20 text-amber-800 dark:text-amber-300">
                  {stg.stage}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {stg.subject}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {stg.totalMarks ? `${stg.totalMarks} Marks` : "Official Weightage"}
                    {stg.durationMinutes ? ` • ${stg.durationMinutes} Mins` : ""}
                    {stg.negativeMarking ? ` • ${stg.negativeMarking}` : ""}
                  </p>
                </div>
              </div>

              <span className="text-slate-400 font-bold text-lg transform transition-transform duration-200">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Topics & Sub-Modules:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {topicList.map((tp, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{tp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SyllabusAccordion;
