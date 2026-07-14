import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "../services/profileService";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { outreachService } from "../../outreach/services/outreachService";

const GithubIcon = () => (
  <svg className="w-5 h-5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

interface Props {
  userId: number;
  activeTab: string;
  onProfileUpdate: (name: string, avatar: string) => void;
}

export const ProfessionalProfileView: React.FC<Props> = ({ userId, activeTab, onProfileUpdate }) => {
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
  const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);
  const [newExcludedCompany, setNewExcludedCompany] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubProfileUrl, setGithubProfileUrl] = useState("");
  const [linkedinName, setLinkedinName] = useState("");
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState("");
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [username, setUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [professionalVertical, setProfessionalVertical] = useState("DEVELOPER");
  
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
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setExcludedCompanies(data.excludedCompanies || []);
      setGithubUsername(data.githubUsername || "");
      setGithubProfileUrl(data.githubProfileUrl || "");
      setLinkedinName(data.linkedinName || "");
      setLinkedinProfileUrl(data.linkedinProfileUrl || "");
      
      onProfileUpdate(data.name, data.avatar || "");
      setMessage("Profile successfully synchronized with your resume!");
    } catch (err: any) {
      setError(err.message || "Failed to sync profile.");
    } finally {
      setSyncingProfile(false);
    }
  };

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

    // Check query params for OAuth redirection callback status
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const provider = params.get("provider");
    const errorMsg = params.get("errorMsg");
    if (status === "success") {
      if (provider === "github") {
        setMessage("GitHub account connected successfully!");
      } else if (provider === "linkedin") {
        setMessage("LinkedIn account connected successfully!");
      } else {
        setMessage("Gmail account connected successfully!");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "error") {
      const displayErr = errorMsg ? decodeURIComponent(errorMsg) : "Please try again.";
      if (provider === "github") {
        setError("Failed to connect GitHub account: " + displayErr);
      } else if (provider === "linkedin") {
        setError("Failed to connect LinkedIn account: " + displayErr);
      } else {
        setError("Failed to connect Gmail account: " + displayErr);
      }
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

  const handleConnectGithub = async () => {
    try {
      setError("");
      setMessage("");
      const resolvedUserId = userId || JSON.parse(localStorage.getItem("user") || "{}").id;
      if (!resolvedUserId) {
        throw new Error("User ID is not found. Please log in again.");
      }
      const redirectUrl = await profileService.getGithubConnectUrl(resolvedUserId);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to initiate GitHub connection.");
      alert("GitHub Connect Error: " + (err.message || err));
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      setError("");
      setMessage("");
      const resolvedUserId = userId || JSON.parse(localStorage.getItem("user") || "{}").id;
      if (!resolvedUserId) {
        throw new Error("User ID is not found. Please log in again.");
      }
      await profileService.disconnectGithub(resolvedUserId);
      setGithubUsername("");
      setGithubProfileUrl("");
      setMessage("GitHub account disconnected successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to disconnect GitHub.");
      alert("GitHub Disconnect Error: " + (err.message || err));
    }
  };

  const handleConnectLinkedin = async () => {
    try {
      setError("");
      setMessage("");
      const resolvedUserId = userId || JSON.parse(localStorage.getItem("user") || "{}").id;
      if (!resolvedUserId) {
        throw new Error("User ID is not found. Please log in again.");
      }
      const redirectUrl = await profileService.getLinkedinConnectUrl(resolvedUserId);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to initiate LinkedIn connection.");
      alert("LinkedIn Connect Error: " + (err.message || err));
    }
  };

  const handleDisconnectLinkedin = async () => {
    try {
      setError("");
      setMessage("");
      const resolvedUserId = userId || JSON.parse(localStorage.getItem("user") || "{}").id;
      if (!resolvedUserId) {
        throw new Error("User ID is not found. Please log in again.");
      }
      await profileService.disconnectLinkedin(resolvedUserId);
      setLinkedinName("");
      setLinkedinProfileUrl("");
      setMessage("LinkedIn account disconnected successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to disconnect LinkedIn.");
      alert("LinkedIn Disconnect Error: " + (err.message || err));
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
        setExcludedCompanies(data.excludedCompanies || []);
        setGithubUsername(data.githubUsername || "");
        setGithubProfileUrl(data.githubProfileUrl || "");
        setLinkedinName(data.linkedinName || "");
        setLinkedinProfileUrl(data.linkedinProfileUrl || "");
        setIsProfilePublic(data.isProfilePublic || false);
        setUsername(data.username || "");
        setLeetcodeUsername(data.leetcodeUsername || "");
        setIsVerified(data.isVerified || false);
        setProfessionalVertical(data.professionalVertical || "DEVELOPER");

        onProfileUpdate(data.name, data.avatar || "");
      })
      .catch(() => setError("Failed to load profile details."))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const delayDebounceFn = setTimeout(() => {
      profileService.checkUsernameAvailability(username)
        .then((available) => {
          setUsernameAvailable(available);
        })
        .catch(() => setUsernameAvailable(false))
        .finally(() => setCheckingUsername(false));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [username, profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (isProfilePublic && usernameAvailable === false) {
      setError("Cannot save profile: Username is already taken.");
      return;
    }

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
        excludedCompanies,
        githubUsername,
        githubProfileUrl,
        linkedinProfileUrl,
        linkedinName,
        isProfilePublic,
        username,
        leetcodeUsername,
        professionalVertical,
      };

      const result = await profileService.updateCandidateProfile(userId, updatedProfile);
      setProfile(result);
      setIsProfilePublic(result.isProfilePublic || false);
      setUsername(result.username || "");
      setLeetcodeUsername(result.leetcodeUsername || "");
      setIsVerified(result.isVerified || false);
      setProfessionalVertical(result.professionalVertical || "DEVELOPER");
      setExcludedCompanies(result.excludedCompanies || []);
      
      // Update local storage user details
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
        u.mobile = mobile;
        u.officialEmail = officialEmail;
        localStorage.setItem("user", JSON.stringify(u));
      }

      onProfileUpdate(name, result.avatar || "");
      setMessage("Profile details saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
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

  const handleAddExcludedCompany = () => {
    if (newExcludedCompany.trim()) {
      const trimmed = newExcludedCompany.trim();
      if (!excludedCompanies.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        setExcludedCompanies([...excludedCompanies, trimmed]);
      }
      setNewExcludedCompany("");
    }
  };

  const handleRemoveExcludedCompany = (index: number) => {
    setExcludedCompanies(excludedCompanies.filter((_, i) => i !== index));
  };

  if (loading) return <div className="text-slate-500 py-6 text-center font-medium animate-pulse">Loading profile details...</div>;

  return (
    <div className="w-full">
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl mb-6 text-sm font-medium animate-in fade-in duration-200">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl mb-6 text-sm font-medium animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {activeTab === "profile" && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Professional Details</h2>
            <p className="text-sm text-slate-500 mt-1">Provide your name, contact email, skills, and work history.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />

            <Input
              label="Mobile Number"
              type="text"
              value={mobile}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
              required
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Account Email (Read-only)"
              type="email"
              value={profile?.email || ""}
              disabled
              className="rounded-xl border-slate-100 bg-slate-50 text-slate-400 font-medium px-4 py-2.5"
            />

            <Input
              label="Official Email Address"
              type="email"
              value={officialEmail}
              placeholder="yourname@company.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficialEmail(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />
          </div>

          <div className="relative w-full">
            <Input
              label="Skills (comma-separated)"
              type="text"
              value={skills}
              placeholder="React, TypeScript, Java, Spring Boot"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-[100%] left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-[200px] overflow-y-auto p-1.5 animate-in slide-in-from-top-2 duration-150">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-3.5 py-2 cursor-pointer transition-colors duration-150 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 text-sm"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Professional Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Brief professional summary extracted from your resume..."
            />
          </div>

          {/* Work Experience */}
          <div className="w-full border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">Work Experience</h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all cursor-pointer"
              >
                + Add Experience
              </button>
            </div>
            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 border border-slate-100">No experience entries listed.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/40 flex flex-col gap-4 relative transition-all hover:bg-slate-50/80">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer bg-rose-50 hover:bg-rose-100/60 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Job Title"
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-white"
                      />
                      <Input
                        label="Company"
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-white"
                      />
                      <Input
                        label="Duration (e.g. 2021 - 2024)"
                        type="text"
                        value={exp.duration || ""}
                        onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                        className="rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={exp.description || ""}
                        onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-base-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        placeholder="Role description and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="w-full border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">Education</h3>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all cursor-pointer"
              >
                + Add Education
              </button>
            </div>
            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 border border-slate-100">No education entries listed.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-5 border border-slate-150 rounded-2xl bg-slate-50/40 flex flex-col gap-4 relative transition-all hover:bg-slate-50/80">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-4 right-4 text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer bg-rose-50 hover:bg-rose-100/60 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="Degree"
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-white"
                      />
                      <Input
                        label="Institution"
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                        required
                        className="rounded-xl border-slate-200 bg-white"
                      />
                      <Input
                        label="Field of Study"
                        type="text"
                        value={edu.field_of_study || ""}
                        onChange={(e) => handleEducationChange(idx, "field_of_study", e.target.value)}
                        className="rounded-xl border-slate-200 bg-white"
                      />
                      <Input
                        label="Graduation Year"
                        type="number"
                        value={edu.graduation_year || ""}
                        onChange={(e) => handleEducationChange(idx, "graduation_year", e.target.value ? parseInt(e.target.value) : null)}
                        className="rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-3">Certifications</h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newCert}
                placeholder="e.g. AWS Certified Solutions Architect"
                onChange={(e) => setNewCert(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm text-base-text bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleAddCert}
                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all active:scale-95 shadow-sm hover:shadow"
              >
                Add
              </button>
            </div>
            {certifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 border border-slate-100">No certifications listed.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                {certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full text-xs text-slate-700 font-bold shadow-sm"
                  >
                    <span>{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(idx)}
                      className="text-xs text-slate-400 hover:text-rose-500 font-extrabold cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public Profile Settings */}
          <div className="w-full border-t border-slate-100 pt-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-800 mb-2">Public Profile Settings</h3>
            <p className="text-xs text-slate-500 mb-4">
              Control your public profile visibility. When enabled, recruiters and peers can view your non-sensitive professional bio, skills, GitHub stats, and LeetCode stats.
            </p>

            <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="is-profile-public-checkbox" className="text-sm font-bold text-slate-700">Make Profile Public</label>
                  <p className="text-xs text-slate-400">Allow anyone with the link to view your public profile page.</p>
                </div>
                <input
                  id="is-profile-public-checkbox"
                  type="checkbox"
                  checked={isProfilePublic}
                  onChange={(e) => setIsProfilePublic(e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-350 rounded focus:ring-primary cursor-pointer"
                />
              </div>

              {isProfilePublic && (
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div>
                    <label htmlFor="vertical-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Professional Vertical
                    </label>
                    <select
                      id="vertical-select"
                      value={professionalVertical}
                      onChange={(e) => setProfessionalVertical(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="DEVELOPER">Technology & Software Engineering</option>
                      <option value="KNOWLEDGE_WORKER">Business Operations, Management & Finance</option>
                      <option value="DOCUMENT_VERIFICATION">Legal, Regulatory & Medical Services</option>
                    </select>
                  </div>

                  <div className={`grid grid-cols-1 ${professionalVertical === "DEVELOPER" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4 pt-3 border-t border-slate-200/50 animate-in fade-in duration-250`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="public-username-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Profile Username / Handle
                        </label>
                        {isVerified && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">
                            Verified ✔
                          </span>
                        )}
                      </div>
                      <input
                        id="public-username-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replaceAll(/[^a-z0-9_]/g, ""))}
                        placeholder="e.g. professional_handle"
                        required={isProfilePublic}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      {username && username !== profile?.username && (
                        <div className="mt-1.5 text-xs">
                          {checkingUsername ? (
                            <span className="text-slate-400 font-medium animate-pulse">Checking availability...</span>
                          ) : usernameAvailable ? (
                            <span className="text-emerald-600 font-semibold">✓ Username is available</span>
                          ) : (
                            <span className="text-rose-500 font-semibold">✗ Username is already taken</span>
                          )}
                        </div>
                      )}
                    </div>

                    {professionalVertical === "DEVELOPER" && (
                      <div>
                        <label htmlFor="leetcode-username-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          LeetCode Username
                        </label>
                        <input
                          id="leetcode-username-input"
                          type="text"
                          value={leetcodeUsername}
                          onChange={(e) => setLeetcodeUsername(e.target.value)}
                          placeholder="e.g. leetcode_user"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isProfilePublic && username && (
                <div className="mt-4 p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shareable Public Link</p>
                    <a
                      href={`${window.location.origin}/profile/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-bold block truncate mt-0.5"
                    >
                      {`${window.location.origin}/profile/${username}`}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/profile/${username}`);
                      alert("Link copied to clipboard!");
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" size="md">
              Save Profile Details
            </Button>
          </div>
        </form>
      )}

      {activeTab === "preferences" && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Job Preferences & Resume</h2>
            <p className="text-sm text-slate-500 mt-1">Specify preferred location, salary details, and keep your resume up to date.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Preferred Job Location"
              type="text"
              value={locationPreference}
              placeholder="San Francisco, CA or Remote"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationPreference(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />

            <Input
              label="Expected Salary"
              type="text"
              value={expectedSalary}
              placeholder="$120k/yr"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpectedSalary(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />
          </div>

          {/* Excluded Companies Section */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Excluded Companies</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add companies that you want to exclude from email outreach and job applications. (e.g. current or previous employers).
            </p>

            <div className="space-y-4">
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Meta"
                  value={newExcludedCompany}
                  onChange={(e) => setNewExcludedCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddExcludedCompany();
                    }
                  }}
                  className="flex-1 min-h-[44px] px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={handleAddExcludedCompany}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center min-h-[44px]"
                >
                  Exclude
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {excludedCompanies.length > 0 ? (
                  excludedCompanies.map((company, index) => (
                    <div
                      key={`${company}-${index}`}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs"
                    >
                      <span>{company}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExcludedCompany(index)}
                        className="text-rose-400 hover:text-rose-700 focus:outline-none cursor-pointer transition-colors p-0.5 rounded-full hover:bg-rose-200/60"
                        aria-label={`Remove exclusion for ${company}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No companies excluded yet.</span>
                )}
              </div>
            </div>
          </div>

          {/* Resume Upload section */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-2">Upload Resume (PDF, DOC, DOCX)</h3>
            <p className="text-xs text-slate-500 mb-4">Upload your latest resume to automatically parse and synchronize skills and work experience.</p>
            
            <div className="flex flex-col gap-4 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center items-center justify-center transition-all hover:bg-slate-100/50">
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
              
              <div className="p-3 bg-white rounded-full shadow-sm text-primary mb-1">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <label
                htmlFor="resume-upload-input"
                className="px-6 py-2.5 bg-primary text-white hover:bg-primary-hover text-sm font-semibold rounded-xl cursor-pointer transition-all inline-block shadow-sm hover:shadow active:scale-95"
              >
                {uploadingResume ? "Uploading..." : "Choose File"}
              </label>

              {profile?.resumeFilename ? (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-xs border border-slate-150">
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">📄 {profile.resumeFilename}</span>
                    <a
                      href={`/api/v1/profiles/candidate/${userId}/resume`}
                      download
                      className="text-xs text-primary hover:underline font-bold border-l border-slate-200 pl-2"
                    >
                      Download
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncProfile}
                    disabled={syncingProfile}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-1 active:scale-95"
                  >
                    {syncingProfile ? "Syncing..." : "Sync Profile fields from Resume"}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No resume uploaded yet</span>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" size="md">
              Save Preferences
            </Button>
          </div>
        </form>
      )}

      {activeTab === "scheduling" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Outreach & Scheduling</h2>
            <p className="text-sm text-slate-500 mt-1">Connect your mail dispatchers, and configure interval algorithms to keep your account safe.</p>
          </div>

          {/* Gmail Integration Section */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-2">Gmail Integration</h3>
            <p className="text-xs text-slate-500 mb-4">
              Connect your personal Gmail account to automate sending application and follow-up emails directly from your own email address.
            </p>
            
            {gmailLoading ? (
              <div className="text-xs text-slate-400 italic py-3 bg-slate-50 rounded-xl border border-slate-100 text-center animate-pulse">Checking connection status...</div>
            ) : gmailConnected ? (
              <div className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-xs">
                <div className="flex items-center gap-4">
                  <span className="text-2xl bg-white p-2.5 rounded-xl shadow-xs border border-emerald-100">📧</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Gmail Connected</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">{connectedEmail}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectGmail}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold rounded-xl"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-5 bg-slate-50/50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-4">
                  <span className="text-2xl bg-white p-2.5 rounded-xl shadow-xs border border-slate-150">📧</span>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Gmail Disconnected</p>
                    <p className="text-xs text-slate-400 mt-0.5">No account connected yet</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConnectGmail}
                  className="rounded-xl shadow-sm"
                >
                  Connect Gmail
                </Button>
              </div>
            )}
          </div>

          {/* Connected Professional Accounts */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-2">Connected Professional Accounts</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-4">
              Connect your verified accounts to authenticate your professional identity and enrich outreach materials.
            </p>

            <div className={`grid grid-cols-1 ${professionalVertical === "DEVELOPER" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
              {/* GitHub Card */}
              {professionalVertical === "DEVELOPER" && (
                githubUsername ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-2xl transition-all hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-slate-150 shadow-xs">
                        <GithubIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">GitHub Connected</p>
                        <a
                          href={githubProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-semibold block truncate"
                        >
                          @{githubUsername}
                        </a>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectGithub}
                      className="text-rose-600 border-rose-200 hover:bg-rose-55 font-bold rounded-xl"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-slate-150 shadow-xs text-slate-400">
                        <GithubIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">GitHub</p>
                        <p className="text-xs text-slate-400">Not connected</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConnectGithub}
                      className="rounded-xl"
                    >
                      Connect
                    </Button>
                  </div>
                )
              )}

              {/* LinkedIn Card */}
              {linkedinName ? (
                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-2xl transition-all hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl border border-slate-150 shadow-xs">
                      <LinkedinIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0A66C2]">LinkedIn Connected</p>
                      <a
                        href={linkedinProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0A66C2] hover:underline font-semibold block truncate"
                      >
                        {linkedinName}
                      </a>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectLinkedin}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold rounded-xl"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl border border-slate-150 shadow-xs text-slate-400">
                      <LinkedinIcon />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">LinkedIn</p>
                      <p className="text-xs text-slate-400">Not connected</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConnectLinkedin}
                    className="rounded-xl"
                  >
                    Connect
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Outreach Scheduling & Anti-Spam Settings */}
          <div className="w-full border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-800 mb-2">Outreach & Anti-Spam Scheduling</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure randomized dispatch intervals and time slot windows to simulate natural mailing behavior and keep your account safe from spam filters.
            </p>

            {settingsLoading ? (
              <div className="text-xs text-slate-400 italic py-3 bg-slate-50 rounded-xl text-center">Loading scheduling settings...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 border border-slate-200 rounded-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Daily Send Limit (emails/day)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(parseInt(e.target.value) || 50)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Randomized Interval Range (minutes between emails)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Min Delay</span>
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={minInterval}
                            onChange={(e) => setMinInterval(parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                          />
                        </div>
                        <span className="text-slate-400 mt-5 text-xs font-bold">to</span>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Max Delay</span>
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={maxInterval}
                            onChange={(e) => setMaxInterval(parseInt(e.target.value) || 30)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        id="skipWeekendsCheckbox"
                        checked={skipWeekends}
                        onChange={(e) => setSkipWeekends(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="skipWeekendsCheckbox" className="select-none cursor-pointer">
                        <span className="block text-xs font-bold text-slate-600">Skip Weekends</span>
                        <span className="block text-[10px] text-slate-400 font-medium">Do not send any outreach emails on Saturday and Sunday.</span>
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="marketingEmailsCheckbox"
                        checked={marketingEmailsEnabled}
                        onChange={(e) => setMarketingEmailsEnabled(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="marketingEmailsCheckbox" className="select-none cursor-pointer">
                        <span className="block text-xs font-bold text-slate-600">Marketing Notifications</span>
                        <span className="block text-[10px] text-slate-400 font-medium">Receive updates on job matches, tips, and subscription offers.</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          Local Timezone
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            if (localTz) setTimezone(localTz);
                          }}
                          className="text-[10px] text-primary hover:underline font-bold bg-primary/5 px-2 py-0.5 rounded-full"
                        >
                          Detect timezone
                        </button>
                      </div>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
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
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Active Sending Slot (local user hours)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Start Time</span>
                          <input
                            type="time"
                            value={slotStart}
                            onChange={(e) => setSlotStart(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                          />
                        </div>
                        <span className="text-slate-400 mt-5 text-xs font-bold">to</span>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">End Time</span>
                          <input
                            type="time"
                            value={slotEnd}
                            onChange={(e) => setSlotEnd(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated HR Cold Email Campaign Settings */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Automated HR Cold Email Campaign</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Send cold email outreach to list of HR contacts automatically one by one in randomized order, respecting limits and intervals.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 border border-slate-200 rounded-2xl">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="campaignEnabledCheckbox"
                          checked={hrOutreachCampaignEnabled}
                          onChange={(e) => setHrOutreachCampaignEnabled(e.target.checked)}
                          className="mt-1 h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="campaignEnabledCheckbox" className="select-none cursor-pointer">
                          <span className="block text-xs font-bold text-slate-600">Activate HR Outreach Campaign</span>
                          <span className="block text-[10px] text-slate-400 font-medium">
                            Start sending cold emails in a random sequence to the chosen HR list.
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Source HR Contacts Database Table
                        </label>
                        <select
                          value={hrOutreachSourceTable}
                          onChange={(e) => setHrOutreachSourceTable(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                        >
                          <option value="TESTING">Testing Emails Table (testing_emails)</option>
                          <option value="MAIN">Main HR Details Table (hr_details)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Target Job Role for Template ({"{{jobRole}}"})
                        </label>
                        <input
                          type="text"
                          value={hrOutreachTargetRole}
                          onChange={(e) => setHrOutreachTargetRole(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white font-medium"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Outreach Email Template
                        </label>
                        <select
                          value={hrOutreachTemplateId}
                          onChange={(e) => setHrOutreachTemplateId(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
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

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2.5 shadow-sm hover:shadow rounded-xl"
                  >
                    {savingSettings ? "Saving Settings..." : "Save Scheduling Settings"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalProfileView;
