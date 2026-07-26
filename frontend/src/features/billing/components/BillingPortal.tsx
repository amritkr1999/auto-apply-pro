import React, { useEffect, useState, useCallback } from "react";
import {
  getActiveSubscription,
  cancelSubscription,
  getTransactions,
  getMyUpiPaymentStatus,
  type SubscriptionDto,
  type PaymentTransactionDto,
} from "../services/billingService";
import { UpiPaymentModal } from "./UpiPaymentModal";

// --- Helpers ---
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/30",
    authenticated: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    created: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    past_due: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    halted: "bg-red-500/15 text-red-400 border-red-500/30",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
    completed: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    expired: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    paused: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    captured: "bg-green-500/15 text-green-400 border-green-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    refunded: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    authorized: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
        styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const BillingPortal: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionDto[]>([]);
  const [upiStatus, setUpiStatus] = useState<{
    isPremium: boolean;
    role: string;
    latestTransaction: {
      id: number;
      utrNumber: string;
      amount: number;
      status: string;
      createdAt: string;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: number } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sub, txns, upiData] = await Promise.all([
        getActiveSubscription().catch(() => null),
        getTransactions().catch(() => []),
        getMyUpiPaymentStatus().catch(() => null),
      ]);
      setSubscription(sub);
      setTransactions(txns);
      setUpiStatus(upiData);
    } catch (err) {
      console.error("Error loading billing status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      setError(null);
      await cancelSubscription();
      setCancelSuccess(true);
      setShowCancelConfirm(false);
      // Refresh data
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <SpinnerIcon className="w-10 h-10 text-indigo-500 mx-auto" />
          <p className="text-slate-400 text-lg">Loading billing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Billing & Subscription</h1>
        <p className="text-slate-400">Manage your subscription and view payment history.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Cancel Success */}
      {cancelSuccess && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-300 text-sm">
            Your subscription has been cancelled. You can continue using your plan until the current period ends.
          </p>
        </div>
      )}

      {/* UPI Pending Banner */}
      {upiStatus?.latestTransaction?.status === "PENDING" && !subscription && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 text-xl">⏳</div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-amber-400 mb-1">UPI Payment Pending Verification</h4>
            <p className="text-xs text-slate-300">
              UTR Number <code className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300 font-mono">{upiStatus.latestTransaction.utrNumber}</code> (₹{upiStatus.latestTransaction.amount}) has been submitted. Admin verification is in progress via Telegram.
            </p>
          </div>
        </div>
      )}

      {/* Direct PRO Active Banner */}
      {(upiStatus?.isPremium || upiStatus?.role === "PRO" || upiStatus?.role === "PREMIUM") && !subscription && (
        <div className="mb-8 bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-800 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                PRO Member Active
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Full Lifetime / Manual Premium Plan</h3>
            <p className="text-xs text-slate-400 mt-1">Your account has been upgraded to PRO. You have unlimited outreach & premium features.</p>
          </div>
          <span className="text-4xl">👑</span>
        </div>
      )}

      {/* Available Plans Grid */}
      {!subscription && !upiStatus?.isPremium && upiStatus?.role !== "PRO" && (
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Upgrade Plan</h2>
            <p className="text-slate-400 text-sm">Select a plan below to unlock automated applications & AI power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "starter",
                name: "Starter Plan",
                price: 69,
                interval: "month",
                description: "Great for active candidates seeking a steady daily job outreach volume.",
                popular: false,
                features: [
                  "15 Submissions per day (450/mo)",
                  "Up to 3 Resume Profiles",
                  "ATS Keyword Optimization",
                  "All Roadmaps & Unlimited Quizzes",
                  "Pipeline Conversion Analytics",
                  "Mobile App Sync & Biometrics",
                ],
              },
              {
                id: "candidate-pro",
                name: "Candidate Pro",
                price: 99,
                interval: "month",
                description: "For serious job seekers looking to maximize outreach and land interview calls fast.",
                popular: true,
                features: [
                  "40 Submissions per day (1,200/mo)",
                  "Unlimited Resume Profiles",
                  "Automated Cover Letters & AI Tailoring",
                  "Automated SMTP Scheduled Dispatch",
                  "Rejection Trends & Funnel Stats",
                  "Priority Email Support",
                ],
              },
              {
                id: "elite-autopilot",
                name: "Elite Autopilot",
                price: 199,
                interval: "month",
                description: "Maximum speed & priority processing for aggressive job hunting campaigns.",
                popular: false,
                features: [
                  "Unlimited Submissions (100+/day)",
                  "Priority Instant AI OCR & Parsing",
                  "Full Resume & Cover Letter Suite",
                  "Featured Candidate Recruiter Spotlight",
                  "Dedicated Account Support",
                  "Custom Outreach Mail Config",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-slate-900 border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/10"
                    : "bg-slate-800/70 border border-slate-700/60 hover:border-slate-600"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-lg">
                    ★ Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mb-4 min-h-[32px]">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-white">₹{plan.price}</span>
                    <span className="text-slate-400 text-xs">/{plan.interval}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan({ name: plan.name, amount: plan.price });
                    setIsUpiModalOpen(true);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                  }`}
                >
                  ⚡ Pay ₹{plan.price} via UPI QR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Card */}
      {subscription && (
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700/60 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-100">{subscription.planName}</h2>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="text-slate-500 text-sm">
                Subscription ID: {subscription.razorpaySubscriptionId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/40">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Current Period Start</p>
              <p className="text-slate-200 font-medium">{formatDate(subscription.currentPeriodStart)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/40">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Current Period End</p>
              <p className="text-slate-200 font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/40">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Next Renewal</p>
              <p className="text-slate-200 font-medium">
                {subscription.status === "cancelled" || subscription.cancelAtPeriodEnd
                  ? "—"
                  : formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Cancel Section */}
          {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
            <div className="border-t border-slate-700/40 pt-5">
              {!showCancelConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300 text-sm flex-1">
                    Are you sure you want to cancel? You'll retain access until the current billing period ends.
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelling}
                      className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Keep Plan
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {cancelling ? (
                        <>
                          <SpinnerIcon className="w-4 h-4" />
                          Cancelling...
                        </>
                      ) : (
                        "Yes, Cancel"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="border-t border-slate-700/40 pt-5 mt-2">
              <p className="text-amber-400 text-sm font-medium">
                Your subscription will cancel at the end of the current billing cycle. You still have access until {formatDate(subscription.currentPeriodEnd)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Payment History */}
      <div className="bg-slate-800/70 rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className="px-6 sm:px-8 py-5 border-b border-slate-700/40">
          <h2 className="text-lg font-bold text-slate-100">Payment History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 sm:px-8 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/40">
                  <th className="text-left px-6 sm:px-8 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Payment ID</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Method</th>
                  <th className="text-left px-6 sm:px-8 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 sm:px-8 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {formatDate(txn.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                      {txn.razorpayPaymentId}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-200 font-medium text-right whitespace-nowrap">
                      {formatCurrency(txn.amount, "INR")}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400 capitalize whitespace-nowrap">
                      {txn.paymentMethod || "unknown"}
                    </td>
                    <td className="px-6 sm:px-8 py-4 whitespace-nowrap">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        planName={selectedPlan?.name || "PRO / PREMIUM Plan"}
        amount={selectedPlan?.amount || 499}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default BillingPortal;
