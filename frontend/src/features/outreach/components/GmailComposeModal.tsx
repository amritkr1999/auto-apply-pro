import React, { useState, useEffect } from "react";
import { isValidEmail } from "../../../utils/validation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  subject: string;
  body: string;
  onSend: (subject: string, body: string, recipient: string) => Promise<void>;
  attachmentFilename?: string;
}

export const GmailComposeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recipientEmail: initialRecipient,
  subject: initialSubject,
  body: initialBody,
  onSend,
  attachmentFilename
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // Sync state when props change and modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient(initialRecipient);
      setSubject(initialSubject);
      setBody(initialBody);
      setError("");
    }
  }, [isOpen, initialRecipient, initialSubject, initialBody]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Clear all states to prevent stale/cached data from displaying next time
    setRecipient("");
    setSubject("");
    setBody("");
    setError("");
    onClose();
  };

  const handleSendSubmit = async () => {
    if (!recipient.trim()) {
      setError("Recipient email is required.");
      return;
    }

    if (!isValidEmail(recipient.trim())) {
      setError("Please enter a valid recipient email address.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    setIsSending(true);
    setError("");
    try {
      await onSend(subject, body, recipient);
      handleClose(); // Resets and closes modal on success
    } catch (err) {
      setError("Failed to register outreach draft.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Centered Modal Content Card (12px rounded-modal) */}
      <div className="bg-white w-full max-w-2xl h-[550px] flex flex-col rounded-modal shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <span className="text-sm font-semibold">New Message</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-medium"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Recipient Form Row */}
        <div className="border-b border-slate-100 px-6 py-3.5 flex items-center gap-4">
          <span className="text-slate-400 w-14 text-xs font-semibold uppercase tracking-wider">To</span>
          <input
            type="email"
            className="flex-1 border-none p-0 text-sm focus:ring-0 focus:outline-none placeholder-slate-400 text-slate-800"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="recruiter@company.com"
          />
        </div>

        {/* Subject Form Row */}
        <div className="border-b border-slate-100 px-6 py-3.5 flex items-center gap-4">
          <span className="text-slate-400 w-14 text-xs font-semibold uppercase tracking-wider">Subject</span>
          <input
            type="text"
            className="flex-1 border-none p-0 text-sm focus:ring-0 focus:outline-none placeholder-slate-400 text-slate-800"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />
        </div>

        {/* Attachment Row */}
        {attachmentFilename && (
          <div className="border-b border-slate-100 px-6 py-2 flex items-center gap-4 bg-slate-50/50">
            <span className="text-slate-400 w-14 text-xs font-semibold uppercase tracking-wider">Attached</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              <span>📎</span>
              <span>{attachmentFilename}</span>
            </div>
          </div>
        )}

        {/* Body Rich Text Area */}
        <div className="flex-1 flex flex-col bg-white">
          <textarea
            className="w-full flex-1 p-6 border-none focus:ring-0 focus:outline-none text-sm text-slate-700 resize-none font-sans leading-relaxed"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write email body here (HTML tags are supported)..."
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border-t border-rose-100 text-rose-600 text-xs px-6 py-2">
            {error}
          </div>
        )}

        {/* Footer controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSendSubmit}
              disabled={isSending}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-btn text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmailComposeModal;
