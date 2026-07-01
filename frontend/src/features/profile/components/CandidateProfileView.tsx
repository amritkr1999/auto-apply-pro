import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "../services/profileService";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { outreachService } from "../../outreach/services/outreachService";

interface Props {
  userId: number;
}

export const CandidateProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
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
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [gmailLoading, setGmailLoading] = useState(true);

  // Outreach Scheduling Settings State
  const [dailyLimit, setDailyLimit] = useState(50);
  const [minInterval, setMinInterval] = useState(10);
  const [maxInterval, setMaxInterval] = useState(30);
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("UTC");
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // HR Outreach Campaign Settings State
  const [hrOutreachCampaignEnabled, setHrOutreachCampaignEnabled] = useState(false);
  const [hrOutreachTargetRole, setHrOutreachTargetRole] = useState("Software Engineer");
  const [hrOutreachTemplateId, setHrOutreachTemplateId] = useState("default-1");
  const [hrOutreachSourceTable, setHrOutreachSourceTable] = useState("TESTING");
  const [templatesList, setTemplatesList] = useState<any[]>([]);

  const handleUploadResume = async (file: File) => {
    try {
      setUploadingResume(true);
      setError("");
      setMessage("");
      await profileService.uploadCandidateResume(userId, file);
      
      // Refetch profile to show new filename
      const data = await profileService.getCandidateProfile(userId);
      setProfile(data);
      
      setMessage("Resume uploaded successfully! Click 'Sync Profile' to auto-populate fields from the new resume.");
    } catch (err: any) {
      setError(err.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSyncProfile = async () => {
    try {
      setSyncingProfile(true);
      setError("");
      setMessage("");
      await profileService.syncCandidateProfile(userId);
      
      // Refetch profile to load parsed results
      const data = await profileService.getCandidateProfile(userId);
      setProfile(data);
      setName(data.name || "");
      setMobile(data.mobile || "");
      setOfficialEmail(data.officialEmail || "");
      setSkills(data.skills ? data.skills.join(", ") : "");
      
      const prefs = data.jobPreferences || {};
      setLocationPreference(prefs.locationPreference || "");
      setExpectedSalary(prefs.expectedSalary || "");
      
      setSummary(data.summary || "");
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setCertifications(data.certifications || []);
      
      setMessage("Profile successfully synchronized with your resume!");
    } catch (err: any) {
      setError(err.message || "Failed to sync profile.");
    } finally {
      setSyncingProfile(false);
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
    // Check Gmail connection status
    setGmailLoading(true);
    outreachService.getGmailStatus(userId)
      .then((data) => {
        setGmailConnected(data.connected);
        setConnectedEmail(data.connectedEmail);
      })
      .catch((err) => console.error("Failed to check Gmail status", err))
      .finally(() => setGmailLoading(false));

    // Check query params for Google OAuth redirection callback status
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      setMessage("Gmail account connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "error") {
      setError("Failed to connect Gmail account. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [userId]);

  useEffect(() => {
    setSettingsLoading(true);
    
    // Fetch email templates for selection dropdown
    outreachService.getTemplates()
      .then((templates) => {
        setTemplatesList(templates);
      })
      .catch((err) => console.error("Failed to load templates list", err));

    outreachService.getOutreachSettings(userId)
      .then((data) => {
        setDailyLimit(data.dailyLimit);
        setMinInterval(data.minIntervalMinutes);
        setMaxInterval(data.maxIntervalMinutes);
        setSlotStart(data.slotStart ? data.slotStart.substring(0, 5) : "09:00");
        setSlotEnd(data.slotEnd ? data.slotEnd.substring(0, 5) : "17:00");
        setSkipWeekends(data.skipWeekends !== false);
        setMarketingEmailsEnabled(data.marketingEmailsEnabled !== false);
        
        // Populate campaign settings
        setHrOutreachCampaignEnabled(!!data.hrOutreachCampaignEnabled);
        setHrOutreachTargetRole(data.hrOutreachTargetRole || "Software Engineer");
        setHrOutreachTemplateId(data.hrOutreachTemplateId || "default-1");
        setHrOutreachSourceTable(data.hrOutreachSourceTable || "TESTING");

        if (data.timezone) {
          setTimezone(data.timezone);
        } else {
          const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (localTz) setTimezone(localTz);
        }
      })
      .catch((err) => console.error("Failed to load outreach settings", err))
      .finally(() => setSettingsLoading(false));
  }, [userId]);

  const handleSaveSettings = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (minInterval > maxInterval) {
      setError("Minimum interval cannot be greater than maximum interval.");
      return;
    }
    try {
      setSavingSettings(true);
      setError("");
      setMessage("");
      const res = await outreachService.saveOutreachSettings(userId, {
        dailyLimit,
        minIntervalMinutes: minInterval,
        maxIntervalMinutes: maxInterval,
        slotStart,
        slotEnd,
        timezone,
        skipWeekends,
        marketingEmailsEnabled,
        hrOutreachCampaignEnabled,
        hrOutreachTargetRole,
        hrOutreachTemplateId,
        hrOutreachSourceTable
      });
      setMessage(res.message || "Outreach settings updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update outreach settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setError("");
      setMessage("");
      const redirectUrl = await outreachService.getConnectUrl(userId);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to initiate Gmail connection.");
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      setError("");
      setMessage("");
      setGmailLoading(true);
      await outreachService.disconnectGmail(userId);
      setGmailConnected(false);
      setConnectedEmail(null);
      setMessage("Gmail account disconnected successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to disconnect Gmail.");
    } finally {
      setGmailLoading(false);
    }
  };

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
        setOfficialEmail(data.officialEmail || "");
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
        officialEmail,
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
        u.officialEmail = officialEmail;
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
          label="Official Email Address"
          type="email"
          value={officialEmail}
          placeholder="yourname@company.com"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficialEmail(e.target.value)}
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

        {/* Gmail Integration Section */}
        <div className="w-full border-t border-slate-100 pt-5">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Gmail Integration</h3>
          <p className="text-xs text-slate-500 mb-4">
            Connect your personal Gmail account to automate sending application and follow-up emails directly from your own email address.
          </p>
          
          {gmailLoading ? (
            <div className="text-xs text-slate-400 italic py-2">Checking connection status...</div>
          ) : gmailConnected ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-card">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Gmail Connected</p>
                  <p className="text-xs text-emerald-600 font-medium">{connectedEmail}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnectGmail}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-card">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Gmail Disconnected</p>
                  <p className="text-xs text-slate-400">No account connected yet</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleConnectGmail}
              >
                Connect Gmail
              </Button>
            </div>
          )}
        </div>

        {/* Outreach Scheduling & Anti-Spam Settings */}
        <div className="w-full border-t border-slate-100 pt-5 mt-5">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Outreach & Anti-Spam Scheduling</h3>
          <p className="text-xs text-slate-500 mb-4">
            Configure randomized dispatch intervals and time slot windows to simulate natural mailing behavior and keep your account safe from spam filters.
          </p>

          {settingsLoading ? (
            <div className="text-xs text-slate-400 italic py-2">Loading scheduling settings...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Daily Send Limit (emails/day)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value) || 50)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Randomized Interval Range (minutes between emails)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Min Delay</span>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={minInterval}
                          onChange={(e) => setMinInterval(parseInt(e.target.value) || 10)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <span className="text-slate-400 mt-4 text-xs font-medium">to</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Max Delay</span>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={maxInterval}
                          onChange={(e) => setMaxInterval(parseInt(e.target.value) || 30)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="skipWeekendsCheckbox"
                      checked={skipWeekends}
                      onChange={(e) => setSkipWeekends(e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary border-slate-200 rounded focus:ring-primary"
                    />
                    <label htmlFor="skipWeekendsCheckbox" className="select-none cursor-pointer">
                      <span className="block text-xs font-semibold text-slate-600">Skip Weekends</span>
                      <span className="block text-[10px] text-slate-400">Do not send any outreach emails on Saturday and Sunday.</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="marketingEmailsCheckbox"
                      checked={marketingEmailsEnabled}
                      onChange={(e) => setMarketingEmailsEnabled(e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary border-slate-200 rounded focus:ring-primary"
                    />
                    <label htmlFor="marketingEmailsCheckbox" className="select-none cursor-pointer">
                      <span className="block text-xs font-semibold text-slate-600">Marketing Notifications</span>
                      <span className="block text-[10px] text-slate-400">Receive updates on job matches, tips, and subscription offers.</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        Local Timezone
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                          if (localTz) setTimezone(localTz);
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Detect timezone
                      </button>
                    </div>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">America/New_York (US Eastern Time)</option>
                      <option value="America/Chicago">America/Chicago (US Central Time)</option>
                      <option value="America/Denver">America/Denver (US Mountain Time)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (US Pacific Time)</option>
                      <option value="Europe/London">Europe/London (London, GMT/BST)</option>
                      <option value="Europe/Paris">Europe/Paris (Paris, CET/CEST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (India Standard Time)</option>
                      <option value="Asia/Singapore">Asia/Singapore (Singapore Time)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (Japan Standard Time)</option>
                      <option value="Australia/Sydney">Australia/Sydney (Sydney, AEST/AEDT)</option>
                      {!["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"].includes(timezone) && (
                        <option value={timezone}>{timezone} (Detected)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Active Sending Slot (local user hours)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Start Time</span>
                        <input
                          type="time"
                          value={slotStart}
                          onChange={(e) => setSlotStart(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <span className="text-slate-400 mt-4 text-xs font-medium">to</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">End Time</span>
                        <input
                          type="time"
                          value={slotEnd}
                          onChange={(e) => setSlotEnd(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated HR Cold Email Campaign Settings */}
              <div className="border-t border-slate-100 pt-5 mt-5">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Automated HR Cold Email Campaign</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Send cold email outreach to list of HR contacts automatically one by one in randomized order, respecting limits and intervals.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="campaignEnabledCheckbox"
                        checked={hrOutreachCampaignEnabled}
                        onChange={(e) => setHrOutreachCampaignEnabled(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary border-slate-200 rounded focus:ring-primary"
                      />
                      <label htmlFor="campaignEnabledCheckbox" className="select-none cursor-pointer">
                        <span className="block text-xs font-semibold text-slate-600">Activate HR Outreach Campaign</span>
                        <span className="block text-[10px] text-slate-400">
                          Start sending cold emails in a random sequence to the chosen HR list.
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Source HR Contacts Database Table
                      </label>
                      <select
                        value={hrOutreachSourceTable}
                        onChange={(e) => setHrOutreachSourceTable(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="TESTING">Testing Emails Table (testing_emails)</option>
                        <option value="MAIN">Main HR Details Table (hr_details)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Target Job Role for Template ({"{{jobRole}}"})
                      </label>
                      <input
                        type="text"
                        value={hrOutreachTargetRole}
                        onChange={(e) => setHrOutreachTargetRole(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Outreach Email Template
                      </label>
                      <select
                        value={hrOutreachTemplateId}
                        onChange={(e) => setHrOutreachTemplateId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {templatesList.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {templatesList.length === 0 && (
                          <option value="default-1">General Application Outreach</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={savingSettings}
                  onClick={handleSaveSettings}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
                >
                  {savingSettings ? "Saving Settings..." : "Save Scheduling Settings"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full border-t border-slate-100 pt-5">
          <h3 className="text-base font-semibold text-slate-800 mb-3">Upload Resume (PDF, DOC, DOCX)</h3>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleUploadResume(file);
                }
              }}
              className="hidden"
              id="resume-upload-input"
            />
            <label
              htmlFor="resume-upload-input"
              className="px-4 py-2 bg-primary text-white hover:bg-primary-hover text-sm font-semibold rounded-card cursor-pointer transition-colors inline-block"
            >
              {uploadingResume ? "Uploading..." : "Choose File"}
            </label>
            {profile?.resumeFilename ? (
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-slate-600 font-medium">📄 {profile.resumeFilename}</span>
                <div className="flex items-center gap-3">
                  <a
                    href={`http://localhost:8060/api/v1/profiles/candidate/${userId}/resume`}
                    download
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={handleSyncProfile}
                    disabled={syncingProfile}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncingProfile ? "Syncing..." : "Sync Profile"}
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">No resume uploaded</span>
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
