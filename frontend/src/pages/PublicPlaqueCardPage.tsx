import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { plaqueCardService, type PublicPlaqueCardResponse } from "../features/profile/services/plaqueCardService";
import { API_BASE } from "../config/api";

export const PublicPlaqueCardPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicPlaqueCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recruiter contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);
    plaqueCardService.getPublicPlaqueCard(username)
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(err.message || "Visiting Card profile not found or private");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill in all required fields.");
      return;
    }

    setSubmittingContact(true);
    setContactError("");
    setContactSuccess(false);

    try {
      await plaqueCardService.sendContactMessage(username, {
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        message: contactMessage
      });
      setContactSuccess(true);
      setContactMessage("");
      setContactName("");
      setContactEmail("");
      setContactCompany("");
    } catch (err: any) {
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700/50 rounded-3xl p-8 space-y-6 shadow-2xl animate-pulse">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-slate-700 rounded-full" />
            <div className="h-5 bg-slate-700 rounded-lg w-1/2" />
            <div className="h-3 bg-slate-700 rounded-lg w-1/3" />
          </div>
          <div className="h-20 bg-slate-700 rounded-2xl" />
          <div className="h-32 bg-slate-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-100">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-bold">Card Private or Unset</h1>
            <p className="text-sm text-slate-400 mt-2">
              {error || "This Candidate's plaque card is not public or has not been configured."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const settings = profile.card.settings || {};
  const resumeUrl = `${API_BASE}/v1/profiles/candidate/${profile.userId}/resume`;
  const displayName = settings.displayName || profile.name;
  const headline = settings.customHeadline || profile.professionalVertical?.replace("_", " ");
  const location = settings.customLocation || "Bengaluru, India";
  const bio = settings.customSummary || profile.summary;

  // Resolve links list
  const links = [];
  const portfolioVal = settings.portfolioUrl || "";
  const githubVal = settings.githubUrl || profile.githubProfileUrl || "";
  const linkedinVal = settings.linkedinUrl || profile.linkedinProfileUrl || "";
  const leetcodeVal = settings.leetcodeUsername || profile.leetcodeUsername || "";

  if (portfolioVal) links.push({ platform: "portfolio", label: "Website", url: portfolioVal });
  if (githubVal) links.push({ platform: "github", label: "GitHub", url: githubVal });
  if (linkedinVal) links.push({ platform: "linkedin", label: "LinkedIn", url: linkedinVal });
  if (leetcodeVal) links.push({ platform: "leetcode", label: "LeetCode", url: leetcodeVal.startsWith("http") ? leetcodeVal : `https://leetcode.com/${leetcodeVal}` });

  return (
    <div
      style={{ background: "linear-gradient(135deg, #090d16 0%, #0f172a 100%)", color: "#f8fafc" }}
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 flex items-center justify-center font-sans"
    >
      <Helmet>
        <title>{`${displayName} | Professional visiting card`}</title>
        <meta name="description" content={bio || `View ${displayName}'s professional credentials.`} />
      </Helmet>

      <div className="w-full max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
        
        {/* BRANDING HEADER */}
        <div className="flex justify-between items-center px-4 shrink-0 opacity-60">
          <span className="text-[10px] uppercase tracking-widest text-primary font-black">
            Auto Apply Pro Plaque Card
          </span>
          <span className="text-xl">🤖</span>
        </div>

        {/* HEADER SECTION */}
        <div className="p-8 text-center flex flex-col items-center bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
          {settings.showAvatar && (
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-800 shadow-md shrink-0 flex items-center justify-center font-black text-slate-400 text-3xl overflow-hidden mb-4">
              {profile.avatar ? (
                <img src={profile.avatar} className="w-full h-full object-cover" alt={displayName} />
              ) : (
                displayName.charAt(0)
              )}
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight">{displayName}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1.5">
            @{profile.username}
          </p>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            {headline}
          </p>
          {settings.showLocation && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              📍 {location}
            </p>
          )}
          {profile.isVerified && (
            <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              🛡️ Verified Candidate Profile
            </span>
          )}
        </div>

        {/* SUMMARY SECTION */}
        {settings.showSummary && bio && (
          <div className="p-6 space-y-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Summary</h2>
            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
              {bio}
            </p>
          </div>
        )}

        {/* SOCIAL & PORTFOLIO LINKS */}
        {links.length > 0 && (
          <div className="p-6 space-y-3 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Connections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {links.map((lk, idx) => (
                <a
                  key={idx}
                  href={lk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 hover:bg-slate-800/60 rounded-2xl transition-all duration-200 group active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {lk.platform === "linkedin" ? "💼" : lk.platform === "github" ? "🐙" : lk.platform === "leetcode" ? "👑" : "🔗"}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{lk.label}</span>
                  </div>
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                    ➔
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS SECTION */}
        {settings.showSkills && profile.skills && profile.skills.length > 0 && (
          <div className="p-6 space-y-3 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Core Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-slate-800/40 border border-slate-800 rounded-full text-xs font-semibold text-slate-300"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* WORK HISTORY SECTION */}
        {settings.showExperience && profile.experience && profile.experience.length > 0 && (
          <div className="p-6 space-y-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Work History</h2>
            <div className="space-y-4">
              {profile.experience.slice(0, 3).map((exp: any, idx: number) => (
                <div key={idx} className="space-y-1 border-l-2 border-primary/50 pl-4 ml-1 relative">
                  <div className="w-2.5 h-2.5 rounded-full absolute -left-[6px] top-1.5 bg-primary" />
                  <h3 className="text-sm font-black text-slate-100">{exp.role || exp.title}</h3>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-semibold">{exp.company}</span>
                    <span>{exp.duration || exp.startDate}</span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-500 leading-relaxed pt-1 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION HISTORY */}
        {settings.showEducation && profile.education && profile.education.length > 0 && (
          <div className="p-6 space-y-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Education</h2>
            <div className="space-y-3">
              {profile.education.map((edu: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-100">{edu.degree || edu.qualification}</h3>
                  <p className="text-xs text-slate-400">{edu.institution || edu.school}</p>
                  <p className="text-[10px] text-slate-500">{edu.year || edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESUME DOWNLOAD BUTTON */}
        {settings.showResume && (
          <a
            href={resumeUrl}
            download
            className="w-full py-4 text-sm font-extrabold text-white bg-primary rounded-2xl shadow-lg hover:shadow-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>📄</span> Download Resume
          </a>
        )}

        {/* EMAIL CONTACT INQUIRY */}
        {settings.showContactForm && (
          <div className="p-6 space-y-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl">
            <h2 className="text-[10px] font-black tracking-wider text-primary uppercase">Email Inquiries</h2>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-800/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-200 placeholder-slate-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-800/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-200 placeholder-slate-500"
                />
              </div>
              <input
                type="text"
                placeholder="Company Name (Optional)"
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-slate-800/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-200 placeholder-slate-500"
              />
              <textarea
                required
                placeholder="Write a message..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-xs bg-slate-800/40 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-200 placeholder-slate-500 resize-none"
              />

              {contactSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl font-bold">
                  Message sent successfully! The candidate has been notified.
                </div>
              )}

              {contactError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 rounded-xl font-bold">
                  {contactError}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingContact}
                className="w-full py-3 bg-transparent border border-dashed border-primary/50 text-xs font-black text-primary hover:bg-slate-800/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submittingContact ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPlaqueCardPage;
