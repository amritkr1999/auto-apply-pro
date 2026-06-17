import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { profileService } from "../features/profile/services/profileService";

type AuthTab = "login" | "register";
type UserRole = "candidate" | "recruiter" | "company";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Tab State: 'login' or 'register'
  const [tab, setTab] = useState<AuthTab>("login");

  // Registration step state: 1 (role selection) or 2 (details form)
  const [regStep, setRegStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Form Field States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // Show/Hide password states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Error States
  const [error, setError] = useState<string>("");

  const handleTabChange = (newTab: AuthTab) => {
    setTab(newTab);
    setError("");
    // Reset steps if switching
    if (newTab === "register") {
      setRegStep(1);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleRoleContinue = () => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }
    setRegStep(2);
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      setError("");
      const userData = await profileService.login({ email, password });
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (userData.role === "RECRUITER") {
        navigate("/recruiter-dashboard");
      } else if (userData.role === "COMPANY") {
        navigate("/company-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      const userData = await profileService.register({
        name,
        email,
        mobile,
        password,
        role: selectedRole?.toUpperCase(),
      });
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (userData.role === "RECRUITER") {
        navigate("/recruiter-dashboard");
      } else if (userData.role === "COMPANY") {
        navigate("/company-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Authenticating with ${provider}...`);
    // Mock user login for social auth
    const mockUser = {
      token: "mock-social-token",
      id: 999,
      email: `social.${provider.toLowerCase()}@example.com`,
      name: `Social ${provider} User`,
      mobile: "+1234567890",
      role: "CANDIDATE",
    };
    localStorage.setItem("user", JSON.stringify(mockUser));
    navigate("/candidate-dashboard");
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
          <h1 className="auth-logo">Auto Apply Pro</h1>
          <p className="auth-subtitle">
            {tab === "login"
              ? "Sign in to manage your job applications"
              : "Create an account to automate your applications"}
          </p>
        </header>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
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

        {/* ==================== LOGIN FLOW ==================== */}
        {tab === "login" && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-group">
              <label className="auth-label" htmlFor="login-email">
                Email / Username
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-group">
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-actions-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign In
            </button>
          </form>
        )}

        {/* ==================== REGISTER FLOW ==================== */}
        {tab === "register" && (
          <div>
            {/* Step 1: Role Selection */}
            {regStep === 1 && (
              <div>
                <h2 className="role-select-title">Select your profile role</h2>
                <div className="role-cards-grid">
                  <div
                    className={`role-card ${selectedRole === "candidate" ? "selected candidate" : ""}`}
                    onClick={() => handleRoleSelect("candidate")}
                  >
                    <div className="role-icon-wrapper" style={{ color: "var(--candidate-color)" }}>
                      🎓
                    </div>
                    <div className="role-meta">
                      <h3 className="role-name">Candidate</h3>
                      <p className="role-description">
                        Apply to roles, build resume profiles, and schedule automation.
                      </p>
                    </div>
                    <div className="role-radio-indicator" style={{ color: "var(--candidate-color)" }}></div>
                  </div>

                  <div
                    className={`role-card ${selectedRole === "recruiter" ? "selected recruiter" : ""}`}
                    onClick={() => handleRoleSelect("recruiter")}
                  >
                    <div className="role-icon-wrapper" style={{ color: "var(--recruiter-color)" }}>
                      💼
                    </div>
                    <div className="role-meta">
                      <h3 className="role-name">Recruiter</h3>
                      <p className="role-description">
                        Discover matching candidates and manage application outreach.
                      </p>
                    </div>
                    <div className="role-radio-indicator" style={{ color: "var(--recruiter-color)" }}></div>
                  </div>

                  <div
                    className={`role-card ${selectedRole === "company" ? "selected company" : ""}`}
                    onClick={() => handleRoleSelect("company")}
                  >
                    <div className="role-icon-wrapper" style={{ color: "var(--company-color)" }}>
                      🏢
                    </div>
                    <div className="role-meta">
                      <h3 className="role-name">Company</h3>
                      <p className="role-description">
                        Manage corporate postings and scale recruitment pipelines.
                      </p>
                    </div>
                    <div className="role-radio-indicator" style={{ color: "var(--company-color)" }}></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={handleRoleContinue}
                  disabled={!selectedRole}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Details Registration Form */}
            {regStep === 2 && (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-name"
                      type="text"
                      className="auth-input"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-mobile">
                    Mobile Number
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-mobile"
                      type="tel"
                      className="auth-input"
                      placeholder="+91 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-email">
                    Email ID
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-email"
                      type="email"
                      className="auth-input"
                      placeholder="jane.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-password"
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-confirm">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-confirm"
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                  Complete Registration
                </button>

                <button
                  type="button"
                  className="form-back-btn"
                  onClick={() => setRegStep(1)}
                >
                  ← Back to role selection
                </button>
              </form>
            )}
          </div>
        )}

        {/* Social Authentication Dividers & Buttons */}
        <div className="social-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-btn-row">
          <button
            type="button"
            className="social-auth-btn google"
            onClick={() => handleSocialAuth("Google")}
            aria-label="Sign in with Google"
          >
            <svg viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          </button>

          <button
            type="button"
            className="social-auth-btn github"
            onClick={() => handleSocialAuth("GitHub")}
            aria-label="Sign in with GitHub"
          >
            <svg viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>

          <button
            type="button"
            className="social-auth-btn linkedin"
            onClick={() => handleSocialAuth("LinkedIn")}
            aria-label="Sign in with LinkedIn"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
