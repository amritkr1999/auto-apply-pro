import React, { useState } from 'react';
import ChromeExtensionSetupModal from './ChromeExtensionSetupModal';

export const ExtensionDownloadSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      {/* Sleek Dashboard Chrome Extension Banner Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all hover:border-indigo-400/50">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-3xl font-bold shrink-0 shadow-inner">
            🔌
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-white tracking-tight font-serif">
                EasyNaukri Chrome Extension
              </h3>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v1.0 Ready
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
              Automate recruiter contact harvesting, email parsing, and 1-click candidate outreach directly from any LinkedIn, Naukri, or Indeed page.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shrink-0 border border-indigo-400/30 group"
        >
          <span>⚡ Install Extension & Setup Guide</span>
          <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
        </button>
      </div>

      {/* Setup Guide Modal */}
      <ChromeExtensionSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ExtensionDownloadSection;
