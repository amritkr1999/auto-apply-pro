import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./login.css";
import { profileService } from "../features/profile/services/profileService";
import { API_BASE } from "../config/api";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { useAnalytics } from "../context/AnalyticsContext";
import { useAuth } from "../context/AuthContext";
import { isValidEmail, isValidPhone, isValidBasicPassword } from "../utils/validation";
import { SEOHead } from "../components/SEOHead";

type AuthTab = "login" | "register";
type UserRole = "candidate" | "recruiter" | "company";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  const { login: authLogin, isAuthenticated, user } = useAuth();

  const getRedirectTarget = (role?: string) => {
    const fromPath = (location.state as any)?.from?.pathname || (location.state as any)?.from;
    if (typeof fromPath === "string" && fromPath && fromPath !== "/login" && fromPath !== "/") {
      return fromPath;
    }
    if (role === "RECRUITER") {
      return "/recruiter-dashboard";
    }
    if (role === "COMPANY") {
      return "/company-dashboard";
    }
    return "/dashboard";
  };

  // Tab State: 'login' or 'register'
  const [tab, setTab] = useState<AuthTab>(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    return tabParam === "register" ? "register" : "login";
  });

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      const id = params.get("id");
      const email = params.get("email");
      const name = params.get("name");
      const role = params.get("role");
      const loginStreak = params.get("loginStreak");
      const mobile = params.get("mobile");
      
      const userData = {
        token,
        id: Number(id),
        email: email ? decodeURIComponent(email) : "",
        name: name ? decodeURIComponent(name) : "",
        role: role || "CANDIDATE",
        loginStreak: loginStreak && loginStreak !== "null" ? Number(loginStreak) : 1,
        mobile: mobile ? decodeURIComponent(mobile) : "",
        isPendingDeletion: false
      };
      
      authLogin(userData);
      trackEvent("login_success", { method: "oauth", role: userData.role });
      
      const targetPath = getRedirectTarget(userData.role);
      window.location.replace(targetPath);
      return;
    }

    if (isAuthenticated) {
      const targetPath = getRedirectTarget(user?.role);
      window.location.replace(targetPath);
      return;
    }

    const errorMsg = params.get("errorMsg");
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }

    const tabParam = params.get("tab");
    if (tabParam === "register" || tabParam === "login") {
      setTab(tabParam);
    }
  }, [location.search, navigate, isAuthenticated, user]);

  // Registration step state: 1 (role selection) or 2 (details form)
  const [regStep, setRegStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Form Field States
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const [registerFormData, setRegisterFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Show/Hide password states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Error States
  const [error, setError] = useState<string | null>(null);

  // Registration Submitting & Multi-Step Loader State
  const [isRegisteringSubmit, setIsRegisteringSubmit] = useState<boolean>(false);
  const [regProgressStage, setRegProgressStage] = useState<number>(1);

  // Account Recovery States
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreError, setRestoreError] = useState<string>("");

  // Email Verification States
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isVerifyingSubmit, setIsVerifyingSubmit] = useState<boolean>(false);
  const [isResendingCode, setIsResendingCode] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string>("");

  const handleTabChange = (newTab: AuthTab) => {
    setTab(newTab);
    setError("");
    // Reset steps if switching
    if (newTab === "register") {
      setRegStep(1);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    if (role !== "candidate") {
      setError("Registration for Recruiter and Company profiles is currently disabled. Please select Candidate.");
      return;
    }
    setSelectedRole("candidate");
    setRegStep(2);
    setError("");
  };

  const handleRoleContinue = () => {
    if (!selectedRole || selectedRole !== "candidate") {
      setError("Only Candidate profile registration is currently available.");
      return;
    }
    setRegStep(2);
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginFormData.email || !loginFormData.password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!isValidEmail(loginFormData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      setError("");
      const userData = await profileService.login({
        email: loginFormData.email,
        password: loginFormData.password,
      });
      
      if (userData.isPendingDeletion) {
        setPendingUser(userData);
        setShowRecoveryModal(true);
        return;
      }

      authLogin(userData, rememberMe);
      trackEvent("login_success", { method: "credentials", role: userData.role });
      
      const targetPath = getRedirectTarget(userData.role);
      window.location.replace(targetPath);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      trackEvent("login_failed", { method: "credentials", error: err.message || "Unknown error" });
    }
  };

  const handleRestoreAccount = async () => {
    if (!pendingUser) return;
    setIsRestoring(true);
    setRestoreError("");
    try {
      const response = await fetch("/api/v1/profiles/cancel-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${pendingUser.token || ""}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to restore account.");
      }

      // Success: Save user to localStorage and navigate to dashboard
      const activeUser = { ...pendingUser, isPendingDeletion: false, deletionScheduledAt: null };
      authLogin(activeUser);
      setShowRecoveryModal(false);
      setPendingUser(null);
      
      alert("Welcome back! Your account deletion has been cancelled successfully.");
      
      const targetPath = getRedirectTarget(activeUser.role);
      window.location.replace(targetPath);
    } catch (err: any) {
      setRestoreError(err.message || "Failed to restore account. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, mobile, email, password, confirmPassword } = registerFormData;
    if (!fullName || !mobile || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(mobile)) {
      setError("Please enter a valid mobile phone number (7 to 15 digits).");
      return;
    }
    if (!isValidBasicPassword(password)) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsRegisteringSubmit(true);
    setRegProgressStage(1);
    setError("");

    // Automatically advance registration stages during backend network request
    const stageTimer = setInterval(() => {
      setRegProgressStage((prev) => (prev < 4 ? prev + 1 : prev));
    }, 850);

    try {
      const userData = await profileService.register({
        name: fullName,
        email,
        mobile,
        password,
        role: selectedRole?.toUpperCase(),
      });

      clearInterval(stageTimer);
      setRegProgressStage(5); // All steps completed

      setTimeout(() => {
        setIsRegisteringSubmit(false);
        if (userData.requiresVerification) {
          setIsVerifyingEmail(true);
          setRegStep(3);
          if ((userData as any).devVerificationCode) {
            setVerificationCode((userData as any).devVerificationCode);
          }
          trackEvent("registration_verification_required", { email: registerFormData.email });
        } else {
          authLogin(userData);
          if (userData.token) {
            localStorage.setItem("token", userData.token);
          }
          trackEvent("registration_success", { role: userData.role });
          
          const targetPath = getRedirectTarget(userData.role);
          window.location.replace(targetPath);
        }
      }, 500);
    } catch (err: any) {
      clearInterval(stageTimer);
      setIsRegisteringSubmit(false);
      setError(err.message || "Registration failed. Please try again.");
      trackEvent("registration_failed", { error: err.message || "Unknown error" });
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setIsVerifyingSubmit(true);
    setError("");
    setResendSuccessMessage("");

    try {
      const userData = await profileService.verifyEmail(registerFormData.email, verificationCode);
      authLogin(userData);
      trackEvent("email_verification_success", { role: userData.role });

      const targetPath = getRedirectTarget(userData.role);
      window.location.replace(targetPath);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please check the code and try again.");
      trackEvent("email_verification_failed", { error: err.message });
    } finally {
      setIsVerifyingSubmit(false);
    }
  };

  const handleResendCode = async () => {
    if (!registerFormData.email) {
      setError("Email address is missing.");
      return;
    }
    setIsResendingCode(true);
    setError("");
    setResendSuccessMessage("");

    try {
      const res = await profileService.resendVerification(registerFormData.email);
      setResendSuccessMessage(res.message || "A new verification code has been sent to your email address.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    console.log(`Authenticating with ${provider}...`);
    trackEvent("social_auth_initiated", { provider });
    const providerLower = provider.toLowerCase();
    if (providerLower === "google" || providerLower === "github" || providerLower === "linkedin") {
      try {
        setError("");
        const API_BASE_V1 = `${API_BASE}/v1`;
        const response = await fetch(`${API_BASE_V1}/auth/login/${providerLower}`);
        if (!response.ok) {
          throw new Error(`Failed to get ${provider} login URL`);
        }
        const redirectUrl = await response.text();
        console.log(`Redirecting to ${provider} OAuth URL:`, redirectUrl);
        window.location.href = redirectUrl;
      } catch (err: any) {
        setError(err.message || `Failed to initiate ${provider} login.`);
        trackEvent("login_failed", { method: `oauth_${providerLower}`, error: err.message || "Unknown error" });
      }
    } else {
      const email = `social.${providerLower}@example.com`;
      const password = "social-password-123";
      try {
        setError("");
        let userData;
        try {
          userData = await profileService.register({
            name: `Social ${provider} User`,
            email,
            mobile: "1234567890",
            password,
            role: "CANDIDATE",
          });
        } catch (err: any) {
          if (err.message && err.message.includes("already in use")) {
            userData = await profileService.login({ email, password });
          } else {
            throw err;
          }
        }
        authLogin(userData);
        const targetPath = getRedirectTarget(userData.role);
        window.location.replace(targetPath);
      } catch (err: any) {
        setError(err.message || "Social login failed.");
      }
    }
  };

  return (
    <div className="auth-page-root">
      <SEOHead
        title={tab === "register" ? "Create an Account | EasyNaukri" : "Sign In | EasyNaukri"}
        description="Sign in or register for EasyNaukri to access automated resume matching, AI job applications, and candidate outreach tools."
        canonicalUrl="https://easynaukri.online/login"
      />
      <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", zIndex: 50 }}>
        <DarkModeToggle tooltipPosition="left" />
      </div>

      {/* Background Orbs */}
      <div className="auth-bg-glow">
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>
      </div>

      <div className="auth-container">
        {/* Descriptive Multi-Step Registration Progress Overlay */}
        {isRegisteringSubmit && (
          <div className="reg-loader-overlay">
            <div className="reg-loader-card">
              <div className="reg-loader-badge">
                <span className="reg-loader-badge-pulse"></span>
                Setting up account
              </div>
              <h2 className="reg-loader-title">Setting Up Your Account</h2>
              <p className="reg-loader-subtitle">
                Please wait a moment while we provision your credentials and initialize your profile.
              </p>

              {/* Progress Bar */}
              <div className="reg-progress-bar-track">
                <div
                  className="reg-progress-bar-fill"
                  style={{ width: `${Math.min(regProgressStage * 20, 100)}%` }}
                ></div>
              </div>

              {/* Step Checklist */}
              <div className="reg-steps-list">
                {[
                  {
                    id: 1,
                    title: "Validating Account Details",
                    desc: "Checking email availability & password complexity..."
                  },
                  {
                    id: 2,
                    title: "Creating Secure Account",
                    desc: "Encrypting credentials and creating record in database..."
                  },
                  {
                    id: 3,
                    title: `Initializing ${selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : "Candidate"} Profile`,
                    desc: "Setting up default workspace preferences and candidate profile..."
                  },
                  {
                    id: 4,
                    title: "Dispatching Welcome Package",
                    desc: "Generating JWT authentication token & welcome instructions..."
                  },
                  {
                    id: 5,
                    title: "Finalizing Workspace Setup",
                    desc: "Redirecting you directly to your customized dashboard..."
                  }
                ].map((step) => {
                  const isCompleted = regProgressStage > step.id;
                  const isActive = regProgressStage === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`reg-step-item ${
                        isCompleted ? "completed" : isActive ? "active" : "pending"
                      }`}
                    >
                      <div className="reg-step-icon-container">
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : isActive ? (
                          <div className="reg-step-spinner" />
                        ) : (
                          <span style={{ fontSize: "0.75rem", fontWeight: "700" }}>{step.id}</span>
                        )}
                      </div>
                      <div className="reg-step-content">
                        <span className="reg-step-label">{step.title}</span>
                        <span className="reg-step-desc">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Logo Header */}
        <header className="auth-header">
          <div className="flex items-center justify-center mb-3">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="w-16 h-16 rounded-2xl object-contain shadow-md select-none" />
          </div>
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
            disabled={isRegisteringSubmit}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
            disabled={isRegisteringSubmit}
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
              color: "#ef4444",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              textAlign: "center"
            }}
          >
            <div>{error}</div>
            {error.toLowerCase().includes("not verified") && (
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setIsVerifyingEmail(true);
                  setRegStep(3);
                }}
                style={{
                  marginTop: "8px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Verify Email Now
              </button>
            )}
          </div>
        )}

        {/* ==================== LOGIN FLOW ==================== */}
        {tab === "login" && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-group">
              <label className="auth-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={loginFormData.email}
                  onChange={(e) => setLoginFormData((prev) => ({ ...prev, email: e.target.value }))}
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
                  value={loginFormData.password}
                  onChange={(e) => setLoginFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div className="auth-remember-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
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
                    onClick={() => !isRegisteringSubmit && handleRoleSelect("candidate")}
                  >
                    <div className="role-icon-wrapper" style={{ color: "var(--candidate-color)" }}>
                      🎓
                    </div>
                    <div className="role-meta">
                      <div className="role-name-header">
                        <h3 className="role-name">Candidate</h3>
                      </div>
                      <p className="role-description">
                        Apply to roles, build resume profiles, and schedule automation.
                      </p>
                    </div>
                    <div className="role-radio-indicator" style={{ color: "var(--candidate-color)" }}></div>
                  </div>

                  <div
                    className="role-card disabled recruiter"
                    onClick={() =>
                      setError("Recruiter registration is currently disabled. Please register as a Candidate.")
                    }
                    title="Recruiter registration is currently disabled"
                  >
                    <div className="role-icon-wrapper" style={{ color: "#94a3b8" }}>
                      💼
                    </div>
                    <div className="role-meta">
                      <div className="role-name-header">
                        <h3 className="role-name" style={{ color: "#64748b" }}>Recruiter</h3>
                        <span className="coming-soon-badge">Coming Soon</span>
                      </div>
                      <p className="role-description">
                        Discover matching candidates and manage application outreach.
                      </p>
                    </div>
                    <div className="role-radio-indicator disabled"></div>
                  </div>

                  <div
                    className="role-card disabled company"
                    onClick={() =>
                      setError("Company registration is currently disabled. Please register as a Candidate.")
                    }
                    title="Company registration is currently disabled"
                  >
                    <div className="role-icon-wrapper" style={{ color: "#94a3b8" }}>
                      🏢
                    </div>
                    <div className="role-meta">
                      <div className="role-name-header">
                        <h3 className="role-name" style={{ color: "#64748b" }}>Company</h3>
                        <span className="coming-soon-badge">Coming Soon</span>
                      </div>
                      <p className="role-description">
                        Manage corporate postings and scale recruitment pipelines.
                      </p>
                    </div>
                    <div className="role-radio-indicator disabled"></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={handleRoleContinue}
                  disabled={!selectedRole || isRegisteringSubmit}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Details Registration Form */}
            {regStep === 2 && !isVerifyingEmail && (
              <form className={`auth-form ${isRegisteringSubmit ? "submitting" : ""}`} onSubmit={handleRegisterSubmit}>
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
                      value={registerFormData.fullName}
                      onChange={(e) => setRegisterFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      disabled={isRegisteringSubmit}
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
                      value={registerFormData.mobile}
                      onChange={(e) => setRegisterFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                      disabled={isRegisteringSubmit}
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
                      value={registerFormData.email}
                      onChange={(e) => setRegisterFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={isRegisteringSubmit}
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
                      type={showRegPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="••••••••"
                      value={registerFormData.password}
                      onChange={(e) => setRegisterFormData((prev) => ({ ...prev, password: e.target.value }))}
                      disabled={isRegisteringSubmit}
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                      disabled={isRegisteringSubmit}
                    >
                      {showRegPassword ? (
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
                  <label className="auth-label" htmlFor="reg-confirm">
                    Confirm Password
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-confirm"
                      type={showRegConfirmPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="••••••••"
                      value={registerFormData.confirmPassword}
                      onChange={(e) => setRegisterFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isRegisteringSubmit}
                      required
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                      disabled={isRegisteringSubmit}
                    >
                      {showRegConfirmPassword ? (
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

                <button type="submit" className="auth-submit-btn" disabled={isRegisteringSubmit}>
                  {isRegisteringSubmit ? (
                    <>
                      <span className="btn-spinner"></span> Creating Account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>

                <button
                  type="button"
                  className="form-back-btn"
                  onClick={() => setRegStep(1)}
                  disabled={isRegisteringSubmit}
                >
                  ← Back to role selection
                </button>
              </form>
            )}

            {/* Step 3: Verification Code Form */}
            {(regStep === 3 || isVerifyingEmail) && (
              <form className="auth-form" onSubmit={handleVerifyEmail}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✉️</div>
                  <h3 style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    Verify Your Email Address
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5" }}>
                    We've sent a 6-digit verification code to <strong style={{ color: "#e2e8f0" }}>{registerFormData.email}</strong>.<br />
                    Please enter the code below to activate your account. Code expires in 15 minutes.
                  </p>
                </div>

                {resendSuccessMessage && (
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
                    }}
                  >
                    {resendSuccessMessage}
                  </div>
                )}

                <div className="auth-group">
                  <label className="auth-label" htmlFor="reg-verification-code">
                    6-Digit Verification Code (OTP)
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reg-verification-code"
                      type="text"
                      className="auth-input"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={10}
                      disabled={isVerifyingSubmit}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isVerifyingSubmit || !verificationCode}>
                  {isVerifyingSubmit ? (
                    <>
                      <span className="btn-spinner"></span> Verifying...
                    </>
                  ) : (
                    "Verify & Activate Account"
                  )}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={handleResendCode}
                    disabled={isResendingCode}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.85rem" }}
                  >
                    {isResendingCode ? "Resending..." : "Resend Verification Code"}
                  </button>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => {
                      setIsVerifyingEmail(false);
                      setRegStep(2);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.85rem" }}
                  >
                    Change Details
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="social-divider">
          <span>Sign in with Google</span>
        </div>

        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary, #94a3b8)", marginBottom: "1rem", lineHeight: "1.5" }}>
          <p style={{ marginBottom: "6px" }}>
            Signing in with Google authenticates your account profile (<code>openid</code>, <code>email</code>, <code>profile</code>) and authorizes Gmail send permission (<code>https://www.googleapis.com/auth/gmail.send</code>) strictly to dispatch user-authorized job application outreach emails to recruiters.
          </p>
          <p>
            By continuing, you agree to EasyNaukri's{" "}
            <Link to="/privacy" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "underline" }}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "underline" }}>
              Terms of Service
            </Link>.
          </p>
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

      {/* Account Deletion Intercept Modal */}
      {showRecoveryModal && pendingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" style={{ color: "#334155" }}>
            <div className="p-6">
              <div className="flex items-center space-x-2 text-amber-600 mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-slate-800">Account Scheduled for Deletion</h3>
              </div>

              <div className="text-sm text-slate-600 space-y-3">
                <p>
                  This account is currently deactivated and scheduled for permanent erasure on:
                </p>
                <p className="font-mono text-center font-bold bg-amber-50 text-amber-800 py-2 border border-amber-200 rounded-lg text-sm">
                  {new Date(pendingUser.deletionScheduledAt).toLocaleString()}
                </p>
                <p>
                  Logging in will automatically keep your account deactivated unless you restore it. 
                  Would you like to cancel the deletion request and restore access to your profile?
                </p>
              </div>

              {restoreError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-600 rounded-lg">
                  {restoreError}
                </div>
              )}

              <div className="mt-6 flex flex-col space-y-2">
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleRestoreAccount}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-btn transition-colors shadow-sm flex items-center justify-center disabled:opacity-50"
                >
                  {isRestoring ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Restoring Account...
                    </>
                  ) : (
                    "Yes, Restore My Account"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setPendingUser(null);
                  }}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm rounded-btn transition-colors"
                >
                  Cancel & Keep Scheduled for Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
