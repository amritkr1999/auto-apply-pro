import React from "react";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import CandidateDashboardView from "../features/dashboard/components/views/CandidateDashboardView";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/candidate-dashboard" element={<CandidateDashboardView />} />
      {/* Add more app routes below as pages/components become available */}
    </Routes>
  );
};

export default AppRoutes;
