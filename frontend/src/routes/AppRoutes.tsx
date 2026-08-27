import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const UnsubscribePage = lazy(() => import("../pages/UnsubscribePage"));
const ProfessionalDashboardView = lazy(() => import("../features/dashboard/components/views/ProfessionalDashboardView"));
const RecruiterDashboardView = lazy(() => import("../features/dashboard/components/views/RecruiterDashboardView"));
const CompanyDashboardView = lazy(() => import("../features/dashboard/components/views/CompanyDashboardView"));
const ProfessionalProfile = lazy(() => import("../features/profile/ProfessionalProfile"));
const OpportunityImporter = lazy(() => import("../features/opportunities/components/OpportunityImporter"));
const HrHarvesterPage = lazy(() => import("../pages/HrHarvesterPage").then((m: any) => ({ default: m.HrHarvesterPage || m.default })));
const TemplateManager = lazy(() => import("../features/outreach/components/TemplateManager").then((m: any) => ({ default: m.TemplateManager || m.default })));
const OutreachDraftSection = lazy(() => import("../features/outreach/components/OutreachDraftSection").then((m: any) => ({ default: m.OutreachDraftSection || m.default })));
const DraftsReviewPage = lazy(() => import("../pages/DraftsReviewPage"));
const QueueDetailsPage = lazy(() => import("../pages/QueueDetailsPage"));
const JobTrackerPage = lazy(() => import("../pages/JobTrackerPage"));
const LearningSpaceDashboard = lazy(() => import("../features/learning/components/LearningSpaceDashboard"));
const TopicDetailsView = lazy(() => import("../features/learning/components/TopicDetailsView"));
const RoadmapDetailsView = lazy(() => import("../features/learning/components/RoadmapDetailsView"));
const SubmitQuestionForm = lazy(() => import("../features/learning/components/SubmitQuestionForm").then((m: any) => ({ default: m.SubmitQuestionForm || m.default })));
const UserSubmissionsList = lazy(() => import("../features/learning/components/UserSubmissionsList").then((m: any) => ({ default: m.UserSubmissionsList || m.default })));
const AdminModerationList = lazy(() => import("../features/learning/components/AdminModerationList").then((m: any) => ({ default: m.AdminModerationList || m.default })));
const BillingPortal = lazy(() => import("../features/billing/components/BillingPortal"));
const TelemetryDashboard = lazy(() => import("../features/dashboard/components/views/TelemetryDashboard").then((m: any) => ({ default: m.TelemetryDashboard || m.default })));
const SarkariNaukriPage = lazy(() => import("../pages/SarkariNaukriPage"));
const AutoJobApplicationPage = lazy(() => import("../pages/AutoJobApplicationPage"));
const ColdOutreachEmailPage = lazy(() => import("../pages/ColdOutreachEmailPage"));
const SarkariNaukriAlertsPage = lazy(() => import("../pages/SarkariNaukriAlertsPage"));
const GovtExamsPage = lazy(() => import("../pages/GovtExamsPage"));


const PublicProfilePage = lazy(() => import("../pages/PublicProfilePage"));
const PublicPlaqueCardPage = lazy(() => import("../pages/PublicPlaqueCardPage"));
const ExtensionLandingPage = lazy(() => import("../pages/ExtensionLandingPage"));
const PrivacyPolicy = lazy(() => import("../components/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../components/pages/CookiePolicy"));
const TermsOfService = lazy(() => import("../components/pages/TermsOfService"));
const AboutUsPage = lazy(() => import("../pages/AboutUsPage"));
const CareersPage = lazy(() => import("../pages/CareersPage"));
const ContactUsPage = lazy(() => import("../pages/ContactUsPage"));

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]" aria-label="Loading page content">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/cookies" element={<Navigate to="/cookie-policy" replace />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/profile/:username" element={<PublicProfilePage />} />
        <Route path="/card/:username" element={<PublicPlaqueCardPage />} />
        <Route path="/extension" element={<ExtensionLandingPage />} />
        <Route path="/auto-job-application" element={<AutoJobApplicationPage />} />
        <Route path="/cold-outreach-email" element={<ColdOutreachEmailPage />} />
        <Route path="/sarkari-naukri-alerts" element={<SarkariNaukriAlertsPage />} />
        <Route path="/sarkari-naukri" element={<SarkariNaukriPage />} />
        <Route path="/government-exams" element={<GovtExamsPage />} />
        <Route path="/govt-jobs" element={<Navigate to="/government-exams" replace />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
          <Route path="/candidate/profile" element={<ProfessionalProfile />} />
          <Route path="/opportunities/tracker" element={<JobTrackerPage />} />
          <Route path="/opportunities/import" element={<OpportunityImporter />} />
          <Route path="/opportunities/parser" element={<OpportunityImporter />} />
          <Route path="/opportunities/harvester" element={<HrHarvesterPage />} />
          <Route path="/harvester" element={<Navigate to="/opportunities/harvester" replace />} />
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
