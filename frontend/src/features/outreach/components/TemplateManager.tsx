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
    <div className="max-w-[1000px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and customize your cold email outreach templates</p>
        </div>
        {!editingTemplate && (
          <button
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn text-xs font-semibold shadow-sm transition-all duration-150 shrink-0"
          >
            Create New Template
          </button>
        )}
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-card mb-6 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-card mb-6 text-sm">
          {error}
        </div>
      )}

      {editingTemplate ? (
        <div className="bg-white border border-slate-200 p-6 rounded-card shadow-sm max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
            {editingTemplate.id ? "Edit Template" : "New Email Template"}
          </h2>
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-600 mb-1.5">Template Name</label>
              <input
                type="text"
                placeholder="e.g., General Referral Request"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-600 mb-1.5">Email Subject</label>
              <input
                type="text"
                placeholder="e.g., Application for {{jobRole}} | {{companyName}}"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <label className="text-sm font-medium text-slate-600">Template Body (HTML Supported)</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">Insert tags:</span>
                  <button type="button" className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{hrName}}")}>{"{{hrName}}"}</button>
                  <button type="button" className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{companyName}}")}>{"{{companyName}}"}</button>
                  <button type="button" className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{jobRole}}")}>{"{{jobRole}}"}</button>
                </div>
              </div>
              <textarea
                id="template-body-textarea"
                placeholder="Hi {{hrName}},\n\nI am interested in the {{jobRole}} role at {{companyName}}..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-btn text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-btn text-xs font-semibold shadow-sm transition-all"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      ) : loading ? (
        <div className="text-slate-500 italic text-sm py-10 text-center">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white border border-slate-200 rounded-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate mb-1" title={tpl.name}>{tpl.name}</h3>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded inline-block mb-3 max-w-full truncate" title={tpl.subject}>
                  Subject: <span className="text-slate-600 font-normal">{tpl.subject}</span>
                </div>
                <div
                  className="text-xs text-slate-500 leading-relaxed font-mono whitespace-pre-line overflow-hidden line-clamp-4 bg-slate-50 p-2.5 rounded border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: tpl.body.replace(/\n/g, "<br/>") }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => handleEdit(tpl)}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-650 rounded text-xs font-semibold transition-all"
                >
                  Edit
                </button>
                {!tpl.id.startsWith("default-") && (
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded text-xs font-semibold transition-all"
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
