import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./layout.css";

export const Layout: React.FC = () => {
  return (
    <div className="app-root">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
