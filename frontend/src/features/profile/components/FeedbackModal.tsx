import React, { useState } from "react";
import { feedbackService } from "../services/feedbackService";

interface FeedbackModalProps {
  onClose: () => void;
  onLogout: () => void;
  onSubmitSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onLogout, onSubmitSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Please select a rating of at least 1 star.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Please write a short comment about your experience.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await feedbackService.submitFeedback(rating, comment);
      setSuccess(true);
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onLogout();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptOut = () => {
    localStorage.setItem("feedback_opt_out", "true");
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full text-3xl shadow-inner animate-bounce">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Thank You!</h3>
              <p className="text-slate-600 text-sm">
                Your feedback has been submitted successfully. We appreciate your response and help in making Auto Apply Pro better!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-block text-2xl">⚡</span>
                <h3 className="text-xl font-bold text-slate-800">Enjoying Auto Apply Pro?</h3>
                <p className="text-slate-600 text-sm">
                  We'd love to hear your feedback! Let us know how your automated job search is going.
                </p>
              </div>

              {/* Star Rating Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                  Your Rating
                </label>
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-115 active:scale-95 duration-100 cursor-pointer"
                    >
                      <span
                        className={
                          star <= (hoverRating || rating)
                            ? "text-amber-400 drop-shadow-sm"
                            : "text-slate-200"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-xs font-semibold text-amber-600">
                    {rating === 5 ? "Loved it!" : rating === 4 ? "Very good!" : rating === 3 ? "Good" : rating === 2 ? "Could be better" : "Disappointed"}
                  </p>
                )}
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label htmlFor="modal-comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Comment
                </label>
                <textarea
                  id="modal-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you like, or how we can improve..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-slate-50/50 hover:bg-slate-50 resize-none"
                />
                <div className="text-right text-[10px] text-slate-400">
                  {comment.length} / 1000 characters
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-600 rounded-xl animate-shake">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center cursor-pointer font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full sm:w-1/2 px-4 py-2 border border-slate-200 text-slate-655 dark:text-slate-400 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    onClick={handleOptOut}
                    className="w-full sm:w-1/2 px-4 py-2 border border-rose-200 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer text-center"
                  >
                    Don't Show Again
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
