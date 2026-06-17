import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import CandidateDashboardView from "../features/dashboard/components/views/CandidateDashboardView";
import CandidateProfile from "../features/profile/CandidateProfile";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboardView />}
        />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
      </Route>
      {/* Add more app routes below as pages/components become available */}
    </Routes>
  );
};

export default AppRoutes;
