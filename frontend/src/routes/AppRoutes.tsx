import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import CandidateDashboardView from "../features/dashboard/components/views/CandidateDashboardView";
import RecruiterDashboardView from "../features/dashboard/components/views/RecruiterDashboardView";
import CompanyDashboardView from "../features/dashboard/components/views/CompanyDashboardView";
import CandidateProfile from "../features/profile/CandidateProfile";
import ScreenshotUploader from "../features/jobs/components/ScreenshotUploader";
import { TemplateManager } from "../features/outreach/components/TemplateManager";
import { OutreachDraftSection } from "../features/outreach/components/OutreachDraftSection";
import DraftsReviewPage from "../pages/DraftsReviewPage";
import QueueDetailsPage from "../pages/QueueDetailsPage";
import LearningSpaceDashboard from "../features/learning/components/LearningSpaceDashboard";
import TopicDetailsView from "../features/learning/components/TopicDetailsView";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboardView />}
        />
        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboardView />}
        />
        <Route
          path="/company-dashboard"
          element={<CompanyDashboardView />}
        />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        <Route path="/jobs/parse" element={<ScreenshotUploader />} />
        <Route path="/outreach/templates" element={<TemplateManager />} />
        <Route path="/outreach/draft" element={<OutreachDraftSection />} />
        <Route path="/outreach/drafts/review" element={<DraftsReviewPage />} />
        <Route path="/outreach/queue" element={<QueueDetailsPage />} />
        <Route path="/learning" element={<LearningSpaceDashboard />} />
        <Route path="/learning/topic/:topicId" element={<TopicDetailsView />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

