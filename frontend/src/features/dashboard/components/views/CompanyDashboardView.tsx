import React from "react";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";

export const CompanyDashboardView: React.FC = () => {

  const postings = [
    { id: 1, title: "Senior Product Manager", applicants: "12 applicants", status: "Active", variant: "success" as const },
    { id: 2, title: "DevOps Architect", applicants: "8 applicants", status: "Active", variant: "success" as const },
  ];

  return (
    <>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Company Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage active corporate job postings and internal recruiters</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">15 listings</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Recruiters</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">8 active</p>
          </div>
          <div className="bg-white rounded-card shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Applicants</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">342 received</p>
          </div>
        </div>

        {/* Postings Table */}
        <section id="jobs">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Active Postings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Applicants Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postings.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-semibold text-slate-700">{post.title}</TableCell>
                  <TableCell className="text-slate-500">{post.applicants}</TableCell>
                  <TableCell>
                    <Badge variant={post.variant}>{post.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </>
  );
};

export default CompanyDashboardView;
