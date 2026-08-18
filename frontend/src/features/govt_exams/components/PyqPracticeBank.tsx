import { useEffect, useState } from "react";
import type { ExamCategory } from "../types/govtExam";
import { fetchGovtPyqs, type ExamPyq } from "../services/govtExamApi";

interface PyqPracticeBankProps {
  category?: ExamCategory | "ALL";
}

export const PyqPracticeBank: React.FC<PyqPracticeBankProps> = ({ category = "ALL" }) => {
  const [pyqs, setPyqs] = useState<ExamPyq[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchGovtPyqs(category, selectedSubject)
      .then((data) => {
        if (mounted) {
          setPyqs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category, selectedSubject]);

  const handleSelectOption = (pyqId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [pyqId]: optionKey }));
    setRevealedExplanations((prev) => ({ ...prev, [pyqId]: true }));
  };

  const toggleExplanation = (pyqId: string) => {
    setRevealedExplanations((prev) => ({ ...prev, [pyqId]: !prev[pyqId] }));
  };

  const subjects = [
    { label: "All Subjects", value: "ALL" },
    { label: "Polity & Constitution", value: "POLITY" },
    { label: "Quantitative Aptitude", value: "QUANT" },
    { label: "Reasoning Ability", value: "REASONING" },
    { label: "English Comprehension", value: "ENGLISH" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📚 Interactive PYQ Practice Bank</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300 uppercase">
              Official Papers
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Test yourself on authentic past year questions from UPSC, SSC CGL, RRB NTPC, and IBPS PO with instant AI explanations.
          </p>
        </div>

        {/* Subject filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setSelectedSubject(sub.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSubject === sub.value
                  ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : pyqs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500">No PYQs cataloged for this subject filter yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pyqs.map((q, idx) => {
            const userAnswer = selectedAnswers[q.id];
            const isAnswered = Boolean(userAnswer);
            const isCorrect = userAnswer === q.correctOption;
            const showExp = revealedExplanations[q.id];

            return (
              <div
                key={q.id || idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                      {q.subjectTag}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.examCategory}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    Source: <span className="text-slate-700 dark:text-slate-300">{q.examSourceYear}</span>
                  </span>
                </div>

                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-relaxed">
                  Q{idx + 1}. {q.questionText}
                </p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "A", text: q.optionA },
                    { key: "B", text: q.optionB },
                    { key: "C", text: q.optionC },
                    { key: "D", text: q.optionD }
                  ].map((opt) => {
                    const isSelected = userAnswer === opt.key;
                    const isThisCorrect = q.correctOption === opt.key;

                    let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400";
                    if (isAnswered) {
                      if (isThisCorrect) {
                        btnStyle = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${btnStyle}`}
                      >
                        <span className="font-black mr-2">{opt.key})</span>
                        <span>{opt.text}</span>
                        {isAnswered && isThisCorrect && <span className="ml-2">✅</span>}
                        {isAnswered && isSelected && !isCorrect && <span className="ml-2">❌</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    {showExp ? "Hide AI Conceptual Explanation" : "Show AI Conceptual Explanation"}
                  </button>

                  {isAnswered && (
                    <span className={`text-xs font-black ${isCorrect ? "text-emerald-500" : "text-rose-500"}`}>
                      {isCorrect ? "Correct Choice! 🎉" : "Incorrect Option"}
                    </span>
                  )}
                </div>

                {/* Explanation Box */}
                {showExp && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 animate-fadeIn">
                    <p className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                      Step-by-step AI Conceptual Breakdown:
                    </p>
                    <p className="whitespace-pre-line leading-relaxed">{q.explanationText}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PyqPracticeBank;
