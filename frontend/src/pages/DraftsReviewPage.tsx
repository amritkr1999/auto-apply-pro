import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { outreachService } from "../features/outreach/services/outreachService";

export const DraftsReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await outreachService.getOutreachQueue(userId);
      setDrafts(data.filter((item: any) => item.status === "DRAFT"));
    } catch (err) {
      console.error("Failed to load drafts", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDraftFieldChange = (id: string, field: string, value: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleApproveDraft = async (id: string, draft: any) => {
    try {
      setError(null);
      await outreachService.updateDraft(id, {
        subject: draft.subject,
        body: draft.body,
        recipientEmail: draft.recipientEmail,
        ccEmails: draft.ccEmails,
        parsedEmails: draft.parsedEmails,
        status: "PENDING"
      });
      setDrafts(prev => prev.filter(d => d.id !== id));
      setMessage("Draft approved successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to approve draft", err);
      setError("Failed to approve draft.");
    }
  };

  const handleDiscardDraft = async (id: string) => {
    try {
      setError(null);
      await outreachService.deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      setMessage("Draft discarded successfully.");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to discard draft", err);
      setError("Failed to discard draft.");
    }
  };

  const handleApproveAll = async () => {
    if (drafts.length === 0) return;
    
    setIsApprovingAll(true);
    setError(null);
    setMessage(null);

    let approvedCount = 0;
    try {
      for (const draft of drafts) {
        await outreachService.updateDraft(draft.id, {
          subject: draft.subject,
          body: draft.body,
          recipientEmail: draft.recipientEmail,
          ccEmails: draft.ccEmails,
          parsedEmails: draft.parsedEmails,
          status: "PENDING"
        });
        approvedCount++;
      }
      setDrafts([]);
      setMessage(`Successfully approved and scheduled all ${approvedCount} email drafts!`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error("Error approving all drafts:", err);
      setError(`Failed to approve all drafts: ${err.message || "Server error"}`);
      loadDrafts();
    } finally {
      setIsApprovingAll(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate("/candidate-dashboard")}
            className="text-xs font-semibold text-primary hover:underline mb-2 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Email Drafts Awaiting Approval</h1>
          <p className="text-sm text-slate-500 mt-1">Review, personalize, and approve generated cold outreach drafts</p>
        </div>
        {drafts.length > 0 && (
          <div className="flex items-center gap-3">
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleApproveAll} 
              disabled={isApprovingAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2"
            >
              {isApprovingAll ? "Approving All..." : `Approve All (${drafts.length})`}
            </Button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-card mb-6 text-sm text-center">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-card mb-6 text-sm text-center">
          {message}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm italic">
          Loading email drafts...
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-card text-slate-500 text-sm italic">
          No drafts currently awaiting review. Upload screenshots on the dashboard to auto-generate outreach drafts!
        </div>
      ) : (
        <div className="space-y-6">
          {drafts.map((draft, idx) => {
            const isEditing = editingDraftId === draft.id;
            return (
              <div 
                key={draft.id} 
                className={`bg-white border rounded-card overflow-hidden transition-all duration-200 shadow-sm ${
                  isEditing ? "border-primary" : "border-slate-200 hover:border-slate-350"
                }`}
              >
                {/* Header preview row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                        Draft #{drafts.length - idx}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">To: {draft.recipientEmail} {draft.ccEmails ? `(CC: ${draft.ccEmails})` : ''}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 truncate">{draft.subject}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingDraftId(isEditing ? null : draft.id)}
                      className="text-xs font-semibold px-3 py-1.5"
                    >
                      {isEditing ? "Cancel" : "Edit Draft"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDiscardDraft(draft.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 px-3 py-1.5"
                    >
                      Discard
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => handleApproveDraft(draft.id, draft)}
                      className="text-xs font-semibold px-4 py-1.5"
                    >
                      Approve
                    </Button>
                  </div>
                </div>

                {/* Expandable editor panel */}
                {isEditing && (
                  <div className="p-5 border-t border-slate-100 space-y-4 bg-slate-50/20">
                    {/* Interactive Recipient Management */}
                    <div className="space-y-3">
                      {draft.parsedEmails && (
                        <div className="bg-slate-100/60 p-3 rounded-lg border border-slate-200/50">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parsed Emails from posting:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {draft.parsedEmails.split(',').map((email: string) => {
                              const trimmed = email.trim();
                              if (!trimmed) return null;
                              const isPrimary = draft.recipientEmail === trimmed;
                              const ccList = draft.ccEmails ? draft.ccEmails.split(',').map((c: string) => c.trim()) : [];
                              const isCC = ccList.includes(trimmed);
                              
                              return (
                                <button
                                  key={trimmed}
                                  type="button"
                                  onClick={() => {
                                    if (isPrimary) {
                                      // Toggle off primary
                                    } else {
                                      // Set as primary, and remove from CC
                                      const newCc = ccList.filter((c: string) => c !== trimmed).join(', ');
                                      handleDraftFieldChange(draft.id, "recipientEmail", trimmed);
                                      handleDraftFieldChange(draft.id, "ccEmails", newCc);
                                    }
                                  }}
                                  className={`text-xs px-2.5 py-1 rounded-full transition-all border font-medium flex items-center gap-1 ${
                                    isPrimary 
                                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                      : isCC 
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                                  }`}
                                >
                                  <span>{trimmed}</span>
                                  {isPrimary && <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1 rounded-full uppercase">To</span>}
                                  {isCC && <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded-full uppercase">CC</span>}
                                  {!isPrimary && !isCC && (
                                    <span 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedCc = [...ccList, trimmed].join(', ');
                                        handleDraftFieldChange(draft.id, "ccEmails", updatedCc);
                                      }}
                                      className="hover:bg-slate-200 rounded px-1 text-[10px]"
                                      title="Add to CC"
                                    >
                                      +CC
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Recipient Email (To)</label>
                          <input 
                            type="email"
                            value={draft.recipientEmail || ''}
                            onChange={(e) => handleDraftFieldChange(draft.id, "recipientEmail", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="recruiter@company.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">CC Emails (Comma-separated)</label>
                          <input 
                            type="text"
                            value={draft.ccEmails || ''}
                            onChange={(e) => handleDraftFieldChange(draft.id, "ccEmails", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="cc1@company.com, cc2@company.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Subject</label>
                      <input 
                        type="text"
                        value={draft.subject}
                        onChange={(e) => handleDraftFieldChange(draft.id, "subject", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Subject line"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Body</label>
                      <textarea 
                        value={draft.body}
                        onChange={(e) => handleDraftFieldChange(draft.id, "body", e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                        placeholder="Write email body..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setEditingDraftId(null)}
                        className="text-xs font-semibold px-4 py-1.5"
                      >
                        Close Editor
                      </Button>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => {
                          handleApproveDraft(draft.id, draft);
                          setEditingDraftId(null);
                        }}
                        className="text-xs font-semibold px-4 py-1.5"
                      >
                        Save & Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DraftsReviewPage;
