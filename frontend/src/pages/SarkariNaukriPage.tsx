import React, { useState } from "react";

// Icons
const BellIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const BookOpenIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CalculatorIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const FileCheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface GovtNotification {
  id: string;
  title: string;
  department: string;
  sector: "Central" | "State" | "Railways" | "Banking" | "Defense";
  vacancies: string;
  eligibility: string;
  ageLimit: string;
  lastDate: string;
  status: "Expected Soon" | "Draft Gazette" | "Annual Calendar";
  tagColor: string;
}

const mockNotifications: GovtNotification[] = [
  {
    id: "ssc-cgl-2026",
    title: "SSC CGL 2026 (Combined Graduate Level Exam)",
    department: "Staff Selection Commission",
    sector: "Central",
    vacancies: "~14,500 Posts",
    eligibility: "Any Bachelor's Degree",
    ageLimit: "18 to 30 / 32 Years",
    lastDate: "Notification Expected Oct 2026",
    status: "Annual Calendar",
    tagColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
  },
  {
    id: "upsc-cse-2026",
    title: "UPSC Civil Services Examination 2026 (IAS / IFS / IPS)",
    department: "Union Public Service Commission",
    sector: "Central",
    vacancies: "~1,050 Posts",
    eligibility: "Graduate in any discipline",
    ageLimit: "21 to 32 Years (6 Attempts for Gen)",
    lastDate: "Notification Expected Feb 2027",
    status: "Annual Calendar",
    tagColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  },
  {
    id: "rrb-ntpc-2026",
    title: "RRB NTPC Non-Technical Popular Categories",
    department: "Indian Railways Recruitment Board",
    sector: "Railways",
    vacancies: "~11,550 Posts",
    eligibility: "12th Pass / Graduate",
    ageLimit: "18 to 33 Years",
    lastDate: "Draft Release Phase",
    status: "Expected Soon",
    tagColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
  },
  {
    id: "ibps-po-xv",
    title: "IBPS PO / Management Trainee XV Recruitment",
    department: "Institute of Banking Personnel Selection",
    sector: "Banking",
    vacancies: "~4,200 Posts",
    eligibility: "Graduate + Computer Literacy",
    ageLimit: "20 to 30 Years",
    lastDate: "Expected Sep 2026",
    status: "Draft Gazette",
    tagColor: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
  },
  {
    id: "nda-cds-2026",
    title: "UPSC CDS II Exam 2026 (IMA, INA, AFA, OTA)",
    department: "Ministry of Defence / UPSC",
    sector: "Defense",
    vacancies: "~460 Posts",
    eligibility: "Degree / B.E / B.Tech",
    ageLimit: "19 to 24 Years",
    lastDate: "Upcoming Calendar",
    status: "Annual Calendar",
    tagColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
  }
];

