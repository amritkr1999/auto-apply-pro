import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./landing.css";
import { feedbackService } from "../features/profile/services/feedbackService";
import type { FeedbackResponse } from "../features/profile/services/feedbackService";
import { useTheme } from "../context/ThemeContext";
import MobileAppComingSoonModal from "../components/MobileAppComingSoonModal";
import { SEOHead } from "../components/SEOHead";

export const LandingPage: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [activeSlide, setActiveSlide] = useState<string>("intro");
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    { id: "intro", label: "Intro" },
    { id: "what-we-do", label: "Workflow Automation" },
    { id: "benefits", label: "Key Advantages" },
    { id: "google-oauth", label: "Google OAuth & Privacy" },
    { id: "pricing", label: "Pricing Tiers" },
    { id: "testimonials", label: "Success Stories" },
    { id: "faqs", label: "Questions & Answers" },
    { id: "footer", label: "Footer" }
  ];

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await feedbackService.getFeedbacks();
        setFeedbacks(data.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlide(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    slides.forEach((slide) => {
      const el = document.getElementById(slide.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "RECRUITER":
        return "/recruiter-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      default:
        return "/dashboard";
    }
  };

  const landingPageJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "EasyNaukri",
      "alternateName": "EasyNaukri Auto Apply",
      "url": "https://easynaukri.online/",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "description": "EasyNaukri is an automated job application & resume matching platform. Streamline your job search, optimize your resume, and send recruiter outreach emails effortlessly."
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "EasyNaukri",
      "url": "https://easynaukri.online/",
      "logo": "https://easynaukri.online/favicon.svg"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does EasyNaukri automate job applications?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EasyNaukri automatically matches your candidate profile and resume with active job postings, creates personalized cover letters, and helps you send recruiter outreach directly."
          }
        },
        {
          "@type": "Question",
          "name": "Is my Gmail data safe with EasyNaukri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, EasyNaukri complies fully with Google OAuth API Services User Data Policy. We only request permissions strictly needed to send candidate outreach emails on your behalf."
          }
        },
        {
          "@type": "Question",
          "name": "Can I try EasyNaukri for free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! EasyNaukri offers a Free Starter Tier that lets you experience automated resume matching and outreach immediately."
          }
        }
      ]
    }
  ];

  return (
    <div className="landing-root">
      <SEOHead
        title="EasyNaukri - Automated Job Application & Resume Matching Platform"
        description="Streamline your job search with EasyNaukri. Automated resume matching, AI-assisted recruiter outreach, and personalized application tracking."
        canonicalUrl="https://easynaukri.online/"
        jsonLd={landingPageJsonLd}
      />
      {/* ==================== Navigation Navbar ==================== */}
      <nav className="landing-nav">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span>⚡</span> EasyNaukri
          </a>

          <div className="nav-ctas">
            {/* Desktop-only Action Controls */}
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

              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  transition: "opacity 0.2s"
                }}
                title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              >
                {resolvedTheme === "dark" ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "20px", height: "20px", color: "#fbbf24" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "20px", height: "20px", color: "#4f46e5" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Auth Action Button */}
            {user ? (
              <Link to={getDashboardPath()} className="landing-btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn btn-text nav-desktop-only">
                  Login
                </Link>
                <Link to="/login?tab=register" className="landing-btn btn-primary">
                  Get Started
                </Link>
              </>
            )}

            {/* 3-Dots Mobile Menu Button */}
            <button
              type="button"
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              title="Menu Options"
            >
              {mobileMenuOpen ? (
                <svg style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg style={{ width: "24px", height: "24px" }} fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2.2" />
                  <circle cx="12" cy="12" r="2.2" />
                  <circle cx="12" cy="19" r="2.2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile 3-Dots Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="landing-btn btn-outline"
                style={{ width: "100%", justifyContent: "space-between", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {resolvedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </span>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Switch Theme</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileAppModal(true);
                  setMobileMenuOpen(false);
                }}
                className="landing-btn btn-outline"
                style={{ width: "100%", justifyContent: "flex-start", gap: "0.6rem", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
              >
                <span>📱</span>
                <span>Download Mobile App</span>
              </button>
            </div>

            {!user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
                Sign In / Login
              </Link>
            )}

            <div style={{ height: "1px", background: "var(--card-border)", margin: "0.25rem 0" }}></div>

            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "0.85rem", opacity: 0.8 }}>Privacy Policy</Link>
            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "0.85rem", opacity: 0.8 }}>Terms of Service</Link>
          </div>
        )}
      </nav>

      {showMobileAppModal && (
        <MobileAppComingSoonModal onClose={() => setShowMobileAppModal(false)} />
      )}

      {/* Slide Navigation Dots */}
      <nav className="slide-dots-nav" aria-label="Slide Navigation">
        {slides.map((slide) => (
          <button
            key={slide.id}
            type="button"
            className={`slide-dot ${activeSlide === slide.id ? "active" : ""}`}
            data-label={slide.label}
            onClick={() => {
              const el = document.getElementById(slide.id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            title={slide.label}
          />
        ))}
      </nav>

      {/* ==================== Hero Section ==================== */}
      <header id="intro" className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">EasyNaukri</span>
          <h1 className="hero-title">Welcome to EasyNaukri</h1>
          <p className="hero-subtitle">
            EasyNaukri is an automated job search and resume management platform designed to help job seekers discover matching opportunities, optimize resumes, and track applications effortlessly.
          </p>
          <div className="hero-ctas">
            {user ? (
              <Link to={getDashboardPath()} className="landing-btn btn-primary">
                Back to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login?tab=register" className="landing-btn btn-primary">
                  Get Started Free
                </Link>
                <a href="#what-we-do" className="landing-btn btn-outline">
                  How it works
                </a>
              </>
            )}
          </div>
          <p className="hero-auth-note" style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Sign in with Google to securely create your EasyNaukri profile, track your job applications, and save your resume preferences.
          </p>
        </div>

        <div className="hero-graphic-container">
          <div className="glow-orb-hero" aria-hidden="true"></div>
          <div className="hero-mockup-card">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
                <span className="mockup-dot"></span>
              </div>
              <span className="mockup-status">AI Autopilot Running</span>
            </div>

            <div className="mockup-row">
              <span className="mockup-label">Match Score Threshold</span>
              <span className="mockup-val">85% +</span>
            </div>
            <div className="mockup-row">
              <span className="mockup-label">Daily Submission Limit</span>
              <span className="mockup-val">15 / day</span>
            </div>

            <div className="mockup-row" style={{ marginTop: "1rem" }}>
              <span className="mockup-label">Weekly Queue Progress</span>
              <span className="mockup-val">72% Completed</span>
            </div>
            <div className="mockup-progress-bar">
              <div className="mockup-progress-fill"></div>
            </div>

            <div className="mockup-job-card">
              <div className="mockup-job-icon">⚛️</div>
              <div className="mockup-job-info">
                <h4>Frontend Developer</h4>
                <p>Vercel Inc. • Remote • 94% Skills Match</p>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>
                Submitted
              </span>
            </div>
          </div>

          <div className="floating-overlay-card">
            <div className="floating-icon">✓</div>
            <div className="floating-details">
              <h5>Applications Submitted</h5>
              <p>1,482 this month</p>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== What We Do Section ==================== */}
      <section id="what-we-do" className="landing-section">
        <div className="section-header">
          <span className="section-label">Workflow Automation</span>
          <h2 className="section-title">How EasyNaukri Works</h2>
          <p className="section-subtitle">
            Let our AI assistant manage the entire job hunting pipeline,
            working behind the scenes to get you noticed.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <span className="step-number">1</span>
            <div className="step-icon">📄</div>
            <h3 className="step-title">Upload & Analyze</h3>
            <p className="step-description">
              Drop in your resume and profile details. Our system extracts your key skills,
              experience levels, and target job parameters.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">2</span>
            <div className="step-icon">🎯</div>
            <h3 className="step-title">Smart Matching</h3>
            <p className="step-description">
              Our matching engine evaluates job descriptions across major websites
              to isolate listings that maximize your hiring potential.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">3</span>
            <div className="step-icon">🤖</div>
            <h3 className="step-title">Autopilot Applying</h3>
            <p className="step-description">
              The AI dynamically creates tailored answers, customizes your resume
              to match keywords, and submits the applications for you.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== Benefits Section ==================== */}
      <section id="benefits" className="landing-section">
        <div className="section-header">
          <span className="section-label">Key Advantages</span>
          <h2 className="section-title">Designed to Save Your Time</h2>
          <p className="section-subtitle">
            Job hunting doesn't have to be a full-time job. Get the competitive edge
            needed to succeed.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">⏱️</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Save 80+ Hours Monthly</h3>
              <p className="benefit-description">
                Skip filling repeating application forms on job boards. Spend your time
                preparing for upcoming interviews instead.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">🎯</div>
            <div className="benefit-info">
              <h3 className="benefit-title">ATS-Optimized Customization</h3>
              <p className="benefit-description">
                We rewrite application responses and highlight relevant skills
                to ensure your profiles pass automated ATS screening filters.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">📈</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Unified Tracking Dashboard</h3>
              <p className="benefit-description">
                Keep tabs on all applications, upcoming stages, and offers in one centralized,
                high-fidelity dashboard.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">💼</div>
            <div className="benefit-info">
              <h3 className="benefit-title">Recruiter Partnerships</h3>
              <p className="benefit-description">
                Connect directly with recruiters and businesses looking for verified candidates
                matching your specific skillset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Google OAuth Verification Section ==================== */}
      <section id="google-oauth" className="landing-section">
        <div className="section-header">
          <span className="section-label">Security & Compliance</span>
          <h2 className="section-title">Google OAuth Permissions & Data Usage</h2>
          <p className="section-subtitle">
            EasyNaukri requests specific Google OAuth permissions to provide authentication and email dispatch services. Below is a detailed breakdown of what data we access, why we need it, and how it is used.
          </p>
        </div>

        <div className="oauth-card">
          <div className="oauth-table-wrapper">
            <table className="oauth-table">
              <thead>
                <tr>
                  <th>Scope Name</th>
                  <th>Permission Type</th>
                  <th>What Data We Access</th>
                  <th>Why We Need It</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="oauth-scope-tag">openid</span></td>
                  <td><span className="oauth-badge-normal">Non-sensitive</span></td>
                  <td>Unique Google User ID (<code className="font-mono text-xs">sub</code>)</td>
                  <td>To authenticate user identity securely without creating a separate password.</td>
                </tr>
                <tr>
                  <td><span className="oauth-scope-tag">email</span></td>
                  <td><span className="oauth-badge-normal">Non-sensitive</span></td>
                  <td>Primary Email Address</td>
                  <td>To create your EasyNaukri account, sign you in, and deliver account notifications.</td>
                </tr>
                <tr>
                  <td><span className="oauth-scope-tag">profile</span></td>
                  <td><span className="oauth-badge-normal">Non-sensitive</span></td>
                  <td>Display Name & Profile Picture URL</td>
                  <td>To populate your candidate dashboard profile (Name and Avatar).</td>
                </tr>
                <tr>
                  <td><span className="oauth-scope-tag">https://www.googleapis.com/auth/gmail.send</span></td>
                  <td><span className="oauth-badge-restricted">Restricted</span></td>
                  <td>Ability to compose & send outbound emails</td>
                  <td>To send user-authorized job applications and recruiter outreach emails directly from your connected Gmail address.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="oauth-details-grid">
            <div className="oauth-detail-box">
              <h4>1. Basic Identity Scopes (openid, email, profile)</h4>
              <ul className="oauth-list">
                <li><strong>What data is requested:</strong> Primary email address, full name, profile picture URL, and unique Google ID.</li>
                <li><strong>Why we need it:</strong> To allow single sign-on (SSO), populate your user profile, authenticate API requests, and send system account notifications.</li>
              </ul>
            </div>

            <div className="oauth-detail-box">
              <h4>2. Gmail Send Scope (gmail.send)</h4>
              <ul className="oauth-list">
                <li><strong>What permission is requested:</strong> Send-only authorization to dispatch outbound emails through Google's Gmail API on your behalf.</li>
                <li><strong>Why we need it:</strong> EasyNaukri allows candidates to automate job application outreach by sending personalized cover letters and resumes directly to hiring managers from their own Gmail address. Recruiter replies land in your personal Gmail inbox.</li>
                <li><strong>What we NEVER do:</strong> We NEVER read, access, fetch, modify, label, or delete non-outreach inbox emails (<code className="font-mono text-xs">gmail.readonly</code> is not requested).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Privacy & Security Guarantees */}
        <div className="oauth-card">
          <h3 className="step-title" style={{ marginBottom: "1rem" }}>Data Privacy & Security Guarantees</h3>
          <ul className="oauth-list">
            <li><strong>User Control:</strong> All outreach emails sent using <code className="oauth-scope-tag">gmail.send</code> are created based on candidate-approved templates and job parameters.</li>
            <li><strong>Minimal Access:</strong> We strictly request send-only permissions (<code className="oauth-scope-tag">gmail.send</code>) and do not ask for read or delete access to your inbox.</li>
            <li><strong>Data Protection:</strong> OAuth tokens are securely encrypted in transit and at rest, and your personal data is never shared or sold to third parties.</li>
          </ul>
        </div>
      </section>

      {/* ==================== Pricing Plans Section ==================== */}
      <section id="pricing" className="landing-section">
        <div className="section-header">
          <span className="section-label">Pricing Tiers</span>
          <h2 className="section-title">Select the Perfect Plan</h2>
          <p className="section-subtitle">
            Start free and upgrade as you scale your search. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Candidate Free */}
          <div className="pricing-card">
            <h3 className="pricing-tier">Candidate Free</h3>
            <div className="pricing-price">₹0<span>/month</span></div>
            <p className="pricing-desc">Ideal for testing the platform and getting familiar with application automation.</p>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> 3 Submissions per day (90/mo)
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> 1 Resume Profile
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Standard Job Matching
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Basic Roadmaps & 5 Quizzes/day
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Simple Application Tracker
              </li>
              <li className="pricing-feature-item" style={{ opacity: 0.4 }}>
                <span style={{ marginRight: "0.75rem" }}>✕</span> Custom Cover Letters
              </li>
            </ul>
            <Link to="/login?tab=register" className="landing-btn btn-outline pricing-btn">
              Get Started Free
            </Link>
          </div>

          {/* Starter Plan */}
          <div className="pricing-card">
            <h3 className="pricing-tier">Starter Plan</h3>
            <div className="pricing-price">₹69<span>/month</span></div>
            <p className="pricing-desc">Great for active candidates seeking a steady daily job outreach volume.</p>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> 15 Submissions per day (450/mo)
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Up to 3 Resume Profiles
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> ATS Keyword Optimization
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> All Roadmaps & Unlimited Quizzes
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Pipeline Conversion Analytics
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Mobile App Sync & Biometrics
              </li>
            </ul>
            <Link to="/login?tab=register" className="landing-btn btn-outline pricing-btn">
              Start Starter Plan
            </Link>
          </div>

          {/* Candidate Pro Tier */}
          <div className="pricing-card featured">
            <span className="pricing-badge">Most Popular</span>
            <h3 className="pricing-tier">Candidate Pro</h3>
            <div className="pricing-price">₹99<span>/month</span></div>
            <p className="pricing-desc">For serious job seekers looking to maximize outreach and land interview calls fast.</p>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> 25 Submissions per day (750/mo)
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Unlimited Resume Profiles
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Automated Cover Letters & AI Tailoring
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Automated SMTP Scheduled Dispatch
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Rejection Trends & Funnel Stats
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Priority Email Support
              </li>
            </ul>
            <Link to="/login?tab=register" className="landing-btn btn-primary pricing-btn">
              Upgrade to Pro
            </Link>
          </div>

          {/* Elite Autopilot Tier */}
          <div className="pricing-card">
            <h3 className="pricing-tier">Elite Autopilot</h3>
            <div className="pricing-price">₹199<span>/month</span></div>
            <p className="pricing-desc">Maximum speed & priority processing for aggressive job hunting campaigns.</p>
            <div className="pricing-divider"></div>
            <ul className="pricing-features">
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> 50 Submissions per day (1,500/mo)
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Priority Instant AI OCR & Parsing
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Full Resume & Cover Letter Suite
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Featured Candidate Recruiter Spotlight
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Dedicated Account Support
              </li>
              <li className="pricing-feature-item">
                <span className="pricing-feature-check">✓</span> Custom Outreach Mail Config
              </li>
            </ul>
            <Link to="/login?tab=register" className="landing-btn btn-outline pricing-btn">
              Get Elite Autopilot
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== Testimonials Section ==================== */}
      <section id="testimonials" className="landing-section">
        <div className="section-header">
          <span className="section-label">Success Stories</span>
          <h2 className="section-title">Loved by Job Seekers</h2>
          <p className="section-subtitle">
            Hear from developers and professionals who automated their job hunt and succeeded.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              EasyNaukri saved me weeks of manual copy-pasting. I was able to target
              top companies with customized submissions and landed a Senior Frontend Developer
              role at a startup within 14 days!
            </p>
            <div className="testimonial-user">
              <div className="testimonial-avatar">SM</div>
              <div className="testimonial-meta">
                <h4>Sarah Jenkins</h4>
                <p>Senior Frontend Developer</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              The AI resume tailoring works like magic. My response rate increased from less
              than 5% to almost 35%. Having a single dashboard to track all of my interview invitations
              made organization a breeze.
            </p>
            <div className="testimonial-user">
              <div className="testimonial-avatar">DK</div>
              <div className="testimonial-meta">
                <h4>David Kim</h4>
                <p>Technical Product Manager</p>
              </div>
            </div>
          </div>

          {feedbacks.map((fb) => (
            <div key={fb.id} className="testimonial-card animate-in fade-in duration-300">
              <div className="testimonial-stars">
                {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
              </div>
              <p className="testimonial-quote">
                {fb.comment}
              </p>
              <div className="testimonial-user">
                <div className="testimonial-avatar">
                  {getInitials(fb.userName)}
                </div>
                <div className="testimonial-meta">
                  <h4>{fb.userName}</h4>
                  <p>{fb.userRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FAQs Section ==================== */}
      <section id="faqs" className="landing-section">
        <div className="section-header">
          <span className="section-label">Questions & Answers</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Find answers to commonly asked questions about our automation features, security standards, and policies.
          </p>
        </div>

        <div className="faqs-container">
          <details className="faq-item" name="landing-faqs" open>
            <summary>How does the automated application process work?</summary>
            <p className="faq-content">
              After you upload your resume and set your target preferences (e.g. roles, location, salary),
              our AI agents scan job postings, identify optimal fits, adapt your skills text to matching keywords,
              and automatically fill form fields on target websites on your behalf.
            </p>
          </details>

          <details className="faq-item" name="landing-faqs">
            <summary>Can I review applications before they are sent?</summary>
            <p className="faq-content">
              Yes! You can choose to enable "Review Mode" in your profile. When enabled, applications
              will be drafted in your Outreach Queue, where you can check the customized response,
              adjust cover letters, and confirm submission manually.
            </p>
          </details>

          <details className="faq-item" name="landing-faqs">
            <summary>What Google permissions does EasyNaukri use and why?</summary>
            <p className="faq-content">
              EasyNaukri uses standard identity scopes (<code className="oauth-scope-tag">openid</code>, <code className="oauth-scope-tag">email</code>, <code className="oauth-scope-tag">profile</code>) for passwordless authentication, and the restricted <code className="oauth-scope-tag">gmail.send</code> scope to send personalized job application emails to recruiters directly from your connected Gmail address. We NEVER request read or delete access to your inbox.
            </p>
          </details>

          <details className="faq-item" name="landing-faqs">
            <summary>Which job boards and systems do you support?</summary>
            <p className="faq-content">
              EasyNaukri supports major job sites like LinkedIn, Indeed, ZipRecruiter, Greenhouse,
              and Lever applicant tracking systems (ATS), with support for more portals being updated weekly.
            </p>
          </details>

          <details className="faq-item" name="landing-faqs">
            <summary>Is my personal information secure?</summary>
            <p className="faq-content">
              Your security is our priority. We encrypt your personal data and documents during transit
              and at rest. OAuth tokens are stored securely, and we never sell your personal information or resume files to third-party data brokers.
            </p>
          </details>
        </div>
      </section>

      {/* ==================== CTA Banner Section ==================== */}
      <section className="landing-section" style={{ minHeight: "auto", padding: "60px 2rem" }}>
        <div className="oauth-card text-center" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))", textAlign: "center" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>Ready to Automate Your Job Search?</h2>
          <p className="section-subtitle" style={{ margin: "0 auto 2rem auto" }}>
            Sign in with Google to securely create your EasyNaukri profile, track your job applications, and save your resume preferences.
          </p>
          <Link to="/login" className="landing-btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
            Sign in with Google
          </Link>
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            By continuing, you agree to our <Link to="/privacy" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Privacy Policy</Link> and <Link to="/terms" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Terms of Service</Link>.
          </p>
        </div>
      </section>

      {/* ==================== Footer ==================== */}
      <footer id="footer" className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>EasyNaukri</h3>
            <p>EasyNaukri is an automated job application & resume matching platform. Streamline your job search, optimize your resume, and track applications effortlessly.</p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/easynaukri.online"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
                title="Follow EasyNaukri on Instagram (@easynaukri.online)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "17px", height: "17px" }}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="X (Twitter)">𝕏</a>
              <a href="#" className="footer-social-link" aria-label="GitHub">🐙</a>
              <a
                href="https://www.linkedin.com/company/easynaukri/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="LinkedIn"
                title="Follow EasyNaukri on LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><a href="#what-we-do">Features</a></li>
              <li className="footer-link-item"><a href="#pricing">Pricing Plans</a></li>
              <li className="footer-link-item"><a href="#google-oauth">OAuth & Privacy</a></li>
              <li className="footer-link-item"><a href="#faqs">Q&A Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/privacy">Privacy Policy</Link></li>
              <li className="footer-link-item"><Link to="/terms">Terms of Service</Link></li>
              <li className="footer-link-item"><a href="#google-oauth">Security Audits</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company & Social</h4>
            <ul className="footer-links">
              <li className="footer-link-item">
                <a
                  href="https://www.linkedin.com/company/easynaukri/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <span>💼</span> LinkedIn
                </a>
              </li>
              <li className="footer-link-item">
                <a
                  href="https://www.instagram.com/easynaukri.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <span>📷</span> Instagram
                </a>
              </li>
              <li className="footer-link-item"><Link to="/about">About Us</Link></li>
              <li className="footer-link-item"><Link to="/careers">Careers</Link></li>
              <li className="footer-link-item"><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "center" }}>
          <span>© {new Date().getFullYear()} EasyNaukri. All rights reserved.</span>
          <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>Made with ❤️ by an Indian for India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
