import React, { useState, useEffect } from "react";
import { outreachService, type EmailTemplate } from "../services/outreachService";
import { getActiveSubscription } from "../../billing/services/billingService";
import { Link } from "react-router-dom";
import "../outreach.css";

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("");

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser.id : null;
  const currentUserRole = currentUser ? currentUser.role : null;
  const isAdmin = currentUserRole === "ADMIN";

  const fetchActiveTemplateId = async () => {
    if (!currentUserId) return;
    try {
      const data = await outreachService.getOutreachSettings(currentUserId);
      setActiveTemplateId(data.hrOutreachTemplateId || "default-1");
    } catch (err) {
      console.warn("Failed to fetch active template, falling back to local storage.", err);
      const localSettingsStr = localStorage.getItem(`outreach_settings_${currentUserId}`);
      if (localSettingsStr) {
        const localSettings = JSON.parse(localSettingsStr);
        setActiveTemplateId(localSettings.hrOutreachTemplateId || "default-1");
      } else {
        setActiveTemplateId("default-1");
      }
    }
  };

  const handleActivateTemplate = async (templateId: string) => {
    if (!currentUserId) {
      setError("Please log in to activate a template.");
      return;
    }
    try {
      setError("");
      setMessage("");

      let currentSettings;
      try {
        currentSettings = await outreachService.getOutreachSettings(currentUserId);
      } catch {
        const localSettingsStr = localStorage.getItem(`outreach_settings_${currentUserId}`);
        currentSettings = localSettingsStr ? JSON.parse(localSettingsStr) : {
          dailyLimit: 50,
          minIntervalMinutes: 10,
          maxIntervalMinutes: 30,
          slotStart: "09:00",
          slotEnd: "17:00",
          timezone: "UTC",
          skipWeekends: true,
          hrOutreachCampaignEnabled: false,
          hrOutreachTargetRole: "Software Engineer",
          hrOutreachTemplateId: "default-1",
          hrOutreachSourceTable: "TESTING",
          marketingEmailsEnabled: true
        };
      }

      const updatedSettings = {
        ...currentSettings,
        hrOutreachTemplateId: templateId
      };

      await outreachService.saveOutreachSettings(currentUserId, updatedSettings);
      setActiveTemplateId(templateId);
      setMessage("Template activated successfully for outreach!");
      setTimeout(() => setMessage(""), 3000);
      setActiveTemplate(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Failed to activate template.");
    }
  };

  const fetchTemplates = async (sortVal?: string) => {
    setLoading(true);
    try {
      const activeSort = sortVal !== undefined ? sortVal : sortBy;
      const data = await outreachService.getTemplates(activeSort);
      setTemplates(data);
      if (activeTemplate) {
        const updated = data.find(t => t.id === activeTemplate.id);
        if (updated) {
          setActiveTemplate(updated);
        }
      }
    } catch {
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      setError("");
      const nowFavorited = await outreachService.toggleFavorite(id);
      setMessage(nowFavorited ? "Template added to favorites!" : "Template removed from favorites.");
      fetchTemplates();
      if (activeTemplate && activeTemplate.id === id) {
        setActiveTemplate(prev => prev ? { ...prev, isFavorited: nowFavorited } : null);
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Failed to toggle favorite.");
    }
  };

  const handleRate = async (id: string, rating: number) => {
    try {
      setError("");
      await outreachService.rateTemplate(id, rating);
      setMessage("Rating submitted successfully!");
      fetchTemplates();
      if (activeTemplate && activeTemplate.id === id) {
        setActiveTemplate(prev => prev ? { ...prev, userRating: rating } : null);
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Failed to submit rating.");
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    fetchTemplates(val);
  };

  const [isPremium, setIsPremium] = useState(false);

  const checkSubscription = async () => {
    try {
      const sub = await getActiveSubscription();
      setIsPremium(!!sub);
    } catch (err) {
      console.warn("Failed to check subscription status:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchTemplates();
      fetchActiveTemplateId();
      checkSubscription();
    };
    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNew = () => {
    setActiveTemplate({
      id: "",
      name: "",
      subject: "",
      body: ""
    });
    setName("");
    setSubject("");
    setBody("");
    setIsEditMode(true);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    if (!window.confirm("Are you sure you want to delete this template?")) return false;
    try {
      await outreachService.deleteTemplate(id);
      setMessage("Template deleted successfully!");
      fetchTemplates();
      return true;
    } catch {
      setError("Failed to delete template.");
      return false;
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
        id: activeTemplate?.id || undefined,
        name,
        subject,
        body
      };
      await outreachService.saveTemplate(payload);
      setMessage(activeTemplate?.id ? "Template updated successfully!" : "Template created successfully!");
      setActiveTemplate(null);
      setIsEditMode(false);
      fetchTemplates();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Failed to save template.");
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

  const customTemplatesCount = templates.filter(t => !t.id.startsWith("default-")).length;
  const isLimitReached = !isPremium && customTemplatesCount >= 3;

  const filteredTemplates = templates.filter(tpl => {
    if (showStarredOnly && !tpl.isFavorited) {
      return false;
    }
    return true;
  });

  const systemTemplates = filteredTemplates.filter(tpl => tpl.isSystemTemplate);
  const userTemplates = filteredTemplates.filter(tpl => tpl.creatorId === currentUserId && !tpl.isSystemTemplate);
  const publicTemplates = filteredTemplates.filter(tpl => tpl.isPublic && tpl.creatorId !== currentUserId && !tpl.isSystemTemplate);

  const currentActiveTemplate = templates.find(tpl => tpl.id === activeTemplateId);

  const canModify = activeTemplate && (
    isAdmin || 
    (activeTemplate.creatorId === currentUserId && activeTemplate.id && !activeTemplate.id.startsWith("default-") && !activeTemplate.isSystemTemplate)
  );

  const renderTemplateCard = (tpl: EmailTemplate) => {
    const isActive = tpl.id === activeTemplateId;
    return (
      <div
        key={tpl.id}
        onClick={() => {
          setActiveTemplate(tpl);
          setIsEditMode(false);
        }}
        className={`bg-white border rounded-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-205 flex flex-col justify-between h-full cursor-pointer relative ${
          isActive ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-800 truncate" title={tpl.name}>
              {tpl.name}
            </h3>
            {isActive && (
              <span className="shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Active
              </span>
            )}
          </div>

          {/* Rating display */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(tpl.averageRating || 0) ? "fill-current" : "text-slate-200"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {(tpl.averageRating || 0).toFixed(1)} / 5.0
            </span>
          </div>

          <div
            className="text-xs text-slate-500 leading-relaxed font-mono whitespace-pre-line overflow-hidden line-clamp-3 bg-slate-50 p-3 rounded border border-slate-100/50"
            dangerouslySetInnerHTML={{ __html: tpl.body.replace(/\n/g, "<br/>") }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and customize your cold email outreach templates</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">Upgrade to Premium for multiple template use.</p>
        </div>
        {!activeTemplate && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Starred Filter Button */}
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold border transition-all ${
                showStarredOnly
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-650 border-slate-200"
              }`}
            >
              <svg className={`w-3.5 h-3.5 fill-current ${showStarredOnly ? "text-white" : "text-amber-400"}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {showStarredOnly ? "Starred Only" : "Filter Starred"}
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Default</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
            <button
              onClick={isLimitReached ? undefined : handleCreateNew}
              disabled={isLimitReached}
              className={`${
                isLimitReached
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover text-white shadow-sm"
              } px-4 py-2 rounded-btn text-xs font-semibold transition-all duration-150 shrink-0`}
            >
              Create New Template
            </button>
          </div>
        )}
      </div>

      {/* CURRENTLY USING TEMPLATE SECTION */}
      {!activeTemplate && (
        <div className="mb-8 bg-gradient-to-r from-primary/10 via-indigo-50 to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Currently Active
                </span>
                {currentActiveTemplate?.isSystemTemplate && (
                  <span className="bg-slate-100 text-slate-650 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    System Template
                  </span>
                )}
              </div>
              {currentActiveTemplate ? (
                <>
                  <h2 className="text-xl font-bold text-slate-800">{currentActiveTemplate.name}</h2>
                  <p className="text-xs text-indigo-600 font-semibold">
                    Subject: <span className="text-slate-650 font-normal">{currentActiveTemplate.subject}</span>
                  </p>
                  <div 
                    className="text-xs text-slate-550 leading-relaxed font-mono whitespace-pre-line bg-white/70 backdrop-blur-sm p-3 rounded-lg border border-slate-200 max-w-xl shadow-inner mt-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: currentActiveTemplate.body.replace(/\n/g, "<br/>") }}
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-850">No Active Template Selected</h2>
                  <p className="text-xs text-slate-500">
                    Your campaigns won't send emails automatically without an active template. Select and activate one of the templates below.
                  </p>
                </>
              )}
            </div>
            {currentActiveTemplate && (
              <button
                onClick={() => {
                  setActiveTemplate(currentActiveTemplate);
                  setIsEditMode(false);
                }}
                className="shrink-0 self-start md:self-center px-4 py-2 bg-white hover:bg-slate-50 text-primary border border-primary/20 hover:border-primary/40 rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            )}
          </div>
        </div>
      )}

      {isLimitReached && !activeTemplate && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-card mb-6 text-sm shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Template Limit Reached
            </div>
            <p className="text-amber-700 text-xs mt-1">
              You have created {customTemplatesCount} custom templates. Please upgrade to Premium to get unlimited custom templates, private options, and access to advanced AI tools.
            </p>
          </div>
          <Link
            to="/billing/pricing"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-btn text-xs font-semibold shadow-sm transition-all text-center shrink-0"
          >
            Upgrade to Premium
          </Link>
        </div>
      )}

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

      {loading ? (
        <div className="text-slate-500 italic text-sm py-10 text-center">Loading templates...</div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: SYSTEM DEFINED TEMPLATES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-base font-bold text-slate-800">System Templates</h2>
              <span className="bg-slate-100 text-slate-650 text-xs font-semibold px-2 py-0.5 rounded-full">{systemTemplates.length}</span>
            </div>
            {systemTemplates.length === 0 ? (
              <p className="text-xs text-slate-450 italic py-2">No system templates found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>

          {/* SECTION 2: USERS CREATED TEMPLATES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-base font-bold text-slate-800">My Custom Templates</h2>
              <span className="bg-slate-100 text-slate-650 text-xs font-semibold px-2 py-0.5 rounded-full">{userTemplates.length}</span>
            </div>
            {userTemplates.length === 0 ? (
              <div className="bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <p className="text-xs text-slate-450 italic">You haven't created any custom templates yet.</p>
                {!isLimitReached && (
                  <button
                    onClick={handleCreateNew}
                    className="mt-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    + Create custom template
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>

          {/* SECTION 3: PUBLIC TEMPLATES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <h2 className="text-base font-bold text-slate-800">Public & Community Templates</h2>
              <span className="bg-slate-100 text-slate-650 text-xs font-semibold px-2 py-0.5 rounded-full">{publicTemplates.length}</span>
            </div>
            {publicTemplates.length === 0 ? (
              <p className="text-xs text-slate-450 italic py-2">No public templates found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicTemplates.map(renderTemplateCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNIFIED MODAL COMPONENT */}
      {activeTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-card shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {isEditMode ? (
              // EDIT/CREATE MODE FORM IN MODAL
              <div>
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  {activeTemplate.id ? "Edit Template" : "New Email Template"}
                </h2>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5">Template Name</label>
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
                    <label className="text-xs font-semibold text-slate-500 mb-1.5">Email Subject</label>
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
                      <label className="text-xs font-semibold text-slate-500">Template Body (HTML Supported)</label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Insert tags:</span>
                        <button type="button" className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{hrName}}")}>{"{{hrName}}"}</button>
                        <button type="button" className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{companyName}}")}>{"{{companyName}}"}</button>
                        <button type="button" className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors" onClick={() => insertPlaceholder("{{jobRole}}")}>{"{{jobRole}}"}</button>
                      </div>
                    </div>
                    <textarea
                      id="template-body-textarea"
                      placeholder="Hi {{hrName}},\n\nI am interested in the {{jobRole}} role at {{companyName}}..."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-200 rounded-input text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTemplate.id) {
                          setIsEditMode(false);
                        } else {
                          setActiveTemplate(null);
                        }
                      }}
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
            ) : (
              // REVIEW/VIEW MODE IN MODAL
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-800">{activeTemplate.name}</h2>
                      {activeTemplate.id.startsWith("default-") && (
                        <span className="bg-slate-100 text-slate-650 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-650 font-semibold mt-1">
                      Subject: <span className="text-slate-650 font-normal">{activeTemplate.subject}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Star Bookmarking Toggle inside Modal */}
                    <button
                      onClick={() => handleToggleFavorite(activeTemplate.id)}
                      className={`transition-colors p-1.5 rounded-full hover:bg-slate-50 ${
                        activeTemplate.isFavorited ? "text-amber-400 hover:text-amber-500" : "text-slate-300 hover:text-slate-400"
                      }`}
                      title={activeTemplate.isFavorited ? "Unfavorite" : "Favorite"}
                    >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        {activeTemplate.isFavorited ? (
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        ) : (
                          <path fillRule="evenodd" d="M10 14.382l-5.836 3.068 1.115-6.5L.536 6.33l6.525-.95L10 .5l2.939 4.88 6.525.95-4.743 4.62 1.115 6.5L10 14.382zm0-1.39l4.526 2.38-1.072-5.04 3.664-3.57-5.064-.736L10 1.5 7.946 6.026l-5.064.736 3.664 3.57-1.072 5.04L10 12.992z" clipRule="evenodd" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveTemplate(null)}
                      className="text-slate-400 hover:text-slate-650 p-1.5"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body html display */}
                <div
                  className="text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-100 max-h-[300px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: activeTemplate.body }}
                />

                {/* Ratings & Interactive Rate widget */}
                <div className="bg-slate-50/50 rounded p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Public Rating</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(activeTemplate.averageRating || 0) ? "fill-current" : "text-slate-200"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-650">
                        {(activeTemplate.averageRating || 0).toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                      {activeTemplate.userRating ? "Your Rating" : "Rate this Template"}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(activeTemplate.id, star)}
                          className={`transition-colors p-1 ${
                            star <= (activeTemplate.userRating || 0)
                              ? "text-amber-400 fill-current"
                              : "text-slate-200 hover:text-amber-400"
                          }`}
                          title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTemplate(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-btn text-xs font-semibold transition-all"
                    >
                      Close
                    </button>
                    {activeTemplate.id === activeTemplateId ? (
                      <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-btn text-xs font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Currently Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateTemplate(activeTemplate.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-btn text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                      >
                        Activate Template
                      </button>
                    )}
                  </div>

                  {/* Edit/Delete Actions */}
                  {canModify && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setName(activeTemplate.name);
                          setSubject(activeTemplate.subject);
                          setBody(activeTemplate.body);
                          setIsEditMode(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-650 rounded text-xs font-semibold transition-all"
                      >
                        Edit Template
                      </button>
                      <button
                        onClick={async () => {
                          if (await handleDelete(activeTemplate.id)) {
                            setActiveTemplate(null);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded text-xs font-semibold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
