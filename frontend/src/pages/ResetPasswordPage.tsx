import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./login.css";
import { profileService } from "../features/profile/services/profileService";
import { isValidBasicPassword } from "../utils/validation";

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Reset token is missing from the link. Please request a new reset link.");
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new password reset email.");
      return;
    }
    if (!isValidBasicPassword(newPassword)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await profileService.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or is invalid.");
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
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center justify-center shrink-0">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 font-black text-base select-none">EN</span>
            </span>
            <h1 className="auth-logo !mb-0">EasyNaukri</h1>
          </div>
          <p className="auth-subtitle">Choose a new password</p>
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
              🎉 Password reset successfully! You can now log in using your new credentials.
            </div>
            <Link to="/login" className="auth-submit-btn" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
              Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-group">
              <label className="auth-label" htmlFor="new-password">
                New Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={!token}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-group">
              <label className="auth-label" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || !token}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || !token}>
              {loading ? "Updating password..." : "Reset Password"}
            </button>

            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link to="/login" className="forgot-link" style={{ fontSize: "0.85rem" }}>
                Cancel and back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
