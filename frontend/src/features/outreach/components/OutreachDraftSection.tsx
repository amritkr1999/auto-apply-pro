import React, { useState, useEffect } from "react";
import { outreachService, type EmailTemplate } from "../services/outreachService";
import { GmailComposeModal } from "./GmailComposeModal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

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
    return <div className="text-slate-600 p-6">Loading outreach templates...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Draft Email Outreach</h1>
        <p className="text-sm text-slate-500 mt-1">Personalize templates and queue outbound recruitment cold emails</p>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-card mb-6 text-sm">
          {statusMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-card mb-6 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Draft Editor Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-card shadow-sm space-y-6">
        
        {/* Template Selection Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-600 mb-1.5">Select Template</label>
          <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm text-base-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Placeholders Variable Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Recipient Email"
            type="email"
            placeholder="recruiter@company.com"
            value={recipientEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientEmail(e.target.value)}
            required
          />
          <Input
            label="HR Name ({{hrName}})"
            placeholder="e.g. Jane Doe"
            value={hrName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHrName(e.target.value)}
          />
          <Input
            label="Company Name ({{companyName}})"
            placeholder="e.g. Stripe"
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          />
          <Input
            label="Job Role ({{jobRole}})"
            placeholder="e.g. Software Engineer"
            value={jobRole}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobRole(e.target.value)}
          />
        </div>

        <hr className="border-slate-100" />

        {/* Raw Subject Field */}
        <Input
          label="Edit Subject Structure"
          type="text"
          value={rawSubject}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRawSubject(e.target.value)}
        />

        {/* Raw Body Editor */}
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1.5">
            <label className="text-sm font-medium text-slate-600">Edit Body Structure (HTML Supported)</label>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400">Insert tags:</span>
              <button
                type="button"
                onClick={() => insertPlaceholder("{{hrName}}")}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                {"{{hrName}}"}
              </button>
              <button
                type="button"
                onClick={() => insertPlaceholder("{{companyName}}")}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                {"{{companyName}}"}
              </button>
              <button
                type="button"
                onClick={() => insertPlaceholder("{{jobRole}}")}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                {"{{jobRole}}"}
              </button>
            </div>
          </div>
          <textarea
            id="draft-body-textarea"
            value={rawBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawBody(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed"
          />
        </div>

        {/* Preview Trigger Button */}
        <div className="flex justify-end pt-2">
          <Button type="button" onClick={handlePreview}>
            Preview in Gmail Composer
          </Button>
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
