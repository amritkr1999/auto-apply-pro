import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { outreachService, type OutreachDraft } from "../../outreach/services/outreachService";
import { profileService } from "../../profile/services/profileService";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { useAnalytics } from "../../../context/AnalyticsContext";
import { validateFile } from "../../../utils/validation";

interface UploadItem {
  id: string;
  file: File;
  status: "QUEUED" | "UPLOADING" | "COMPLETED" | "FAILED";
  errorMessage?: string;
}

interface EditItem {
  id: string;
  originalFile: File;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
  cropLeft: number; // percentage (0-100)
  cropRight: number; // percentage (0-100)
  cropTop: number; // percentage (0-100)
  cropBottom: number; // percentage (0-100)
}

// Feature flag: set to true when backend LLM/AI infrastructure support is deployed
const IS_AI_PARSER_ENABLED = false;

export const ScreenshotUploader: React.FC = () => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

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

  // Editing modal state
  const [filesToEdit, setFilesToEdit] = useState<EditItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number>(0);

  // Frontend sequential file upload queue
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploadPaused, setIsUploadPaused] = useState<boolean>(false);
  const [isCurrentlyUploading, setIsCurrentlyUploading] = useState<boolean>(false);

  // Background processing queue loaded from backend
  const [processingQueue, setProcessingQueue] = useState<Array<{
    id: number;
    fileName: string;
    status: string;
    errorMessage?: string;
    createdAt?: string;
  }>>([]);

  const pollIntervalRef = useRef<any>(null);

  // Fetch existing drafts
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

  // Fetch upload logs from backend
  const loadUploadLogs = useCallback(async () => {
    try {
      const logs = await outreachService.getScreenshotUploads(userId);
      setProcessingQueue(logs);

      // Check if any uploads are still processing in the background
      const hasActive = logs.some(log => 
        log.status === "PENDING" || 
        log.status === "PARSING" || 
        log.status === "GENERATING" || 
        log.status === "SAVING"
      );

      if (hasActive) {
        startPolling();
      } else {
        stopPolling();
      }
    } catch (err) {
      console.error("Failed to load screenshot upload logs", err);
    }
  }, [userId]);

  // Polling loop logic for background processing
  const startPolling = () => {
    if (pollIntervalRef.current) return;

    console.log("Starting background processing status polling...");
    pollIntervalRef.current = setInterval(async () => {
      try {
        const logs = await outreachService.getScreenshotUploads(userId);
        
        // Find if any transitioned to COMPLETED to trigger drafts reload
        const previouslyProcessingIds = processingQueue
          .filter(q => q.status !== "COMPLETED" && q.status !== "FAILED")
          .map(q => q.id);

        const anyCompleted = logs.some(log => 
          previouslyProcessingIds.includes(log.id) && log.status === "COMPLETED"
        );

        setProcessingQueue(logs);

        if (anyCompleted) {
          console.log("One or more background screenshots completed. Reloading drafts...");
          loadDrafts();
        }

        const hasActive = logs.some(log => 
          log.status === "PENDING" || 
          log.status === "PARSING" || 
          log.status === "GENERATING" || 
          log.status === "SAVING"
        );

        if (!hasActive) {
          console.log("All background uploads finished. Stopping polling.");
          stopPolling();
        }
      } catch (err) {
        console.error("Failed to poll upload logs", err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Lifecycle
  useEffect(() => {
    profileService.getCandidateProfile(userId)
      .then(profile => {
        if (profile && profile.resumeFilename) {
          setResumeFilename(profile.resumeFilename);
        }
      })
      .catch(err => console.error("Failed to load profile for resume check", err));

    loadDrafts();
    loadUploadLogs();

    return () => {
      stopPolling();
    };
  }, [userId, loadDrafts, loadUploadLogs]);

  // Sequential File Upload Loop
  useEffect(() => {
    if (isUploadPaused || isCurrentlyUploading) return;

    const nextQueuedItem = uploadQueue.find(item => item.status === "QUEUED");
    if (!nextQueuedItem) return;

    uploadSingleFile(nextQueuedItem);
  }, [uploadQueue, isUploadPaused, isCurrentlyUploading]);

  const uploadSingleFile = async (item: UploadItem) => {
    setIsCurrentlyUploading(true);
    
    // Set status to UPLOADING
    setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "UPLOADING" } : q));

    try {
      await outreachService.uploadScreenshots(userId, [item.file]);
      
      // Update item status to COMPLETED
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "COMPLETED" } : q));
      
      // Fetch latest background status logs
      await loadUploadLogs();
      trackEvent("screenshot_ocr_triggered", { filename: item.file.name, size: item.file.size });
    } catch (err: any) {
      console.error("Failed to upload file", item.file.name, err);
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { 
        ...q, 
        status: "FAILED", 
        errorMessage: err.message || "Failed to upload to server." 
      } : q));
      trackEvent("screenshot_ocr_failed", { filename: item.file.name, error: err.message || "Unknown error" });
    } finally {
      setIsCurrentlyUploading(false);
    }
  };

  const processEditedFile = (item: EditItem): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create intermediate canvas for rotation
          const rotCanvas = document.createElement("canvas");
          const rotCtx = rotCanvas.getContext("2d");
          if (!rotCtx) {
            resolve(item.originalFile);
            return;
          }

          const rotationRad = (item.rotation * Math.PI) / 180;
          const is90or270 = item.rotation === 90 || item.rotation === 270;

          const rotatedW = is90or270 ? img.height : img.width;
          const rotatedH = is90or270 ? img.width : img.height;

          rotCanvas.width = rotatedW;
          rotCanvas.height = rotatedH;

          // Draw rotated
          rotCtx.translate(rotatedW / 2, rotatedH / 2);
          rotCtx.rotate(rotationRad);
          rotCtx.drawImage(img, -img.width / 2, -img.height / 2);

          // Apply crop percentages on rotated dimensions
          const cropX = (item.cropLeft / 100) * rotatedW;
          const cropY = (item.cropTop / 100) * rotatedH;
          const cropW = ((100 - item.cropLeft - item.cropRight) / 100) * rotatedW;
          const cropH = ((100 - item.cropTop - item.cropBottom) / 100) * rotatedH;

          // Create final cropped canvas
          const cropCanvas = document.createElement("canvas");
          const cropCtx = cropCanvas.getContext("2d");
          if (!cropCtx) {
            resolve(item.originalFile);
            return;
          }

          cropCanvas.width = cropW;
          cropCanvas.height = cropH;

          cropCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          // Convert to blob
          cropCanvas.toBlob((blob) => {
            if (blob) {
              const editedFile = new File([blob], item.originalFile.name, {
                type: item.originalFile.type,
                lastModified: Date.now(),
              });
              resolve(editedFile);
            } else {
              resolve(item.originalFile);
            }
          }, item.originalFile.type, 0.95);
        } catch (e) {
          console.error("Canvas processing failed", e);
          resolve(item.originalFile);
        }
      };
      img.onerror = () => {
        resolve(item.originalFile);
      };
      img.src = item.previewUrl;
    });
  };

  const handleFinishEditing = async () => {
    setSaveMessage("Processing edited images...");
    try {
      const processedFiles = await Promise.all(
        filesToEdit.map(item => {
          if (item.rotation === 0 && item.cropLeft === 0 && item.cropRight === 0 && item.cropTop === 0 && item.cropBottom === 0) {
            return Promise.resolve(item.originalFile);
          }
          return processEditedFile(item);
        })
      );

      // Clean preview URLs
      filesToEdit.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setFilesToEdit([]);

      // Push to upload queue
      processFiles(processedFiles);
      setSaveMessage("Images processed and queued for upload!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      console.error("Failed to process images", e);
      setError("Failed to process edited images.");
    }
  };

  const handleCancelEditing = () => {
    filesToEdit.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setFilesToEdit([]);
  };

  const updateActiveItem = (field: keyof EditItem, value: any) => {
    setFilesToEdit(prev => prev.map((item, idx) => 
      idx === editingIndex ? { ...item, [field]: value } : item
    ));
  };

  // Process selected files
  const processFiles = (files: File[]) => {
    setError(null);
    const newItems: UploadItem[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      status: "QUEUED",
    }));

    setUploadQueue(prev => [...newItems, ...prev]);
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newEdits: EditItem[] = acceptedFiles.map((file, idx) => ({
        id: `${Date.now()}-${idx}-${file.name}`,
        originalFile: file,
        previewUrl: URL.createObjectURL(file),
        rotation: 0,
        cropLeft: 0,
        cropRight: 0,
        cropTop: 0,
        cropBottom: 0,
      }));
      setFilesToEdit(newEdits);
      setEditingIndex(0);
    }
  }, []);

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
        ccEmails: draft.ccEmails,
        parsedEmails: draft.parsedEmails,
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
          ccEmails: draft.ccEmails,
          parsedEmails: draft.parsedEmails,
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
    const validation = validateFile(uploadedFile, 5 * 1024 * 1024, [".pdf", ".doc", ".docx", ".txt"]);
    if (!validation.valid) {
      setError(validation.error || "Invalid file selection.");
      return;
    }

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

  const handleClearLogs = async () => {
    try {
      await outreachService.clearScreenshotUploadLogs(userId);
      setProcessingQueue([]);
      loadUploadLogs();
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  const handleClearUploadQueue = () => {
    setUploadQueue([]);
  };

  const handleCancelBrowserUpload = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleCancelBackgroundUpload = async (id: number) => {
    try {
      await outreachService.deleteScreenshotUpload(id);
      setProcessingQueue(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to cancel background upload", err);
    }
  };

  const hasActiveUploads = uploadQueue.some(item => item.status === "QUEUED" || item.status === "UPLOADING");

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-8">
      {/* 0. Image Editor Modal */}
      {filesToEdit.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-[950px] overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[750px] shadow-2xl text-slate-800 animate-in zoom-in-95 duration-200">
            {/* Sidebar with thumbnails */}
            <div className="w-full md:w-[220px] bg-slate-50 border-r border-slate-200 p-4 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 md:h-full">
              <h3 className="hidden md:block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Screenshots ({filesToEdit.length})</h3>
              {filesToEdit.map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => setEditingIndex(idx)}
                  className={`relative p-1.5 rounded-xl cursor-pointer border transition-all shrink-0 w-[80px] h-[80px] md:w-auto md:h-auto md:aspect-video flex items-center justify-center bg-slate-100 ${
                    idx === editingIndex 
                      ? "border-primary bg-primary/5 shadow-inner" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-200/50"
                  }`}
                >
                  <img 
                    src={item.previewUrl} 
                    alt={`Thumb ${idx}`}
                    className="max-w-full max-h-full rounded-md object-contain"
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                  />
                  {/* Badge */}
                  <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md font-mono">
                    #{idx + 1}
                  </span>
                  {/* Delete button on thumbnail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const remains = filesToEdit.filter((_, i) => i !== idx);
                      filesToEdit.forEach((item, i) => { if (i === idx) URL.revokeObjectURL(item.previewUrl); });
                      setFilesToEdit(remains);
                      if (editingIndex >= remains.length) {
                        setEditingIndex(Math.max(0, remains.length - 1));
                      }
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm"
                    title="Remove Image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Main editing area */}
            <div className="flex-1 flex flex-col min-w-0 md:h-full bg-white">
              {/* Active Image Canvas/Preview Wrapper */}
              <div className="flex-1 min-h-0 p-6 flex items-center justify-center bg-slate-900 relative">
                {filesToEdit[editingIndex] && (
                  <div className="relative overflow-hidden inline-block border border-slate-800 rounded-lg max-w-full shadow-inner">
                    {/* Rendered Preview image */}
                    <img 
                      src={filesToEdit[editingIndex].previewUrl} 
                      alt="Active Edit"
                      className="max-h-[300px] md:max-h-[380px] max-w-full object-contain block transition-transform duration-200"
                      style={{ transform: `rotate(${filesToEdit[editingIndex].rotation}deg)` }}
                    />
                    
                    {/* Crop Shading Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top Mask */}
                      <div 
                        className="absolute top-0 left-0 right-0 bg-slate-950/65" 
                        style={{ height: `${filesToEdit[editingIndex].cropTop}%` }} 
                      />
                      {/* Bottom Mask */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-slate-950/65" 
                        style={{ height: `${filesToEdit[editingIndex].cropBottom}%` }} 
                      />
                      {/* Left Mask */}
                      <div 
                        className="absolute left-0 bg-slate-950/65" 
                        style={{ 
                          top: `${filesToEdit[editingIndex].cropTop}%`, 
                          bottom: `${filesToEdit[editingIndex].cropBottom}%`,
                          width: `${filesToEdit[editingIndex].cropLeft}%` 
                        }} 
                      />
                      {/* Right Mask */}
                      <div 
                        className="absolute right-0 bg-slate-950/65" 
                        style={{ 
                          top: `${filesToEdit[editingIndex].cropTop}%`, 
                          bottom: `${filesToEdit[editingIndex].cropBottom}%`,
                          width: `${filesToEdit[editingIndex].cropRight}%` 
                        }} 
                      />
                      {/* Dotted border overlay */}
                      <div 
                        className="absolute border border-dashed border-indigo-400"
                        style={{
                          top: `${filesToEdit[editingIndex].cropTop}%`,
                          bottom: `${filesToEdit[editingIndex].cropBottom}%`,
                          left: `${filesToEdit[editingIndex].cropLeft}%`,
                          right: `${filesToEdit[editingIndex].cropRight}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Editing Controls */}
              {filesToEdit[editingIndex] && (
                <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 shrink-0">
                  {/* Rotation & Reset Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const currentRot = filesToEdit[editingIndex].rotation;
                          const nextRot = (currentRot - 90 + 360) % 360;
                          updateActiveItem("rotation", nextRot);
                        }}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        ↺ Rotate Left
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentRot = filesToEdit[editingIndex].rotation;
                          const nextRot = (currentRot + 90) % 360;
                          updateActiveItem("rotation", nextRot);
                        }}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        ↻ Rotate Right
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFilesToEdit(prev => prev.map((item, idx) => 
                          idx === editingIndex 
                            ? { ...item, rotation: 0, cropLeft: 0, cropRight: 0, cropTop: 0, cropBottom: 0 } 
                            : item
                        ));
                      }}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline transition-colors"
                    >
                      Reset Changes
                    </button>
                  </div>

                  {/* Crop sliders grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Crop Left</span>
                        <span className="text-[11px] font-semibold text-indigo-650 font-mono">{filesToEdit[editingIndex].cropLeft}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="45"
                        value={filesToEdit[editingIndex].cropLeft}
                        onChange={(e) => updateActiveItem("cropLeft", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Crop Right</span>
                        <span className="text-[11px] font-semibold text-indigo-650 font-mono">{filesToEdit[editingIndex].cropRight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="45"
                        value={filesToEdit[editingIndex].cropRight}
                        onChange={(e) => updateActiveItem("cropRight", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Crop Top</span>
                        <span className="text-[11px] font-semibold text-indigo-650 font-mono">{filesToEdit[editingIndex].cropTop}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="45"
                        value={filesToEdit[editingIndex].cropTop}
                        onChange={(e) => updateActiveItem("cropTop", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Crop Bottom</span>
                        <span className="text-[11px] font-semibold text-indigo-650 font-mono">{filesToEdit[editingIndex].cropBottom}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="45"
                        value={filesToEdit[editingIndex].cropBottom}
                        onChange={(e) => updateActiveItem("cropBottom", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer actions */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-650 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinishEditing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/10 transition-all flex items-center gap-1.5"
                >
                  ✓ Process & Upload ({filesToEdit.length} images)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Multi-Screenshot Job Parser</h1>
        <p className="text-sm text-slate-500">
          Upload multiple screenshots of job postings. The system processes them in the background, generates cold outreach drafts, and schedules approved emails sequentially.
        </p>
      </header>

      {/* Coming Soon Card */}
      <div className="bg-white border border-indigo-100 rounded-3xl p-8 sm:p-10 text-center shadow-md max-w-2xl mx-auto my-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
          ✨
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Feature Coming Soon
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-3">
          AI Screenshot Parsing & Auto-Drafting
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          The AI Multi-Screenshot Job Parser uses intelligent OCR and Large Language Models (LLM) to automatically extract recruiter contacts, job requirements, and company details directly from job posting screenshots, automatically crafting customized cold outreach drafts.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
          ℹ️ <strong>Server Infrastructure Notice:</strong> This feature requires dedicated AI/LLM server capabilities which are currently being integrated on our production server. The parser interface will be enabled once backend AI support is deployed.
        </div>
      </div>

      {/* Active Parser & Drafts UI (Gated by IS_AI_PARSER_ENABLED feature flag) */}
      {IS_AI_PARSER_ENABLED && (
        <>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 text-center text-sm shadow-sm animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {saveMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 text-center text-sm shadow-sm animate-in fade-in duration-300">
              {saveMessage}
            </div>
          )}

          {!resumeFilename && (
            <div className="bg-rose-50 border border-rose-100 rounded-card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
              <div>
                <h4 className="text-sm font-semibold text-rose-800 mb-1">Please upload your updated resume</h4>
                <p className="text-xs text-rose-600 leading-relaxed">
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
                  onClick={() => navigate("/profile/settings")}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs transition-all"
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

          <div 
            {...getRootProps()} 
            className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:bg-slate-50/50 shadow-sm"
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📸</div>
            {isDragActive ? (
              <p className="text-primary font-semibold text-sm">Drop the screenshots here...</p>
            ) : (
              <p className="font-semibold text-sm text-slate-750">
                Drag & drop job posting screenshots here, or <span className="text-primary hover:underline">browse files</span>
              </p>
            )}
            <p className="text-[11px] text-slate-450 mt-2">Supports PNG, JPG, JPEG, WEBP. You can select multiple files.</p>
          </div>

          {uploadQueue.length > 0 && (
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>📤</span> Browser Upload Queue ({uploadQueue.filter(q => q.status === "COMPLETED").length}/{uploadQueue.length})
                </h3>
                <div className="flex items-center gap-3">
                  {hasActiveUploads && (
                    <button
                      type="button"
                      onClick={() => setIsUploadPaused(prev => !prev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                        isUploadPaused 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse" 
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      {isUploadPaused ? "▶ Resume Uploads" : "⏸ Pause Uploads"}
                    </button>
                  )}
                  {!hasActiveUploads && (
                    <button 
                      onClick={handleClearUploadQueue} 
                      className="text-[11px] text-slate-400 hover:text-slate-655 underline transition-all"
                    >
                      Clear queue
                    </button>
                  )}
                </div>
              </div>
              
              {isUploadPaused && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl mb-3 text-center text-xs">
                  ⚠️ Uploading has been paused. Any currently active file upload will finish, but subsequent files are held. Click "Resume Uploads" to continue.
                </div>
              )}

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                {uploadQueue.map(item => {
                  let statusText = "Queued...";
                  let textClass = "text-slate-400";
                  let badgeVariant: "neutral" | "info" | "warning" | "success" | "error" = "neutral";

                  if (item.status === "QUEUED") {
                    statusText = "Waiting in queue...";
                    textClass = "text-slate-450";
                    badgeVariant = "neutral";
                  } else if (item.status === "UPLOADING") {
                    statusText = "Sending file to server...";
                    textClass = "text-indigo-600 animate-pulse";
                    badgeVariant = "info";
                  } else if (item.status === "COMPLETED") {
                    statusText = "Uploaded to server!";
                    textClass = "text-emerald-600";
                    badgeVariant = "success";
                  } else if (item.status === "FAILED") {
                    statusText = item.errorMessage || "Upload failed";
                    textClass = "text-rose-600";
                    badgeVariant = "error";
                  }

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-xs text-slate-700 truncate max-w-[280px]" title={item.file.name}>
                        📄 {item.file.name}
                      </span>
                      <div className="flex items-center gap-3.5 self-end sm:self-center shrink-0">
                        <span className={`text-[11px] ${textClass}`}>{statusText}</span>
                        <Badge variant={badgeVariant}>
                          {item.status}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleCancelBrowserUpload(item.id)}
                          className="text-slate-400 hover:text-rose-600 font-bold px-1 py-0.5 rounded text-xs transition-colors"
                          title="Cancel/Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {processingQueue.length > 0 && (
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>🔄</span> Background Processing Pipeline ({processingQueue.filter(q => q.status === "COMPLETED").length}/{processingQueue.length})
                </h3>
                {processingQueue.every(q => q.status === "COMPLETED" || q.status === "FAILED") && (
                  <button 
                    onClick={handleClearLogs} 
                    className="text-[11px] text-slate-400 hover:text-slate-655 underline transition-all"
                  >
                    Clear logs
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                {processingQueue.map((item, idx) => {
                  let statusText = "Preparing...";
                  let textClass = "text-slate-450";
                  let badgeVariant: "neutral" | "info" | "warning" | "success" | "error" = "neutral";
                  
                  if (item.status === "PENDING") {
                    statusText = "Queued for background analysis...";
                    textClass = "text-slate-450";
                    badgeVariant = "neutral";
                  } else if (item.status === "PARSING") {
                    statusText = "Extracting job details (AI OCR)...";
                    textClass = "text-amber-600";
                    badgeVariant = "warning";
                  } else if (item.status === "GENERATING") {
                    statusText = "Crafting custom cold outreach...";
                    textClass = "text-indigo-650";
                    badgeVariant = "info";
                  } else if (item.status === "SAVING") {
                    statusText = "Saving drafts in database...";
                    textClass = "text-cyan-600";
                    badgeVariant = "info";
                  } else if (item.status === "COMPLETED") {
                    statusText = "Completed successfully! Image deleted to clear space.";
                    textClass = "text-emerald-650";
                    badgeVariant = "success";
                  } else if (item.status === "FAILED") {
                    statusText = item.errorMessage || "Failed";
                    textClass = "text-rose-650";
                    badgeVariant = "error";
                  }

                  return (
                    <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-xs font-medium text-slate-700 truncate max-w-[280px]" title={item.fileName}>
                        📄 {item.fileName}
                      </span>
                      <div className="flex items-center gap-3.5 self-end sm:self-center shrink-0">
                        <span className={`text-[11px] ${textClass}`}>{statusText}</span>
                        <Badge variant={badgeVariant}>
                          {item.status}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleCancelBackgroundUpload(item.id)}
                          className="text-slate-400 hover:text-rose-600 font-bold px-1 py-0.5 rounded text-xs transition-colors"
                          title="Cancel/Delete log"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <section className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Generated Email Drafts</h2>
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
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-550 text-sm italic shadow-inner">
                No drafts currently awaiting review. Upload screenshots above to auto-generate outreach drafts!
              </div>
            ) : (
              <div className="space-y-6">
                {drafts.map((draft, idx) => {
                  const isExpanded = expandedDraftId === draft.id;
                  const bodyPreview = draft.body ? draft.body.substring(0, 120).replace(/<[^>]*>/g, '') + "..." : "";
                  
                  return (
                    <div 
                      key={draft.id || idx} 
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                        isExpanded ? "border-primary bg-white shadow-md" : "border-slate-200 hover:border-slate-350 hover:shadow"
                      }`}
                    >
                      <div 
                        onClick={() => setExpandedDraftId(isExpanded ? null : (draft.id || null))}
                        className="p-5 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                            <span className="text-[11px] font-semibold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Draft #{drafts.length - idx}
                            </span>
                            <span className="text-xs text-slate-500 font-medium truncate max-w-[300px]" title={draft.recipientEmail}>
                              To: {draft.recipientEmail || "recruiter@example.com"} {draft.ccEmails ? `(CC: ${draft.ccEmails})` : ''}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-750 truncate" title={draft.subject}>
                            {draft.subject || "(No Subject)"}
                          </h3>
                          {!isExpanded && (
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-full">
                              {bodyPreview}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-slate-400 text-xs">
                            {isExpanded ? "Collapse ▲" : "Expand/Edit ▼"}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-6 border-t border-slate-100 pt-5 bg-slate-50/30 space-y-4">
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
                                          } else {
                                            const newCc = ccList.filter((c: string) => c !== trimmed).join(', ');
                                            handleDraftFieldChange(draft.id!, "recipientEmail", trimmed);
                                            handleDraftFieldChange(draft.id!, "ccEmails", newCc);
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
                                              handleDraftFieldChange(draft.id!, "ccEmails", updatedCc);
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
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Recipient Email (To)</label>
                                <input 
                                  type="email"
                                  value={draft.recipientEmail || ''}
                                  onChange={(e) => handleDraftFieldChange(draft.id!, "recipientEmail", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                  placeholder="recruiter@company.com"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">CC Emails (Comma-separated)</label>
                                <input 
                                  type="text"
                                  value={draft.ccEmails || ''}
                                  onChange={(e) => handleDraftFieldChange(draft.id!, "ccEmails", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                  placeholder="cc1@company.com, cc2@company.com"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Subject</label>
                            <input 
                              type="text"
                              value={draft.subject}
                              onChange={(e) => handleDraftFieldChange(draft.id!, "subject", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                              placeholder="Subject line"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Body (HTML/text)</label>
                            <textarea 
                              value={draft.body}
                              onChange={(e) => handleDraftFieldChange(draft.id!, "body", e.target.value)}
                              rows={8}
                              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                              placeholder="Compose cold outreach email body..."
                              required
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] text-slate-450 italic">
                              Approved drafts are queued and spaced by your outreach settings interval.
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleDiscardDraft(draft.id!)}
                                className="px-4 py-2 border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all"
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
        </>
      )}
    </div>
  );
};

export default ScreenshotUploader;
