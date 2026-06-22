import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../DashboardSidebar";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";

export const CandidateDashboardView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold text-slate-800">Candidate Dashboard</h1>
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
