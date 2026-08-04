import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import { profileService } from "../features/profile/services/profileService";
import { isValidEmail } from "../utils/validation";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await profileService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Background Orbs */}
      <div className="auth-bg-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      <div className="auth-container">
        {/* Logo Header */}
        <header className="auth-header">
          <div className="flex items-center justify-center mb-3">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="w-16 h-16 rounded-2xl object-contain shadow-md select-none" />
          </div>
          <p className="auth-subtitle">Recover your account password</p>
        </header>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              fontSize: "0.85rem",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "1.25rem",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="auth-form" style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                fontSize: "0.9rem",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontWeight: 500,
                lineHeight: "1.5",
              }}
            >
              🎉 If your email is registered in our system, a password reset link has been dispatched to it.
              <br />
              <small style={{ display: "block", marginTop: "10px", color: "var(--text-secondary)" }}>
                (For development/testing, the link is also printed in the backend terminal console logs.)
              </small>
            </div>
            <Link to="/login" className="auth-submit-btn" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem", textAlign: "center", lineHeight: "1.4" }}>
              Enter the email address associated with your account, and we will send you a password reset link.
            </p>

            <div className="auth-group">
              <label className="auth-label" htmlFor="forgot-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="forgot-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>

            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link to="/login" className="forgot-link" style={{ fontSize: "0.85rem" }}>
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
