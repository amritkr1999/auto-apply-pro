import React, { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";
import "./candidate-dashboard.css";

export const CandidateDashboardView: React.FC = () => {
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
        <h1>Candidate Dashboard</h1>
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
            <h3>Applications</h3>
            <p>12 submitted</p>
          </div>
          <div className="card">
            <h3>Interviews</h3>
            <p>2 upcoming</p>
          </div>
          <div className="card">
            <h3>Saved Jobs</h3>
            <p>5 saved</p>
          </div>
        </section>

        <section id="applications" style={{ marginTop: 24 }}>
          <h2>Recent Applications</h2>
          <ul>
            <li>
              Frontend Engineer — ACME Corp — <small>Applied 3 days ago</small>
            </li>
            <li>
              Fullstack Developer — Beta LLC — <small>Applied 7 days ago</small>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default CandidateDashboardView;
