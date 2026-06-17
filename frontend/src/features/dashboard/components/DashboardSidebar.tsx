import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || "CANDIDATE";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getOverviewPath = () => {
    switch (role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/candidate-dashboard";
    }
  };

  return (
    <aside
      style={{
        width: 240,
        padding: 16,
        borderRight: "1px solid rgba(255,255,255,0.04)",
        backgroundColor: "#0f172a", // Sleek dark mode background
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "between",
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", opacity: 0.8 }}>
          Menu ({role.toLowerCase()})
        </h3>
        <nav>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <li>
              <Link to={getOverviewPath()} style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                Overview
              </Link>
            </li>
            {role === "CANDIDATE" && (
              <>
                <li>
                  <a href="#applications" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Applications
                  </a>
                </li>
                <li>
                  <a href="#saved" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Saved Jobs
                  </a>
                </li>
                <li>
                  <Link to="/jobs/parse" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Parse Screenshot
                  </Link>
                </li>
                <li>
                  <Link to="/outreach/templates" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Email Templates
                  </Link>
                </li>
                <li>
                  <Link to="/outreach/draft" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Draft Outreach
                  </Link>
                </li>
              </>
            )}
            {role === "RECRUITER" && (
              <>
                <li>
                  <a href="#outreach" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Outreach
                  </a>
                </li>
                <li>
                  <a href="#candidates" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Candidates
                  </a>
                </li>
              </>
            )}
            {role === "COMPANY" && (
              <>
                <li>
                  <a href="#jobs" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Job Listings
                  </a>
                </li>
                <li>
                  <a href="#recruiters" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                    Recruiters
                  </a>
                </li>
              </>
            )}
            <li>
              <Link to="/candidate/profile" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500 }}>
                Profile Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#ef4444",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
