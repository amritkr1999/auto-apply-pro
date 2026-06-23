import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "../services/profileService";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

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
  const [summary, setSummary] = useState("");
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  
  const [masterSkills, setMasterSkills] = useState<{ id: number; name: string }[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleUploadResume = async (file: File) => {
    try {
      setUploadingResume(true);
      setError("");
      setMessage("");
      await profileService.uploadCandidateResume(userId, file);
      
      // Refetch profile to load parsed results
      const data = await profileService.getCandidateProfile(userId);
      setProfile(data);
      setName(data.name || "");
      setMobile(data.mobile || "");
      setSkills(data.skills ? data.skills.join(", ") : "");
      
      const prefs = data.jobPreferences || {};
      setLocationPreference(prefs.locationPreference || "");
      setExpectedSalary(prefs.expectedSalary || "");
      
      setSummary(data.summary || "");
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setCertifications(data.certifications || []);
      
      setMessage("Resume uploaded and parsed successfully!");
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

        setSummary(data.summary || "");
        setEducation(data.education || []);
        setExperience(data.experience || []);
        setCertifications(data.certifications || []);
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
        summary,
        education,
        experience,
        certifications,
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

  const handleAddExperience = () => {
    setExperience([...experience, { title: "", company: "", duration: "", description: "" }]);
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducation([...education, { degree: "", institution: "", graduation_year: null, field_of_study: "" }]);
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (newCert.trim()) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) return <div className="text-slate-500">Loading profile details...</div>;

  return (
    <div className="w-full">
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address (Read-only)"
          type="email"
          value={profile?.email || ""}
          disabled
        />

        <Input
          label="Mobile Number"
          type="text"
          value={mobile}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
          required
        />

        <div className="relative w-full">
          <Input
            label="Skills (comma-separated)"
            type="text"
            value={skills}
            placeholder="React, TypeScript, Java, Spring Boot"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div className="absolute top-[100%] left-0 right-0 z-50 bg-white border border-[#b2bec3] rounded-md mt-1 shadow-lg max-h-[200px] overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="px-3 py-2 cursor-pointer transition-colors duration-200 border-b border-slate-100 text-slate-700 font-medium hover:bg-slate-100"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Preferred Job Location"
          type="text"
          value={locationPreference}
          placeholder="San Francisco, CA or Remote"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationPreference(e.target.value)}
        />

        <Input
          label="Expected Salary"
          type="text"
          value={expectedSalary}
          placeholder="$120k/yr"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpectedSalary(e.target.value)}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Professional Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder="Brief professional summary extracted from your resume..."
          />
        </div>

        {/* Work Experience */}
        <div className="w-full border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-slate-800">Work Experience</h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              + Add Experience
            </button>
          </div>
          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No experience entries listed.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-4 border border-slate-100 rounded-card bg-slate-50/50 flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="absolute top-4 right-4 text-xs font-medium text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Job Title"
                      type="text"
                      value={exp.title || ""}
                      onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                      required
                    />
                    <Input
                      label="Company"
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      required
                    />
                    <Input
                      label="Duration (e.g. 2021 - 2024)"
                      type="text"
                      value={exp.duration || ""}
                      onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Description
                    </label>
                    <textarea
                      value={exp.description || ""}
                      onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-xs text-base-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Role description and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="w-full border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-slate-800">Education</h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              + Add Education
            </button>
          </div>
          {education.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education entries listed.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 border border-slate-100 rounded-card bg-slate-50/50 flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="absolute top-4 right-4 text-xs font-medium text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      label="Degree"
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                      required
                    />
                    <Input
                      label="Institution"
                      type="text"
                      value={edu.institution || ""}
                      onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                      required
                    />
                    <Input
                      label="Field of Study"
                      type="text"
                      value={edu.field_of_study || ""}
                      onChange={(e) => handleEducationChange(idx, "field_of_study", e.target.value)}
                    />
                    <Input
                      label="Graduation Year"
                      type="number"
                      value={edu.graduation_year || ""}
                      onChange={(e) => handleEducationChange(idx, "graduation_year", e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="w-full border-t border-slate-100 pt-5">
          <h3 className="text-base font-semibold text-slate-800 mb-3">Certifications</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCert}
              placeholder="e.g. AWS Certified Solutions Architect"
              onChange={(e) => setNewCert(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-[#b2bec3] rounded-input text-sm text-base-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleAddCert}
              className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-card hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          {certifications.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No certifications listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium"
                >
                  <span>{cert}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(idx)}
                    className="text-[10px] text-slate-400 hover:text-rose-500 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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

        <div className="flex justify-end pt-4">
          <Button type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfileView;
