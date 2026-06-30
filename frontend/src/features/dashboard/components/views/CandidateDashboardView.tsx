import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";
import { outreachService } from "../../../outreach/services/outreachService";
import { profileService } from "../../../profile/services/profileService";
import ReferralSection from "./ReferralSection";
import { learningService } from "../../../learning/services/learningService";
import type { DailyContent } from "../../../learning/services/learningService";

export const CandidateDashboardView: React.FC = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [gmailConnected, setGmailConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [hasResume, setHasResume] = useState(true);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null);
  
  // Campaign State
  const [hrOutreachCampaignEnabled, setHrOutreachCampaignEnabled] = useState(false);
  const [togglingCampaign, setTogglingCampaign] = useState(false);

  // Daily learning content state
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);

  // Timeframe state
  const [timeframe, setTimeframe] = useState<"all" | "24h" | "7d" | "30d">("all");

  const filterByTimeframe = (items: any[]) => {
    if (timeframe === "all") return items;
    const now = Date.now();
    let msLimit = 0;
    if (timeframe === "24h") msLimit = 24 * 60 * 60 * 1000;
    else if (timeframe === "7d") msLimit = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === "30d") msLimit = 30 * 24 * 60 * 60 * 1000;
    
    return items.filter(item => {
      const dateStr = item.sentAt || item.createdAt;
      if (!dateStr) return false;
      const itemTime = new Date(dateStr).getTime();
      return (now - itemTime) <= msLimit;
    });
  };

  const filteredQueueItems = filterByTimeframe(queueItems);
  const filteredDrafts = filterByTimeframe(drafts);
  const filteredSuggestions = filterByTimeframe(suggestions);

  const sentCount = filteredQueueItems.filter(item => item.status === "SENT").length;
  const pendingApprovalCount = filteredDrafts.length;
  const suggestionCount = filteredSuggestions.length;
  const totalApplications = filteredQueueItems.length;


  useEffect(() => {
    const dismissed = localStorage.getItem("gmail_onboarding_dismissed") === "true";
    
    outreachService.getGmailStatus(userId)
      .then((data) => {
        setGmailConnected(data.connected);
        if (!data.connected && !dismissed) {
          setShowBanner(true);
        }
      })
      .catch((err) => console.error("Failed to fetch Gmail status", err))
      .finally(() => setLoadingStatus(false));

    // Fetch candidate profile to check if a resume exists
    profileService.getCandidateProfile(userId)
      .then((profile) => {
        setHasResume(!!profile.resumeFilename);
      })
      .catch((err) => {
        console.error("Failed to fetch candidate profile", err);
        setHasResume(true);
      });

    // Fetch campaign active settings status
    outreachService.getOutreachSettings(userId)
      .then((data) => {
        setHrOutreachCampaignEnabled(!!data.hrOutreachCampaignEnabled);
      })
      .catch((err) => console.error("Failed to fetch campaign settings", err));

    // Fetch candidate outreach queue history
    outreachService.getOutreachQueue(userId)
      .then((data) => {
        setQueueItems(data.filter((item: any) => item.status !== "DRAFT" && item.status !== "SUGGESTION"));
        setDrafts(data.filter((item: any) => item.status === "DRAFT"));
        setSuggestions(data.filter((item: any) => item.status === "SUGGESTION"));
      })
      .catch((err) => console.error("Failed to fetch outreach queue", err));

    // Fetch daily learning preview
    learningService.getDailyContent()
      .then((data) => {
        setDailyContent(data);
      })
      .catch((err) => console.error("Failed to fetch daily content on dashboard", err));
  }, [userId]);

  const handleDismissBanner = () => {
    localStorage.setItem("gmail_onboarding_dismissed", "true");
    setShowBanner(false);
  };

  const handleConnectGmail = async () => {
    try {
      const redirectUrl = await outreachService.getConnectUrl(userId);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Failed to connect Gmail", err);
    }
  };

  const handleApproveDraft = async (id: string, draft: any) => {
    try {
      await outreachService.updateDraft(id, {
        subject: draft.subject,
        body: draft.body,
        recipientEmail: draft.recipientEmail,
        status: "PENDING"
      });
      setDrafts(prev => prev.filter(d => d.id !== id));
      // Re-fetch queue to get the scheduled send time correct
      const updatedQueue = await outreachService.getOutreachQueue(userId);
      setQueueItems(updatedQueue.filter((item: any) => item.status !== "DRAFT" && item.status !== "SUGGESTION"));
    } catch (err) {
      console.error("Failed to approve draft", err);
    }
  };

  const handleDiscardDraft = async (id: string) => {
    try {
      await outreachService.deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Failed to discard draft", err);
    }
  };

  const handleDraftFieldChange = (id: string, field: string, value: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleApproveSuggestion = async (id: string, suggestion: any) => {
    try {
      await outreachService.updateDraft(id, {
        subject: suggestion.subject,
        body: suggestion.body,
        recipientEmail: suggestion.recipientEmail,
        status: "PENDING"
      });
      setSuggestions(prev => prev.filter(s => s.id !== id));
      // Re-fetch queue to get the scheduled send time correct
      const updatedQueue = await outreachService.getOutreachQueue(userId);
      setQueueItems(updatedQueue.filter((item: any) => item.status !== "DRAFT" && item.status !== "SUGGESTION"));
    } catch (err) {
      console.error("Failed to approve suggestion", err);
    }
  };

  const handleDiscardSuggestion = async (id: string) => {
    try {
      await outreachService.deleteDraft(id);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to discard suggestion", err);
    }
  };

  const handleSuggestionFieldChange = (id: string, field: string, value: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleToggleCampaign = async () => {
    try {
      setTogglingCampaign(true);
      const nextState = !hrOutreachCampaignEnabled;
      const res = await outreachService.toggleHrCampaign(userId, nextState);
      setHrOutreachCampaignEnabled(res.enabled);
      
      // Re-fetch email queue to reflect changes immediately
      const updatedQueue = await outreachService.getOutreachQueue(userId);
      setQueueItems(updatedQueue.filter((item: any) => item.status !== "DRAFT" && item.status !== "SUGGESTION"));
      setDrafts(updatedQueue.filter((item: any) => item.status === "DRAFT"));
      setSuggestions(updatedQueue.filter((item: any) => item.status === "SUGGESTION"));
    } catch (err) {
      console.error("Failed to toggle campaign", err);
    } finally {
      setTogglingCampaign(false);
    }
  };

  useEffect(() => {
    if (dailyContent?.tip) {
      const todayStr = new Date().toDateString();
      const lastDismissed = localStorage.getItem("last_tip_dismissed_date");
      if (lastDismissed !== todayStr) {
        setShowTipModal(true);
      }
    }
  }, [dailyContent]);

  const handleCloseTipModal = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem("last_tip_dismissed_date", todayStr);
    setShowTipModal(false);
  };


  return (
    <>
      <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-800">Candidate Dashboard</h1>
              {!loadingStatus && (
                <Badge variant={gmailConnected ? "success" : "neutral"}>
                  {gmailConnected ? "Gmail Connected" : "Gmail Disconnected"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Track your job applications and email outreach status</p>
          </div>
        </div>

        {!hasResume && (
          <div className="mb-8 p-5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3">
              <span className="text-2xl mt-0.5">📄</span>
              <div>
                <h4 className="text-sm font-semibold text-rose-800">Please upload your updated resume</h4>
                <p className="text-xs text-rose-600 mt-0.5 max-w-xl">
                  You haven't uploaded a resume yet. To ensure your resume is automatically attached when sending job outreach emails, please upload it to your profile.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                size="sm"
                onClick={() => navigate("/candidate/profile")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
              >
                Go to Profile to Upload
              </Button>
            </div>
          </div>
        )}

        {showBanner && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3">
              <span className="text-2xl mt-0.5">📧</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Automate your Job Outreach!</h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  Connect your personal Gmail account to automatically draft and send tailored, high-fidelity outreach emails directly from your inbox to recruiters.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleDismissBanner}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Dismiss
              </button>
              <Button
                size="sm"
                onClick={handleConnectGmail}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
              >
                Connect Gmail
              </Button>
            </div>
          </div>
        )}

        {/* Timeframe selector header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800">Overview Metrics</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Applications</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{totalApplications} submitted</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Approval</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{pendingApprovalCount} drafts</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Match Suggestions</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{suggestionCount} suggestions</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sent Emails</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">{sentCount} sent</p>
          </div>
        </div>

        {/* HR Cold Email Campaign Status Widget */}
        <div className="mb-10 p-6 bg-white border border-slate-200 rounded-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-slate-800">Automated HR Cold Email Campaign</h4>
                <Badge variant={hrOutreachCampaignEnabled ? "success" : "neutral"}>
                  {hrOutreachCampaignEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Automatically draft and dispatch cold outreach emails to HR contacts in random order. Respects daily quotas, intervals, and active slot windows.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button
              onClick={() => navigate("/candidate/profile")}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors border border-slate-200 rounded-card hover:bg-slate-50"
            >
              Configure Settings
            </button>
            <Button
              size="sm"
              disabled={togglingCampaign}
              onClick={handleToggleCampaign}
              className={`text-xs font-semibold px-4 py-1.5 shadow-sm ${
                hrOutreachCampaignEnabled
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {togglingCampaign ? "Toggling..." : hrOutreachCampaignEnabled ? "Pause Campaign" : "Activate Campaign"}
            </Button>
          </div>
        </div>

        {/* Daily Learning Preview Widget */}
        {dailyContent && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 text-white rounded-card p-6 shadow-sm border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            
            <div className="space-y-3 relative border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Daily Tip
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Tip of the Day</span>
                </div>
                {dailyContent.tip ? (
                  <>
                    <h4 className="text-xs sm:text-sm font-bold text-indigo-100 line-clamp-1">{dailyContent.tip.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{dailyContent.tip.content}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Loading daily tip...</p>
                )}
              </div>
              <button
                onClick={() => navigate("/learning")}
                className="mt-4 self-start text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 focus:outline-none"
              >
                View Tip Details →
              </button>
            </div>

            <div className="space-y-3 relative pl-0 md:pl-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Daily Challenge
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Question of the Day</span>
                </div>
                {dailyContent.question ? (
                  <>
                    <h4 className="text-xs sm:text-sm font-bold text-rose-100 line-clamp-1">{dailyContent.question.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{dailyContent.question.content}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Loading daily question...</p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/learning")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-4 py-1 shadow-sm mt-4 self-start border-none"
              >
                Solve Question
              </Button>
            </div>
          </div>
        )}

        <ReferralSection userId={userId} />

        {/* Email Suggestions (Job Matches) */}
        {suggestions.length > 0 && (
          <section className="mb-10" id="suggestions-review">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>🎯</span> Job Match Suggestions
                </h2>
                <p className="text-xs text-slate-500">Tailored outreach drafts generated automatically for jobs matching your skillset</p>
              </div>
              <Badge variant="info">{suggestions.length} Matches Found</Badge>
            </div>
            
            <div className="space-y-4">
              {suggestions.slice(0, 5).map((suggestion) => {
                const isEditing = editingSuggestionId === suggestion.id;
                return (
                  <div key={suggestion.id} className="bg-white border border-l-4 border-l-indigo-500 border-slate-200 rounded-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    {/* Header preview row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                            Suggestion
                          </span>
                          <span className="text-xs text-slate-400 font-medium">To: {suggestion.recipientEmail}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 truncate">{suggestion.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingSuggestionId(isEditing ? null : suggestion.id)}
                          className="text-xs font-semibold px-3 py-1.5"
                        >
                          {isEditing ? "Cancel" : "Edit Suggestion"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDiscardSuggestion(suggestion.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 px-3 py-1.5"
                        >
                          Discard
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApproveSuggestion(suggestion.id, suggestion)}
                          className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 border-none"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>

                    {/* Expandable editor panel */}
                    {isEditing && (
                      <div className="p-5 border-t border-slate-100 space-y-4 bg-slate-50/20">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Recipient Email</label>
                          <input 
                            type="email"
                            value={suggestion.recipientEmail}
                            onChange={(e) => handleSuggestionFieldChange(suggestion.id, "recipientEmail", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="recruiter@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Subject</label>
                          <input 
                            type="text"
                            value={suggestion.subject}
                            onChange={(e) => handleSuggestionFieldChange(suggestion.id, "subject", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="Subject line"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Body</label>
                          <textarea 
                            value={suggestion.body}
                            onChange={(e) => handleSuggestionFieldChange(suggestion.id, "body", e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                            placeholder="Write email body..."
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setEditingSuggestionId(null)}
                            className="text-xs font-semibold px-4 py-1.5"
                          >
                            Close Editor
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => {
                              handleApproveSuggestion(suggestion.id, suggestion);
                              setEditingSuggestionId(null);
                            }}
                            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 border-none"
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
          </section>
        )}

        {/* Email Drafts Awaiting Approval */}
        {drafts.length > 0 && (
          <section className="mb-10" id="drafts-review">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>📨</span> Email Drafts Awaiting Approval
                </h2>
                <p className="text-xs text-slate-500">Verify email copy and approve drafts to add them to your sending queue</p>
              </div>
              <Badge variant="warning">{drafts.length} Action Required</Badge>
            </div>
            
            <div className="space-y-4">
              {drafts.slice(0, 5).map((draft) => {
                const isEditing = editingDraftId === draft.id;
                return (
                  <div key={draft.id} className="bg-white border border-slate-200 rounded-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                    {/* Header preview row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                            Draft
                          </span>
                          <span className="text-xs text-slate-400 font-medium">To: {draft.recipientEmail}</span>
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
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Recipient Email</label>
                          <input 
                            type="email"
                            value={draft.recipientEmail}
                            onChange={(e) => handleDraftFieldChange(draft.id, "recipientEmail", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            placeholder="recruiter@company.com"
                          />
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
                            rows={6}
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

            {drafts.length > 5 && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/outreach/drafts/review")}
                  className="text-xs font-semibold px-4 py-1.5"
                >
                  View All Drafts ({drafts.length})
                </Button>
              </div>
            )}
          </section>
        )}


        {/* Email Outreach Queue */}
        <section className="mt-10" id="outreach-queue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Email Outreach Queue</h2>
              <p className="text-xs text-slate-500">Scheduled recruiter outreach emails and logs</p>
            </div>
            <Button size="sm" onClick={() => navigate("/jobs/parse")}>
              Parse New Screenshot
            </Button>
          </div>

          {queueItems.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-card text-slate-400 text-sm italic">
              No outreach emails currently in the queue. Parse a screenshot and generate an email to get started!
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details / Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueItems.slice(0, 5).map((item) => {
                    let statusText = "In Queue";
                    let variant: "neutral" | "success" | "warning" | "error" | "info" = "neutral";
                    
                    if (item.status === "SENT") {
                      statusText = "Sent";
                      variant = "success";
                    } else if (item.status === "FAILED") {
                      statusText = "Failed";
                      variant = "error";
                    } else if (item.status === "BLACKLISTED") {
                      statusText = "Blacklisted";
                      variant = "error";
                    } else if (item.status === "PAUSED") {
                      statusText = "Paused";
                      variant = "warning";
                    } else if (item.status === "PENDING") {
                      statusText = "In Queue";
                      variant = "info";
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold text-slate-700">{item.recipientEmail}</TableCell>
                        <TableCell className="text-slate-500 truncate max-w-[200px]">{item.subject}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{statusText}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {item.status === "SENT" && item.sentAt ? `Dispatched on ${new Date(item.sentAt).toLocaleString()}` : item.errorMessage || "Awaiting dispatch (cron scheduled every 5m)"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {queueItems.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/outreach/queue")}
                    className="text-xs font-semibold px-4 py-1.5"
                  >
                    View Full Outreach Queue ({queueItems.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

      {/* Tip of the Day Pop-up Modal */}
      {showTipModal && dailyContent?.tip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 duration-200">
            {/* Header / Accent Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            
            {/* Content Area */}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">Daily Advice</span>
                    <h3 className="text-lg font-bold text-slate-800">Tip of the Day</h3>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseTipModal}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-indigo-950 text-base">{dailyContent.tip.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{dailyContent.tip.content}</p>
              </div>

              <button
                onClick={handleCloseTipModal}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-btn text-sm shadow-md transition-all duration-200"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateDashboardView;
