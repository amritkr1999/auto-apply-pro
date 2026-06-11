import React from "react";
import { Link } from "react-router-dom";

export const DashboardSidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: 240,
        padding: 16,
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <nav>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <li>
            <Link to="/candidate-dashboard">Overview</Link>
          </li>
          <li>
            <a href="#applications">Applications</a>
          </li>
          <li>
            <a href="#saved">Saved Jobs</a>
          </li>
          <li>
            <a href="#profile">Profile</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
