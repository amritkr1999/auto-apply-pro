import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/LoginPage";
import LandingPage from "../pages/LandingPage";
import MainLandingPage from "../pages/MainLandingPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import UnsubscribePage from "../pages/UnsubscribePage";
import ProfessionalDashboardView from "../features/dashboard/components/views/ProfessionalDashboardView";
import RecruiterDashboardView from "../features/dashboard/components/views/RecruiterDashboardView";
import CompanyDashboardView from "../features/dashboard/components/views/CompanyDashboardView";
import ProfessionalProfile from "../features/profile/ProfessionalProfile";
import OpportunityImporter from "../features/opportunities/components/OpportunityImporter";
import { TemplateManager } from "../features/outreach/components/TemplateManager";
import { OutreachDraftSection } from "../features/outreach/components/OutreachDraftSection";
import DraftsReviewPage from "../pages/DraftsReviewPage";
import QueueDetailsPage from "../pages/QueueDetailsPage";
import JobTrackerPage from "../pages/JobTrackerPage";
import LearningSpaceDashboard from "../features/learning/components/LearningSpaceDashboard";
import TopicDetailsView from "../features/learning/components/TopicDetailsView";
import RoadmapDetailsView from "../features/learning/components/RoadmapDetailsView";
import { SubmitQuestionForm } from "../features/learning/components/SubmitQuestionForm";
import { UserSubmissionsList } from "../features/learning/components/UserSubmissionsList";
import { AdminModerationList } from "../features/learning/components/AdminModerationList";
import BillingPortal from "../features/billing/components/BillingPortal";
import { TelemetryDashboard } from "../features/dashboard/components/views/TelemetryDashboard";

import PublicProfilePage from "../pages/PublicProfilePage";
import PublicPlaqueCardPage from "../pages/PublicPlaqueCardPage";
import PrivacyPolicy from "../components/pages/PrivacyPolicy";
import TermsOfService from "../components/pages/TermsOfService";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/main" element={<MainLandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/profile/:username" element={<PublicProfilePage />} />
      <Route path="/card/:username" element={<PublicPlaqueCardPage />} />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<ProfessionalDashboardView />}
        />
        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboardView />}
        />
        <Route
          path="/company-dashboard"
          element={<CompanyDashboardView />}
        />
        <Route path="/profile/settings" element={<ProfessionalProfile />} />
        <Route path="/opportunities/tracker" element={<JobTrackerPage />} />
        <Route path="/opportunities/import" element={<OpportunityImporter />} />
        <Route path="/outreach/templates" element={<TemplateManager />} />
        <Route path="/outreach/draft" element={<OutreachDraftSection />} />
        <Route path="/outreach/drafts/review" element={<DraftsReviewPage />} />
        <Route path="/outreach/queue" element={<QueueDetailsPage />} />
        <Route path="/learning" element={<LearningSpaceDashboard />} />
        <Route path="/learning/submit" element={<SubmitQuestionForm />} />
        <Route path="/learning/submissions" element={<UserSubmissionsList />} />
        <Route path="/learning/moderation" element={<AdminModerationList />} />
        <Route path="/learning/topic/:topicId" element={<TopicDetailsView />} />
        <Route path="/learning/roadmap/:roadmapId" element={<RoadmapDetailsView />} />
        <Route path="/billing" element={<BillingPortal />} />
        <Route path="/billing/pricing" element={<BillingPortal />} />
        <Route path="/billing/portal" element={<BillingPortal />} />
        <Route path="/pricing" element={<BillingPortal />} />
        <Route path="/admin/telemetry" element={<TelemetryDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

