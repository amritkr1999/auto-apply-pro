import React, { useState } from 'react';

export const ExtensionDownloadSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Download static physical ZIP file or trigger backend API
    const link = document.createElement('a');
    link.href = '/easynaukri-extension.zip';
    link.download = 'easynaukri-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto w-full text-white py-6">
      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-serif mb-2">
          EasyNaukri for Chrome & Chromium
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Find emails and send outreach directly from any LinkedIn, Naukri, or Indeed profile — without leaving the page.
        </p>
      </div>

      {/* Main Download Card (JobDululu Style) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12 transition-all hover:border-amber-700/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/40 text-amber-500 border border-amber-800/40 flex items-center justify-center text-2xl font-bold shrink-0">
              ✉️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Chrome Extension</h3>
              <p className="text-xs text-slate-400 mt-1">
                Manifest v3 · ~18KB · Works on Chrome, Edge, Brave, and any other Chromium-based browser.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            type="button"
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shrink-0"
          >
            <span className="text-lg">📥</span>
            <span>Download for Chrome</span>
          </button>
        </div>
      </div>

      {/* How to Install Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">How to install</h3>
      </div>

      {/* 4-Step List (JobDululu Cards) */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 md:p-6 transition-all flex items-start gap-4 md:gap-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
            1
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-base text-slate-100">
              <span>📥 Download the extension</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
              Click "Download for Chrome" above. You'll get a ZIP file — unzip it somewhere you won't accidentally delete (e.g. your Documents folder).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 md:p-6 transition-all flex items-start gap-4 md:gap-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
            2
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-base text-slate-100">
                <span>🌐 Open chrome://extensions</span>
              </div>
              <button
                onClick={copyChromeUrl}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy URL'}
              </button>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
              Paste <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">chrome://extensions</code> into your address bar. Toggle "Developer mode" on in the top-right corner.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 md:p-6 transition-all flex items-start gap-4 md:gap-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
            3
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-base text-slate-100">
              <span>📁 Click "Load unpacked"</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
              Select the unzipped <code className="text-amber-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">easynaukri-extension</code> folder. The EasyNaukri icon will appear in your extensions list.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 md:p-6 transition-all flex items-start gap-4 md:gap-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-700">
            4
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-base text-slate-100">
              <span>📌 Pin & connect</span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
              Click the puzzle icon in Chrome's toolbar, pin EasyNaukri, then click the icon and start automated harvesting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionDownloadSection;
