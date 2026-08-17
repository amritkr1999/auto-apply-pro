import React, { useState } from 'react';
import ChromeExtensionSetupModal from './ChromeExtensionSetupModal';

export const ExtensionDownloadSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      {/* Sleek Compact Dashboard Chrome Extension Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all hover:border-indigo-400/50">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl font-bold shrink-0 shadow-inner">
            🔌
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-tight">
                EasyNaukri Chrome Extension
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v1.0 Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
              Automate recruiter contact harvesting, email parsing, and 1-click candidate outreach directly from LinkedIn, Naukri, or Indeed.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shrink-0 border border-indigo-400/30 group cursor-pointer"
        >
          <span>⚡ Install Extension & Guide</span>
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
