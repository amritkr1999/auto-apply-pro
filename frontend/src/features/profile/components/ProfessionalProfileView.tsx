import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile, ParsedResumeDto } from "../services/profileService";
import { ResumeSuggestionsModal } from "./ResumeSuggestionsModal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Link } from "react-router-dom";
import { outreachService } from "../../outreach/services/outreachService";
import { getActiveSubscription, getMyUpiPaymentStatus } from "../../billing/services/billingService";
import { useAnalytics } from "../../../context/AnalyticsContext";
import { validateFile, isValidEmail, isValidPhone, isValidUrl, isValidUsername } from "../../../utils/validation";

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
  const { trackEvent } = useAnalytics();
  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState("");
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
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [parsedSuggestions, setParsedSuggestions] = useState<ParsedResumeDto | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [gmailLoading, setGmailLoading] = useState(true);

  // Outreach Scheduling Settings State
  const [userTier, setUserTier] = useState<"Free" | "Starter" | "Pro" | "Autopilot">("Free");
  const [sentTodayCount, setSentTodayCount] = useState<number>(0);
  const [minInterval, setMinInterval] = useState(10);
  const [maxInterval, setMaxInterval] = useState(30);
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");
  const [timezone, setTimezone] = useState("UTC");

  // Interval range options (Min: 2 to 20 mins, Max: 12 to 30 mins)
  const minIntervalOptions = Array.from({ length: 19 }, (_, i) => i + 2);
  const maxIntervalOptions = Array.from({ length: 19 }, (_, i) => i + 12);

  const handleMinIntervalChange = (newMin: number) => {
    setMinInterval(newMin);
    if (maxInterval < newMin + 10) {
      setMaxInterval(Math.min(30, newMin + 10));
    }
  };

  const handleMaxIntervalChange = (newMax: number) => {
    setMaxInterval(newMax);
    if (minInterval > newMax - 10) {
      setMinInterval(Math.max(2, newMax - 10));
    }
  };
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(true);
  const [aiPersonalizationEnabled, setAiPersonalizationEnabled] = useState(false);
  const [outreachSkillsFormat, setOutreachSkillsFormat] = useState("COMMA");
  const [isPremium, setIsPremium] = useState(false);
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

  const setProfileData = (data: CandidateProfile) => {
    setProfile(data);
    setName(data.name || "");
    setMobile(data.mobile || "");
    setOfficialEmail(data.officialEmail || "");
    setSkills(data.skills || []);
    
    const prefs = data.jobPreferences || {};
    setTargetRole(prefs.targetRole || prefs.role || (data as any).hrOutreachTargetRole || "");
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
  };

  const loadProfiles = async (selectId?: number) => {
    try {
      setLoading(true);
      const allProfiles = await profileService.getCandidateProfiles(userId);
      setProfiles(allProfiles);
      if (allProfiles.length > 0) {
        const defaultProfile = allProfiles.find(p => p.isDefault) || allProfiles[0];
        const toSelect = selectId 
          ? (allProfiles.find(p => p.id === selectId) || defaultProfile) 
          : defaultProfile;
        
        setSelectedProfileId(toSelect.id || null);
        setProfileData(toSelect);
      }
    } catch (err: any) {
      setError("Failed to load profiles list.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = async (file: File) => {
    if (!selectedProfileId) return;

    const validation = validateFile(file, 5 * 1024 * 1024, [".pdf", ".doc", ".docx", ".txt"]);
    if (!validation.valid) {
      setError(validation.error || "Invalid resume file.");
      return;
    }

    try {
      setUploadingResume(true);
      setError("");
      setMessage("");
      await profileService.uploadCandidateResumeById(userId, selectedProfileId, file);
      
      // Refetch profile to show new filename
      const data = await profileService.getCandidateProfileById(userId, selectedProfileId);
      setProfileData(data);
      setProfiles(prev => prev.map(p => p.id === selectedProfileId ? data : p));
      
      // Automatically trigger suggestions review modal
      try {
        const suggestions = await profileService.syncCandidateProfileById(userId, selectedProfileId);
        setParsedSuggestions(suggestions);
        setSuggestionsModalOpen(true);
        setMessage("Resume uploaded successfully! Review suggestions below.");
      } catch (parseErr) {
        setMessage("Resume uploaded successfully! Click 'Sync Profile' to review suggestions.");
      }
      trackEvent("resume_uploaded", { filename: file.name, size: file.size });
    } catch (err: any) {
      setError(err.message || "Failed to upload resume.");
      trackEvent("resume_upload_failed", { filename: file.name, error: err.message || "Unknown error" });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSyncProfile = async () => {
    if (!selectedProfileId) return;
    try {
      setSyncingProfile(true);
      setError("");
      setMessage("");
      const suggestions = await profileService.syncCandidateProfileById(userId, selectedProfileId);
      setParsedSuggestions(suggestions);
      setSuggestionsModalOpen(true);
      trackEvent("profile_synced_from_resume", { profileId: selectedProfileId });
    } catch (err: any) {
      setError(err.message || "Failed to parse resume suggestions.");
      trackEvent("profile_sync_failed", { profileId: selectedProfileId, error: err.message || "Unknown error" });
    } finally {
      setSyncingProfile(false);
    }
  };

  const handleApplySuggestions = async (updated: CandidateProfile) => {
    if (!selectedProfileId) return;
    try {
      setError("");
      setMessage("");
      const saved = await profileService.updateCandidateProfileById(userId, selectedProfileId, updated);
      setProfileData(saved);
      setProfiles(prev => prev.map(p => p.id === selectedProfileId ? saved : p));
      setMessage("Profile successfully updated with selected resume suggestions!");
      trackEvent("resume_suggestions_applied", { profileId: selectedProfileId });
    } catch (err: any) {
      setError(err.message || "Failed to update profile with suggestions.");
    }
  };

  const handleSwitchProfile = (profileId: number) => {
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      setSelectedProfileId(profileId);
      setProfileData(target);
      setMessage("");
      setError("");
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    try {
      setIsCreatingProfile(true);
      setError("");
      setMessage("");
      const newProf = await profileService.createCandidateProfile(userId, newProfileName.trim());
      setNewProfileName("");
      await loadProfiles(newProf.id);
      setMessage(`Profile version "${newProf.profileName}" created successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to create profile version.");
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleSelectDefault = async (profileId: number) => {
    try {
      setError("");
      setMessage("");
      await profileService.selectDefaultProfile(userId, profileId);
      await loadProfiles(profileId);
      setMessage("Set default profile version successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to set default profile version.");
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!window.confirm("Are you sure you want to delete this profile version? All details and resume bytes will be permanently lost.")) return;
    try {
      setError("");
      setMessage("");
      await profileService.deleteCandidateProfile(userId, profileId);
      await loadProfiles();
      setMessage("Profile version deleted successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to delete profile version.");
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
    
    // Detect tier & sent count
    const detectTierAndCount = async () => {
      try {
        const sub = await getActiveSubscription();
        if (sub && (sub.status === "active" || sub.status === "authenticated")) {
          setIsPremium(true);
          const name = (sub.planName || "").toLowerCase();
          if (name.includes("starter")) setUserTier("Starter");
          else if (name.includes("autopilot") || name.includes("elite")) setUserTier("Autopilot");
          else setUserTier("Pro");
        } else {
          const upi = await getMyUpiPaymentStatus().catch(() => null);
          if (upi && (upi.isPremium || upi.role === "PRO" || upi.role === "PREMIUM")) {
            setIsPremium(true);
            const amt = upi.latestTransaction?.amount || 99;
            if (amt <= 70) setUserTier("Starter");
            else if (amt > 120) setUserTier("Autopilot");
            else setUserTier("Pro");
          } else {
            setIsPremium(false);
            setUserTier("Free");
          }
        }
      } catch (err) {
        console.warn("Failed to check subscription status", err);
      }

      try {
        const queue = await outreachService.getOutreachQueue(userId);
        const todayStr = new Date().toDateString();
        const count = queue.filter((item: any) => {
          if (item.status !== "SENT") return false;
          const d = item.sentAt || item.createdAt;
          return d ? new Date(d).toDateString() === todayStr : false;
        }).length;
        setSentTodayCount(count);
      } catch (err) {
        console.warn("Failed to fetch sent queue items today", err);
      }
    };

    detectTierAndCount();

    // Fetch email templates for selection dropdown
    outreachService.getTemplates()
      .then((templates) => {
        setTemplatesList(templates);
      })
      .catch((err) => console.error("Failed to load templates list", err));

    outreachService.getOutreachSettings(userId)
      .then((data) => {
        const rawMin = data.minIntervalMinutes ?? 10;
        const rawMax = data.maxIntervalMinutes ?? 30;
        let validMin = Math.max(2, Math.min(20, rawMin));
        let validMax = Math.max(validMin + 10, Math.min(30, rawMax));
        if (validMax - validMin < 10) {
          validMin = Math.max(2, validMax - 10);
        }
        setMinInterval(validMin);
        setMaxInterval(validMax);
        setSlotStart(data.slotStart ? data.slotStart.substring(0, 5) : "09:00");
        setSlotEnd(data.slotEnd ? data.slotEnd.substring(0, 5) : "17:00");
        setSkipWeekends(data.skipWeekends !== false);
        setMarketingEmailsEnabled(data.marketingEmailsEnabled !== false);
        setAiPersonalizationEnabled(!!data.aiPersonalizationEnabled);
        setOutreachSkillsFormat(data.outreachSkillsFormat || "COMMA");
        
        // Populate campaign settings
        setHrOutreachCampaignEnabled(!!data.hrOutreachCampaignEnabled);
        setHrOutreachTargetRole(data.hrOutreachTargetRole || "Software Engineer");
        setHrOutreachTemplateId(data.hrOutreachTemplateId || "default-1");
        setHrOutreachSourceTable(import.meta.env.DEV ? (data.hrOutreachSourceTable || "TESTING") : "MAIN");

        if (data.timezone && data.timezone !== "UTC") {
          setTimezone(data.timezone);
        } else {
          const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (localTz) setTimezone(localTz);
        }
      })
      .catch((err) => console.error("Failed to load outreach settings", err))
      .finally(() => setSettingsLoading(false));
  }, [userId]);

  const getTierLimitNumber = (tier: string): number => {
    switch (tier) {
      case "Starter": return 15;
      case "Pro": return 25;
      case "Autopilot": return 50;
      case "Free":
      default: return 5;
    }
  };

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
        dailyLimit: getTierLimitNumber(userTier),
        minIntervalMinutes: minInterval,
        maxIntervalMinutes: maxInterval,
        slotStart,
        slotEnd,
        timezone,
        skipWeekends,
        marketingEmailsEnabled,
        aiPersonalizationEnabled,
        outreachSkillsFormat,
        hrOutreachCampaignEnabled,
        hrOutreachTargetRole,
        hrOutreachTemplateId,
        hrOutreachSourceTable: import.meta.env.DEV ? hrOutreachSourceTable : "MAIN"
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

  const handleAddSkill = (skillName: string) => {
    if (!skills.includes(skillName)) {
      setSkills(prev => [...prev, skillName]);
    }
    setSkillSearchQuery("");
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(prev => prev.filter(s => s !== skillName));
  };

  useEffect(() => {
    loadProfiles();
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

    if (officialEmail && !isValidEmail(officialEmail)) {
      setError("Please enter a valid official email address.");
      return;
    }
    if (mobile && !isValidPhone(mobile)) {
      setError("Please enter a valid mobile phone number.");
      return;
    }
    if (githubProfileUrl && !isValidUrl(githubProfileUrl)) {
      setError("Please enter a valid GitHub profile URL starting with http:// or https://");
      return;
    }
    if (linkedinProfileUrl && !isValidUrl(linkedinProfileUrl)) {
      setError("Please enter a valid LinkedIn profile URL starting with http:// or https://");
      return;
    }
    if (username && !isValidUsername(username)) {
      setError("Username must be 3-30 alphanumeric characters or underscores.");
      return;
    }

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
        skills,
        jobPreferences: {
          targetRole,
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

      const result = await profileService.updateCandidateProfileById(userId, selectedProfileId!, updatedProfile);
      setProfiles(prev => prev.map(p => p.id === selectedProfileId ? result : p));
      setProfileData(result);
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
      trackEvent("profile_updated", { profileId: selectedProfileId });
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
      trackEvent("profile_update_failed", { profileId: selectedProfileId, error: err.message || "Unknown error" });
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

      {/* Profile Version Switcher & Creator */}
      {(activeTab === "profile" || activeTab === "preferences") && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Active Profile Version</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switch between different target roles (e.g., Java Full Stack, Python Full Stack, AI Engineer).</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedProfileId || ""}
                onChange={(e) => handleSwitchProfile(Number(e.target.value))}
                className="rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-transparent px-3 py-2 bg-white text-slate-700 font-medium"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName} {p.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
              {selectedProfileId && !profiles.find(p => p.id === selectedProfileId)?.isDefault && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectDefault(selectedProfileId)}
                  className="text-xs py-1.5 px-3 rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                >
                  Set Default
                </Button>
              )}
              {selectedProfileId && profiles.length > 1 && !profiles.find(p => p.id === selectedProfileId)?.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(selectedProfileId)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Profile Version"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateProfile} className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-3">
            <input
              type="text"
              placeholder="Create new version (e.g. AI Engineer)"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              required
              className="flex-1 rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-transparent px-3.5 py-2 bg-white"
            />
            <Button
              type="submit"
              disabled={isCreatingProfile}
              className="text-sm py-2 px-4 rounded-xl shadow-sm"
            >
              {isCreatingProfile ? "Creating..." : "Add Version"}
            </Button>
          </form>
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

          <div className="w-full space-y-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic p-1.5">No skills selected. Search and select from the list below.</span>
              ) : (
                skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-450 hover:text-indigo-650 focus:outline-none font-bold text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search and select skills..."
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent px-4 py-2.5 text-sm outline-none transition-all bg-white"
              />
              {skillSearchQuery.trim() !== "" && (
                <div className="absolute top-[100%] left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl mt-1 shadow-lg max-h-[200px] overflow-y-auto p-1.5 animate-in slide-in-from-top-2 duration-150">
                  {masterSkills
                    .filter(s => s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) && !skills.includes(s.name))
                    .slice(0, 10)
                    .map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleAddSkill(s.name)}
                        className="px-3.5 py-2 cursor-pointer transition-colors duration-150 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 text-sm"
                      >
                        {s.name}
                      </div>
                    ))
                  }
                  {masterSkills.filter(s => s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) && !skills.includes(s.name)).length === 0 && (
                    <div className="px-3.5 py-2 text-slate-400 text-xs italic">
                      No matching skills found
                    </div>
                  )}
                </div>
              )}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="Target Job Role / Position"
              type="text"
              value={targetRole}
              placeholder="e.g. Software Engineer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRole(e.target.value)}
              className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
            />

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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          Daily Send Limit ({userTier} Tier)
                        </label>
                        <Link
                          to="/billing"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 transition-colors"
                        >
                          ⚡ Upgrade Plan to increase limit
                        </Link>
                      </div>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                          <span className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase tracking-wider font-extrabold">
                              {userTier}
                            </span>
                            <span>{getTierLimitNumber(userTier)} emails / day limit</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {sentTodayCount} / {getTierLimitNumber(userTier)} sent today
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (sentTodayCount / getTierLimitNumber(userTier)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Randomized Interval Range (minutes between emails)
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Min Delay</span>
                          <select
                            value={minInterval}
                            onChange={(e) => handleMinIntervalChange(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm cursor-pointer"
                          >
                            {minIntervalOptions.map((val) => (
                              <option key={val} value={val}>
                                {val} mins
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-slate-400 mt-5 text-xs font-bold">to</span>
                        <div className="flex-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Max Delay</span>
                          <select
                            value={maxInterval}
                            onChange={(e) => handleMaxIntervalChange(parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm cursor-pointer"
                          >
                            {maxIntervalOptions.map((val) => (
                              <option key={val} value={val}>
                                {val} mins
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                        Select delay between 2 to 30 mins (minimum 10-minute gap required). Default is 10 to 30 mins.
                      </p>
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

                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="aiPersonalizationCheckbox"
                        checked={aiPersonalizationEnabled}
                        disabled={!isPremium}
                        onChange={(e) => {
                          if (!isPremium) {
                            return;
                          }
                          setAiPersonalizationEnabled(e.target.checked);
                        }}
                        className="mt-1 h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label htmlFor="aiPersonalizationCheckbox" className={`select-none ${isPremium ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          Enable AI Personalized Hook
                          {!isPremium && (
                            <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              🔒 Premium
                            </span>
                          )}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          Tailor your outreach emails using deep vision/language models to match your exact skills with job requirements.
                        </span>
                        {!isPremium && (
                          <span className="block text-[10px] text-indigo-600 font-semibold mt-1">
                            * Upgrade to Premium to unlock AI Personalized Hook.
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Skills Formatting Style in Emails
                      </label>
                      <select
                        value={outreachSkillsFormat}
                        onChange={(e) => setOutreachSkillsFormat(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white cursor-pointer"
                      >
                        <option value="COMMA">Comma Separated List (e.g., React, Java)</option>
                        <option value="BADGES">Visual Tag Pills (Modern HTML Badges)</option>
                        <option value="CALLOUT">Bordered Accent Callout Box</option>
                        <option value="BULLET">Line-by-line Bullet Points</option>
                      </select>
                      <span className="block text-[10px] text-slate-400 font-medium mt-1">
                        Choose how your skills are presented to recruiters when parsed inside templates or draft emails.
                      </span>
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
                          <span className="block text-[10px] text-indigo-600 font-semibold mt-1">
                            * Upgrade to Premium for multiple template use.
                          </span>
                        </label>
                      </div>

                      {import.meta.env.DEV && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Source HR Contacts Database Table <span className="text-[10px] text-amber-600 font-semibold">(Dev Mode Only)</span>
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
                      )}
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

      {parsedSuggestions && profile && (
        <ResumeSuggestionsModal
          isOpen={suggestionsModalOpen}
          onClose={() => setSuggestionsModalOpen(false)}
          parsedData={parsedSuggestions}
          currentProfile={profile}
          onApplySuggestions={handleApplySuggestions}
        />
      )}
    </div>
  );
};

export default ProfessionalProfileView;
