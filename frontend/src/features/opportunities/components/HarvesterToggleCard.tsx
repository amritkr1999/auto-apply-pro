import React, { useState, useEffect } from 'react';
import { ChromeExtensionSetupModal } from './ChromeExtensionSetupModal';
import { buildApiUrl } from '../../../config/api';

interface PortalOption {
  id: string;
  name: string;
  badge: string;
}

const AVAILABLE_PORTALS: PortalOption[] = [
  { id: 'naukri', name: 'Naukri.com', badge: 'Popular' },
  { id: 'linkedin', name: 'LinkedIn Jobs', badge: 'Popular' },
  { id: 'indeed', name: 'Indeed India', badge: 'Active' },
  { id: 'instahyre', name: 'Instahyre', badge: 'Tech' },
  { id: 'wellfound', name: 'Wellfound (AngelList)', badge: 'Startups' },
];

export const HarvesterToggleCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('auto_harvester_enabled') === 'true';
  });

  const [selectedPortals, setSelectedPortals] = useState<string[]>(() => {
    const saved = localStorage.getItem('auto_harvester_selected_portals');
    return saved ? JSON.parse(saved) : ['naukri', 'linkedin', 'indeed', 'instahyre', 'wellfound'];
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const [contributedCount, setContributedCount] = useState<number>(() => {
    const saved = localStorage.getItem('auto_harvester_contributed_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(() => {
    return localStorage.getItem('auto_extension_installed') === 'true' || Boolean((window as any).__EASYNAUKRI_EXTENSION_ACTIVE__);
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleHarvester = () => {
    const checkInstalled = localStorage.getItem('auto_extension_installed') === 'true' || Boolean((window as any).__EASYNAUKRI_EXTENSION_ACTIVE__);

    // STRICT GUARD: If extension is not setup, BLOCK turning ON the toggle!
    if (!isEnabled) {
      if (!checkInstalled) {
        setIsEnabled(false);
        localStorage.setItem('auto_harvester_enabled', 'false');
        setErrorMessage('⚠️ Cannot Activate Toggle: EasyNaukri Extension is not setup on your browser. Please download and load the extension first.');
        setIsGuideOpen(true);
        return;
      }
    }

    setErrorMessage(null);
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    localStorage.setItem('auto_harvester_enabled', String(nextState));
    
    // Dispatch custom event for background extension / worker
    window.dispatchEvent(new CustomEvent('harvester-toggle-changed', { detail: { enabled: nextState, portals: selectedPortals } }));
  };

  const togglePortal = (portalId: string) => {
    let updated: string[];
    if (selectedPortals.includes(portalId)) {
      if (selectedPortals.length === 1) return; // Must keep at least 1 selected
      updated = selectedPortals.filter((p) => p !== portalId);
    } else {
      updated = [...selectedPortals, portalId];
    }
    setSelectedPortals(updated);
    localStorage.setItem('auto_harvester_selected_portals', JSON.stringify(updated));
    
    window.dispatchEvent(new CustomEvent('harvester-portals-changed', { detail: { portals: updated } }));
  };

  useEffect(() => {
    let pongReceived = false;

    const handleSyncEvent = (e: any) => {
      if (e.detail && e.detail.added) {
        setContributedCount((prev) => {
          const updated = prev + e.detail.added;
          localStorage.setItem('auto_harvester_contributed_count', String(updated));
          return updated;
        });
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EASYNAUKRI_EXTENSION_PONG') {
        pongReceived = true;
        setIsExtensionInstalled(true);
        localStorage.setItem('auto_extension_installed', 'true');
        setErrorMessage(null);
      }
    };

    window.addEventListener('harvester-sync-success', handleSyncEvent);
    window.addEventListener('message', handleMessage);

    // Send dynamic heartbeat ping to check if extension is currently installed
    window.postMessage({ type: 'EASYNAUKRI_EXTENSION_PING' }, '*');

    // If no extension response within 1 second, mark extension as uninstalled and turn OFF toggle!
    const timeoutId = setTimeout(() => {
      if (!pongReceived && !Boolean((window as any).__EASYNAUKRI_EXTENSION_ACTIVE__)) {
        setIsExtensionInstalled(false);
        localStorage.removeItem('auto_extension_installed');
        setIsEnabled(false);
        localStorage.setItem('auto_harvester_enabled', 'false');
      }
    }, 1000);

    // Fetch live total HR contacts stats from backend
    const fetchLiveStats = async () => {
      try {
        const res = await fetch(buildApiUrl('/v1/jobs/scraper/stats'));
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalHrContacts === 'number') {
            setContributedCount(data.totalHrContacts);
            localStorage.setItem('auto_harvester_contributed_count', String(data.totalHrContacts));
          }
        }
      } catch (err) {
        console.warn('Could not fetch live HR contacts stats:', err);
      }
    };
    fetchLiveStats();

    return () => {
      window.removeEventListener('harvester-sync-success', handleSyncEvent);
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all text-slate-800 dark:text-slate-100 mb-8 hover:border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl text-2xl shrink-0 transition-colors shadow-sm ${
              isEnabled 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Automated Background HR Harvester
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isEnabled 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  {isEnabled ? (isExtensionInstalled ? '● Extension Verified & Active' : '● Node Pending Setup') : 'Off'}
                </span>

                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  🔌 Extension Setup Guide
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                When toggled ON, your node silently discovers active job postings and extracts recruiter details in the background. HR contacts stay in database permanently, while job updates stay for 20 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0 pt-2 sm:pt-0">
            {isEnabled && (
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Contacts Discovered</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{contributedCount} HRs</div>
              </div>
            )}
            
            <button
              onClick={toggleHarvester}
              type="button"
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
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

        {/* Target Sites Selection Settings */}
        <div className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              🌐 Target Job Portals ({selectedPortals.length}/{AVAILABLE_PORTALS.length} Selected)
            </span>
            <span className="text-[11px] text-slate-400">
              Select which sites your harvester node should scan
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_PORTALS.map((portal) => {
              const isSelected = selectedPortals.includes(portal.id);
              return (
                <button
                  key={portal.id}
                  onClick={() => togglePortal(portal.id)}
                  type="button"
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-slate-400 dark:bg-slate-600'}`} />
                  <span>{portal.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {portal.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert Banner when Extension Not Installed */}
        {errorMessage && (
          <div className="mt-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">🚫</span>
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/easynaukri-extension.zip"
                download="easynaukri-extension.zip"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors shadow-sm text-xs"
              >
                Download Extension ZIP 📥
              </a>
            </div>
          </div>
        )}

        {/* Extension Active Alert & Quick Download Banner */}
        {isEnabled && (
          <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">🔌</span>
              <span>
                <strong>Extension Required:</strong> Ensure the EasyNaukri Chrome Extension is loaded in Chrome for automated background scans.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors text-xs shadow-sm"
              >
                Setup Guide 📖
              </button>
              <a
                href="/easynaukri-extension.zip"
                download="easynaukri-extension.zip"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-xs shadow-sm"
              >
                Download ZIP 📥
              </a>
            </div>
          </div>
        )}
      </div>

      <ChromeExtensionSetupModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export default HarvesterToggleCard;
