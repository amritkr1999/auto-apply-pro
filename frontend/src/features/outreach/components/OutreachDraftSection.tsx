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
      } catch {
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

  const parseTextForPreview = (text: string) => {
    let result = text;
    const variables = [
      { key: "{{hrName}}", value: hrName },
      { key: "{{companyName}}", value: companyName },
      { key: "{{jobRole}}", value: jobRole },
    ];
    
    variables.forEach(({ key, value }) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKey, "g");
      if (value) {
        result = result.replace(
          regex,
          `<span class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100 text-xs inline-block my-0.5">${value}</span>`
        );
      } else {
        result = result.replace(
          regex,
          `<span class="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-semibold border border-amber-200 border-dashed text-xs inline-block my-0.5 animate-pulse">${key}</span>`
        );
      }
    });
    return result;
  };

  const formatBodyForPreview = (text: string) => {
    let parsed = parseTextForPreview(text);
    if (!/<[a-z][\s\S]*>/i.test(text)) {
      parsed = parsed.replace(/\n/g, "<br />");
    }
    return parsed;
  };

  const formatSubjectForPreview = (text: string) => {
    return parseTextForPreview(text);
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
    <div className="max-w-[1400px] mx-auto w-full px-2 sm:px-4">
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

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Draft Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
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
        </div>

        {/* Right Column: Live Email Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full animate-in fade-in slide-in-from-right duration-500">
          <div className="sticky top-6">
            {/* Mac OS Window Mock Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-t-xl px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-xs text-slate-400 font-medium ml-2 font-mono">Live Email Preview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">Live Sync</span>
              </div>
            </div>
            
            {/* Email Preview Card Body */}
            <div className="bg-slate-50 border-x border-b border-slate-200 rounded-b-xl p-5 shadow-sm space-y-4">
              
              {/* Headers Area */}
              <div className="bg-white border border-slate-100 p-4 rounded-lg space-y-2.5 shadow-sm">
                <div className="flex items-center text-xs text-slate-500">
                  <span className="w-14 font-medium uppercase tracking-wider text-slate-400">From</span>
                  <span className="text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">You &lt;your-gmail@gmail.com&gt;</span>
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <span className="w-14 font-medium uppercase tracking-wider text-slate-400">To</span>
                  {recipientEmail ? (
                    <span className="text-primary font-semibold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded truncate max-w-[250px]">
                      {recipientEmail}
                    </span>
                  ) : (
                    <span className="text-rose-500 font-semibold bg-rose-50 border border-rose-100 border-dashed px-2 py-0.5 rounded animate-pulse">
                      recruiter@company.com
                    </span>
                  )}
                </div>
                <div className="flex items-start text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="w-14 font-medium uppercase tracking-wider text-slate-400 mt-0.5">Subject</span>
                  <div 
                    className="text-slate-800 font-bold text-sm flex-1 leading-snug"
                    dangerouslySetInnerHTML={{ __html: formatSubjectForPreview(rawSubject) || `<span class="text-slate-400 italic">No Subject</span>` }}
                  />
                </div>
              </div>

              {/* Email Body Sheet (White Sheet) */}
              <div className="bg-white border border-slate-200/80 rounded-lg shadow-inner min-h-[300px] flex flex-col p-6 overflow-y-auto">
                <div 
                  className="text-sm text-slate-700 flex-grow font-sans leading-relaxed whitespace-pre-wrap select-text"
                  dangerouslySetInnerHTML={{ __html: formatBodyForPreview(rawBody) || `<span class="text-slate-400 italic text-slate-300">Start editing the body template...</span>` }}
                />

                {/* Attachment Footer Mockup */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attachment</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors p-2.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700 leading-none">resume.pdf</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Your Active Resume</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded tracking-wide">
                      Attached
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Note */}
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                <span>💡</span>
                <span>Changes sync in real-time. Highlights show template variables.</span>
              </div>

            </div>
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
