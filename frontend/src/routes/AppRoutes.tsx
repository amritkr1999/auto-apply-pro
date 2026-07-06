import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import LandingPage from "../pages/LandingPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import UnsubscribePage from "../pages/UnsubscribePage";
import CandidateDashboardView from "../features/dashboard/components/views/CandidateDashboardView";
import RecruiterDashboardView from "../features/dashboard/components/views/RecruiterDashboardView";
import CompanyDashboardView from "../features/dashboard/components/views/CompanyDashboardView";
import CandidateProfile from "../features/profile/CandidateProfile";
import ScreenshotUploader from "../features/jobs/components/ScreenshotUploader";
import { TemplateManager } from "../features/outreach/components/TemplateManager";
import { OutreachDraftSection } from "../features/outreach/components/OutreachDraftSection";
import DraftsReviewPage from "../pages/DraftsReviewPage";
import QueueDetailsPage from "../pages/QueueDetailsPage";
import JobTrackerPage from "../pages/JobTrackerPage";
import LearningSpaceDashboard from "../features/learning/components/LearningSpaceDashboard";
import TopicDetailsView from "../features/learning/components/TopicDetailsView";
import RoadmapDetailsView from "../features/learning/components/RoadmapDetailsView";
import PricingPage from "../features/billing/components/PricingPage";
import BillingPortal from "../features/billing/components/BillingPortal";
import { TelemetryDashboard } from "../features/dashboard/components/views/TelemetryDashboard";

import PublicProfilePage from "../pages/PublicProfilePage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/profile/:username" element={<PublicProfilePage />} />
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
        <Route path="/jobs/applications" element={<JobTrackerPage />} />
        <Route path="/jobs/parse" element={<ScreenshotUploader />} />
        <Route path="/outreach/templates" element={<TemplateManager />} />
        <Route path="/outreach/draft" element={<OutreachDraftSection />} />
        <Route path="/outreach/drafts/review" element={<DraftsReviewPage />} />
        <Route path="/outreach/queue" element={<QueueDetailsPage />} />
        <Route path="/learning" element={<LearningSpaceDashboard />} />
        <Route path="/learning/topic/:topicId" element={<TopicDetailsView />} />
        <Route path="/learning/roadmap/:roadmapId" element={<RoadmapDetailsView />} />
        <Route path="/billing/pricing" element={<PricingPage />} />
        <Route path="/billing/portal" element={<BillingPortal />} />
        <Route path="/admin/telemetry" element={<TelemetryDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

