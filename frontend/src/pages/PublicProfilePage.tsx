import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

  // Statistics calculation/fallbacks
  const github = profile.githubStats || {};
  const leetcode = profile.leetcodeStats || {};

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      {/* react-helmet-async Meta-tags injection */}
      <Helmet>
        <title>{`${profile.name} (@${profile.username}) | Professional Profile`}</title>
        <meta name="description" content={profile.summary || `View ${profile.name}'s professional developer credentials, GitHub stats, and verified coding records.`} />
        
        {/* OpenGraph Tags */}
        <meta property="og:title" content={`${profile.name} (@${profile.username}) | Coding Profile`} />
        <meta property="og:description" content={profile.summary || `Verified credentials, repository stats, and coding achievements.`} />
        <meta property="og:image" content={profile.avatar || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500"} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.name}'s Developer Profile`} />
        <meta name="twitter:description" content={profile.summary || `Verified code metrics and achievements.`} />
        <meta name="twitter:image" content={profile.avatar || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500"} />
      </Helmet>

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
                title="Verified OAuth Account"
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
            <p className="text-sm font-semibold text-slate-400">@{profile.username}</p>
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

        {/* Coding & GitHub Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* GitHub Stats Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">GitHub Stats</h2>
                {profile.githubUsername && (
                  <a
                    href={profile.githubProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    @{profile.githubUsername}
                  </a>
                )}
              </div>

              {profile.githubUsername ? (
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
                {profile.leetcodeUsername && (
                  <span className="text-xs text-slate-500 font-bold">
                    @{profile.leetcodeUsername}
                  </span>
                )}
              </div>

              {profile.leetcodeUsername ? (
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

                  {/* Solved breakdown progress bar */}
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

        {/* LinkedIn Identity */}
        {profile.linkedinName && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">💼</span>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Network</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{profile.linkedinName}</p>
              </div>
            </div>
            {profile.linkedinProfileUrl && (
              <a
                href={profile.linkedinProfileUrl}
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
