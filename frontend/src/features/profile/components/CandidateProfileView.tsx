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
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            placeholder="React, TypeScript, Java, Spring Boot"
            onChange={(e) => setSkills(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
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
