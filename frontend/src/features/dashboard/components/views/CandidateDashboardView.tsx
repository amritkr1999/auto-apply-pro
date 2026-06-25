import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../DashboardSidebar";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";
import { outreachService } from "../../../outreach/services/outreachService";
import { profileService } from "../../../profile/services/profileService";

export const CandidateDashboardView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [gmailConnected, setGmailConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [hasResume, setHasResume] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("gmail_onboarding_dismissed") === "true";
    
    outreachService.getGmailStatus(userId)
      .then((data) => {
        setGmailConnected(data.connected);
        if (!data.connected && !dismissed) {
          setShowBanner(true);
        }
      })
      .catch((err) => console.error("Failed to fetch Gmail status", err))
      .finally(() => setLoadingStatus(false));

    // Fetch candidate profile to check if a resume exists
    profileService.getCandidateProfile(userId)
      .then((profile) => {
        setHasResume(!!profile.resumeFilename);
      })
      .catch((err) => {
        console.error("Failed to fetch candidate profile", err);
        setHasResume(true);
      });
  }, [userId]);

  const handleDismissBanner = () => {
    localStorage.setItem("gmail_onboarding_dismissed", "true");
    setShowBanner(false);
  };

  const handleConnectGmail = async () => {
    try {
      const redirectUrl = await outreachService.getConnectUrl(userId);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Failed to connect Gmail", err);
    }
  };

  const applications = [
    { id: 1, title: "Frontend Engineer", company: "ACME Corp", date: "3 days ago", status: "Applied", statusVariant: "info" as const },
    { id: 2, title: "Fullstack Developer", company: "Beta LLC", date: "7 days ago", status: "Interviewing", statusVariant: "warning" as const },
    { id: 3, title: "UI Developer", company: "Stripe", date: "10 days ago", status: "Saved", statusVariant: "neutral" as const },
    { id: 4, title: "Software Engineer", company: "Google", date: "14 days ago", status: "Rejected", statusVariant: "error" as const },
  ];

  return (
    <div className="flex-1 flex gap-8">
      {sidebarOpen && <DashboardSidebar />}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-800">Candidate Dashboard</h1>
              {!loadingStatus && (
                <Badge variant={gmailConnected ? "success" : "neutral"}>
                  {gmailConnected ? "Gmail Connected" : "Gmail Disconnected"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Track your job applications and email outreach status</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button>
        </div>

        {!hasResume && (
          <div className="mb-8 p-5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3">
              <span className="text-2xl mt-0.5">📄</span>
              <div>
                <h4 className="text-sm font-semibold text-rose-800">Please upload your updated resume</h4>
                <p className="text-xs text-rose-600 mt-0.5 max-w-xl">
                  You haven't uploaded a resume yet. To ensure your resume is automatically attached when sending job outreach emails, please upload it to your profile.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                size="sm"
                onClick={() => navigate("/candidate/profile")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
              >
                Go to Profile to Upload
              </Button>
            </div>
          </div>
        )}

        {showBanner && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3">
              <span className="text-2xl mt-0.5">📧</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Automate your Job Outreach!</h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  Connect your personal Gmail account to automatically draft and send tailored, high-fidelity outreach emails directly from your inbox to recruiters.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleDismissBanner}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Dismiss
              </button>
              <Button
                size="sm"
                onClick={handleConnectGmail}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-1.5 shadow-sm"
              >
                Connect Gmail
              </Button>
            </div>
          </div>
        )}

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Applications</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">12 submitted</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Interviews</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">2 upcoming</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saved Positions</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">5 saved</p>
          </div>
        </div>

        {/* Recent Applications Table */}
        <section id="applications">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Recent Applications</h2>
            <Button size="sm" onClick={() => navigate("/outreach/draft")}>
              New Outreach
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-semibold text-slate-700">{app.title}</TableCell>
                  <TableCell className="text-slate-500">{app.company}</TableCell>
                  <TableCell className="text-slate-400">{app.date}</TableCell>
                  <TableCell>
                    <Badge variant={app.statusVariant}>{app.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
};

export default CandidateDashboardView;
