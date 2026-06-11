import React from "react";
import "./layout.css";

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <small>© {new Date().getFullYear()} Auto Apply Pro</small>
      </div>
    </footer>
  );
};

export default Footer;
