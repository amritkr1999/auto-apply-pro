import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { DarkModeToggle } from "../components/DarkModeToggle";
import MobileAppComingSoonModal from "../components/MobileAppComingSoonModal";
import "./landing.css";

export const ColdOutreachEmailPage: React.FC = () => {
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
          "name": "Cold Outreach Email",
          "item": "https://easynaukri.online/cold-outreach-email"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "EasyNaukri Recruiter Cold Outreach Automation",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Send high-converting cold outreach emails for jobs to verified recruiters & hiring managers using EasyNaukri's automated Gmail dispatch system."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does cold outreach email for jobs work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cold outreach for jobs involves emailing recruiters or hiring managers directly with a personalized message and resume before or right after submitting a job application. EasyNaukri automates finding recruiter contacts and sending customized emails from your Gmail account."
          }
        },
        {
          "@type": "Question",
          "name": "Is EasyNaukri's recruiter email automation safe with Gmail?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! EasyNaukri uses official Google OAuth API authorization with send-only permissions (gmail.send). We never read or modify your inbox."
          }
        },
        {
          "@type": "Question",
          "name": "What response rates can I expect from recruiter cold emails?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Candidates using personalized cold outreach emails report 3x to 5x higher interview response rates compared to submitting applications through standard web portals alone."
          }
        }
      ]
    }
  ];

  return (
    <div className="landing-root">
      <SEOHead
        title="Cold Outreach Email for Jobs & Recruiter Automation | EasyNaukri"
        description="Streamline recruiter email automation and cold outreach emails for jobs. Send personalized cover letters directly to hiring managers via Gmail with EasyNaukri."
        canonicalUrl="https://easynaukri.online/cold-outreach-email"
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
            <Link to="/sarkari-naukri-alerts">Sarkari Naukri Alerts</Link>
          </div>
        )}
      </nav>

      {showMobileAppModal && (
        <MobileAppComingSoonModal onClose={() => setShowMobileAppModal(false)} />
      )}

      {/* Hero Section */}
      <header className="hero-section" style={{ minHeight: "auto", padding: "80px 2rem 60px" }}>
        <div className="hero-content" style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center" }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-extrabold tracking-wide mb-4">
            <span>✉️ Direct Recruiter &amp; Hiring Manager Outreach</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: "2.75rem", lineHeight: "1.2", marginBottom: "1rem" }}>
            Cold Outreach Email for Jobs &amp; Recruiter Automation
          </h1>
          <p className="hero-subtitle" style={{ fontSize: "1.125rem", margin: "0 auto 2rem" }}>
            Bypass black-hole application portals. Send personalized <strong>cold outreach emails for jobs</strong> directly to verified tech recruiters and hiring managers straight from your personal Gmail.
          </p>
          <div className="hero-ctas" style={{ justifyContent: "center" }}>
            <Link to="/login?tab=register" className="landing-btn btn-primary shadow-lg shadow-indigo-500/25" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Start Free Outreach Trial
            </Link>
            <a href="#features" className="landing-btn btn-outline" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              See How It Works
            </a>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>
            ✓ Verified Recruiter Harvester • Send via Gmail OAuth • 100% Google Compliant
          </p>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem" }}>
        <div className="section-header">
          <span className="section-label">Recruiter Outreach</span>
          <h2 className="section-title">Why Recruiter Email Automation Works Best</h2>
          <p className="section-subtitle">
            Recruiters check their inbox first thing every morning. Get your candidate profile placed at the top of their email list.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">📧</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Sent From Your Own Gmail</h3>
              <p className="benefit-description">
                Outreach emails come directly from your authorized Gmail address, ensuring high deliverability rates and organic recruiter replies directly in your primary inbox.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🧑‍💼</div>
            <div className="benefit-info">
              <h3 className="benefit-title">HR &amp; Recruiter Email Harvester</h3>
              <p className="benefit-description">
                Discover verified contact details of tech recruiters, talent acquisition managers, and engineering leads matching your target company list.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">✨</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Personalized Template Engine</h3>
              <p className="benefit-description">
                Craft custom email templates with dynamic tags like company name, open job title, key projects, and relevant skills.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🔒</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Strict Google OAuth Security</h3>
              <p className="benefit-description">
                EasyNaukri requests send-only (<code className="font-mono text-xs">gmail.send</code>) permissions. We never read, scan, or modify existing emails in your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem", background: "var(--bg-secondary)" }}>
        <div className="section-header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faqs-container">
          <details className="faq-item" open>
            <summary>Why should I send cold outreach emails for jobs?</summary>
            <p className="faq-content">
              Job boards receive hundreds of applications for a single opening. Sending a direct, polite cold email to the recruiter shows initiative and gets your resume reviewed immediately.
            </p>
          </details>

          <details className="faq-item">
            <summary>Where do recruiter replies go?</summary>
            <p className="faq-content">
              Because outreach emails are dispatched directly from your connected Gmail address, all recruiter replies arrive straight in your personal Gmail inbox.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I schedule outreach emails at optimal times?</summary>
            <p className="faq-content">
              Yes! EasyNaukri's outreach queue allows you to schedule emails to dispatch during business hours in the recruiter's local timezone.
            </p>
          </details>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: "60px 2rem 80px", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))", padding: "3rem", borderRadius: "1.5rem", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Start Cold Emailing Recruiters Today</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Supercharge your job search with automated recruiter email outreach on EasyNaukri.</p>
          <Link to="/login?tab=register" className="landing-btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
            Get Started Free Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "2rem", borderTop: "1px solid var(--card-border)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
        <p>© {new Date().getFullYear()} EasyNaukri. All rights reserved. • <Link to="/privacy">Privacy Policy</Link> • <Link to="/terms">Terms of Service</Link></p>
      </footer>
    </div>
  );
};

export default ColdOutreachEmailPage;
