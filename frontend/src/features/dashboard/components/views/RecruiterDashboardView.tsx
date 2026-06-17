import React, { useState } from "react";
import DashboardSidebar from "../DashboardSidebar";
import "./candidate-dashboard.css";

export const RecruiterDashboardView: React.FC = () => {
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
        <h1>Recruiter Dashboard</h1>
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
            <h3>Sourced Candidates</h3>
            <p>48 candidates</p>
          </div>
          <div className="card">
            <h3>Active Campaigns</h3>
            <p>3 active</p>
          </div>
          <div className="card">
            <h3>Response Rate</h3>
            <p>64% response</p>
          </div>
        </section>

        <section id="outreach" style={{ marginTop: 24 }}>
          <h2>Recent Outreach Campaigns</h2>
          <ul>
            <li>
              React Developer - Acme Corp — <small>Sent 2 days ago (80% opened)</small>
            </li>
            <li>
              Backend Engineer - Beta LLC — <small>Sent 6 days ago (45% opened)</small>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default RecruiterDashboardView;
