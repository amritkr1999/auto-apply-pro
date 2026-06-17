import React from "react";
import { Link } from "react-router-dom";
import "./layout.css";

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="brand">
          <Link to="/candidate-dashboard" className="brand-link">
            Auto Apply Pro
          </Link>
        </div>
        <nav className="nav">
          {/* <Link to="/">Home</Link> */}
          <Link to="/candidate-dashboard">Dashboard</Link>
          <Link to="/candidate/profile">Profile</Link>

        </nav>
      </div>
    </header>
  );
};

export default Header;
