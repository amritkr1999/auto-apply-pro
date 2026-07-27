import React, { useState, useEffect } from "react";
import { plaqueCardService, type PlaqueCardConfig } from "../services/plaqueCardService";
import { profileService, type CandidateProfile } from "../services/profileService";
import { isValidHexColor } from "../../../utils/validation";

interface PlaqueCardEditorProps {
  userId: number;
}

export const PlaqueCardEditor: React.FC<PlaqueCardEditorProps> = ({ userId }) => {
  const [config, setConfig] = useState<PlaqueCardConfig | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cardData = await plaqueCardService.getMyPlaqueCard();
        setConfig(cardData);
        
        const profileData = await profileService.getCandidateProfile(userId);
        setProfile(profileData);
      } catch (err: any) {
        setErrorMsg("Failed to load visiting card settings: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleUpdateSetting = (key: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    if (!config) return;

    if (config.settings?.primaryColor && !isValidHexColor(config.settings.primaryColor)) {
      setErrorMsg("Primary color must be a valid hex color code (e.g. #2563eb).");
      return;
    }

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const saved = await plaqueCardService.updateMyPlaqueCard(config);
      setConfig(saved);
      setSuccessMsg("Visiting Card settings saved successfully! View the link below to see your public card.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save card config.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading visiting card configuration...</p>
      </div>
    );
  }

  if (!config || !profile) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 font-medium">
        Error: Unable to load card settings.
      </div>
    );
  }

  const settings = config.settings || {};
  const publicUrl = `${window.location.origin}/card/${profile.username}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Virtual Visiting Card Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure which sections and details are displayed on your public plaque card.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 rounded-2xl font-bold flex items-start gap-2">
          <span>✅</span>
          <div>
            <p>{successMsg}</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="underline text-emerald-900 mt-1 block">
              Open Public Plaque Card: {publicUrl} ↗
            </a>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-sm text-rose-800 rounded-2xl font-semibold flex items-center gap-2">
          <span>❌</span>
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Configuration Controls */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Display Overrides */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Information Overrides</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName ?? ""}
                  onChange={(e) => handleUpdateSetting("displayName", e.target.value)}
                  placeholder={profile.name}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Headline Subtitle</label>
                <input
                  type="text"
                  value={settings.customHeadline ?? ""}
                  onChange={(e) => handleUpdateSetting("customHeadline", e.target.value)}
                  placeholder={profile.professionalVertical?.replace("_", " ")}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Location</label>
                <input
                  type="text"
                  value={settings.customLocation ?? ""}
                  onChange={(e) => handleUpdateSetting("customLocation", e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Portfolio URL</label>
                <input
                  type="url"
                  value={settings.portfolioUrl ?? ""}
                  onChange={(e) => handleUpdateSetting("portfolioUrl", e.target.value)}
                  placeholder="e.g. https://myportfolio.com"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">GitHub URL</label>
                  <input
                    type="url"
                    value={settings.githubUrl ?? ""}
                    onChange={(e) => handleUpdateSetting("githubUrl", e.target.value)}
                    placeholder="GitHub Profile URL"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={settings.linkedinUrl ?? ""}
                    onChange={(e) => handleUpdateSetting("linkedinUrl", e.target.value)}
                    placeholder="LinkedIn Profile URL"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">LeetCode Username</label>
                <input
                  type="text"
                  value={settings.leetcodeUsername ?? ""}
                  onChange={(e) => handleUpdateSetting("leetcodeUsername", e.target.value)}
                  placeholder="LeetCode Username"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50 hover:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Custom Biography/Summary</label>
                <textarea
                  value={settings.customSummary ?? ""}
                  onChange={(e) => handleUpdateSetting("customSummary", e.target.value)}
                  rows={4}
                  placeholder="Write a custom summary bio..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-slate-50/50 hover:bg-slate-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Card Section Visibility</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showAvatar}
                  onChange={(e) => handleUpdateSetting("showAvatar", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Profile Picture</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show profile avatar</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showLocation}
                  onChange={(e) => handleUpdateSetting("showLocation", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Location Tag</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show location details</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showSummary}
                  onChange={(e) => handleUpdateSetting("showSummary", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Summary Section</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show summary bio</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showSkills}
                  onChange={(e) => handleUpdateSetting("showSkills", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Core Competencies</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show skills list badges</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showExperience}
                  onChange={(e) => handleUpdateSetting("showExperience", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Work History</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show experiences list</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showEducation}
                  onChange={(e) => handleUpdateSetting("showEducation", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Education Details</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show education history</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showResume}
                  onChange={(e) => handleUpdateSetting("showResume", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Resume Action</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show resume download btn</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.showContactForm}
                  onChange={(e) => handleUpdateSetting("showContactForm", e.target.checked)}
                  className="w-4.5 h-4.5 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">Contact Form</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Show direct email form</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Preview Simulator */}
        <div className="lg:col-span-6 sticky top-6 space-y-4">
          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">EasyNaukri Preview</span>
            </div>
            <div className="flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  previewDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  previewDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Desktop
              </button>
            </div>
          </div>

          {/* SIMULATOR */}
          <div className="flex items-center justify-center p-4 bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden min-h-[500px]">
            <div
              style={{
                width: previewDevice === "mobile" ? "360px" : "100%",
                height: previewDevice === "mobile" ? "640px" : "auto",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#f8fafc"
              }}
              className={`shadow-2xl flex flex-col p-6 overflow-y-auto transition-all scrollbar-none font-sans ${
                previewDevice === "mobile"
                  ? "rounded-[40px] border-[10px] border-slate-800 relative"
                  : "rounded-2xl"
              }`}
            >
              {/* Phone Status bar mock */}
              {previewDevice === "mobile" && (
                <div className="flex justify-between items-center text-[10px] font-bold mb-5 shrink-0 opacity-40 px-2 select-none">
                  <span>9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>
              )}

              {/* BRANDING HEADER */}
              <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase tracking-widest text-primary font-black">
                  EasyNaukri Card
                </span>
                <span className="text-lg">🤖</span>
              </div>

              {/* CARD CONTENT */}
              <div className="space-y-4 pb-8 flex-1">
                
                {/* Header widget */}
                <div className="p-5 text-center flex flex-col items-center bg-slate-900/80 border border-slate-800 shadow-xl rounded-2xl">
                  {settings.showAvatar && (
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-primary/40 shadow-xs shrink-0 flex items-center justify-center font-black text-slate-400 overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        (settings.displayName || profile.name).charAt(0)
                      )}
                    </div>
                  )}
                  <h4 className="text-base font-extrabold mt-3 tracking-tight">{settings.displayName || profile.name}</h4>
                  <p className="text-[11px] text-primary font-bold mt-1">
                    {settings.customHeadline || profile.professionalVertical?.replace("_", " ")}
                  </p>
                  {settings.showLocation && (
                    <p className="text-[10px] opacity-50 mt-1">
                      📍 {settings.customLocation || "Bengaluru, IN"}
                    </p>
                  )}
                  {profile.isVerified && (
                    <span className="mt-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✔ Verified Professional
                    </span>
                  )}
                </div>

                {/* Summary widget */}
                {settings.showSummary && (
                  <div className="p-4 space-y-2 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <h5 className="text-[10px] font-black tracking-wider text-primary uppercase">Summary</h5>
                    <p className="text-xs leading-relaxed opacity-85">
                      {settings.customSummary || "Professional candidate summary..."}
                    </p>
                  </div>
                )}

                {/* Social links */}
                <div className="p-4 space-y-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  <h5 className="text-[10px] font-black tracking-wider text-primary uppercase">Connections</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {settings.portfolioUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <span className="text-xs font-bold">🌐 Website</span>
                        <span className="text-[9px] opacity-40 font-mono truncate max-w-[120px]">{settings.portfolioUrl}</span>
                      </div>
                    )}
                    {settings.githubUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <span className="text-xs font-bold">🐙 GitHub</span>
                        <span className="text-[9px] opacity-40 font-mono truncate max-w-[120px]">{settings.githubUrl}</span>
                      </div>
                    )}
                    {settings.linkedinUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <span className="text-xs font-bold">💼 LinkedIn</span>
                        <span className="text-[9px] opacity-40 font-mono truncate max-w-[120px]">{settings.linkedinUrl}</span>
                      </div>
                    )}
                    {settings.leetcodeUsername && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-800/40 border border-slate-800 rounded-xl">
                        <span className="text-xs font-bold">👑 LeetCode</span>
                        <span className="text-[9px] opacity-40 font-mono truncate max-w-[120px]">{settings.leetcodeUsername}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {settings.showSkills && profile.skills && profile.skills.length > 0 && (
                  <div className="p-4 space-y-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <h5 className="text-[10px] font-black tracking-wider text-primary uppercase">Core Skills</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.slice(0, 8).map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 bg-slate-800 border border-slate-800 rounded-full text-[10px] font-semibold text-slate-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {settings.showExperience && profile.experience && profile.experience.length > 0 && (
                  <div className="p-4 space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <h5 className="text-[10px] font-black tracking-wider text-primary uppercase">Experience</h5>
                    <div className="space-y-3">
                      {profile.experience.slice(0, 3).map((exp: any, eIdx: number) => (
                        <div key={eIdx} className="space-y-0.5 border-l-2 border-primary/50 pl-3 ml-1">
                          <h6 className="text-xs font-black">{exp.role || exp.title}</h6>
                          <p className="text-[10px] opacity-75">{exp.company}</p>
                          <p className="text-[9px] opacity-50">{exp.duration || exp.startDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Download */}
                {settings.showResume && (
                  <button
                    type="button"
                    className="w-full py-3 bg-primary text-xs font-extrabold text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 select-none"
                  >
                    <span>📄</span> Download Resume
                  </button>
                )}

                {/* Contact Form */}
                {settings.showContactForm && (
                  <div className="p-4 space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <h5 className="text-[10px] font-black tracking-wider text-primary uppercase">Email Inquiries</h5>
                    <input
                      type="text"
                      placeholder="Your Name"
                      disabled
                      className="w-full px-3 py-2 text-[11px] bg-slate-800/40 border border-slate-800 rounded-lg select-none opacity-80"
                    />
                    <textarea
                      placeholder="Leave a message..."
                      disabled
                      rows={2}
                      className="w-full px-3 py-2 text-[11px] bg-slate-800/40 border border-slate-800 rounded-lg select-none opacity-80 resize-none"
                    />
                    <button
                      type="button"
                      className="w-full py-2 bg-transparent border border-dashed border-primary/40 text-xs font-extrabold text-primary cursor-not-allowed select-none"
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaqueCardEditor;
