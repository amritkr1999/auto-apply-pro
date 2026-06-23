import React, { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import type { CandidateProfile } from "../services/profileService";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

interface Props {
  userId: number;
}

export const CandidateProfileView: React.FC<Props> = ({ userId }) => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [skills, setSkills] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    profileService
      .getCandidateProfile(userId)
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setMobile(data.mobile || "");
        setSkills(data.skills ? data.skills.join(", ") : "");
        
        const prefs = data.jobPreferences || {};
        setLocationPreference(prefs.locationPreference || "");
        setExpectedSalary(prefs.expectedSalary || "");
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
      
      const updatedProfile: CandidateProfile = {
        ...profile,
        name,
        mobile,
        skills: skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0),
        jobPreferences: {
          locationPreference,
          expectedSalary,
        },
      };

      const result = await profileService.updateCandidateProfile(userId, updatedProfile);
      setProfile(result);
      
      // Update local storage user name
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
        u.mobile = mobile;
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
          label="Mobile Number"
          type="text"
          value={mobile}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
          required
        />

        <Input
          label="Skills (comma-separated)"
          type="text"
          value={skills}
          placeholder="React, TypeScript, Java, Spring Boot"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkills(e.target.value)}
        />

        <Input
          label="Preferred Job Location"
          type="text"
          value={locationPreference}
          placeholder="San Francisco, CA or Remote"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationPreference(e.target.value)}
        />

        <Input
          label="Expected Salary"
          type="text"
          value={expectedSalary}
          placeholder="$120k/yr"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpectedSalary(e.target.value)}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CandidateProfileView;
