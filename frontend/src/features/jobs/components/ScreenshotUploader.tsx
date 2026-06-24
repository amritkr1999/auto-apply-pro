import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { outreachService } from "../../outreach/services/outreachService";
import { GmailComposeModal } from "../../outreach/components/GmailComposeModal";

interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary: string;
  sourceUrl: string;
  skills: string[];
}

export const ScreenshotUploader: React.FC = () => {
  // State for file upload
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for editable job form details
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // State for AI outreach email generation
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [emailRecipient, setEmailRecipient] = useState<string>("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // react-dropzone callback
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setJobDetails(null); // Clear previous details on new upload
      setError(null);
      setSaveMessage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: false,
  });

  // Call the Spring Boot backend to parse screenshot
  const handleProcessScreenshot = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSaveMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8060/api/jobs/parse-screenshot", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to process screenshot.");
      }

      const data: JobDetails = await response.json();
      setJobDetails(data);
    } catch (err: any) {
      console.error("Error during screenshot processing:", err);
      setError(err.message || "An error occurred while connecting to the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editable input field changes
  const handleFieldChange = (field: keyof JobDetails, value: any) => {
    if (!jobDetails) return;
    setJobDetails({
      ...jobDetails,
      [field]: value,
    });
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDetails) return;

    // In a full implementation, this saves the job details to the database (POST /api/jobs)
    console.log("Saving job details:", jobDetails);
    
    // Save to localStorage as mock database persistence
    const savedJobs = JSON.parse(localStorage.getItem("parsedJobs") || "[]");
    savedJobs.push({ ...jobDetails, id: Date.now() });
    localStorage.setItem("parsedJobs", JSON.stringify(savedJobs));

    setSaveMessage("Job details successfully validated and saved to dashboard!");
  };

  const handleGenerateEmail = async () => {
    if (!jobDetails) return;

    setIsGeneratingEmail(true);
    setError(null);
    setSaveMessage(null);

    const userStr = localStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).id : 1;

    try {
      const data = await outreachService.generateOutreachEmail(userId, jobDetails);
      setEmailSubject(data.subject);
      setEmailBody(data.body.replace(/\\n/g, "\n")); // format linebreaks
      setEmailRecipient(data.recipientEmail);
      setIsEmailModalOpen(true);
    } catch (err: any) {
      console.error("Error generating email:", err);
      setError(err.message || "Failed to generate AI outreach email.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendEmailDraft = async (subject: string, body: string, recipient: string) => {
    try {
      await outreachService.saveDraft({
        recipientEmail: recipient,
        subject,
        body
      });
      setSaveMessage("Outreach email draft successfully generated and queued for sending!");
    } catch (err: any) {
      console.error("Error saving draft:", err);
      setError("Failed to register outreach draft in the queue.");
      throw err;
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setJobDetails(null);
    setError(null);
    setSaveMessage(null);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px", color: "#cbd5e1" }}>
      <header style={{ marginBottom: 24, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#fff", marginBottom: 8 }}>AI Screenshot Job Parser</h1>
        <p style={{ color: "#94a3b8" }}>
          Upload a screenshot of a job posting (LinkedIn, Indeed, etc.) to automatically extract job details.
        </p>
      </header>

      {/* error message alert */}
      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#f87171",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {/* success message alert */}
      {saveMessage && (
        <div style={{
          background: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.2)",
          color: "#4ade80",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          textAlign: "center"
        }}>
          {saveMessage}
        </div>
      )}

      {/* 1. Upload & Drag area */}
      {!jobDetails && !isProcessing && (
        <div style={{
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px dashed rgba(255,255,255,0.15)",
          borderRadius: "12px",
          padding: "40px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s"
        }} {...getRootProps()}>
          <input {...getInputProps()} />
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📸</div>
          {isDragActive ? (
            <p style={{ color: "#6366f1", fontWeight: 500 }}>Drop the screenshot here...</p>
          ) : (
            <p style={{ fontWeight: 500 }}>
              Drag & drop a job listing screenshot here, or <span style={{ color: "#6366f1" }}>browse files</span>
            </p>
          )}
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 8 }}>Supports PNG, JPG, JPEG, WEBP</p>
        </div>
      )}

      {/* 2. File Preview & Process CTA */}
      {previewUrl && !jobDetails && (
        <div style={{
          marginTop: 20,
          background: "rgba(15, 23, 42, 0.5)",
          borderRadius: "12px",
          padding: 20,
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center"
        }}>
          <h3 style={{ marginBottom: 12, color: "#fff" }}>Selected Screenshot</h3>
          <div style={{ maxHeight: "300px", overflow: "hidden", display: "inline-block", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 }}>
            <img src={previewUrl} alt="Job Screenshot Preview" style={{ maxWidth: "100%", maxHeight: "300px", display: "block" }} />
          </div>
          
          {!isProcessing && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={handleReset} style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleProcessScreenshot} style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: 500 }}>
                Process Screenshot
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Loader State */}
      {isProcessing && (
        <div style={{
          textAlign: "center",
          padding: "50px 20px",
          background: "rgba(15, 23, 42, 0.5)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div className="spinner" style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(99, 102, 241, 0.1)",
            borderTop: "3px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px auto"
          }}></div>
          <h3 style={{ color: "#fff", marginBottom: 6 }}>Processing Screenshot...</h3>
          <p style={{ color: "#64748b" }}>Running AI OCR and job field extraction on local server.</p>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* 4. Editable Extracted Job Form */}
      {jobDetails && (
        <div style={{
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}>
            <h2 style={{ color: "#fff", margin: 0 }}>Extracted Job details</h2>
            <button onClick={handleReset} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", cursor: "pointer", fontSize: "0.85rem" }}>
              Upload Another
            </button>
          </div>

          <form onSubmit={handleSaveJob} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Job Title</label>
                <input
                  type="text"
                  value={jobDetails.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Company Name</label>
                <input
                  type="text"
                  value={jobDetails.company}
                  onChange={(e) => handleFieldChange("company", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Location</label>
                <input
                  type="text"
                  value={jobDetails.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Salary Range / Compensation</label>
                <input
                  type="text"
                  value={jobDetails.salary}
                  onChange={(e) => handleFieldChange("salary", e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Job Source URL</label>
              <input
                type="text"
                value={jobDetails.sourceUrl}
                onChange={(e) => handleFieldChange("sourceUrl", e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Description</label>
              <textarea
                value={jobDetails.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Job Requirements</label>
              <textarea
                value={jobDetails.requirements}
                onChange={(e) => handleFieldChange("requirements", e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, color: "#94a3b8" }}>Required Skills (comma-separated)</label>
              <input
                type="text"
                value={jobDetails.skills ? jobDetails.skills.join(", ") : ""}
                onChange={(e) => {
                  const val = e.target.value.split(",").map(s => s.trim());
                  handleFieldChange("skills", val);
                }}
                placeholder="e.g. React, TypeScript, Java"
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: 500, fontSize: "1rem" }}>
                Verify & Save Job Listing
              </button>
              <button 
                type="button" 
                onClick={handleGenerateEmail}
                disabled={isGeneratingEmail}
                style={{ flex: 1, padding: "12px", borderRadius: 6, border: "1px solid #4f46e5", background: "transparent", color: "#818cf8", cursor: "pointer", fontWeight: 500, fontSize: "1rem" }}
              >
                {isGeneratingEmail ? "Generating Email..." : "AI Generate Outreach Email"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gmail Compose Modal */}
      <GmailComposeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={emailRecipient}
        subject={emailSubject}
        body={emailBody}
        onSend={handleSendEmailDraft}
      />
    </div>
  );
};

export default ScreenshotUploader;
