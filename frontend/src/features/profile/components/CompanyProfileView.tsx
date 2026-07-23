import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CompanyProfile } from "../services/profileService";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { isValidEmail, isValidUrl } from "../../../utils/validation";

interface Props {
  userId: number;
  onProfileUpdate: (name: string, avatar: string) => void;
}

export const CompanyProfileView: React.FC<Props> = ({ userId, onProfileUpdate }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
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
        setOfficialEmail(data.officialEmail || "");
        setDescription(data.description || "");
        onProfileUpdate(data.name || "", data.avatar || "");
      })
      .catch(() => setError("Failed to load profile details."))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      setError("Company Name must be between 2 and 100 characters long.");
      return;
    }

    if (officialEmail && !isValidEmail(officialEmail)) {
      setError("Please enter a valid official email address (e.g. contact@company.com).");
      return;
    }

    if (website && !isValidUrl(website)) {
      setError("Please enter a valid website URL starting with http:// or https:// (e.g. https://example.com).");
      return;
    }

    if (description && description.length > 2000) {
      setError("Company description must not exceed 2000 characters.");
      return;
    }

    try {
      setMessage("");
      setError("");
      
      const updatedProfile: CompanyProfile = {
        ...profile,
        name,
        industry,
        website,
        officialEmail,
        description,
      };

      const result = await profileService.updateCompanyProfile(userId, updatedProfile);
      setProfile(result);
      
      // Update local storage user details
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
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
        <h2 className="text-xl font-bold text-slate-800">Company Details</h2>
        <p className="text-sm text-slate-500 mt-1">Manage public profile info, website, industry, and description.</p>
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
            label="Company Name"
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Primary Contact Email (Read-only)"
            type="email"
            value={profile?.email || ""}
            disabled
            className="rounded-xl border-slate-100 bg-slate-50 text-slate-400 font-medium px-4 py-2.5"
          />

          <Input
            label="Industry"
            type="text"
            value={industry}
            placeholder="e.g. Software, Finance, Healthcare..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndustry(e.target.value)}
            className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
          />
        </div>

        <Input
          label="Website URL"
          type="url"
          value={website}
          placeholder="https://acme.com"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
          className="rounded-xl border-slate-200 focus:ring-primary focus:border-transparent px-4 py-2.5"
        />

        <div className="w-full">
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            Company Description
          </label>
          <textarea
            value={description}
            placeholder="Describe your company culture, mission, and size..."
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" size="md">
            Save Company Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileView;
