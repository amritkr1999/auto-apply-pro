import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getActiveSubscription,
  cancelSubscription,
  getTransactions,
  type SubscriptionDto,
  type PaymentTransactionDto,
} from "../services/billingService";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sub, txns] = await Promise.all([
        getActiveSubscription(),
        getTransactions(),
      ]);
      setSubscription(sub);
      setTransactions(txns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data");
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

      {/* No Subscription */}
      {!subscription && (
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700/60 p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No Active Subscription</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            You don't have an active subscription yet. Explore our plans to get started.
          </p>
          <Link
            to="/billing/pricing"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            View Plans
          </Link>
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
    </div>
  );
};

export default BillingPortal;
