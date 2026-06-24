import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CompanyProfile } from "../services/profileService";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

interface Props {
  userId: number;
}

export const CompanyProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
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
        setDescription(data.description || "");
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
      
      const updatedProfile: CompanyProfile = {
        ...profile,
        name,
        industry,
        website,
        description,
      };

      const result = await profileService.updateCompanyProfile(userId, updatedProfile);
      setProfile(result);
      
      // Update local storage user name
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
        localStorage.setItem("user", JSON.stringify(u));
      }

      setMessage("Profile updated successfully!");
    } catch {
      setError("Failed to update profile.");
    }
  };

  if (loading) return <div className="text-slate-500">Loading profile details...</div>;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Company Profile Settings</h2>
      </div>

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
          label="Company Name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />

        <Input
          label="Primary Contact Email (Read-only)"
          type="email"
          value={profile?.email || ""}
          disabled
        />

        <Input
          label="Industry"
          type="text"
          value={industry}
          placeholder="e.g. Software, Finance, Healthcare..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIndustry(e.target.value)}
        />

        <Input
          label="Website URL"
          type="url"
          value={website}
          placeholder="https://acme.com"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Company Description
          </label>
          <textarea
            value={description}
            placeholder="Describe your company culture, mission, and size..."
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm text-base-text bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
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

export default CompanyProfileView;
