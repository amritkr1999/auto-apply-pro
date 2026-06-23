import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "../services/profileService";

interface Props {
  userId: number;
}

export const CandidateProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [skills, setSkills] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [masterSkills, setMasterSkills] = useState<{ id: number; name: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleUploadResume = async (file: File) => {
    try {
      setUploadingResume(true);
      setError("");
      setMessage("");
      await profileService.uploadCandidateResume(userId, file);
      setProfile((prev) => prev ? { ...prev, resumeFilename: file.name } : null);
      setMessage("Resume uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    profileService.getSkills()
      .then((data) => setMasterSkills(data))
      .catch((err) => console.error("Failed to load master skills", err));
  }, []);

  useEffect(() => {
    if (!skills || masterSkills.length === 0) {
      setSuggestions([]);
      return;
    }

    const parts = skills.split(",");
    const lastPart = parts[parts.length - 1].trim();

    if (lastPart.length < 1) {
      setSuggestions([]);
      return;
    }

    const lowerLastPart = lastPart.toLowerCase();
    const existingSkillsLower = parts.slice(0, -1).map(p => p.trim().toLowerCase());

    const filtered = masterSkills
      .map(s => s.name)
      .filter(name => {
        const lowerName = name.toLowerCase();
        return lowerName.includes(lowerLastPart) && !existingSkillsLower.includes(lowerName);
      })
      .slice(0, 5);

    setSuggestions(filtered);
  }, [skills, masterSkills]);

  const handleSelectSuggestion = (suggestion: string) => {
    const parts = skills.split(",");
    const updatedParts = [...parts.slice(0, -1), suggestion];
    setSkills(updatedParts.join(", ") + ", ");
    setSuggestions([]);
  };

  useEffect(() => {
    profileService
      .getCandidateProfile(userId)
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setMobile(data.mobile || "");
        setSkills(data.skills ? data.skills.join(", ") : "");
        
        const prefs = data.jobPreferences || {};
        setLocationPreference(prefs.locationPreference || "");
        setExpectedSalary(prefs.expectedSalary || "");
      })
      .catch(() => setError("Failed to load profile details."))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setMessage("");
      setError("");
      
      const updatedProfile: CandidateProfile = {
        ...profile,
        name,
        mobile,
        skills: skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
        jobPreferences: {
          locationPreference,
          expectedSalary,
        },
      };

      const result = await profileService.updateCandidateProfile(userId, updatedProfile);
      setProfile(result);
      
      // Update local storage user name
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
        u.mobile = mobile;
        localStorage.setItem("user", JSON.stringify(u));
      }

      setMessage("Profile updated successfully!");
    } catch {
      setError("Failed to update profile.");
    }
  };

  if (loading) return <div style={{ color: "#cbd5e1" }}>Loading profile details...</div>;

  return (
    <div className="profile-details-card" style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>Candidate Profile Settings</h2>
      {message && <div className="alert success" style={{ color: "#4ade80", marginBottom: 15 }}>{message}</div>}
      {error && <div className="alert danger" style={{ color: "#f87171", marginBottom: 15 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            required
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Email Address (Read-only)</label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#64748b", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Mobile Number</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="auth-input"
            required
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            placeholder="React, TypeScript, Java, Spring Boot"
            onChange={(e) => setSkills(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              marginTop: "4px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: "#f1f5f9"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Preferred Job Location</label>
          <input
            type="text"
            value={locationPreference}
            placeholder="San Francisco, CA or Remote"
            onChange={(e) => setLocationPreference(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Expected Salary</label>
          <input
            type="text"
            value={expectedSalary}
            placeholder="$120k/yr"
            onChange={(e) => setExpectedSalary(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "block", fontWeight: 500 }}>Upload Resume (PDF, DOC, DOCX)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadResume(file);
                }
              }}
              style={{ display: "none" }}
              id="resume-upload-input"
            />
            <label
              htmlFor="resume-upload-input"
              style={{
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                color: "#fff",
                display: "inline-block"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              {uploadingResume ? "Uploading..." : "Choose File"}
            </label>
            {profile?.resumeFilename ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>📄 {profile.resumeFilename}</span>
                <a
                  href={`http://localhost:8060/api/v1/profiles/candidate/${userId}/resume`}
                  download
                  style={{
                    color: "#6366f1",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Download
                </a>
              </div>
            ) : (
              <span style={{ color: "#64748b", fontSize: "0.9rem" }}>No resume uploaded</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          style={{
            padding: "12px",
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
            marginTop: 10,
          }}
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default CandidateProfileView;
