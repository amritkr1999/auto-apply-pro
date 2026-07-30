import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./landing.css";
import { feedbackService } from "../features/profile/services/feedbackService";
import type { FeedbackResponse } from "../features/profile/services/feedbackService";
import { useTheme } from "../context/ThemeContext";
import MobileAppComingSoonModal from "../components/MobileAppComingSoonModal";

export const MainLandingPage: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [activeSlide, setActiveSlide] = useState<string>("intro");
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);

  const slides = [
    { id: "intro", label: "Intro" },
    { id: "what-we-do", label: "Workflow Automation" },
    { id: "benefits", label: "Key Advantages" },
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
      { threshold: 0.4 }
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

  return (
    <div className="landing-root">
      {/* ==================== Navigation Navbar ==================== */}
      <nav className="landing-nav">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span>⚡</span> EasyNaukri
          </a>
          <ul className="nav-links">
            <li className="nav-link-item"><a href="#what-we-do">What We Do</a></li>
            <li className="nav-link-item"><a href="#benefits">Benefits</a></li>
            <li className="nav-link-item"><a href="#pricing">Plans</a></li>
            <li className="nav-link-item"><a href="#testimonials">Testimonials</a></li>
            <li className="nav-link-item"><a href="#faqs">FAQs</a></li>
          </ul>
          <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => setShowMobileAppModal(true)}
              className="landing-btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
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
            {user ? (
              <Link to={getDashboardPath()} className="landing-btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-btn btn-text">
                  Login
                </Link>
                <Link to="/login?tab=register" className="landing-btn btn-outline">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
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
              made the organization a breeze.
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
                <div className="testimonial-avatar bg-primary/10 text-primary font-bold">
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
            Find answers to commonly asked questions about our automation features and policies.
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
              and at rest. We never sell your personal information or resume files to third-party data brokers.
            </p>
          </details>
        </div>
      </section>

      {/* ==================== Footer ==================== */}
      <footer id="footer" className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>EasyNaukri</h3>
            <p>EasyNaukri is an automated job application & resume matching platform. Streamline your job search, optimize your resume, and track applications effortlessly.</p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="X (Twitter)">𝕏</a>
              <a href="#" className="footer-social-link" aria-label="GitHub">🐙</a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn">in</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><a href="#what-we-do">Features</a></li>
              <li className="footer-link-item"><a href="#pricing">Pricing Plans</a></li>
              <li className="footer-link-item"><a href="#faqs">Q&A Support</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/privacy">Privacy Policy</Link></li>
              <li className="footer-link-item"><Link to="/terms">Terms of Service</Link></li>
              <li className="footer-link-item"><a href="#">Security Audits</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><a href="#">About Us</a></li>
              <li className="footer-link-item"><a href="#">Careers</a></li>
              <li className="footer-link-item"><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 EasyNaukri. All rights reserved.</span>
          <span>Designed with high-fidelity glassmorphism.</span>
        </div>
      </footer>
    </div>
  );
};

export default MainLandingPage;
