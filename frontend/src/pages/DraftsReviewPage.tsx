import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { outreachService } from "../features/outreach/services/outreachService";
import { profileService } from "../features/profile/services/profileService";
import type { CandidateProfile } from "../features/profile/services/profileService";
import { useAnalytics } from "../context/AnalyticsContext";
import FeedbackModal from "../components/FeedbackModal";

export const DraftsReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [drafts, setDrafts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [regeneratingDraftId, setRegeneratingDraftId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  // EOD Digest & Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [initialRating, setInitialRating] = useState(5);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState("20:00");
  const [sendingTestDigest, setSendingTestDigest] = useState(false);

  useEffect(() => {
    // Check URL parameters for feedback rating
    const params = new URLSearchParams(window.location.search);
    const ratingParam = params.get("rating");
    if (ratingParam) {
      const r = parseInt(ratingParam, 10);
      if (r >= 1 && r <= 5) {
        setInitialRating(r);
        setIsFeedbackOpen(true);
      }
    }

    // Fetch EOD digest preferences
    const fetchDigestPrefs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/outreach/digest/preferences", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.ok) {
          const data = await res.json();
          setDigestEnabled(data.dailyDigestEnabled ?? true);
          setDigestTime(data.dailyDigestTime || "20:00");
        }
      } catch (err) {
        console.error("Failed to load digest preferences", err);
      }
    };
    fetchDigestPrefs();
  }, []);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await outreachService.getOutreachQueue(userId);
      setDrafts(data.filter((item: any) => item.status === "DRAFT"));

      const candProfiles = await profileService.getCandidateProfiles(userId);
      setProfiles(candProfiles);
    } catch (err) {
      console.error("Failed to load drafts or profiles", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDraftFieldChange = (id: string, field: string, value: any) => {
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
        profileId: draft.profileId,
        status: "PENDING"
      });
      setDrafts(prev => prev.filter(d => d.id !== id));
      setMessage("Draft approved successfully!");
      setTimeout(() => setMessage(null), 3000);
      trackEvent("draft_approved", { draftId: id, company: draft.companyName });
    } catch (err: any) {
      console.error("Failed to approve draft", err);
      setError("Failed to approve draft.");
      trackEvent("draft_approve_failed", { draftId: id, error: err.message || "Unknown error" });
    }
  };

  const handleDiscardDraft = async (id: string) => {
    try {
      setError(null);
      await outreachService.deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      setMessage("Draft discarded successfully.");
      setTimeout(() => setMessage(null), 3000);
      trackEvent("draft_discarded", { draftId: id });
    } catch (err: any) {
      console.error("Failed to discard draft", err);
      setError("Failed to discard draft.");
      trackEvent("draft_discard_failed", { draftId: id, error: err.message || "Unknown error" });
    }
  };

  const handleRegenerateDraft = async (draftId: string, profileId: number) => {
    try {
      setRegeneratingDraftId(draftId);
      setError(null);

      const response = await fetch(`/api/drafts/${draftId}/regenerate?profileId=${profileId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token || ""}`
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to regenerate draft.");
      }

      const updatedDraft = await response.json();
      setDrafts(prev => prev.map(d => d.id === draftId ? updatedDraft : d));
      setMessage("Email draft successfully regenerated for target profile version!");
      setTimeout(() => setMessage(null), 3000);
      trackEvent("draft_regenerated", { draftId, profileId });
    } catch (err: any) {
      console.error("Failed to regenerate draft", err);
      setError(err.message || "Failed to regenerate draft using selected profile version.");
      trackEvent("draft_regenerate_failed", { draftId, profileId, error: err.message || "Unknown error" });
    } finally {
      setRegeneratingDraftId(null);
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
          profileId: draft.profileId,
          status: "PENDING"
        });
        approvedCount++;
      }
      setDrafts([]);
      setMessage(`Successfully approved and scheduled all ${approvedCount} email drafts!`);
      setTimeout(() => setMessage(null), 5000);
      trackEvent("all_drafts_approved", { count: approvedCount });
    } catch (err: any) {
      console.error("Error approving all drafts:", err);
      setError(`Failed to approve all drafts: ${err.message || "Server error"}`);
      loadDrafts();
      trackEvent("all_drafts_approve_failed", { error: err.message || "Unknown error" });
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handleUpdateDigestPrefs = async (enabled: boolean, timeStr: string) => {
    try {
      setDigestEnabled(enabled);
      setDigestTime(timeStr);
      const token = localStorage.getItem("token");
      await fetch("/api/v1/outreach/digest/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          dailyDigestEnabled: enabled,
          dailyDigestTime: timeStr,
        }),
      });
      setMessage("Daily EOD Digest preferences updated!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update digest preferences", err);
    }
  };

  const handleSendTestDigest = async () => {
    setSendingTestDigest(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/outreach/digest/test", {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        setMessage("Daily EOD Digest test email dispatched to your inbox!");
      } else {
        setError("Failed to dispatch test digest email.");
      }
    } catch (err) {
      setError("Network error while sending test digest email.");
    } finally {
      setSendingTestDigest(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs font-semibold text-primary hover:underline mb-2 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Email Drafts & EOD Daily Digest</h1>
          <p className="text-sm text-slate-500 mt-1">Review cold outreach drafts, configure daily EOD summaries, and submit feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-xs font-bold px-3.5 py-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
          >
            ⭐️ Leave Review / Suggestion
          </Button>
          {drafts.length > 0 && (
            <Button 
              variant="success" 
              size="sm" 
              onClick={handleApproveAll} 
              disabled={isApprovingAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2"
            >
              {isApprovingAll ? "Approving All..." : `Approve All (${drafts.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Daily EOD Synopsis Settings Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg mb-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-xl shrink-0">
              📧
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Daily End-Of-Day (EOD) Synopsis Email</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Receive an everyday EOD email with complete activity details (sent emails, recipient list, pending drafts, & quota statistics).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {/* Toggle switch */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={digestEnabled}
                onChange={(e) => handleUpdateDigestPrefs(e.target.checked, digestTime)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              <span className="text-xs font-semibold text-slate-300">Enabled</span>
            </label>

            {/* Digest Time Selector */}
            <select
              value={digestTime}
              onChange={(e) => handleUpdateDigestPrefs(digestEnabled, e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-400"
            >
              <option value="18:00">06:00 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="20:00">08:00 PM (Default)</option>
              <option value="21:00">09:00 PM</option>
              <option value="22:00">10:00 PM</option>
            </select>

            {/* Send Test Email Button */}
            <Button
              variant="outline"
              size="sm"
              disabled={sendingTestDigest}
              onClick={handleSendTestDigest}
              className="text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {sendingTestDigest ? "Sending..." : "Send Test Summary"}
            </Button>
          </div>
        </div>
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
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                        Draft #{drafts.length - idx}
                      </span>
                      {draft.profileName && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                          Profile: {draft.profileName}
                        </span>
                      )}
                      {draft.companyName && draft.jobTitle && (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                          {draft.jobTitle} @ {draft.companyName}
                        </span>
                      )}
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
                    {/* Profile Version Selection & Email Regeneration */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tailored Profile Version:</span>
                        <p className="text-xs text-slate-500 mb-2">Switch the profile version used to generate this outreach draft and rewrite it using LLM pipeline.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={draft.profileId || ""}
                          onChange={(e) => handleDraftFieldChange(draft.id, "profileId", e.target.value ? Number(e.target.value) : "")}
                          className="flex-1 max-w-xs rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-transparent px-3 py-2 bg-white text-slate-700 font-medium"
                        >
                          <option value="">Default Profile</option>
                          {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.profileName} {p.isDefault ? "(Default)" : ""}</option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={regeneratingDraftId === draft.id || !draft.profileId}
                          onClick={() => handleRegenerateDraft(draft.id, draft.profileId)}
                          className="text-xs font-semibold px-4 py-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          {regeneratingDraftId === draft.id ? "Regenerating..." : "Regenerate Draft"}
                        </Button>
                      </div>
                    </div>

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

      {/* Interactive Review & Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialRating={initialRating}
      />
    </div>
  );
};

export default DraftsReviewPage;
