import React, { useState, useEffect, useCallback } from "react";
import { jobApplicationService, type JobApplication, type JobApplicationStats } from "../features/jobs/services/jobApplicationService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// Platform colors configuration
const PLATFORM_CONFIG: Record<string, { bg: string; text: string; stroke: string; logo: string }> = {
  linkedin: { bg: "bg-sky-50", text: "text-sky-700", stroke: "text-sky-500", logo: "in" },
  naukri: { bg: "bg-purple-50", text: "text-purple-700", stroke: "text-purple-500", logo: "N" },
  instahyre: { bg: "bg-emerald-50", text: "text-emerald-700", stroke: "text-emerald-500", logo: "I" },
  indeed: { bg: "bg-blue-50", text: "text-blue-700", stroke: "text-blue-500", logo: "ind" },
  email: { bg: "bg-teal-50", text: "text-teal-700", stroke: "text-teal-500", logo: "✉" },
  other: { bg: "bg-slate-50", text: "text-slate-700", stroke: "text-slate-500", logo: "O" },
};

const getPlatformConfig = (platform?: string) => {
  const normalized = (platform || "other").toLowerCase().trim();
  if (normalized.includes("linkedin")) return PLATFORM_CONFIG.linkedin;
  if (normalized.includes("naukri")) return PLATFORM_CONFIG.naukri;
  if (normalized.includes("instahyre") || normalized.includes("instahire")) return PLATFORM_CONFIG.instahyre;
  if (normalized.includes("indeed")) return PLATFORM_CONFIG.indeed;
  if (normalized.includes("email") || normalized.includes("outreach")) return PLATFORM_CONFIG.email;
  return PLATFORM_CONFIG.other;
};

// SVG Circular Progress Chart
const CircularProgress: React.FC<{ rate: number; colorClass: string }> = ({ rate, colorClass }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-14 h-14 transform -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="text-slate-100"
          strokeWidth="5.5"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className={colorClass}
          strokeWidth="5.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-700">{Math.round(rate)}%</span>
    </div>
  );
};

