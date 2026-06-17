import React, { useState, useEffect } from "react";
import { outreachService, type EmailTemplate } from "../services/outreachService";
import "../outreach.css";

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await outreachService.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setMessage("");
    setError("");
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      name: "",
      subject: "",
      body: ""
    });
    setName("");
    setSubject("");
    setBody("");
    setMessage("");
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await outreachService.deleteTemplate(id);
      setMessage("Template deleted successfully!");
      fetchTemplates();
      if (editingTemplate?.id === id) {
        setEditingTemplate(null);
      }
    } catch {
      setError("Failed to delete template.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setError("Please fill in all template fields.");
      return;
    }

    try {
      setError("");
      setMessage("");
      const payload = {
        id: editingTemplate?.id,
        name,
        subject,
        body
      };
      await outreachService.saveTemplate(payload);
      setMessage(editingTemplate?.id ? "Template updated successfully!" : "Template created successfully!");
      setEditingTemplate(null);
      fetchTemplates();
    } catch {
      setError("Failed to save template.");
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById("template-body-textarea") as HTMLTextAreaElement;
    if (!textarea) {
      setBody(prev => prev + placeholder);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;
    setBody(newText);
    
    // Reset cursor position after React update
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
    }, 0);
  };

  return (
    <div className="outreach-root">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#f8fafc" }}>Email Templates</h1>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8" }}>Manage and customize your cold email outreach templates</p>
        </div>
        {!editingTemplate && (
          <button
            onClick={handleCreateNew}
            className="btn"
            style={{
              padding: "10px 20px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background 0.2s"
            }}
          >
            Create New Template
          </button>
        )}
      </div>

      {message && <div style={{ color: "#4ade80", marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)" }}>{message}</div>}
      {error && <div style={{ color: "#f87171", marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)" }}>{error}</div>}

      {editingTemplate ? (
        <div
          className="draft-editor-container"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: 24,
            borderRadius: 12,
            maxWidth: 800,
            margin: "0 auto"
          }}
        >
          <h2 style={{ marginTop: 0, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
            {editingTemplate.id ? "Edit Template" : "New Email Template"}
          </h2>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Template Name</label>
              <input
                type="text"
                placeholder="e.g., General Referral Request"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#cbd5e1" }}>Email Subject</label>
              <input
                type="text"
                placeholder="e.g., Application for {{jobRole}} | {{companyName}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" }}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontWeight: 500, color: "#cbd5e1" }}>Template Body (HTML Supported)</label>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8", marginRight: 8 }}>Insert tags:</span>
                  <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{hrName}}")}>{"{{hrName}}"}</button>
                  <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{companyName}}")}>{"{{companyName}}"}</button>
                  <button type="button" className="placeholder-badge" onClick={() => insertPlaceholder("{{jobRole}}")}>{"{{jobRole}}"}</button>
                </div>
              </div>
              <textarea
                id="template-body-textarea"
                placeholder="Hi {{hrName}},\n\nI am interested in the {{jobRole}} role at {{companyName}}..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                style={{ width: "100%", padding: "12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none", resize: "vertical", fontFamily: "monospace" }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                style={{
                  padding: "10px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "#cbd5e1",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "#4f46e5",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div style={{ color: "#94a3b8" }}>Loading templates...</div>
      ) : (
        <div className="template-card-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="template-card">
              <div>
                <h3 style={{ margin: "0 0 8px 0", color: "#fff", fontSize: "1.1rem" }}>{tpl.name}</h3>
                <div style={{ fontSize: "0.85rem", color: "#6366f1", marginBottom: 12, fontWeight: 500 }}>
                  Subject: <span style={{ color: "#cbd5e1" }}>{tpl.subject}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.5,
                    marginBottom: 16
                  }}
                  dangerouslySetInnerHTML={{ __html: tpl.body.replace(/\n/g, "<br/>") }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
                <button
                  onClick={() => handleEdit(tpl)}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "4px",
                    color: "#a5b4fc",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  Edit
                </button>
                {!tpl.id.startsWith("default-") && (
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "4px",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
