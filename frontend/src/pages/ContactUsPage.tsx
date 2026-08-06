import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../features/profile/services/profileService";

export const ContactUsPage: React.FC = () => {
  const { toggleTheme, resolvedTheme } = useTheme();
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // Graceful fallback if outside AuthProvider
  }
  const user = authContext?.user || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Auto-fill user details if logged in (from AuthContext, localStorage, and candidate profile)
  useEffect(() => {
    let localUser = user;
    if (!localUser) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) localUser = JSON.parse(stored);
      } catch (err) {
        // ignore parse error
      }
    }

    if (localUser) {
      if (localUser.name) setName(localUser.name);
      if (localUser.email) setEmail(localUser.email);
      if (localUser.mobile || localUser.phone) setPhone(localUser.mobile || localUser.phone);

      if (localUser.id) {
        profileService
          .getCandidateProfile(localUser.id)
          .then((prof) => {
            if (prof) {
              if (prof.name && !name) setName(prof.name);
              if (prof.email && !email) setEmail(prof.email);
              if (prof.mobile && !phone) setPhone(prof.mobile);

            }
          })
          .catch((err) => {
            console.debug("Could not fetch candidate profile for prefilling:", err);
          });
      }
    }
  }, [user]);


  const handleCopyEmail = (emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(emailStr);
    setTimeout(() => setCopiedEmail(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setErrorMsg("Please provide your email address and message content.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/v1/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || "Anonymous User",
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim() || category,
          category,
          message: message.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(data.message || "Thank you! Your message has been sent successfully.");
        setMessage("");
        if (!user) {
          setName("");
          setEmail("");
          setPhone("");
          setSubject("");
        }
      } else {
        setErrorMsg(data.message || "Failed to submit message. Please try sending directly to support@easynaukri.online.");
      }
    } catch (err: any) {
      console.error("Error submitting contact form:", err);
      setErrorMsg("Network connection error. Please try again or email us directly at support@easynaukri.online.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNumber = "918789498334";
  const whatsappPrefilledMessage = encodeURIComponent(
    `Hello EasyNaukri Team! 👋\nI need support with ${category}.\nName: ${name || "User"}\nEmail: ${email || "Not specified"}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappPrefilledMessage}`;


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity flex items-center gap-2.5 shrink-0" aria-label="EasyNaukri Home">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="h-9 w-9 rounded-xl object-contain shadow-xs select-none" />
            <span className="hidden sm:inline-block font-extrabold text-xl tracking-tight text-slate-900 dark:text-white select-none whitespace-nowrap">EasyNaukri</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              to={user ? "/dashboard" : "/"}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {user ? "Back to Dashboard" : "Back to Home"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Banner Section */}
        <div className="mb-10 text-center sm:text-left bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>24/7 Support Available • Fast Response</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-3xl leading-relaxed">
            Have questions about your automated job applications, subscription plans, resume matching, or technical support? Connect with our team anytime via WhatsApp, Email, or the contact form below.
          </p>
        </div>

        {/* Channels Grid: WhatsApp & Email Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp Support Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-emerald-500/20">
                  💬
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Instant Response
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">WhatsApp Support</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Chat directly with our support team on WhatsApp. Get quick assistance with setup, billing, or job outreach guidance.
              </p>
            </div>
            <div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-5 rounded-2xl transition-all shadow-md hover:shadow-emerald-600/30 text-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Chat on WhatsApp (+91 87894 98334)
              </a>
            </div>
          </div>

          {/* Email Support Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-600/20">
                  ✉️
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  SLA: &lt; 2 Hours
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Direct Email Desk</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                Reach out to our customer care and support email channels directly for detailed requests or document sharing.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Support Desk:</span>
                  <div className="flex items-center gap-2">
                    <a href="mailto:support@easynaukri.online" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                      support@easynaukri.online
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail("support@easynaukri.online")}
                      className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-200 transition-colors"
                    >
                      {copiedEmail === "support@easynaukri.online" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Care:</span>
                  <div className="flex items-center gap-2">
                    <a href="mailto:care@easynaukri.online" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                      care@easynaukri.online
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail("care@easynaukri.online")}
                      className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-200 transition-colors"
                    >
                      {copiedEmail === "care@easynaukri.online" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <a
                href="mailto:support@easynaukri.online?subject=EasyNaukri%20Support%20Request"
                className="inline-flex items-center justify-center gap-2.5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-2xl transition-all shadow-md hover:shadow-indigo-600/30 text-sm active:scale-[0.98]"
              >
                Send Direct Email
              </a>
            </div>
          </div>
        </div>

        {/* Official Social & Community Channels */}
        <div className="mb-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
              Connect With Our Official Communities
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Follow our official channels for real-time job market tips, product releases, roadmap updates, and community discussions.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="https://www.linkedin.com/company/easynaukri/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group text-center"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">💼</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">LinkedIn</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">@easynaukri</span>
            </a>
            <a
              href="https://www.instagram.com/easynaukri.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all group text-center"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📷</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Instagram</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">@easynaukri.online</span>
            </a>
            <a
              href="https://x.com/EasyNaukrii"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-slate-900 dark:hover:border-white hover:shadow-md transition-all group text-center"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">𝕏</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">X (Twitter)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">@EasyNaukrii</span>
            </a>
            <a
              href="https://www.reddit.com/r/EasyNaukri/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group text-center"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🤖</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Reddit Hub</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">r/EasyNaukri</span>
            </a>
          </div>
        </div>

        {/* Contact Form Section */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Send Us a Message
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Fill out the form below and our dedicated support team will review your inquiry immediately.
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                <p className="text-xs mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="font-bold text-sm">Submission Error</h4>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Phone / WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Inquiry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support & Issue Report</option>
                  <option value="Resume & AI Match">Resume & AI Job Matching</option>
                  <option value="Billing & Pricing">Billing, Refunds & Subscriptions</option>
                  <option value="Enterprise & Recruiter">Recruiter & Enterprise Partnership</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Message Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-colors resize-y"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                🔒 Your contact details are stored securely according to our{" "}
                <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 underline">
                  Privacy Policy
                </Link>.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[180px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-indigo-600/30 text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Submit Message"
                )}
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/branding/easynaukri_logo.png" alt="EasyNaukri Logo" className="w-5 h-5 rounded-md object-contain select-none" />
            <span>© {new Date().getFullYear()} EasyNaukri. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">About Us</Link>
            <Link to="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Careers</Link>
            <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold">Contact Us</Link>
            <a href="https://www.linkedin.com/company/easynaukri/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"><span>💼</span> LinkedIn</a>
            <a href="https://www.instagram.com/easynaukri.online" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"><span>📷</span> Instagram</a>
            <a href="https://x.com/EasyNaukrii" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"><span>𝕏</span> X</a>
            <a href="https://www.reddit.com/r/EasyNaukri/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"><span>🤖</span> Reddit</a>
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUsPage;
