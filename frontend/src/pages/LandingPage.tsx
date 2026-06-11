import React from "react";
import "./landing.css";

export const LandingPage: React.FC = () => {
  return (
    <main className="landing-root">
      <header className="hero">
        <div className="hero-inner">
          <h1 className="title">Auto Apply Pro</h1>
          <p className="subtitle">
            Automate your job applications and focus on interviews.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="#features">
              Explore features
            </a>
            <a className="btn" href="/dashboard">
              Go to dashboard
            </a>
          </div>
        </div>
        <div className="hero-graphic" aria-hidden>
          <div className="card">Your job hunt, simplified</div>
        </div>
      </header>

      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Automated Applications</h3>
            <p>Submit tailored applications to multiple roles quickly.</p>
          </div>
          <div className="feature">
            <h3>Smart Matching</h3>
            <p>Find roles that match your skills and preferences.</p>
          </div>
          <div className="feature">
            <h3>Track Progress</h3>
            <p>Monitor where you applied and upcoming interviews.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <small>© {new Date().getFullYear()} Auto Apply Pro</small>
      </footer>
    </main>
  );
};

export default LandingPage;
