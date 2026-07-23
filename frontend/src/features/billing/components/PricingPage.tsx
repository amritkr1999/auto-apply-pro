import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getPlans,
  createSubscription,
  verifySubscription,
  type PlanDto,
} from "../services/billingService";
import type { RazorpayResponse } from "../types/razorpay";

// --- Load Razorpay Script ---
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// --- Dynamic features based on application plan tiers ---
const getPlanFeatures = (planName: string, amount: number): string[] => {
  const nameLower = planName.toLowerCase();
  if (nameLower.includes("starter") || amount <= 70) {
    return [
      "15 Submissions per day (450/mo)",
      "Up to 3 Resume Profiles",
      "ATS Keyword Optimization",
      "All Roadmaps & Unlimited Quizzes",
      "Pipeline Conversion Analytics",
      "Mobile App Sync & Biometrics",
    ];
  }
  if (nameLower.includes("pro") || (amount > 70 && amount <= 100)) {
    return [
      "40 Submissions per day (1,200/mo)",
      "Unlimited Resume Profiles",
      "Automated Custom Cover Letters & AI Tailoring",
      "Automated SMTP Scheduled Outreach",
      "Rejection Trends & Funnel Stats",
      "Priority Email Support",
    ];
  }
  if (nameLower.includes("elite") || amount > 100) {
    return [
      "Unlimited Submissions (100+/day)",
      "Priority Instant AI OCR & Parsing",
      "Full Resume & Cover Letter Suite",
      "Featured Candidate Recruiter Spotlight",
      "Dedicated Account Support",
      "Custom Outreach Mail Config",
    ];
  }
  return [
    "AI Resume Tailoring",
    "Automated Email Outreach",
    "Real-time Analytics Dashboard",
    "Learning Space & Career Roadmaps",
    "Application Tracking Board",
  ];
};

// --- Icons ---
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const AnimatedCheckmark: React.FC = () => (
  <div className="relative flex items-center justify-center">
    <div className="absolute w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: "draw 0.5s ease-out forwards" }} />
      </svg>
    </div>
    <style>{`@keyframes draw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }`}</style>
  </div>
);

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (plan: PlanDto) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setError("Please log in to subscribe.");
      return;
    }

    try {
      setSubscribingPlanId(plan.id);
      setError(null);

      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
      }

      // Create subscription on backend
      const checkout = await createSubscription(plan.razorpayPlanId);

      // Open Razorpay checkout
      const options = {
        key: checkout.razorpayKeyId,
        subscription_id: checkout.subscriptionId,
        name: "AutoApply Pro",
        description: `${plan.name} Subscription`,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaymentSuccess(true);
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed");
          } finally {
            setSubscribingPlanId(null);
          }
        },
        prefill: {
          name: checkout.userName,
          email: checkout.userEmail,
          contact: checkout.userMobile,
        },
        theme: {
          color: "#6366f1",
          backdrop_color: "rgba(15, 23, 42, 0.85)",
        },
        modal: {
          ondismiss: () => {
            setSubscribingPlanId(null);
          },
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubscribingPlanId(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "monthly": return "/month";
      case "quarterly": return "/quarter";
      case "yearly": return "/year";
      default: return `/${interval}`;
    }
  };

  // --- Success State ---
  if (paymentSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <AnimatedCheckmark />
          <h2 className="text-3xl font-bold text-slate-100 mt-6">Payment Successful!</h2>
          <p className="text-slate-400 text-lg">
            Your subscription is now active. Welcome to the pro experience!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/billing/portal"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition-all duration-200"
            >
              View Billing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <SpinnerIcon className="w-10 h-10 text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-lg">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl leading-relaxed">
          Unlock the full power of AutoApply Pro. Pick a plan that fits your career goals.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Plans empty */}
      {plans.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No plans available right now. Check back soon!</p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isPopular = plan.razorpayPlanId === "plan_PRM99INR" || plan.name.toLowerCase().includes("pro");
          const isSubscribing = subscribingPlanId === plan.id;
          const planFeatures = getPlanFeatures(plan.name, plan.amount);

          return (
            <div
              key={plan.id}
              className={`relative group rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
                isPopular
                  ? "bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-slate-800 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/10"
                  : "bg-slate-800/70 ring-1 ring-slate-700/60 hover:ring-slate-600"
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-green-500/30">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-slate-100 mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">
                    {formatPrice(plan.amount, plan.currency)}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">{getIntervalLabel(plan.billingInterval)}</span>
                </div>

                {/* Subscribe Button */}
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isSubscribing || subscribingPlanId !== null}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600 disabled:opacity-60"
                  }`}
                >
                  {isSubscribing ? (
                    <>
                      <SpinnerIcon className="w-4 h-4" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe Now"
                  )}
                </button>

                {/* Divider */}
                <div className="border-t border-slate-700/60 my-6" />

                {/* Features */}
                <ul className="space-y-3">
                  {planFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <CheckIcon className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">
          Supported Payment Methods
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "Credit/Debit Card", icon: "💳" },
            { label: "UPI", icon: "📱" },
            { label: "Net Banking", icon: "🏦" },
            { label: "Pay Later", icon: "⏳" },
          ].map((method) => (
            <span
              key={method.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 text-xs font-medium"
            >
              <span className="text-base">{method.icon}</span>
              {method.label}
            </span>
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-6">
          Payments are securely processed by Razorpay. Your data is encrypted and safe.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
