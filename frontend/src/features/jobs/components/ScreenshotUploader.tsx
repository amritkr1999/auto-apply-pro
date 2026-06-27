import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { outreachService, type OutreachDraft } from "../../outreach/services/outreachService";
import { profileService } from "../../profile/services/profileService";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

export const ScreenshotUploader: React.FC = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  // States
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState<boolean>(false);
  const [resumeFilename, setResumeFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState<boolean>(false);

  // File processing queue state
  const [processingQueue, setProcessingQueue] = useState<Array<{
    id: string;
    fileName: string;
    status: "parsing" | "generating" | "saving" | "completed" | "failed";
    errorMessage?: string;
  }>>([]);

  // Fetch existing drafts on mount
  const loadDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    try {
      const allQueue = await outreachService.getOutreachQueue(userId);
      const activeDrafts = allQueue.filter(item => item.status === "DRAFT");
      setDrafts(activeDrafts);
    } catch (err) {
      console.error("Failed to load drafts", err);
    } finally {
      setIsLoadingDrafts(false);
    }
  }, [userId]);

  useEffect(() => {
    // Check candidate profile for resume filename
    profileService.getCandidateProfile(userId)
      .then(profile => {
        if (profile && profile.resumeFilename) {
          setResumeFilename(profile.resumeFilename);
        }
      })
      .catch(err => console.error("Failed to load profile for resume check", err));

    loadDrafts();
  }, [userId, loadDrafts]);

  // Process files
  const processFiles = async (files: File[]) => {
    // Add all files to processingQueue state
    const newItems = files.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      status: "parsing" as const
    }));
    setProcessingQueue(prev => [...prev, ...newItems]);

    // Process each file sequentially/concurrently
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const queueItem = newItems[i];

      try {
        // Step 1: Upload and Parse Screenshot
        const formData = new FormData();
        formData.append("file", file);

        const userStr = localStorage.getItem("user");
        const headers: Record<string, string> = {};
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.token) {
              headers["Authorization"] = `Bearer ${parsedUser.token}`;
            }
          } catch (e) {
            console.error("Failed to parse user for auth header", e);
          }
        }

        const parseResponse = await fetch("http://localhost:8060/api/jobs/parse-screenshot", {
          method: "POST",
          headers,
          body: formData,
        });

        if (!parseResponse.ok) {
          const errText = await parseResponse.text();
          throw new Error(errText || "Failed to process screenshot OCR.");
        }

        const jobDetails = await parseResponse.json();

        // Step 2: Generate Email Draft
        setProcessingQueue(prev => prev.map(item => item.id === queueItem.id ? { ...item, status: "generating" } : item));
        
        const emailData = await outreachService.generateOutreachEmail(userId, jobDetails);

        // Step 3: Save as DRAFT in DB
        setProcessingQueue(prev => prev.map(item => item.id === queueItem.id ? { ...item, status: "saving" } : item));

        const savedDraft = await outreachService.saveDraft({
          recipientEmail: emailData.recipientEmail,
          subject: emailData.subject,
          body: emailData.body.replace(/\\n/g, "\n"), // format linebreaks
          status: "DRAFT"
        });

        // Add to drafts list and update status
        setDrafts(prev => [savedDraft, ...prev]);
        setProcessingQueue(prev => prev.map(item => item.id === queueItem.id ? { ...item, status: "completed" } : item));

      } catch (err: any) {
        console.error("Error processing file " + file.name, err);
        setProcessingQueue(prev => prev.map(item => item.id === queueItem.id ? { 
          ...item, 
          status: "failed", 
          errorMessage: err.message || "Failed to process screenshot." 
        } : item));
      }
    }
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFiles(acceptedFiles);
    }
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
  });

  const handleDraftFieldChange = (id: string, field: keyof OutreachDraft, value: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleApproveDraft = async (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft || !draft.id) return;

    if (!draft.recipientEmail || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(draft.recipientEmail)) {
      setError("Please provide a valid recipient email address before approving.");
      return;
    }

    try {
      setError(null);
      await outreachService.updateDraft(draft.id, {
        subject: draft.subject,
        body: draft.body,
        recipientEmail: draft.recipientEmail,
        status: "PENDING"
      });
      
      setDrafts(prev => prev.filter(d => d.id !== id));
      setSaveMessage("Outreach draft approved and queued for sending!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("Error approving draft:", err);
      setError("Failed to approve draft.");
    }
  };

  const handleDiscardDraft = async (id: string) => {
    try {
      setError(null);
      await outreachService.deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      setSaveMessage("Outreach draft discarded.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("Error discarding draft:", err);
      setError("Failed to discard draft.");
    }
  };

  const handleApproveAll = async () => {
    if (drafts.length === 0) return;
    
    // Check if there are invalid emails
    const hasInvalidEmail = drafts.some(d => !d.recipientEmail || !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(d.recipientEmail));
    if (hasInvalidEmail) {
      setError("One or more drafts have an invalid recipient email. Please verify them first.");
      return;
    }

    setIsApprovingAll(true);
    setError(null);
    setSaveMessage(null);

    let approvedCount = 0;
    try {
      for (const draft of drafts) {
        if (!draft.id) continue;
        await outreachService.updateDraft(draft.id, {
          subject: draft.subject,
          body: draft.body,
          recipientEmail: draft.recipientEmail,
          status: "PENDING"
        });
        approvedCount++;
      }
      setDrafts([]);
      setSaveMessage(`Successfully approved and scheduled all ${approvedCount} email drafts!`);
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      console.error("Error approving all drafts:", err);
      setError(`Failed to approve all drafts: ${err.message || "Server error"}`);
      loadDrafts();
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handleDirectResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    try {
      setError(null);
      setSaveMessage("Uploading resume...");
      await profileService.uploadCandidateResume(userId, uploadedFile);
      setResumeFilename(uploadedFile.name);
      setSaveMessage("Resume uploaded successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("Direct resume upload failed:", err);
      setError("Failed to upload resume. Please try again.");
    }
  };

  const clearProcessingLogs = () => {
    setProcessingQueue([]);
  };

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-8 text-slate-300">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">AI Multi-Screenshot Job Parser</h1>
        <p className="text-sm text-slate-400">
          Upload multiple screenshots of job postings (LinkedIn, Indeed, etc.) to instantly parse them, generate cold outreach drafts, and schedule them sequentially.
        </p>
      </header>

      {/* error message alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl mb-6 text-center text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* success message alert */}
      {saveMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 text-center text-sm shadow-sm">
          {saveMessage}
        </div>
      )}

      {/* Resume Missing Warning */}
      {!resumeFilename && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
          <div>
            <h4 className="text-sm font-semibold text-rose-400 mb-1">Please upload your updated resume</h4>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              No resume is currently uploaded in your profile. Upload it now to ensure it gets parsed and attached to your outreach emails.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => document.getElementById("direct-resume-upload")?.click()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Upload Resume
            </button>
            <button
              type="button"
              onClick={() => navigate("/candidate/profile")}
              className="px-4 py-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition-all"
            >
              Go to Profile
            </button>
            <input
              type="file"
              id="direct-resume-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleDirectResumeUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* 1. Drag & Drop Multi-Image Area */}
      <div 
        {...getRootProps()} 
        className={`bg-slate-900/40 backdrop-blur-md border border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/50 ${
          isDragActive ? "border-indigo-500 bg-slate-950/60" : "border-slate-800"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">📸</div>
        {isDragActive ? (
          <p className="text-indigo-400 font-semibold text-sm">Drop the screenshots here...</p>
        ) : (
          <p className="font-semibold text-sm text-slate-200">
            Drag & drop job posting screenshots here, or <span className="text-indigo-400 hover:underline">browse files</span>
          </p>
        )}
        <p className="text-[11px] text-slate-500 mt-2">Supports PNG, JPG, JPEG, WEBP. You can select multiple files.</p>
      </div>

      {/* 2. Processing Queue Log */}
      {processingQueue.length > 0 && (
        <div className="mt-8 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🔄</span> Processing Pipeline Logs ({processingQueue.filter(q => q.status === "completed").length}/{processingQueue.length})
            </h3>
            {processingQueue.every(q => q.status === "completed" || q.status === "failed") && (
              <button 
                onClick={clearProcessingLogs} 
                className="text-[11px] text-slate-400 hover:text-white underline transition-all"
              >
                Clear logs
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
            {processingQueue.map(item => {
              let statusText = "Preparing...";
              let textClass = "text-slate-400";
              let badgeVariant: "neutral" | "info" | "warning" | "success" | "error" = "neutral";
              
              if (item.status === "parsing") {
                statusText = "Extracting job fields (AI OCR)...";
                textClass = "text-amber-400";
                badgeVariant = "warning";
              } else if (item.status === "generating") {
                statusText = "Crafting custom cold outreach...";
                textClass = "text-indigo-400";
                badgeVariant = "info";
              } else if (item.status === "saving") {
                statusText = "Saving draft in database...";
                textClass = "text-cyan-400";
                badgeVariant = "info";
              } else if (item.status === "completed") {
                statusText = "Completed successfully!";
                textClass = "text-emerald-400";
                badgeVariant = "success";
              } else if (item.status === "failed") {
                statusText = item.errorMessage || "Failed";
                textClass = "text-rose-400";
                badgeVariant = "error";
              }

              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/30">
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[280px]" title={item.fileName}>
                    📄 {item.fileName}
                  </span>
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className={`text-[11px] ${textClass}`}>{statusText}</span>
                    <Badge variant={badgeVariant}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Generated Email Drafts Verification Section */}
      <section className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Generated Email Drafts</h2>
            <p className="text-xs text-slate-500 mt-1">Review, personalize, and approve drafts before queuing them for send</p>
          </div>
          {drafts.length > 0 && (
            <div className="flex items-center gap-3">
              <Button 
                variant="success" 
                size="sm" 
                onClick={handleApproveAll} 
                disabled={isApprovingAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm text-xs px-4 py-2"
              >
                {isApprovingAll ? "Approving All..." : `Approve All (${drafts.length})`}
              </Button>
            </div>
          )}
        </div>

        {isLoadingDrafts ? (
          <div className="text-center py-10 text-slate-500 text-sm italic">
            Loading active email drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/10 border border-slate-800/60 rounded-2xl text-slate-500 text-sm italic shadow-inner">
            No drafts currently awaiting review. Upload screenshots above to auto-generate outreach drafts!
          </div>
        ) : (
          <div className="space-y-6">
            {drafts.map((draft, idx) => {
              const isExpanded = expandedDraftId === draft.id;
              // Extract preview text
              const bodyPreview = draft.body ? draft.body.substring(0, 120).replace(/<[^>]*>/g, '') + "..." : "";
              
              return (
                <div 
                  key={draft.id || idx} 
                  className={`bg-slate-900/30 border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                    isExpanded ? "border-slate-700 bg-slate-900/40" : "border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
                >
                  {/* Card Header Accordion */}
                  <div 
                    onClick={() => setExpandedDraftId(isExpanded ? null : (draft.id || null))}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Draft #{drafts.length - idx}
                        </span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]" title={draft.recipientEmail}>
                          To: {draft.recipientEmail || "recruiter@example.com"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-200 truncate" title={draft.subject}>
                        {draft.subject || "(No Subject)"}
                      </h3>
                      {!isExpanded && (
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-full">
                          {bodyPreview}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-slate-500 text-xs">
                        {isExpanded ? "Collapse ▲" : "Expand/Edit ▼"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Editable Form fields */}
                  {isExpanded && (
                    <div className="px-5 pb-6 border-t border-slate-800/40 pt-5 bg-slate-950/20 space-y-4">
                      {/* Recipient Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Recipient Email</label>
                        <input 
                          type="email"
                          value={draft.recipientEmail}
                          onChange={(e) => handleDraftFieldChange(draft.id!, "recipientEmail", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="recruiter@company.com"
                          required
                        />
                      </div>

                      {/* Subject Input */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Subject</label>
                        <input 
                          type="text"
                          value={draft.subject}
                          onChange={(e) => handleDraftFieldChange(draft.id!, "subject", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="Subject line"
                          required
                        />
                      </div>

                      {/* Body Rich-ish editor */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Body (HTML/text)</label>
                        <textarea 
                          value={draft.body}
                          onChange={(e) => handleDraftFieldChange(draft.id!, "body", e.target.value)}
                          rows={8}
                          className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono leading-relaxed resize-vertical"
                          placeholder="Compose cold outreach email body..."
                          required
                        />
                      </div>

                      {/* Controls Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/40">
                        <span className="text-[10px] text-slate-500 italic">
                          Approved drafts are queued and spaced by your outreach settings interval.
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDiscardDraft(draft.id!)}
                            className="px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold transition-all"
                          >
                            Discard Draft
                          </button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproveDraft(draft.id!)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 shadow-sm"
                          >
                            Verify & Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ScreenshotUploader;
