import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-color text-base-text font-sans">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
