import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { RecruiterProfile } from "../services/profileService";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

interface Props {
  userId: number;
}

export const RecruiterProfileView: React.FC<Props> = ({ userId }) => {
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

  if (loading) return <div className="text-slate-500">Loading profile details...</div>;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Recruiter Profile Settings</h2>
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

        <Input
          label="Affiliated Company Name"
          type="text"
          value={companyName}
          placeholder="e.g. Acme Corp"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterProfileView;
