import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { RecruiterProfile } from "../services/profileService";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

interface Props {
  userId: number;
  onProfileUpdate: (name: string, avatar: string) => void;
}

export const RecruiterProfileView: React.FC<Props> = ({ userId, onProfileUpdate }) => {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
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
        setOfficialEmail(data.officialEmail || "");
        setCompanyName(data.companyName || "");
        onProfileUpdate(data.name || "", data.avatar || "");
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
        officialEmail,
        companyName,
      };

      const result = await profileService.updateRecruiterProfile(userId, updatedProfile);
      setProfile(result);
      
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
      setMessage("Profile updated successfully!");
    } catch {
      setError("Failed to update profile.");
    }
  };

  if (loading) return <div className="text-slate-500 py-6 text-center font-medium animate-pulse">Loading profile details...</div>;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Recruiter Details</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your affiliated company details and personal identifiers.</p>
      </div>

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in duration-200">
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
            label="Account Email Address (Read-only)"
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
            helperText={
              <span className="inline-flex items-center gap-1.5 mt-1 text-xs text-indigo-650 dark:text-indigo-400 font-medium">
                <span>💡</span>
                <span>Your official email address with your company domain name (e.g., <code>name@company.com</code>) used for referral and verification purposes.</span>
              </span>
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficialEmail(e.target.value)}
            className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
          />
        </div>

        <Input
          label="Affiliated Company Name"
          type="text"
          value={companyName}
          placeholder="e.g. Acme Corp"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
        />

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" size="md">
            Save Recruiter Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterProfileView;
