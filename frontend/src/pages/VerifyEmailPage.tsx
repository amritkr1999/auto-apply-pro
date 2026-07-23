import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./login.css";
import { profileService } from "../features/profile/services/profileService";

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const tokenParam = params.get("token");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (tokenParam) {
      setToken(tokenParam);
      // Auto-verify if both email and token exist in URL
      if (emailParam) {
        autoVerify(emailParam, tokenParam);
      }
    }
  }, [location.search]);

  const autoVerify = async (emailVal: string, tokenVal: string) => {
    setLoading(true);
    setError("");
    try {
      const userData = await profileService.verifyEmail(emailVal, tokenVal);
      setSuccess(true);
      localStorage.setItem("user", JSON.stringify(userData));
      setTimeout(() => {
        if (userData.role === "RECRUITER") {
          navigate("/recruiter-dashboard");
        } else if (userData.role === "COMPANY") {
          navigate("/company-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to verify email. The code may have expired or is invalid.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      setError("Please provide both email and 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const userData = await profileService.verifyEmail(email, token);
      setSuccess(true);
      localStorage.setItem("user", JSON.stringify(userData));
      setTimeout(() => {
        if (userData.role === "RECRUITER") {
          navigate("/recruiter-dashboard");
        } else if (userData.role === "COMPANY") {
          navigate("/company-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to verify email. Please check your verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend the code.");
      return;
    }
    setResending(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await profileService.resendVerification(email);
      setInfoMessage(res.message || "A new 6-digit verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
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
        <header className="auth-header">
          <h1 className="auth-logo">Auto Apply Pro</h1>
          <p className="auth-subtitle">Email Verification</p>
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

        {infoMessage && (
          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "#60a5fa",
              fontSize: "0.85rem",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "1.25rem",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {infoMessage}
          </div>
        )}

        {success ? (
          <div className="auth-form" style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                fontSize: "0.95rem",
                padding: "18px",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontWeight: 500,
                lineHeight: "1.5",
              }}
            >
              🎉 Email Verified Successfully! Redirecting you to your dashboard...
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleManualSubmit}>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: "1.25rem", textAlign: "center" }}>
              Please enter your registered email and the 6-digit verification code sent to your inbox (valid for 15 minutes).
            </p>

            <div className="auth-group">
              <label className="auth-label" htmlFor="verify-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="verify-email"
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

            <div className="auth-group">
              <label className="auth-label" htmlFor="verify-token">
                6-Digit Verification Code
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="verify-token"
                  type="text"
                  className="auth-input"
                  placeholder="123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  maxLength={10}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading || !email || !token}>
              {loading ? "Verifying..." : "Verify & Activate Account"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="forgot-link"
                onClick={handleResend}
                disabled={resending || !email}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {resending ? "Resending code..." : "Resend Code"}
              </button>

              <Link to="/login" className="forgot-link" style={{ fontSize: "0.85rem" }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
