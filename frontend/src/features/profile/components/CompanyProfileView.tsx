import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CompanyProfile } from "../services/profileService";

interface Props {
  userId: number;
}

export const CompanyProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    profileService
      .getCompanyProfile(userId)
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setIndustry(data.industry || "");
        setWebsite(data.website || "");
        setDescription(data.description || "");
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
      
      const updatedProfile: CompanyProfile = {
        ...profile,
        name,
        industry,
        website,
        description,
      };

      const result = await profileService.updateCompanyProfile(userId, updatedProfile);
      setProfile(result);
      
      // Update local storage user name
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
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
      <h2>Company Profile Settings</h2>
      {message && <div className="alert success" style={{ color: "#4ade80", marginBottom: 15 }}>{message}</div>}
      {error && <div className="alert danger" style={{ color: "#f87171", marginBottom: 15 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Company Name</label>
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
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Primary Contact Email (Read-only)</label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", color: "#64748b", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Industry</label>
          <input
            type="text"
            value={industry}
            placeholder="Software, Finance, Healthcare..."
            onChange={(e) => setIndustry(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Website URL</label>
          <input
            type="url"
            value={website}
            placeholder="https://acme.com"
            onChange={(e) => setWebsite(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Company Description</label>
          <textarea
            value={description}
            placeholder="Describe your company culture, mission, and size..."
            onChange={(e) => setDescription(e.target.value)}
            className="auth-input"
            rows={4}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontFamily: "inherit", resize: "vertical" }}
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

export default CompanyProfileView;
