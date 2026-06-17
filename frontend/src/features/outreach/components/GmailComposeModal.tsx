import React, { useState, useEffect } from "react";
import "../outreach.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  subject: string;
  body: string;
  onSend: (subject: string, body: string, recipient: string) => Promise<void>;
}

export const GmailComposeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recipientEmail: initialRecipient,
  subject: initialSubject,
  body: initialBody,
  onSend
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // Sync state when props change
  useEffect(() => {
    setRecipient(initialRecipient);
    setSubject(initialSubject);
    setBody(initialBody);
    setError("");
  }, [initialRecipient, initialSubject, initialBody]);

  if (!isOpen) return null;

  const handleSendSubmit = async () => {
    if (!recipient.trim()) {
      setError("Recipient email is required.");
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
      onClose();
    } catch (err) {
      setError("Failed to register outreach draft.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="gmail-compose-window">
      {/* Header Bar */}
      <div className="gmail-header">
        <span>New Message</span>
        <div className="gmail-header-controls">
          <button type="button" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {/* Recipient Form Row */}
      <div className="gmail-fields-row">
        <span className="gmail-fields-label">To</span>
        <input
          type="email"
          className="gmail-fields-input"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="recruiter@company.com"
        />
      </div>

      {/* Subject Form Row */}
      <div className="gmail-fields-row">
        <span className="gmail-fields-label">Subject</span>
        <input
          type="text"
          className="gmail-fields-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
        />
      </div>

      {/* Body Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1e293b" }}>
        <textarea
          className="gmail-body-area"
          style={{
            border: "none",
            width: "100%",
            height: "100%",
            resize: "none",
            background: "none",
            color: "#e2e8f0",
            padding: 16,
            outline: "none",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.9rem",
            lineHeight: 1.5
          }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write email body here (HTML tags are supported)..."
        />
      </div>

      {/* Error display inside compose modal */}
      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", borderTop: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: "0.8rem", padding: "6px 16px" }}>
          {error}
        </div>
      )}

      {/* Footer controls */}
      <div className="gmail-footer">
        <button
          type="button"
          onClick={handleSendSubmit}
          disabled={isSending}
          className="gmail-send-btn"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "0.85rem"
            }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default GmailComposeModal;
