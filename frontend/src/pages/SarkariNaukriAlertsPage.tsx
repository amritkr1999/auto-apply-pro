import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { DarkModeToggle } from "../components/DarkModeToggle";
import MobileAppComingSoonModal from "../components/MobileAppComingSoonModal";
import SarkariNaukriPage from "./SarkariNaukriPage";
import "./landing.css";

export const SarkariNaukriAlertsPage: React.FC = () => {
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://easynaukri.online/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sarkari Naukri Alerts",
          "item": "https://easynaukri.online/sarkari-naukri-alerts"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "EasyNaukri Sarkari Naukri Engine",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "description": "Real-time Sarkari Naukri alerts, government job notification tracking, official syllabus explorer, and age eligibility calculator."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How to get instant Sarkari Naukri alerts?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EasyNaukri monitors central and state government gazette publications, UPSC, SSC, RRB, and Banking websites 24/7 to deliver instant email and push notification alerts for upcoming vacancies."
          }
        },
        {
          "@type": "Question",
          "name": "What government job sectors does EasyNaukri cover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EasyNaukri covers Staff Selection Commission (SSC CGL, CHSL, JE), Civil Services (UPSC CSE, CDS, NDA), Indian Railways (RRB NTPC, Group D), Banking (IBPS PO, SBI), Defense, and 28 State PSCs."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Sarkari Naukri Age & Eligibility Calculator work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Enter your Date of Birth, category (UR, OBC, SC/ST, PwBD), and qualification to get instant age calculation against official notification cutoff dates and view eligible government job exams."
          }
        }
      ]
    }
  ];

  return (
    <div className="landing-root">
      <SEOHead
        title="Sarkari Naukri Alerts & Govt Job Notification Automation | EasyNaukri"
        description="Get real-time Sarkari Naukri alerts and government job notification automation. Calculate age eligibility, access syllabus breakdowns, and practice PYQs on EasyNaukri."
        canonicalUrl="https://easynaukri.online/sarkari-naukri-alerts"
        jsonLd={jsonLd}
      />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo flex items-center gap-2.5" aria-label="EasyNaukri Home">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="h-9 w-9 rounded-xl object-contain shadow-xs select-none" />
            <span className="hidden sm:inline-block font-extrabold text-xl tracking-tight text-slate-900 dark:text-white select-none whitespace-nowrap">EasyNaukri</span>
          </Link>

          <div className="nav-ctas">
            <div className="nav-desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setShowMobileAppModal(true)}
                className="landing-btn btn-outline"
                title="Download Mobile App"
              >
                <span>📱</span>
                <span>Download App</span>
              </button>
              <DarkModeToggle tooltipPosition="bottom" />
            </div>

            {user ? (
              <Link to="/dashboard" className="landing-btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn btn-text nav-desktop-only">
                  Login
                </Link>
                <Link to="/login?tab=register" className="landing-btn btn-primary">
                  Get Started Free
                </Link>
              </>
            )}

            <button
              type="button"
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg style={{ width: "24px", height: "24px" }} fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="12" cy="19" r="2.2" />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <DarkModeToggle variant="menu-item" />
            <Link to="/login?tab=register" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Get Started Free</Link>
            <Link to="/auto-job-application">Auto Job Application</Link>
            <Link to="/cold-outreach-email">Cold Outreach Email</Link>
          </div>
        )}
      </nav>

      {showMobileAppModal && (
        <MobileAppComingSoonModal onClose={() => setShowMobileAppModal(false)} />
      )}

      {/* Main Interactive Sarkari Page Component */}
      <main style={{ paddingTop: "80px" }}>
        <SarkariNaukriPage />
      </main>

      {/* Footer */}
      <footer style={{ padding: "2rem", borderTop: "1px solid var(--card-border)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        <p>© {new Date().getFullYear()} EasyNaukri. All rights reserved. • <Link to="/privacy">Privacy Policy</Link> • <Link to="/terms">Terms of Service</Link></p>
      </footer>
    </div>
  );
};

export default SarkariNaukriAlertsPage;
