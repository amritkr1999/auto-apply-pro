import React, { useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { DarkModeToggle } from "../components/DarkModeToggle";
import MobileAppComingSoonModal from "../components/MobileAppComingSoonModal";
import "./landing.css";

export const AutoJobApplicationPage: React.FC = () => {
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
          "name": "Auto Job Application",
          "item": "https://easynaukri.online/auto-job-application"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "EasyNaukri Auto Job Application Bot",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Chrome Extension",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "description": "Automate job applications across top portals with EasyNaukri's AI automatic job apply bot. Customize resumes, craft cover letters, and track applications."
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an auto job application bot?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An auto job application bot is an AI-powered software tool that automatically matches your profile to job postings, fills out application forms, tailors your resume for ATS screening, and submits job applications on your behalf."
          }
        },
        {
          "@type": "Question",
          "name": "How does EasyNaukri's automatic job apply bot work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EasyNaukri analyzes your resume and preferences, finds high-matching job openings, dynamically customizes cover letters and application answers, and automatically submits applications up to 50 times per day."
          }
        },
        {
          "@type": "Question",
          "name": "Is using an auto job application tool safe for ATS filtering?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! EasyNaukri tailors your resume keywords to match each target job description, ensuring high ATS match scores (85%+) before submitting."
          }
        }
      ]
    }
  ];

  return (
    <div className="landing-root">
      <SEOHead
        title="Auto Job Application Platform & Automatic Apply Bot | EasyNaukri"
        description="Automate job applications across major platforms with EasyNaukri's auto job application bot. Fill forms, optimize resumes for ATS, and land interviews faster."
        canonicalUrl="https://easynaukri.online/auto-job-application"
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
            <Link to="/cold-outreach-email">Cold Outreach Email</Link>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-extrabold tracking-wide mb-4">
            <span>⚡ AI-Powered Job Search Automation</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: "2.75rem", lineHeight: "1.2", marginBottom: "1rem" }}>
            Auto Job Application Platform &amp; Automatic Job Apply Bot
          </h1>
          <p className="hero-subtitle" style={{ fontSize: "1.125rem", margin: "0 auto 2rem" }}>
            Stop spending hours filling repetitive application forms manually. EasyNaukri's intelligent <strong>auto job application bot</strong> matches your skills, tailors your ATS resume, and submits up to 50 applications per day automatically.
          </p>
          <div className="hero-ctas" style={{ justifyContent: "center" }}>
            <Link to="/login?tab=register" className="landing-btn btn-primary shadow-lg shadow-indigo-500/25" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Start 15-Day Free Elite Trial
            </Link>
            <a href="#features" className="landing-btn btn-outline" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Explore Features
            </a>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>
            ✓ Zero credit card required • 50 automated daily applications • 15-day full access
          </p>
        </div>
      </header>

      {/* Main Features Grid */}
      <section id="features" className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem" }}>
        <div className="section-header">
          <span className="section-label">Automated Efficiency</span>
          <h2 className="section-title">Why Use EasyNaukri's Auto Job Application Bot?</h2>
          <p className="section-subtitle">
            Engineered for software developers, product managers, data scientists, and job seekers looking to land interviews 5x faster.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🤖</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Automatic Application Filling</h3>
              <p className="benefit-description">
                Our bot extracts details from your profile to auto-fill complex forms, screening questions, and job portal questionnaires effortlessly.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🎯</div>
            <div className="benefit-info">
              <h3 className="benefit-title">ATS Match Optimization</h3>
              <p className="benefit-description">
                Ensure every application passes Applicant Tracking Systems (ATS). Our engine dynamically embeds target keywords into your submitted materials.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🚀</div>
            <div className="benefit-info">
              <h3 className="benefit-title">50 Submissions Daily</h3>
              <p className="benefit-description">
                Scale your outreach without burnout. Send up to 50 applications every single day while keeping complete track of every stage in your dashboard.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">📝</div>
            <div className="benefit-info">
              <h3 className="benefit-title">AI Cover Letter Tailoring</h3>
              <p className="benefit-description">
                Generate tailored, context-aware cover letters for every role in seconds, highlighting your relevant accomplishments automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem", background: "var(--bg-secondary)" }}>
        <div className="section-header">
          <span className="section-label">Step-by-Step Workflow</span>
          <h2 className="section-title">How Automatic Job Application Works</h2>
          <p className="section-subtitle">Get up and running in less than 3 minutes.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <span className="step-number">1</span>
            <div className="step-icon">📤</div>
            <h3 className="step-title">1. Create Your Profile</h3>
            <p className="step-description">Upload your master resume, target job titles, preferred locations, and salary expectations.</p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <div className="step-icon">🔍</div>
            <h3 className="step-title">2. Set Match Criteria</h3>
            <p className="step-description">Set minimum match thresholds (e.g. 80%+ skills match) so the bot targets high-probability listings.</p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <div className="step-icon">⚡</div>
            <h3 className="step-title">3. Launch Autopilot</h3>
            <p className="step-description">Turn on Autopilot and let EasyNaukri continuously submit applications and deliver real-time progress reports.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem" }}>
        <div className="section-header">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faqs-container">
          <details className="faq-item" open>
            <summary>What is an auto job application bot?</summary>
            <p className="faq-content">
              An auto job application bot is an automated software tool that matches your resume with live job postings and fills out application forms on your behalf, eliminating tedious manual data entry.
            </p>
          </details>

          <details className="faq-item">
            <summary>Can I review applications before they are sent?</summary>
            <p className="faq-content">
              Yes! EasyNaukri lets you run in Full Autopilot mode or Review Mode, where you can inspect generated responses and customized resumes before submission.
            </p>
          </details>

          <details className="faq-item">
            <summary>How many applications can I send per day?</summary>
            <p className="faq-content">
              During the 15-day Free Elite Trial, you can send up to 50 automated applications per day.
            </p>
          </details>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: "60px 2rem 80px", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))", padding: "3rem", borderRadius: "1.5rem", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Ready to Automate Your Job Hunt?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Join thousands of job seekers who land interviews faster with EasyNaukri's auto job application bot.</p>
          <Link to="/login?tab=register" className="landing-btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
            Start 15-Day Free Trial Now
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

export default AutoJobApplicationPage;