export const JobTrackerPage: React.FC = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobApplicationStats>({
    totalApplications: 0,
    activeInterviews: 0,
    offersReceived: 0,
    rejectionsCount: 0,
    overallResponseRate: 0.0,
    platformResponseRates: {},
    platformApplicationsCount: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    sourcePlatform: "LinkedIn",
    status: "WISHLIST" as any,
    currentRound: "",
    location: "",
    salaryDetails: "",
    jobUrl: "",
    notes: "",
    followUpDate: "",
    appliedAt: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        jobApplicationService.getApplications(userId),
        jobApplicationService.getStats(userId),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load tracking records. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle opening modal for creation
  const handleOpenAddModal = () => {
    setSelectedApp(null);
    setFormData({
      companyName: "",
      jobTitle: "",
      sourcePlatform: "LinkedIn",
      status: "WISHLIST",
      currentRound: "",
      location: "",
      salaryDetails: "",
      jobUrl: "",
      notes: "",
      followUpDate: "",
      appliedAt: "",
    });
    setIsModalOpen(true);
  };

  // Handle opening modal for editing
  const handleOpenEditModal = (app: JobApplication) => {
    setSelectedApp(app);
    setFormData({
      companyName: app.companyName || "",
      jobTitle: app.jobTitle || "",
      sourcePlatform: app.sourcePlatform || "LinkedIn",
      status: app.status || "WISHLIST",
      currentRound: app.currentRound || "",
      location: app.location || "",
      salaryDetails: app.salaryDetails || "",
      jobUrl: app.jobUrl || "",
      notes: app.notes || "",
      followUpDate: app.followUpDate ? app.followUpDate.substring(0, 10) : "",
      appliedAt: app.appliedAt ? app.appliedAt.substring(0, 10) : "",
    });
    setIsModalOpen(true);
  };

  // Handle Form Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save Application Card
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobTitle.trim()) {
      alert("Company Name and Job Title are required.");
      return;
    }

    const payload: JobApplication = {
      ...formData,
      status: formData.status as any,
      followUpDate: formData.followUpDate ? `${formData.followUpDate}T09:00:00` : undefined,
      appliedAt: formData.appliedAt ? `${formData.appliedAt}T09:00:00` : undefined,
    };

    try {
      if (selectedApp?.id) {
        await jobApplicationService.updateApplication(selectedApp.id, payload);
      } else {
        await jobApplicationService.createApplication(userId, payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save application records.");
    }
  };

  // Delete Application
  const handleDelete = async () => {
    if (!selectedApp?.id) return;
    if (!window.confirm("Are you sure you want to delete this application record?")) return;
    try {
      await jobApplicationService.deleteApplication(selectedApp.id);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete application.");
    }
  };

  // Native Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    if (!idStr) return;
    const id = parseInt(idStr, 10);
    
    // Optimistic UI update
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: targetStatus as any } : app));

    try {
      await jobApplicationService.updateStatus(id, targetStatus);
      loadData(); // Reload stats and cards to reconcile state
    } catch (err) {
      console.error("Failed to move card status", err);
      loadData(); // Revert on failure
    }
  };

  // Group columns
  const columns = [
    { key: "WISHLIST", title: "Wishlist", borderClass: "border-purple-300", bgClass: "bg-purple-500" },
    { key: "APPLIED", title: "Applied", borderClass: "border-indigo-300", bgClass: "bg-indigo-600" },
    { key: "INTERVIEWING", title: "Interviewing", borderClass: "border-emerald-300", bgClass: "bg-emerald-600" },
    { key: "OFFER", title: "Offers", borderClass: "border-teal-300", bgClass: "bg-teal-600" },
    { key: "REJECTED", title: "Rejected / Archived", borderClass: "border-slate-300", bgClass: "bg-slate-500" }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 text-slate-800">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-btn text-sm font-semibold">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-xs text-slate-400 italic px-1">Refreshing tracker data...</div>
      )}
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Application CRM</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and orchestrate your applications, interviews, and success rates in a single space.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" className="shadow-sm">
          <span className="mr-1.5 font-bold">+</span> Log Application
        </Button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-btn border border-slate-100 shadow-sm flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Applications</span>
            <svg className="w-5 h-5 text-indigo-500 bg-indigo-50 p-1 rounded-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalApplications}</div>
          <div className="text-xs text-indigo-600 mt-2 font-medium">Active applications in board</div>
        </div>

        <div className="bg-white p-5 rounded-btn border border-slate-100 shadow-sm flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Response Rate</span>
            <svg className="w-5 h-5 text-purple-500 bg-purple-50 p-1 rounded-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.overallResponseRate}%</div>
          <div className="text-xs text-purple-600 mt-2 font-medium">Ratio of callbacks to applied</div>
        </div>

        <div className="bg-white p-5 rounded-btn border border-slate-100 shadow-sm flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Active Interviews</span>
            <svg className="w-5 h-5 text-emerald-500 bg-emerald-50 p-1 rounded-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.activeInterviews}</div>
          <div className="text-xs text-emerald-600 mt-2 font-medium">Currently in technical rounds</div>
        </div>

        <div className="bg-white p-5 rounded-btn border border-slate-100 shadow-sm flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Offers Received</span>
            <svg className="w-5 h-5 text-teal-500 bg-teal-50 p-1 rounded-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.offersReceived}</div>
          <div className="text-xs text-teal-600 mt-2 font-medium">Offers extended to you</div>
        </div>
      </div>

      {/* Main Board and Platform Stats Split */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Kanban Board Container (3/4 width) */}
        <div className="flex-1 flex flex-col gap-4 overflow-x-auto min-w-0">
          <div className="flex gap-4 items-stretch h-[600px] select-none min-w-[900px] lg:min-w-0">
            {columns.map(col => {
              const colApps = applications.filter(app => (app.status || "WISHLIST").toUpperCase() === col.key);
              
              return (
                <div
                  key={col.key}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-btn p-3 min-w-[200px]"
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.bgClass}`}></span>
                      <h3 className="font-bold text-sm text-slate-700">{col.title}</h3>
                    </div>
                    <span className="bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full text-xs">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {colApps.length === 0 ? (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-btn text-xs text-slate-400">
                        Drag cards here
                      </div>
                    ) : (
                      colApps.map(app => {
                        const platform = getPlatformConfig(app.sourcePlatform);
                        const isOverdue = app.followUpDate && new Date(app.followUpDate) < new Date() && app.status !== "OFFER" && app.status !== "REJECTED";
                        
                        return (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app.id!)}
                            onClick={() => handleOpenEditModal(app)}
                            className={`bg-white p-4 rounded-btn border border-slate-100 shadow-sm cursor-grab hover:shadow-md hover:border-slate-300 transition-all duration-200 relative ${
                              isOverdue ? "border-l-4 border-l-rose-500" : ""
                            }`}
                          >
                            <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{app.jobTitle}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{app.companyName}</p>

                            {/* Location & Indicators */}
                            {app.location && (
                              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                📍 {app.location}
                              </p>
                            )}

                            {/* Footer stats row */}
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${platform.bg} ${platform.text}`}>
                                {app.sourcePlatform || "Other"}
                              </span>
                              
                              <span className="text-[9px] text-slate-400">
                                {app.appliedAt ? `Applied ${new Date(app.appliedAt).toLocaleDateString()}` : "Not applied"}
                              </span>
                            </div>

                            {/* Custom Round indicator */}
                            {app.currentRound && (
                              <div className="mt-2 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-between">
                                <span>Round: {app.currentRound}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              </div>
                            )}

                            {/* Overdue alert text */}
                            {isOverdue && (
                              <div className="mt-2 text-[9px] font-bold text-rose-600 flex items-center gap-1">
                                ⚠️ Needs Follow-up
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Platform Analytics (1/4 width) */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border border-slate-100 rounded-btn p-5 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Platform Performance</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Response rates across application channels.</p>
          </div>

          <div className="flex flex-col gap-4">
            {["LinkedIn", "Naukri", "Instahyre", "Email"].map(platformName => {
              const count = stats.platformApplicationsCount[platformName] || 0;
              const rate = stats.platformResponseRates[platformName] || 0;
              const platform = getPlatformConfig(platformName);

              return (
                <div key={platformName} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-btn">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${platform.bg} ${platform.text}`}>
                        {platform.logo}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{platformName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {count} {count === 1 ? "application" : "applications"}
                    </span>
                  </div>

                  <CircularProgress rate={rate} colorClass={platform.stroke} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log / Edit Application Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-btn border border-slate-200 shadow-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {selectedApp ? "Edit Job Tracker Card" : "Log New Job Application"}
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Job Title *"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                required
              />

              <Input
                label="Company Name *"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Source Platform</label>
                  <select
                    name="sourcePlatform"
                    value={formData.sourcePlatform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm bg-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Instahyre">Instahyre</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Email">Email Outreach</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Pipeline Stage</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm bg-white"
                  >
                    <option value="WISHLIST">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {formData.status === "INTERVIEWING" && (
                <Input
                  label="Current Interview Round"
                  name="currentRound"
                  value={formData.currentRound}
                  onChange={handleChange}
                  placeholder="e.g. System Design, Manager Round"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote, Seattle WA"
                />
                <Input
                  label="Salary Offer / Details"
                  name="salaryDetails"
                  value={formData.salaryDetails}
                  onChange={handleChange}
                  placeholder="e.g. $140,000/yr"
                />
              </div>

              <Input
                label="Job Posting URL"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleChange}
                placeholder="e.g. https://linkedin.com/jobs/..."
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Applied Date</label>
                  <input
                    type="date"
                    name="appliedAt"
                    value={formData.appliedAt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Follow-up Reminder Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Notes / Logs</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add specific requirements or prep logs here..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#b2bec3] rounded-input text-sm bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                {selectedApp && (
                  <Button type="button" variant="error" size="sm" onClick={handleDelete} className="mr-auto">
                    Delete
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTrackerPage;
