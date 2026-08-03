import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";
import { outreachService } from "../../../outreach/services/outreachService";
import { profileService } from "../../../profile/services/profileService";
import ReferralSection from "./ReferralSection";
import { learningService } from "../../../learning/services/learningService";
import type { DailyContent } from "../../../learning/services/learningService";
import { StreakWidget } from "../StreakWidget";
import { ActivityChart } from "../ActivityChart";
import { dashboardService } from "../../services/dashboardService";
import { StatsGrid } from "./StatsGrid";
import { ReviewDrawer } from "./ReviewDrawer";
import CampaignDispatchModal from "../../../outreach/components/CampaignDispatchModal";
import { parseUtcDate, formatDateInTimezone } from "../../../../utils/dateUtils";

export const ProfessionalDashboardView: React.FC = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [gmailConnected, setGmailConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [hasResume, setHasResume] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [outreachTargetRole, setOutreachTargetRole] = useState<string>("");
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Campaign State
  const [hrOutreachCampaignEnabled, setHrOutreachCampaignEnabled] = useState(false);
  const [togglingCampaign, setTogglingCampaign] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignNotification, setCampaignNotification] = useState<string>("");
  const [userTimezone, setUserTimezone] = useState<string>("");

  // Daily learning content state
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [showTipModal, setShowTipModal] = useState(false);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "outreach" | "growth">("overview");

  // Timeframe state
  const [timeframe, setTimeframe] = useState<"all" | "24h" | "7d" | "30d">("all");

  // Outreach Send Queue date filter state
  const [queueTimeframe, setQueueTimeframe] = useState<"today" | "week" | "month" | "all">("today");

  // Status filter state for Outreach Send Queue
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>("all");

  // Scroll coordination target state
  const [scrollToTarget, setScrollToTarget] = useState<string | null>(null);

  // Streak Widget visibility
  const [showStreak, setShowStreak] = useState(() => localStorage.getItem("show_streak_widget") !== "false");

  // Metrics State
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

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
      const itemDate = parseUtcDate(dateStr);
      if (!itemDate) return false;
      return (now - itemDate.getTime()) <= msLimit;
    });
  };

  const filterQueueByDate = (items: any[]) => {
    const now = new Date();
    return items.filter(item => {
      const dateStr = item.sentAt || item.scheduledAt || item.createdAt;
      if (!dateStr) return false;
      const itemDate = parseUtcDate(dateStr);
      if (!itemDate) return false;

      if (queueTimeframe === "today") {
        return itemDate.getDate() === now.getDate() &&
               itemDate.getMonth() === now.getMonth() &&
               itemDate.getFullYear() === now.getFullYear();
      }
      if (queueTimeframe === "week") {
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (queueTimeframe === "month") {
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      return true; // all
    });
  };

  const filterQueueByStatus = (items: any[]) => {
    if (queueStatusFilter === "all") return items;
    return items.filter(item => item.status === queueStatusFilter);
  };

  const filteredQueueItems = filterByTimeframe(queueItems);
  const filteredQueue = filterQueueByStatus(filterQueueByDate(queueItems));
  const filteredDrafts = filterByTimeframe(drafts);
  const filteredSuggestions = filterByTimeframe(suggestions);

  const sentCount = filteredQueueItems.filter(item => item.status === "SENT").length;
  const pendingApprovalCount = filteredDrafts.length;
  const suggestionCount = filteredSuggestions.length;
  const totalApplications = filteredQueueItems.length;

  // Scroll to target element when switching tabs
  useEffect(() => {
    if (activeTab === "outreach" && scrollToTarget) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollToTarget);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setScrollToTarget(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, scrollToTarget]);

  const handleCardClick = (cardType: "total" | "pending" | "suggestions" | "sent") => {
    if (cardType === "pending") {
      setScrollToTarget("drafts-review");
      setActiveTab("outreach");
    } else if (cardType === "suggestions") {
      setScrollToTarget("suggestions-review");
      setActiveTab("outreach");
    } else if (cardType === "total") {
      setQueueStatusFilter("all");
      setScrollToTarget("outreach-queue");
      setActiveTab("outreach");
    } else if (cardType === "sent") {
      setQueueStatusFilter("SENT");
      setScrollToTarget("outreach-queue");
      setActiveTab("outreach");
    }
  };


  useEffect(() => {
    const dismissed = localStorage.getItem("gmail_onboarding_dismissed") === "true";
    
    outreachService.getGmailStatus(userId)
      .then((data) => {
        setGmailConnected(data.connected);
        if (!data.connected && !dismissed) {
          setShowBanner(true);
        }
      })
      .catch((err) => console.error("Failed to fetch Gmail status", err));

    // Fetch candidate profile to check if a resume exists and store profile data
    profileService.getCandidateProfile(userId)
      .then((profile) => {
        setCandidateProfile(profile);
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
        if (data.hrOutreachTargetRole) {
          setOutreachTargetRole(data.hrOutreachTargetRole);
        }
        if (data.timezone) {
          setUserTimezone(data.timezone);
        }
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

    // Fetch dashboard stats metrics (streaks, activity logs)
    setMetricsLoading(true);
    dashboardService.getDashboardMetrics(userId)
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => console.error("Failed to fetch dashboard metrics", err))
      .finally(() => setMetricsLoading(false));
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
        ccEmails: draft.ccEmails,
        parsedEmails: draft.parsedEmails,
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

  const handleApproveSuggestion = async (id: string, suggestion: any) => {
    try {
      await outreachService.updateDraft(id, {
        subject: suggestion.subject,
        body: suggestion.body,
        recipientEmail: suggestion.recipientEmail,
        ccEmails: suggestion.ccEmails,
        parsedEmails: suggestion.parsedEmails,
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

  const handleDrawerFieldChange = (id: string, field: string, value: string) => {
    setDrawerItem((prev: any) => prev ? { ...prev, [field]: value } : null);
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDrawerApprove = async (id: string, item: any) => {
    if (item.status === "SUGGESTION") {
      await handleApproveSuggestion(id, item);
    } else {
      await handleApproveDraft(id, item);
    }
  };

  const handleDrawerDiscard = async (id: string) => {
    if (drawerItem && drawerItem.status === "SUGGESTION") {
      await handleDiscardSuggestion(id);
    } else {
      await handleDiscardDraft(id);
    }
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

  const handleStartCampaignWithMode = async (modeKey?: string) => {
    try {
      setTogglingCampaign(true);
      // Explicitly enable campaign in backend
      const res = await outreachService.toggleHrCampaign(userId, true);
      setHrOutreachCampaignEnabled(res.enabled);

      // Re-fetch email queue to reflect newly generated campaign items immediately
      const updatedQueue = await outreachService.getOutreachQueue(userId);
      setQueueItems(updatedQueue.filter((item: any) => item.status !== "DRAFT" && item.status !== "SUGGESTION"));
      setDrafts(updatedQueue.filter((item: any) => item.status === "DRAFT"));
      setSuggestions(updatedQueue.filter((item: any) => item.status === "SUGGESTION"));

      let modeTitle = "Fully Automated";
      if (modeKey === "DRAFTS" || modeKey === "GMAIL_DRAFTS") modeTitle = "Save to Gmail Drafts";
      if (modeKey === "WEB_COMPOSE" || modeKey === "GMAIL_COMPOSE") modeTitle = "Gmail Web Compose";

      setCampaignNotification(`🚀 HR Cold Email Campaign started in [${modeTitle}] mode! Generated emails have been processed into your queue.`);
      setTimeout(() => setCampaignNotification(""), 6000);
    } catch (err) {
      console.error("Failed to start campaign", err);
    } finally {
      setTogglingCampaign(false);
    }
  };

  useEffect(() => {
    if (!dailyContent?.tip) return;

    const todayStr = new Date().toDateString();

    const tryShowTip = () => {
      const lastDismissed = localStorage.getItem(`last_tip_dismissed_date_${userId}`);
      if (lastDismissed !== todayStr) {
        setShowTipModal(true);
      }
    };

    // Check if walkthrough tour is completed
    const walkthroughCompleted = localStorage.getItem(`walkthrough_completed_${userId}`) === "true";

    if (walkthroughCompleted) {
      tryShowTip();
    }

    // Always listen for walkthrough completion (in case it was active or restarted manually)
    const handleTourFinished = () => {
      tryShowTip();
    };
    window.addEventListener("walkthrough-finished", handleTourFinished);
    return () => {
      window.removeEventListener("walkthrough-finished", handleTourFinished);
    };
  }, [dailyContent, userId]);

  const handleCloseTipModal = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem(`last_tip_dismissed_date_${userId}`, todayStr);
    setShowTipModal(false);
  };


  return (
    <>
      <Helmet>
        <title>Candidate Dashboard | EasyNaukri</title>
        <meta name="description" content="Manage your candidate profile, automated recruiter outreach, job match suggestions, and application tracker on EasyNaukri." />
      </Helmet>

      <h1 className="sr-only">Candidate Dashboard - EasyNaukri</h1>

      {/* Universal Career Passport Header */}
      <div data-tour="dashboard-header" className="mb-8 p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-card shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10" aria-hidden="true">
          <span className="text-8xl">🛂</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Universal Career Passport
              </span>
              <Badge variant={gmailConnected ? "success" : "neutral"}>
                {gmailConnected ? "Verified Channels" : "Channels Offline"}
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name || "Candidate User"}</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Target Role:{" "}
              {(candidateProfile?.jobPreferences?.targetRole ||
                candidateProfile?.jobPreferences?.role ||
                candidateProfile?.jobPreferences?.desiredRole ||
                outreachTargetRole) ? (
                <span className="font-semibold text-indigo-300">
                  {candidateProfile?.jobPreferences?.targetRole ||
                    candidateProfile?.jobPreferences?.role ||
                    candidateProfile?.jobPreferences?.desiredRole ||
                    outreachTargetRole}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/profile/settings")}
                  className="font-semibold text-amber-300 hover:text-amber-200 underline inline-flex items-center gap-1 transition-colors"
                >
                  <span>Please add job profile</span>
                  <span className="text-xs" aria-hidden="true">➔</span>
                </button>
              )}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-card border border-slate-800">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                <span>Trust Score</span>
                <span className="text-indigo-400">
                  {candidateProfile?.trustScore !== undefined
                    ? candidateProfile.trustScore
                    : (hasResume ? 40 : 0) + (gmailConnected ? 40 : 0) + 20}%
                </span>
              </div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={candidateProfile?.trustScore !== undefined ? candidateProfile.trustScore : (hasResume ? 40 : 0) + (gmailConnected ? 40 : 0) + 20} aria-valuemin={0} aria-valuemax={100} aria-label="Trust Score">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" 
                  style={{
                    width: `${
                      candidateProfile?.trustScore !== undefined
                        ? candidateProfile.trustScore
                        : (hasResume ? 40 : 0) + (gmailConnected ? 40 : 0) + 20
                    }%`
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Calculated via verification checks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation Menu */}
      <div role="tablist" aria-label="Dashboard sections" className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-6 text-sm font-bold">
        <button
          type="button"
          role="tab"
          id="tab-overview"
          aria-selected={activeTab === "overview"}
          aria-controls="panel-overview"
          onClick={() => setActiveTab("overview")}
          className={`pb-4 transition-all relative ${activeTab === "overview" ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
        >
          Passport Hub
        </button>
        <button
          type="button"
          role="tab"
          id="tab-outreach"
          aria-selected={activeTab === "outreach"}
          aria-controls="panel-outreach"
          onClick={() => setActiveTab("outreach")}
          className={`pb-4 transition-all relative ${activeTab === "outreach" ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
        >
          Outreach Center <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full ml-1">{drafts.length + suggestions.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-growth"
          aria-selected={activeTab === "growth"}
          aria-controls="panel-growth"
          onClick={() => setActiveTab("growth")}
          className={`pb-4 transition-all relative ${activeTab === "growth" ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
        >
          Professional Growth
        </button>
      </div>

      {/* TAB CONTENT */}

      {activeTab === "overview" && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="space-y-6">
          {showStreak ? (
            <div className="relative group">
              <button
                type="button"
                onClick={() => {
                  setShowStreak(false);
                  localStorage.setItem("show_streak_widget", "false");
                }}
                className="absolute top-3 right-3 z-10 text-[9px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title="Hide Daily Streak Widget"
              >
                Hide Checklist
              </button>
              <StreakWidget
                loginStreak={metrics?.loginStreak || 0}
                dailyActivity={metrics?.dailyActivity || []}
                loading={metricsLoading}
              />
            </div>
          ) : (
            <div className="flex justify-end pr-2">
              <button
                type="button"
                onClick={() => {
                  setShowStreak(true);
                  localStorage.setItem("show_streak_widget", "true");
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>🔥</span> Show Daily Streak & Checklist
              </button>
            </div>
          )}

          {!hasResume && (
            <div className="p-5 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-100 dark:border-rose-900/40 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3">
                <span className="text-2xl mt-0.5">📄</span>
                <div>
                  <h4 className="text-sm font-semibold text-rose-850 dark:text-rose-300">Please upload your updated resume</h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5 max-w-xl">
                    You haven't uploaded a resume yet. To ensure your resume is automatically attached when sending job outreach emails, please upload it to your profile.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/profile/settings")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-1.5 shadow-sm shrink-0"
              >
                Go to Profile to Upload
              </Button>
            </div>
          )}

          {showBanner && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3">
                <span className="text-2xl mt-0.5">📧</span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Automate your Job Outreach!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
                    Connect your personal Gmail account to automatically draft and send tailored, high-fidelity outreach emails directly from your inbox to recruiters.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Overview Metrics</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="timeframe-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Timeframe:</label>
              <select
                id="timeframe-select"
                aria-label="Filter overview metrics timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-card text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <StatsGrid 
            totalApplications={totalApplications} 
            pendingApprovalCount={pendingApprovalCount} 
            suggestionCount={suggestionCount} 
            sentCount={sentCount} 
            onCardClick={handleCardClick}
          />

          {/* Activity Chart */}
          <div className="mb-6">
            <ActivityChart data={metrics?.dailyActivity || []} loading={metricsLoading} />
          </div>

          {/* Notification Banner */}
          {campaignNotification && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-card text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{campaignNotification}</span>
              </div>
              <button 
                onClick={() => setCampaignNotification("")} 
                className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* HR Cold Email Campaign Status Widget */}
          <div data-tour="campaign-widget" className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-2xl shrink-0">
                🚀
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">Automated HR Cold Email Campaign</h4>
                  <Badge variant={hrOutreachCampaignEnabled ? "success" : "neutral"}>
                    {hrOutreachCampaignEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Automatically draft and dispatch cold outreach emails to HR contacts in random order. Respects daily quotas, intervals, and active slot windows.
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  * Upgrade to Premium for multiple template use.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800 rounded-card hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span>Dispatch Modes</span>
              </button>
              <button
                onClick={() => navigate("/profile/settings")}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350 hover:text-slate-800 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-slate-800 rounded-card hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Configure Settings
              </button>
              <Button
                size="sm"
                disabled={togglingCampaign}
                onClick={() => {
                  if (!hrOutreachCampaignEnabled) {
                    setIsCampaignModalOpen(true);
                  } else {
                    handleToggleCampaign();
                  }
                }}
                className={`text-xs font-semibold px-4 py-1.5 shadow-sm ${
                  hrOutreachCampaignEnabled
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {togglingCampaign ? "Updating..." : hrOutreachCampaignEnabled ? "Pause Campaign" : "Start Campaign"}
              </Button>
            </div>
          </div>
          <CampaignDispatchModal
            isOpen={isCampaignModalOpen}
            onClose={() => setIsCampaignModalOpen(false)}
            onLaunchAutomated={handleStartCampaignWithMode}
            userId={userId}
            userProfile={candidateProfile}
            targetRole={outreachTargetRole}
          />
        </div>
      )}

      {activeTab === "outreach" && (
        <div id="panel-outreach" role="tabpanel" aria-labelledby="tab-outreach" className="space-y-8 animate-in fade-in duration-200">
          
          {suggestions.length === 0 && drafts.length === 0 && (
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-card p-8 text-center shadow-sm max-w-2xl mx-auto my-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✉️
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Start Sourcing Opportunities</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Welcome to your Outreach Workspace! Once you add professional opportunities or upload details, tailored email templates and matching suggestions will populate here.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {!hasResume && (
                  <Button
                    size="sm"
                    onClick={() => navigate("/profile/settings")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 shadow-sm"
                  >
                    Upload Resume
                  </Button>
                )}
                {!gmailConnected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleConnectGmail}
                    className="text-xs font-semibold px-4 py-2"
                  >
                    Connect Email
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => navigate("/opportunities/import")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 shadow-sm"
                >
                  Import Opportunity
                </Button>
              </div>
            </div>
          )}

          {/* Job Match Suggestions (Job Matches) */}
          {suggestions.length > 0 && (
            <section id="suggestions-review">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span>🎯</span> Job Match Suggestions
                  </h2>
                  <p className="text-xs text-slate-550 dark:text-slate-400">Tailored outreach drafts generated automatically for jobs matching your skillset</p>
                </div>
                <Badge variant="info">{suggestions.length} Matches Found</Badge>
              </div>
              
              <div className="space-y-3">
                {suggestions.slice(0, 5).map((suggestion) => (
                  <div key={suggestion.id} className="bg-white dark:bg-slate-900 border border-l-4 border-l-indigo-500 border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-full uppercase">
                          Suggestion
                        </span>
                        <span className="text-xs text-slate-400 font-semibold truncate max-w-sm">To: {suggestion.recipientEmail}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{suggestion.subject}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setDrawerItem(suggestion);
                          setIsDrawerOpen(true);
                        }}
                        className="text-xs font-semibold px-3 py-1.5"
                      >
                        Review & Edit
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
                        className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 border-none shadow-sm"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending Approval (Drafts Queue) */}
          {drafts.length > 0 && (
            <section id="drafts-review">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span>⏳</span> Pending Email Approval
                  </h2>
                  <p className="text-xs text-slate-550 dark:text-slate-400">Review generated cold email drafts before they are dispatched from your Gmail inbox</p>
                </div>
                <Badge variant="warning">{drafts.length} Awaiting Approval</Badge>
              </div>

              <div className="space-y-3">
                {drafts.slice(0, 5).map((draft) => (
                  <div key={draft.id} className="bg-white dark:bg-slate-900 border border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800 rounded-card shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 px-2 py-0.5 rounded-full uppercase">
                          Draft
                        </span>
                        <span className="text-xs text-slate-400 font-semibold truncate max-w-sm">To: {draft.recipientEmail}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{draft.subject}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setDrawerItem(draft);
                          setIsDrawerOpen(true);
                        }}
                        className="text-xs font-semibold px-3 py-1.5"
                      >
                        Review & Edit
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
                        className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 border-none shadow-sm"
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Send Queue & Sent History Table */}
          <section id="outreach-queue" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>📅</span> Outreach Send Queue
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">Scheduled chronologies and dispatch history</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="queue-status-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status:</label>
                  <select
                    id="queue-status-select"
                    aria-label="Filter outreach queue by status"
                    value={queueStatusFilter}
                    onChange={(e) => setQueueStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-card text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Statuses</option>
                    <option value="SENT">Sent</option>
                    <option value="PENDING">In Queue</option>
                    <option value="PAUSED">Paused</option>
                    <option value="FAILED">Failed</option>
                    <option value="BLACKLISTED">Blacklisted</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="queue-date-select" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Date:</label>
                  <select
                    id="queue-date-select"
                    aria-label="Filter outreach queue by date range"
                    value={queueTimeframe}
                    onChange={(e) => setQueueTimeframe(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-card text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="today">Current Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                <Badge variant="neutral">{filteredQueue.length} items</Badge>
              </div>
            </div>

            {queueItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-950/40 rounded-card border border-dashed border-slate-200 dark:border-slate-850">
                No outreach emails currently in the queue. Parse a screenshot and generate an email to get started!
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-950/40 rounded-card border border-dashed border-slate-200 dark:border-slate-850">
                No outreach emails found for the selected timeframe.
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.slice(0, 5).map((item) => {
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
                      } else if (item.status === "DRAFT") {
                        statusText = "Draft / Pending Review";
                        variant = "warning";
                      }

                      const handleOpenGmailComposeItem = (eqItem: any) => {
                        const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(eqItem.recipientEmail || "")}&su=${encodeURIComponent(eqItem.subject || "")}&body=${encodeURIComponent(eqItem.body || "")}`;
                        window.open(composeUrl, "_blank");
                      };

                      const formatQueueDetails = (eqItem: any) => {
                        if (eqItem.status === "SENT" && eqItem.sentAt) {
                          return `Dispatched on ${formatDateInTimezone(eqItem.sentAt, userTimezone)}`;
                        }
                        
                        if (eqItem.status === "PENDING" && eqItem.scheduledAt) {
                          const scheduledDate = parseUtcDate(eqItem.scheduledAt);
                          if (scheduledDate) {
                            const scheduledTime = scheduledDate.getTime();
                            const now = Date.now();
                            const diffMs = scheduledTime - now;
                            const diffMins = Math.round(diffMs / 60000);
                            
                            const formattedDate = formatDateInTimezone(scheduledDate, userTimezone);
                            if (diffMs <= 0) {
                              return `Processing dispatch... (Scheduled: ${formattedDate})`;
                            } else if (diffMins < 1) {
                              return `Sending in less than a minute... (Scheduled: ${formattedDate})`;
                            } else if (diffMins === 1) {
                              return `Sending in ~1 minute (Scheduled: ${formattedDate})`;
                            } else if (diffMins < 60) {
                              return `Sending in ~${diffMins} minutes (Scheduled: ${formattedDate})`;
                            } else {
                              const diffHours = Math.round(diffMins / 60);
                              return `Sending in ~${diffHours} hours (Scheduled: ${formattedDate})`;
                            }
                          }
                        }

                        if (eqItem.status === "PAUSED") {
                          return eqItem.errorMessage || "Paused (Daily quota reached or slot ended).";
                        }

                        if (eqItem.status === "FAILED") {
                          return `Failed: ${eqItem.errorMessage || "Unknown error"}`;
                        }

                        if (eqItem.status === "BLACKLISTED") {
                          return "Excluded: Recipient matches your excluded companies list.";
                        }

                        if (eqItem.status === "DRAFT") {
                          return "Pending manual review. Open in Gmail Compose to send.";
                        }
                        
                        return eqItem.errorMessage || "Awaiting dispatch (cron scheduled)";
                      };

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-350">{item.recipientEmail}</TableCell>
                          <TableCell className="text-slate-500 truncate max-w-[200px]">{item.subject}</TableCell>
                          <TableCell>
                            <Badge variant={variant}>{statusText}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-400">
                            {formatQueueDetails(item)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenGmailComposeItem(item)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                              title="Open in Gmail Web Compose"
                            >
                              <span>Gmail</span>
                              <span className="text-[10px]">↗</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDrawerItem(item);
                                setIsDrawerOpen(true);
                              }}
                              className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold transition-colors"
                            >
                              Review
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {filteredQueue.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate("/outreach/queue")}
                      className="text-xs font-semibold px-4 py-1.5"
                    >
                      View Full Outreach Queue ({filteredQueue.length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {activeTab === "growth" && (
        <div id="panel-growth" role="tabpanel" aria-labelledby="tab-growth" className="space-y-6 animate-in fade-in duration-200">
          
          {/* Daily Learning Preview Widget */}
          {dailyContent && (
            <div data-tour="learning-preview" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 text-white rounded-card p-6 shadow-sm border border-slate-800 relative overflow-hidden">
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
        </div>
      )}

      {/* Tip of the Day Pop-up Modal */}
      {showTipModal && dailyContent?.tip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 animate-in zoom-in-95 duration-200">
            {/* Header / Accent Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
            
            {/* Content Area */}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">Daily Advice</span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tip of the Day</h3>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseTipModal}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-indigo-950 dark:text-indigo-200 text-base">{dailyContent.tip.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{dailyContent.tip.content}</p>
              </div>

              <button
                onClick={handleCloseTipModal}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-btn text-sm shadow-md transition-all duration-200"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sliding Review Drawer */}
      <ReviewDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerItem(null);
        }}
        item={drawerItem}
        onFieldChange={handleDrawerFieldChange}
        onApprove={handleDrawerApprove}
        onDiscard={handleDrawerDiscard}
      />
    </>
  );
};

export default ProfessionalDashboardView;
