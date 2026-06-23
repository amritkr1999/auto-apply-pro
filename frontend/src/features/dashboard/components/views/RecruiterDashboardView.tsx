import React, { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";

export const RecruiterDashboardView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const campaigns = [
    { id: 1, role: "React Developer", company: "Acme Corp", date: "2 days ago", openRate: "80% opened", variant: "success" as const },
    { id: 2, role: "Backend Engineer", company: "Beta LLC", date: "6 days ago", openRate: "45% opened", variant: "info" as const },
  ];

  return (
    <div className="flex-1 flex gap-8">
      {sidebarOpen && <DashboardSidebar />}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Recruiter Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage sourcing pipelines and candidate outreach campaigns</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sourced Candidates</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">48 candidates</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">3 active</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Response Rate</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">64% response</p>
          </div>
        </div>

        {/* Outreach Table */}
        <section id="outreach">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Outreach Campaigns</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sent On</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-semibold text-slate-700">{camp.role}</TableCell>
                  <TableCell className="text-slate-500">{camp.company}</TableCell>
                  <TableCell className="text-slate-400">{camp.date}</TableCell>
                  <TableCell>
                    <Badge variant={camp.variant}>{camp.openRate}</Badge>
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

export default RecruiterDashboardView;
