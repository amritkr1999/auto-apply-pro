import React, { useState, useEffect } from "react";
import { outreachService, type EmailTemplate } from "../services/outreachService";
import { GmailComposeModal } from "./GmailComposeModal";
import "../outreach.css";

export const OutreachDraftSection: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  
  // Form variables
  const [recipientEmail, setRecipientEmail] = useState("");
  const [hrName, setHrName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");
  
  // Raw subject/body being edited in the main form
  const [rawSubject, setRawSubject] = useState("");
  const [rawBody, setRawBody] = useState("");

  // Preview / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedSubject, setParsedSubject] = useState("");
  const [parsedBody, setParsedBody] = useState("");

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await outreachService.getTemplates();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
          setRawSubject(data[0].subject);
          setRawBody(data[0].body);
        }
      } catch (err) {
        setErrorMessage("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Sync subject and body when selected template changes
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const selected = templates.find(t => t.id === id);
    if (selected) {
      setRawSubject(selected.subject);
      setRawBody(selected.body);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("draft-body-textarea") as HTMLTextAreaElement;
    if (!textarea) {
      setRawBody(prev => prev + placeholder);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;
    setRawBody(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  const parseText = (text: string) => {
    return text
      .replace(/\{\{hrName\}\}/g, hrName || "{{hrName}}")
      .replace(/\{\{companyName\}\}/g, companyName || "{{companyName}}")
      .replace(/\{\{jobRole\}\}/g, jobRole || "{{jobRole}}");
  };

  const handlePreview = () => {
    if (!recipientEmail.trim()) {
      setErrorMessage("Please enter a recipient email address.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");
    setParsedSubject(parseText(rawSubject));
    setParsedBody(parseText(rawBody));
    setIsModalOpen(true);
  };

  const handleSendDraft = async (subject: string, body: string, recipient: string) => {
    try {
      await outreachService.saveDraft({
        templateId: selectedTemplateId,
        recipientEmail: recipient,
        subject,
        body
      });
      setStatusMessage("Outreach draft saved to queue successfully!");
      // Reset form variables for next draft
      setRecipientEmail("");
      setHrName("");
      setCompanyName("");
      setJobRole("");
      // Reset subject/body back to template default
      const currentSelected = templates.find(t => t.id === selectedTemplateId);
      if (currentSelected) {
        setRawSubject(currentSelected.subject);
        setRawBody(currentSelected.body);
      }
    } catch {
      throw new Error("Failed to save outreach draft.");
    }
  };

  if (loading) {
    return <div style={{ color: "#cbd5e1", padding: 24 }}>Loading outreach templates...</div>;
  }

  return (
    <div className="outreach-root" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#f8fafc" }}>Draft Email Outreach</h1>
        <p style={{ margin: "4px 0 0 0", color: "#94a3b8" }}>Personalize a template and queue cold recruitment emails</p>
      </div>

      {statusMessage && (
        <div style={{ color: "#4ade80", marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)" }}>
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ color: "#f87171", marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
          {errorMessage}
        </div>
      )}

      <div className="draft-editor-container" style={{ background: "rgba(15, 23, 42, 0.6)", padding: 24, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Template Selection Dropdown */}
          <div className="form-group">
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Select Template</label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(15,23,42,0.8)",
                color: "#fff",
                outline: "none",
                fontSize: "0.95rem"
              }}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Placeholders Variable Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Recipient Email</label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
                required
              />
            </div>
            
            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>HR Name (for `{"{{hrName}}"}`)</label>
              <input
                type="text"
                placeholder="e.g., Jane Doe"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Company Name (for `{"{{companyName}}"}`)</label>
              <input
                type="text"
                placeholder="e.g., Stripe"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Job Role (for `{"{{jobRole}}"}`)</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
              />
            </div>
          </div>

          <hr style={{ border: "0", borderTop: "1px solid rgba(255, 255, 255, 0.05)", margin: "8px 0" }} />

          {/* Raw Subject Field */}
          <div className="form-group">
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Edit Subject Structure</label>
            <input
              type="text"
              value={rawSubject}
              onChange={(e) => setRawSubject(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
            />
          </div>

          {/* Raw Body Editor Field with Badge Controls */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontWeight: 500, color: "#cbd5e1" }}>Edit Body Structure (HTML Supported)</label>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", marginRight: 8 }}>Insert tags:</span>
                <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{hrName}}")}>{"{{hrName}}"}</button>
                <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{companyName}}")}>{"{{companyName}}"}</button>
                <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{jobRole}}")}>{"{{jobRole}}"}</button>
              </div>
            </div>
            <textarea
              id="draft-body-textarea"
              value={rawBody}
              onChange={(e) => setRawBody(e.target.value)}
              rows={8}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                outline: "none",
                resize: "vertical",
                fontFamily: "monospace",
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Preview Trigger Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              onClick={handlePreview}
              style={{
                padding: "12px 24px",
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "background 0.2s"
              }}
            >
              Preview in Gmail Composer
            </button>
          </div>

        </div>
      </div>

      {/* Gmail High-Fidelity Preview Modal */}
      <GmailComposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipientEmail={recipientEmail}
        subject={parsedSubject}
        body={parsedBody}
        onSend={handleSendDraft}
      />
    </div>
  );
};

export default OutreachDraftSection;
