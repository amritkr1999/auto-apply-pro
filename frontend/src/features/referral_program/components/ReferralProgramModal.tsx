import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { referralProgramService } from "../services/referralProgramService";
import type { ReferralDashboardDto } from "../services/referralProgramService";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/Table";

interface Props {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralProgramModal: React.FC<Props> = ({ userId, isOpen, onClose }) => {
  const [data, setData] = useState<ReferralDashboardDto | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      referralProgramService
        .getMyReferralProgram(userId)
        .then((res) => {
          setData(res);
        })
        .catch((err) => console.error("Error loading referral program", err));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const modalJsx = (
    <div className="fixed inset-0 z-[100000] flex items-start justify-center bg-slate-900/70 backdrop-blur-md p-4 pt-16 md:pt-20 pb-10 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header - Unblurred with Coming Soon Badge */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">Refer & Earn 7 Days Premium</h2>
                  <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                    Coming Soon 🚀
                  </span>
                </div>
                <p className="text-xs text-indigo-100 mt-1">
                  Invite friends to EasyNaukri. Earn 7 Days Premium Trial on their 1st paid subscription!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body - Contains Top Unblurred Benefit Cards + Blurred Teaser Dashboard */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto relative">
          
          {/* Top Program Benefits Overview (Unblurred) */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200/80 dark:border-indigo-800/80 p-4 rounded-xl">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>⚡ Program Benefits Preview</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-lg block mb-0.5">🔗 Share Custom Link</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Get your unique alphanumeric referral code & share link</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-lg block mb-0.5">💳 Friend Subscribes</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Referred friend completes their 1st paid subscription</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-lg block mb-0.5">🎉 7 Days Free Premium</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Both you & your friend automatically unlock 7 days Premium</p>
              </div>
            </div>
          </div>

          {/* Locked / Blurred Container Wrapper */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            
            {/* Overlay Lock Notice Card */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] text-center">
              <div className="bg-slate-900/95 border border-amber-500/40 text-white p-6 rounded-2xl shadow-2xl max-w-md space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-2xl mx-auto border border-amber-500/30">
                  🔒
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-amber-400 uppercase tracking-wide">
                    Referral Dashboard Locked
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    This feature is currently undergoing final trial preparation. Your unique referral code, tracking links, conversion metrics, and reward logs will activate upon launch.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-xs">
                    🚀 Launching Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Blurred Background Details (Referral Code, Link, Metrics, Table) */}
            <div className="p-5 space-y-5 filter blur-[4px] opacity-60 select-none pointer-events-none bg-slate-50 dark:bg-slate-900/80">
              
              {/* Unique Link & Code Box Preview */}
              <div className="bg-slate-900 rounded-xl p-5 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Your Referral Link</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
                        {data?.referralLink || "https://easynaukri.online/register?ref=REF-A8F92K3P"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Code</span>
                      <span className="font-mono text-sm font-bold text-amber-400">{data?.referralCode || "REF-A8F92K3P"}</span>
                    </div>
                    <Button variant="primary" className="bg-indigo-600 text-xs">
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Metrics Cards Grid Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Clicks</span>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">12</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Signups</span>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">5</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conversions</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">2</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Earned Premium</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">14 Days</div>
                </div>
              </div>

              {/* History Table Preview */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Referred Friends History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Friend Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-slate-700 dark:text-slate-300 text-xs">al***@gmail.com</TableCell>
                      <TableCell><Badge variant="success">Converted 🎉</Badge></TableCell>
                      <TableCell className="text-xs text-purple-700 dark:text-purple-300 font-semibold">+7 Days Premium</TableCell>
                      <TableCell className="text-xs text-slate-400">2026-08-10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-700 dark:text-slate-300 text-xs">jo***@yahoo.com</TableCell>
                      <TableCell><Badge variant="warning">Pending Subscription</Badge></TableCell>
                      <TableCell className="text-xs text-purple-700 dark:text-purple-300 font-semibold">+7 Days Premium</TableCell>
                      <TableCell className="text-xs text-slate-400">2026-08-12</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">EasyNaukri Growth Network</span>
          <Button onClick={onClose} variant="secondary">Close Preview</Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJsx, document.body);
};

export default ReferralProgramModal;
