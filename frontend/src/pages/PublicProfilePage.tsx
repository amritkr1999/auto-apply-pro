import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";
import { profileService, type PublicProfile } from "../features/profile/services/profileService";

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);
    profileService.getPublicProfile(username)
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(err.message || "Profile not found or private");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-200 rounded-full" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
            </div>
          </div>
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State (Clean 404/403 display)
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Profile Unavailable</h1>
            <p className="text-sm text-slate-500 mt-2">
              {error || "This profile is private or does not exist."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Statistics calculation/fallbacks from polymorphic metrics
  const github = profile.evidenceMetrics?.github || {};
  const leetcode = profile.evidenceMetrics?.leetcode || {};
  const linkedin = profile.evidenceMetrics?.linkedin || {};
  const verification = profile.evidenceMetrics?.verification || {};
  const projects = profile.evidenceMetrics?.projects || {};

  const lName = profile.linkedinName || linkedin.name;
  const lUrl = profile.linkedinProfileUrl || linkedin.profileUrl;

  const profileCanonical = `https://easynaukri.online/p/${profile.username}`;
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": profile.name,
      "alternateName": profile.username,
      "description": profile.summary || `Verified credentials and professional qualifications of ${profile.name}.`,
      "image": profile.avatar || "https://easynaukri.online/dashboard_mockup.png",
      "jobTitle": profile.professionalVertical || "Professional",
      "url": profileCanonical
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={`${profile.name} (@${profile.username}) | Professional Profile`}
        description={profile.summary || `View ${profile.name}'s professional credentials, verified metrics, and qualifications on EasyNaukri.`}
        canonicalUrl={profileCanonical}
        ogImage={profile.avatar || "https://easynaukri.online/dashboard_mockup.png"}
        ogType="profile"
        jsonLd={profileJsonLd}
      />

      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-3xl font-extrabold text-slate-400">
                {profile.name.charAt(0)}
              </div>
            )}
            {profile.isVerified && (
              <span
                title="Verified Identity"
                className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1.5 shadow-sm border-2 border-white text-[10px]"
              >
                ✔
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 justify-center md:justify-start gap-1">
              <h1 className="text-2xl font-bold text-slate-800">{profile.name}</h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-center">
                  Verified Identity
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-400">
              <span>@{profile.username}</span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                {profile.professionalVertical?.replace("_", " ")}
              </span>
            </div>
            {profile.summary && (
              <p className="text-sm text-slate-600 leading-relaxed pt-2">
                {profile.summary}
              </p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Core Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/85 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vertical-Specific Evidence Section */}
        {profile.professionalVertical === "DEVELOPER" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Stats Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">GitHub Stats</h2>
                  {github.username && (
                    <a
                      href={github.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      @{github.username}
                    </a>
                  )}
                </div>

                {github.username ? (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Public Repos</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        {github.publicRepos ?? "0"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Stars Earned</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        ⭐ {github.stars ?? "0"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Contributions</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        ✨ {github.contributions ?? "0"}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Followers</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        👥 {github.followers ?? "0"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center text-xs text-slate-400 italic py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    GitHub account not connected.
                  </div>
                )}
              </div>
            </div>

            {/* LeetCode Stats Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">LeetCode Profile</h2>
                  {leetcode.username && (
                    <span className="text-xs text-slate-500 font-bold">
                      @{leetcode.username}
                    </span>
                  )}
                </div>

                {leetcode.username ? (
                  <div className="space-y-5 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-slate-800">
                          {leetcode.totalSolved ?? "0"}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">Problems Solved</p>
                      </div>
                      {leetcode.ranking && (
                        <div className="text-right">
                          <span className="inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-black text-amber-700">
                            👑 {leetcode.ranking}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Global Standing</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span className="text-emerald-600">Easy ({leetcode.easySolved ?? 0})</span>
                        <span className="text-amber-600">Medium ({leetcode.mediumSolved ?? 0})</span>
                        <span className="text-rose-600">Hard ({leetcode.hardSolved ?? 0})</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${((leetcode.easySolved || 0) / (leetcode.totalSolved || 1)) * 100}%` }}
                          className="bg-emerald-500 h-full"
                        />
                        <div
                          style={{ width: `${((leetcode.mediumSolved || 0) / (leetcode.totalSolved || 1)) * 100}%` }}
                          className="bg-amber-500 h-full"
                        />
                        <div
                          style={{ width: `${((leetcode.hardSolved || 0) / (leetcode.totalSolved || 1)) * 100}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center text-xs text-slate-400 italic py-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    LeetCode account not connected.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {profile.professionalVertical === "KNOWLEDGE_WORKER" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Operations & Project Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Operations Lead</span>
                <span className="text-3xl font-black text-slate-800 mt-2">
                  💼 {projects.totalProjects || 0} Project{projects.totalProjects !== 1 ? "s" : ""}
                </span>
                <p className="text-xs text-slate-500 mt-2">Parsed from career history and portfolio metrics.</p>
              </div>
              <div className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Focus Area</span>
                <span className="text-base font-extrabold text-slate-800 mt-2">
                  🎯 {projects.focusArea || "Operations & Strategy"}
                </span>
                <p className="text-xs text-slate-500 mt-2">Focusing on strategic deliverables and KPI optimizations.</p>
              </div>
            </div>
          </div>
        )}

        {profile.professionalVertical === "DOCUMENT_VERIFICATION" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Credentials & Document Audits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verification Status</span>
                <span className={`inline-flex items-center gap-1.5 mt-3 self-start px-3 py-1 rounded-full text-xs font-bold ${
                  verification.status === "VERIFIED_CREDENTIALS" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  🛡️ {verification.status === "VERIFIED_CREDENTIALS" ? "Verified" : "Pending Verification"}
                </span>
                <p className="text-xs text-slate-500 mt-3">Verified compliance reports audit check.</p>
              </div>
              <div className="p-5 bg-slate-50/60 border border-slate-100 rounded-2xl flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Document Summary</span>
                <span className="text-base font-extrabold text-slate-800 mt-2">
                  📄 {verification.verifiedDocumentsCount || 0} File{verification.verifiedDocumentsCount !== 1 ? "s" : ""} Parsed
                </span>
                <p className="text-xs text-slate-500 mt-2">Processed successfully through OCR verification pipeline.</p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Achievements / Highlights Cards */}
        {profile.highlights && profile.highlights.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Achievements & Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl items-start hover:shadow-sm transition-all duration-200">
                  <span className="text-3xl p-2 bg-white rounded-xl border border-slate-100/80 shadow-xs shrink-0 select-none">
                    {highlight.badgeUrl || "🏆"}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-800">{highlight.title}</h3>
                      {highlight.isVerified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 gap-0.5 border border-emerald-200">
                          <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.9L10 .954 17.834 4.9a1 1 0 01.616.907v4.457c0 4.887-3.23 9.4-7.834 10.736a1 1 0 01-.616 0C5.396 19.664 2.166 15.15 2.166 10.264V5.807a1 1 0 01.616-.907zM10 12.586l3.293-3.293a1 1 0 00-1.414-1.414L10 9.758 8.121 7.879a1 1 0 00-1.414 1.414L10 12.586z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{highlight.description}</p>
                    <div className="flex gap-2 items-center mt-2 flex-wrap">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {highlight.category}
                      </span>
                      {highlight.trustScore !== undefined && (
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Score: {highlight.trustScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LinkedIn Identity */}
        {lName && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">💼</span>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Network</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{lName}</p>
              </div>
            </div>
            {lUrl && (
              <a
                href={lUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-1.5 border border-[#0A66C2] text-[#0A66C2] font-semibold text-xs rounded-xl hover:bg-blue-50 transition-colors"
              >
                View LinkedIn
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicProfilePage;
