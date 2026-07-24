import React, { useState } from "react";
import { submitUtrPayment } from "../services/billingService";
import upiQrImg from "../../../assets/upi_qr.png";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  amount?: number;
  upiId?: string;
  onSuccess?: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  planName = "PRO / PREMIUM Plan",
  amount = 499,
  upiId = "awwmrit@upi",
  onSuccess,
}) => {
  const [utrNumber, setUtrNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();

    if (!/^[0-9]{12}$/.test(cleanUtr)) {
      setError("Please enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await submitUtrPayment({ utrNumber: cleanUtr, amount });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit payment verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">💳</span>
              Pay via UPI Static QR
            </h3>
            <p className="text-xs text-slate-400">{planName} • Unlimited Access</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {submitted ? (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                ✓
              </div>
              <h4 className="text-xl font-bold text-emerald-400">Payment Submitted!</h4>
              <p className="text-sm text-slate-300">
                Your 12-digit UTR <code className="px-2 py-1 bg-slate-800 rounded text-indigo-300 font-mono">{utrNumber}</code> has been sent to the admin for instant verification.
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs text-slate-400">
                ⌛ Your account will be upgraded automatically within <strong className="text-white">2 - 5 minutes</strong> upon admin tap in Telegram.
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30"
              >
                Done
              </button>
            </div>
          ) : (
            /* Payment Form State */
            <>
              {/* Amount Display */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 rounded-xl border border-indigo-500/20">
                <span className="text-sm text-slate-300">Amount Payable:</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  ₹{amount}.00
                </span>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner border border-slate-700">
                <img
                  src={upiQrImg}
                  alt="UPI QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
                <span className="text-[11px] font-medium text-slate-600 mt-2">
                  Scan using GPay, PhonePe, Paytm, or BHIM
                </span>
              </div>

              {/* Copy UPI VPA */}
              <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="truncate pr-2">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">UPI ID / VPA</span>
                  <span className="text-sm font-semibold font-mono text-indigo-300">{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? "✓ Copied" : "Copy UPI ID"}
                </button>
              </div>

              {/* UTR Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Enter 12-Digit UPI UTR / Reference Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 420198273645"
                    value={utrNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setUtrNumber(val);
                      if (error) setError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm tracking-wide"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check your UPI payment receipt details for the 12-digit Ref No / UTR.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || utrNumber.length !== 12}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting Verification...
                    </>
                  ) : (
                    "Submit Payment UTR"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
