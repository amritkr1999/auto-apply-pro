import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { QuestionSubmission } from "../services/learningService";

export const UserSubmissionsList: React.FC = () => {
  const [submissions, setSubmissions] = useState<QuestionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await learningService.getUserSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to load user submissions", err);
        setError("Failed to fetch your question submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const getStatusBadge = (status: QuestionSubmission["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Approved & Published
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Changes Requested / Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty: QuestionSubmission["difficulty"]) => {
    switch (difficulty) {
      case "HARD":
        return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Hard</span>;
      case "MEDIUM":
        return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Easy</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium text-xs">Loading submissions logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/learning" className="text-xs text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors font-medium">
            ← Back to Learning Space
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">My Question Submissions</h1>
          <p className="text-slate-500 text-xs mt-1">Track the review status of questions you contributed to the learning space.</p>
        </div>
        <Link
          to="/learning/submit"
          className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-btn transition-colors shadow-sm flex items-center gap-1 w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Contribute Question
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">No submissions yet</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
            You haven't contributed any questions to the learning space. Submit your first question to share knowledge with the community!
          </p>
          <Link
            to="/learning/submit"
            className="inline-block px-4 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-btn transition-colors border border-primary/20"
          >
            Submit First Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub.subjectName}</span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{sub.topicName}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{sub.title}</h3>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {getStatusBadge(sub.status)}
                  {getDifficultyBadge(sub.difficulty)}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                {sub.content}
              </div>

              {/* Choices Rendering */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {sub.choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 font-medium ${
                      choice === sub.correctAnswer
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        choice === sub.correctAnswer
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="truncate">{choice}</span>
                    {choice === sub.correctAnswer && (
                      <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">Correct Option</span>
                    )}
                  </div>
                ))}
              </div>

              {sub.explanation && (
                <div className="text-xs text-slate-500 italic bg-slate-50/30 p-2.5 rounded border border-dashed border-slate-200 font-medium">
                  <strong className="text-slate-700 not-italic block mb-0.5 font-bold">Explanation:</strong>
                  {sub.explanation}
                </div>
              )}

              {/* Admin feedback block */}
              {sub.status === "REJECTED" && sub.adminFeedback && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                    </svg>
                    Reviewer Notes / Feedback:
                  </div>
                  <p className="font-medium pl-5">{sub.adminFeedback}</p>
                </div>
              )}

              <div className="text-[10px] text-slate-400 font-medium text-right">
                Submitted on {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
