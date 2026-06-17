import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { RecruiterProfile } from "../services/profileService";

interface Props {
  userId: number;
}

export const RecruiterProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    profileService
      .getRecruiterProfile(userId)
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setMobile(data.mobile || "");
        setCompanyName(data.companyName || "");
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
      
      const updatedProfile: RecruiterProfile = {
        ...profile,
        name,
        mobile,
        companyName,
      };

      const result = await profileService.updateRecruiterProfile(userId, updatedProfile);
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
      <h2>Recruiter Profile Settings</h2>
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
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Affiliated Company Name</label>
          <input
            type="text"
            value={companyName}
            placeholder="Acme Corp"
            onChange={(e) => setCompanyName(e.target.value)}
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

export default RecruiterProfileView;
