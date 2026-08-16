import React, { useState, useEffect } from 'react';
import { ChromeExtensionSetupModal } from './ChromeExtensionSetupModal';

export const HarvesterToggleCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('auto_harvester_enabled') === 'true';
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const [contributedCount, setContributedCount] = useState<number>(() => {
    const saved = localStorage.getItem('auto_harvester_contributed_count');
    return saved ? parseInt(saved, 10) : 18;
  });

  const toggleHarvester = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    localStorage.setItem('auto_harvester_enabled', String(nextState));
    
    // Dispatch custom event for background extension / worker
    window.dispatchEvent(new CustomEvent('harvester-toggle-changed', { detail: { enabled: nextState } }));
  };

  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      if (e.detail && e.detail.added) {
        setContributedCount((prev) => {
          const updated = prev + e.detail.added;
          localStorage.setItem('auto_harvester_contributed_count', String(updated));
          return updated;
        });
      }
    };
    window.addEventListener('harvester-sync-success', handleSyncEvent);
    return () => window.removeEventListener('harvester-sync-success', handleSyncEvent);
  }, []);

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white mb-8 transition-all hover:border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl text-2xl shrink-0 transition-colors ${
              isEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
            }`}>
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold tracking-tight text-slate-100">
                  Automated Background HR Harvester
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isEnabled ? '● Node Active' : 'Off'}
                </span>

                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  🔌 Extension Setup Guide
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                When toggled ON, your node silently discovers active job postings and extracts recruiter details in the background. HR contacts stay in database permanently, while job updates stay for 20 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            {isEnabled && (
              <div className="text-right">
                <div className="text-xs text-slate-400">Contacts Discovered</div>
                <div className="text-lg font-extrabold text-emerald-400">{contributedCount} HRs</div>
              </div>
            )}
            
            <button
              onClick={toggleHarvester}
              type="button"
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={isEnabled}
            >
              <span className="sr-only">Enable Automated HR Harvester</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <ChromeExtensionSetupModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export default HarvesterToggleCard;
