import React, { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";
import "./candidate-dashboard.css";

export const CompanyDashboardView: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="candidate-dashboard-root"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      {sidebarOpen && <DashboardSidebar />}
      <main style={{ flex: 1, padding: 24 }}>
        <button
          className="sidebar-toggle-btn"
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        </button>
        <h1>Company Dashboard</h1>
        <section
          id="overview"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          <div className="card">
            <h3>Active Jobs</h3>
            <p>15 listings</p>
          </div>
          <div className="card">
            <h3>Total Recruiters</h3>
            <p>8 active</p>
          </div>
          <div className="card">
            <h3>Applicants</h3>
            <p>342 received</p>
          </div>
        </section>

        <section id="jobs" style={{ marginTop: 24 }}>
          <h2>Active Postings</h2>
          <ul>
            <li>
              Senior Product Manager — <small>12 applicants</small>
            </li>
            <li>
              DevOps Architect — <small>8 applicants</small>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default CompanyDashboardView;