export const SarkariNaukriPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"updates" | "syllabus" | "learning" | "eligibility" | "vault">("updates");
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedExamSyllabus, setSelectedExamSyllabus] = useState<"ssc" | "upsc" | "rrb" | "ibps">("ssc");

  // Eligibility Calculator state
  const [dob, setDob] = useState("1998-05-15");
  const [category, setCategory] = useState<"GEN" | "OBC" | "SC_ST" | "EWS" | "PWBD">("OBC");
  const [qualification, setQualification] = useState<"10th" | "12th" | "Graduate" | "Engineering">("Graduate");
  const [calcResult, setCalcResult] = useState<{ ageYears: number; ageMonths: number; categoryRelaxation: number; maxAllowedAge: number } | null>(null);

  // PYQ Answer Reveals
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
    }
  };

  const handleCalculateEligibility = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date("2026-08-17"); // Using consistent current date context
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }

    let categoryRelaxation = 0;
    if (category === "OBC") categoryRelaxation = 3;
    if (category === "SC_ST") categoryRelaxation = 5;
    if (category === "PWBD") categoryRelaxation = 10;

    const baseAgeLimit = 30;
    const maxAllowedAge = baseAgeLimit + categoryRelaxation;

    setCalcResult({
      ageYears: years,
      ageMonths: Math.abs(months),
      categoryRelaxation,
      maxAllowedAge
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Banner / Coming Soon Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 sm:p-10 shadow-2xl text-white">
        {/* Background glow graphics */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/40 shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              COMING SOON
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm">
              🇮🇳 Sarkari Naukri Engine
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Central & State Govt Exams
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Sarkari Naukri <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">Hub & Exam Prep</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl font-normal leading-relaxed">
              We are building an all-in-one AI recruitment engine for Government Jobs in India. Track official gazette updates, calculate exact category age eligibility, practice PYQ banks, and auto-resize passport photo/signature specs.
            </p>
          </div>

          {/* Waitlist Subscription Bar */}
          <div className="pt-2 max-w-xl">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email to get early access alerts..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-amber-500/20 shrink-0 flex items-center justify-center gap-2"
                >
                  <BellIcon className="w-4 h-4" />
                  Notify Me First
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-bold text-sm">You are on the priority waitlist!</p>
                  <p className="text-xs text-emerald-400/80">We'll alert you the instant official notification crawling and syllabus engines go live.</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exam Sectors</p>
              <p className="text-xl font-extrabold text-white mt-1">12+ Major Domains</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target PYQs</p>
              <p className="text-xl font-extrabold text-amber-300 mt-1">15,000+ Questions</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State PSC Coverage</p>
              <p className="text-xl font-extrabold text-white mt-1">28 States & 8 UTs</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doc Resizer Vault</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">UPSC / SSC / IBPS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("updates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "updates"
              ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BellIcon className="w-4 h-4" />
          <span>Latest Updates & Notifications</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300">Soon</span>
        </button>

        <button
          onClick={() => setActiveTab("syllabus")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "syllabus"
              ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpenIcon className="w-4 h-4" />
          <span>Syllabus & Exam Pattern</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-300">Soon</span>
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "learning"
              ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          <span>PYQ Practice & Learning Material</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">Preview</span>
        </button>

        <button
          onClick={() => setActiveTab("eligibility")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "eligibility"
              ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <CalculatorIcon className="w-4 h-4" />
          <span>Age & Eligibility Calculator</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">Interactive Demo</span>
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "vault"
              ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileCheckIcon className="w-4 h-4" />
          <span>Document Vault & Specs</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">Soon</span>
        </button>
      </div>

      {/* Tab 1: Latest Updates & Notifications */}
      {activeTab === "updates" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">📢</span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-amber-200 text-sm">Upcoming Official Govt Examination Notifications</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Preview of upcoming notifications being processed for auto-scraping and AI PDF breakdown.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide shrink-0">
              Feature Launching Q3 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockNotifications.map((noti) => (
              <div
                key={noti.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-400/50 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${noti.tagColor}`}>
                      {noti.sector}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {noti.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base group-hover:text-primary transition-colors">
                      {noti.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {noti.department}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Vacancies:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{noti.vacancies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Eligibility:</span>
                      <span className="font-medium">{noti.eligibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age Limit:</span>
                      <span className="font-medium">{noti.ageLimit}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {noti.lastDate}
                  </span>
                  <button
                    onClick={() => alert(`Pre-registered for alerts on ${noti.title}`)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Syllabus & Exam Pattern */}
      {activeTab === "syllabus" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Exam Syllabus & Weightage Explorer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select an exam to view topic breakdown, section-wise marks, and negative marking rules.</p>
              </div>

              {/* Selector */}
              <div className="flex flex-wrap gap-2">
                {(["ssc", "upsc", "rrb", "ibps"] as const).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setSelectedExamSyllabus(ex)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                      selectedExamSyllabus === ex
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {ex === "ssc" && "SSC CGL (Tier 1 & 2)"}
                    {ex === "upsc" && "UPSC CSE Prelims"}
                    {ex === "rrb" && "RRB NTPC CBT-1"}
                    {ex === "ibps" && "IBPS PO Prelims"}
                  </button>
                ))}
              </div>
            </div>

            {/* Syllabus Detail Content */}
            {selectedExamSyllabus === "ssc" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Tier-1 Questions</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">100 MCQs</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Total Marks</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">200 Marks</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Duration</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">60 Mins</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Negative Marking</p>
                    <p className="text-2xl font-black text-rose-500 mt-1">-0.50 Marks</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>1. Quantitative Aptitude</span>
                      <span className="text-xs text-amber-500 font-bold">25 Qs / 50 Marks</span>
                    </h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>Ratio & Proportion, Percentages, Profit & Loss</li>
                      <li>Data Interpretation (Bar Graphs, Pie Charts)</li>
                      <li>Algebra, Geometry & Trigonometric Identities</li>
                      <li>Speed, Distance, Time & Work Problems</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>2. General Intelligence & Reasoning</span>
                      <span className="text-xs text-amber-500 font-bold">25 Qs / 50 Marks</span>
                    </h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>Analogies, Classification, Coding-Decoding</li>
                      <li>Syllogisms & Logical Venn Diagrams</li>
                      <li>Blood Relations, Direction Sense</li>
                      <li>Non-Verbal Series & Folding Paper Patterns</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>3. General Awareness & GK</span>
                      <span className="text-xs text-amber-500 font-bold">25 Qs / 50 Marks</span>
                    </h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>Indian History, Freedom Movement & Art Culture</li>
                      <li>Indian Polity & Constitution (Articles, Amendments)</li>
                      <li>Physical & Economic Geography</li>
                      <li>General Science (Physics, Chemistry, Biology) & National News</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>4. English Comprehension</span>
                      <span className="text-xs text-amber-500 font-bold">25 Qs / 50 Marks</span>
                    </h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>Reading Comprehension & Cloze Test</li>
                      <li>Error Spotting & Sentence Improvement</li>
                      <li>Synonyms, Antonyms & One-Word Substitution</li>
                      <li>Idioms, Phrases & Active/Passive Voice</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedExamSyllabus !== "ssc" && (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300 font-bold">Comprehensive syllabus module for {selectedExamSyllabus.toUpperCase()} is currently being cataloged by our AI pipeline.</p>
                <p className="text-xs text-slate-400 mt-1">Full topic-wise weightage matrices and PYQ mapping will be released in the upcoming update.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Learning Material & PYQ Practice Bank */}
      {activeTab === "learning" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Sample Previous Year Questions (PYQs) & Answer Explanations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Test your knowledge with authentic past year questions from UPSC, SSC, and Railway exams.</p>
            </div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/60 dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Polity & Constitution (UPSC / SSC)
                  </span>
                  <span className="text-xs text-slate-400 font-medium">SSC CGL 2024 Tier-1</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Q1. Which Article of the Indian Constitution empowers the President of India to issue Ordinances during recess of Parliament?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">A) Article 110</div>
                  <div className="p-2.5 rounded-lg border border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold">B) Article 123 (Correct)</div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">C) Article 213</div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">D) Article 356</div>
                </div>
                <div>
                  <button
                    onClick={() => toggleAnswer(1)}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{revealedAnswers[1] ? "Hide Explanation" : "Show AI Conceptual Explanation"}</span>
                  </button>
                  {revealedAnswers[1] && (
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-amber-800 dark:text-amber-300">Detailed Explanation:</p>
                      <p>Article 123 of the Indian Constitution grants the President legislative power to promulgate ordinances when either of the two Houses of Parliament is not in session. For Governors of states, the corresponding Ordinance power is under <strong>Article 213</strong>.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Question 2 */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/60 dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Quantitative Aptitude (Railways / SSC)
                  </span>
                  <span className="text-xs text-slate-400 font-medium">RRB NTPC CBT-1 2022</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Q2. A train 180 meters long passes a telegraph pole in 9 seconds. What is the speed of the train in kilometers per hour (km/h)?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">A) 54 km/h</div>
                  <div className="p-2.5 rounded-lg border border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold">B) 72 km/h (Correct)</div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">C) 60 km/h</div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">D) 80 km/h</div>
                </div>
                <div>
                  <button
                    onClick={() => toggleAnswer(2)}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{revealedAnswers[2] ? "Hide Explanation" : "Show Step-by-Step Calculation"}</span>
                  </button>
                  {revealedAnswers[2] && (
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">Step-by-step Solution:</p>
                      <p>1. Speed in m/s = Distance / Time = 180m / 9s = 20 m/s.</p>
                      <p>2. Convert m/s to km/h by multiplying by (18 / 5): 20 × (18 / 5) = 4 × 18 = <strong>72 km/h</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Eligibility & Age Calculator */}
      {activeTab === "eligibility" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🧮 Interactive Govt Job Age & Eligibility Calculator</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 uppercase">Live Demo</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Input your details below to calculate your exact age as of official cutoff dates and view category-wise age relaxations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="GEN">General / UR (No Relaxation)</option>
                  <option value="OBC">OBC-NCL (+3 Years)</option>
                  <option value="SC_ST">SC / ST (+5 Years)</option>
                  <option value="EWS">EWS (Age as UR, Fee Relaxed)</option>
                  <option value="PWBD">PwBD (+10 Years)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highest Qualification</label>
                <select
                  value={qualification}
                  onChange={(e: any) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="10th">10th Standard Pass</option>
                  <option value="12th">12th Standard Pass</option>
                  <option value="Graduate">Bachelor's Degree (BA/BSc/BCom)</option>
                  <option value="Engineering">B.E / B.Tech (Engineering)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateEligibility}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-sm"
            >
              Calculate Age & Check Eligible Exams
            </button>

            {calcResult && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Calculated Age</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{calcResult.ageYears} Yrs, {calcResult.ageMonths} Mos</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Category Relaxation</p>
                    <p className="text-xl font-black text-amber-500 mt-0.5">+{calcResult.categoryRelaxation} Years</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Max Allowed Limit (Base 30)</p>
                    <p className="text-xl font-black text-emerald-500 mt-0.5">{calcResult.maxAllowedAge} Years</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Status</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {calcResult.ageYears <= calcResult.maxAllowedAge ? "ELIGIBLE ✅" : "AGE OVER ❌"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Recommended Exams for your Profile:</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">SSC CGL Tier-1</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">RRB NTPC Graduate Posts</span>
                    <span className="px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold">IBPS PO / Specialist</span>
                    {qualification === "Engineering" && (
                      <span className="px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">SSC JE (Junior Engineer)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Document Vault Specs */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Smart Document Resizer & Portal Vault Specs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Government portals reject applications if photographs and signatures do not match exact byte sizes and pixel dimensions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📸</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">SSC Portal Specs</h4>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li><strong>Photo:</strong> 20 KB – 50 KB (JPEG format)</li>
                  <li><strong>Dimensions:</strong> 3.5 cm × 4.5 cm</li>
                  <li><strong>Signature:</strong> 10 KB – 20 KB (Black ink)</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">UPSC OTR Specs</h4>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li><strong>Photo:</strong> 20 KB – 300 KB</li>
                  <li><strong>Dimensions:</strong> Min 350 × 350 pixels</li>
                  <li><strong>Date Stamp:</strong> Name & Date on photo</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏦</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">IBPS Banking Specs</h4>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <li><strong>Photo:</strong> 20 KB – 50 KB (200×230 px)</li>
                  <li><strong>Thumb Impression:</strong> 20 KB – 50 KB</li>
                  <li><strong>Handwritten Declaration:</strong> 50 KB – 100 KB</li>
                </ul>
              </div>
            </div>

            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">Automated Document Resizer Tool Coming Soon!</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Upload any image file, select your target exam portal (SSC, UPSC, IBPS), and our engine will automatically compress and resize your photograph to match exact portal guidelines.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SarkariNaukriPage;
