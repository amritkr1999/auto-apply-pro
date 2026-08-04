import React, { useState, useEffect } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRating?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialRating = 5,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [selectedTag, setSelectedTag] = useState<string>("Email Quality");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]);

  if (!isOpen) return null;

  const categories = [
    "Email Quality",
    "Outreach Speed",
    "Feature Suggestion",
    "UI & Experience",
    "Bug Report",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const fullComment = `[${selectedTag}] ${comment.trim() || "Rated " + rating + " stars via EOD feedback"}`;

      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          rating,
          comment: fullComment,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to submit feedback. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage("Network error while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setComment("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleResetAndClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You for Your Review!</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                Your feedback directly drives how we improve AutoApplyPro's outreach and daily feature automation.
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-200/80 dark:border-amber-800/60">
                  ⭐️ EOD Review & Suggestions
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  How was AutoApplyPro Today?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                  Share your experience, feature requests, or suggestions with our team.
                </p>
              </div>

              {/* Star Rating Picker */}
              <div className="mb-6 text-center">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl text-3xl transition-all cursor-pointer ${
                        rating >= star
                          ? "text-amber-400 scale-110 drop-shadow-md"
                          : "text-slate-300 dark:text-slate-700 hover:text-amber-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Chips */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Feedback Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTag(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedTag === cat
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Comments */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Your Thoughts & Feature Suggestions
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what worked well today, or what features you'd like to see added next..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs text-center font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Review..." : "Submit Review & Suggestions"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
