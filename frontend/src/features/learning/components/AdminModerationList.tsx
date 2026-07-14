import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { QuestionSubmission } from "../services/learningService";

export const AdminModerationList: React.FC = () => {
  const [submissions, setSubmissions] = useState<QuestionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ID of the submission currently being rejected
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState<number | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        const data = await learningService.getPendingSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error("Failed to load pending submissions", err);
        setError("Failed to fetch pending submissions. Make sure you are logged in as an administrator.");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      setSubmittingReview(id);
      await learningService.reviewSubmission(id, { status: "APPROVED", feedback: "" });
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to approve submission");
    } finally {
      setSubmittingReview(null);
    }
  };

  const handleRejectSubmit = async (id: number) => {
    if (!feedback.trim()) {
      alert("Please provide feedback or reason for requesting changes.");
      return;
    }

    try {
      setSubmittingReview(id);
      await learningService.reviewSubmission(id, { status: "REJECTED", feedback: feedback.trim() });
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      setRejectingId(null);
      setFeedback("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to reject submission");
    } finally {
      setSubmittingReview(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium text-xs">Loading moderation queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/learning" className="text-xs text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors font-medium">
          ← Back to Learning Space
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2 flex items-center gap-2">
          Moderation Portal
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
            {submissions.length} Pending
          </span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review user contributions before publishing them to the active worksheets.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700 mb-1">Queue is clear!</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            All user-submitted questions have been moderated. Check back later for new contributions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 transition-all duration-200 hover:border-slate-300">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub.subjectName}</span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">{sub.topicName}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{sub.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[10px] font-bold text-slate-400">Difficulty</span>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    sub.difficulty === "HARD" ? "text-rose-600 bg-rose-50" :
                    sub.difficulty === "MEDIUM" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                  }`}>
                    {sub.difficulty}
                  </span>
                </div>
              </div>

              {/* Submitter Details */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium bg-slate-50/50 p-2 rounded">
                <div>
                  Submitted by: <span className="font-bold text-slate-600">{sub.submittedByName}</span> ({sub.submittedByEmail})
                </div>
                <div>
                  Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Question Statement */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-150 text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                {sub.content}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {sub.choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 font-medium ${
                      choice === sub.correctAnswer
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-850"
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
                      <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">Correct Answer</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {sub.explanation && (
                <div className="text-xs text-slate-500 bg-slate-50/30 p-2.5 rounded border border-dashed border-slate-200 font-medium">
                  <strong className="text-slate-700 not-italic block mb-0.5 font-bold">Explanation:</strong>
                  {sub.explanation}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(sub.id)}
                    disabled={submittingReview !== null}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-btn transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {submittingReview === sub.id ? "Approving..." : "Approve & Publish"}
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(rejectingId === sub.id ? null : sub.id);
                      setFeedback("");
                    }}
                    disabled={submittingReview !== null}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 rounded-btn transition-colors"
                  >
                    Request Changes
                  </button>
                </div>
              </div>

              {/* Rejection/Feedback panel */}
              {rejectingId === sub.id && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg space-y-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-rose-800">Reason for Requesting Changes / Rejection *</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details on what needs to be changed (e.g. typos, incorrect correct option, formatting...)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full py-1.5 px-3 border border-rose-200 rounded-btn text-xs bg-white text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setFeedback("");
                      }}
                      className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectSubmit(sub.id)}
                      disabled={submittingReview !== null}
                      className="px-3 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded transition-colors"
                    >
                      Submit Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
