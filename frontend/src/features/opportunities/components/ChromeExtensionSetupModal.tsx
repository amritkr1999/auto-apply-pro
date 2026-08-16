import React, { useState } from 'react';

interface ChromeExtensionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionSetupModal: React.FC<ChromeExtensionSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'developer' | 'webstore'>('developer');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/easynaukri-extension.zip';
    link.download = 'easynaukri-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-13 h-13 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            🔌
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white font-serif">
              EasyNaukri Chrome Extension Setup
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Automate LinkedIn & Naukri recruiter harvesting in 4 simple steps.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'developer'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Download & Load ZIP (Active)
          </button>
          <button
            onClick={() => setActiveTab('webstore')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'webstore'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Chrome Web Store (Coming Soon ⏳)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'webstore' ? (
          <div className="space-y-5 mb-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <h3 className="text-base font-bold text-amber-300">1-Click Chrome Web Store — Coming Soon</h3>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Our official 1-click Chrome Web Store listing is currently undergoing Google Review. In the meantime, use the <strong>"Download & Load ZIP"</strong> tab to start harvesting immediately!
              </p>

              <button
                onClick={() => setActiveTab('developer')}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg hover:scale-105"
              >
                📥 Use Direct ZIP Download Instead →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* Download CTA Card */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Extension Package (.ZIP)</h4>
                <p className="text-xs text-slate-400 mt-0.5">Manifest v3 · ~18KB · Works on Chrome, Edge, Brave.</p>
              </div>
              <button
                onClick={handleDownload}
                type="button"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
              >
                <span>📥</span>
                <span>Download ZIP</span>
              </button>
            </div>

            {/* Step 1 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-100">Download & Unzip Package</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Click "Download ZIP" above. Extract <code className="text-amber-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">easynaukri-extension.zip</code> into your Documents folder.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Open Chrome Extensions & Developer Mode</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Paste <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chrome://extensions</code> into your address bar and toggle ON <strong>"Developer mode"</strong> in top-right.
                  </p>
                </div>
              </div>

              <button
                onClick={copyChromeUrl}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md"
                title="Click to copy chrome://extensions URL to clipboard"
              >
                {copied ? '✓ URL Copied!' : '📋 Copy URL'}
              </button>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-100">Click "Load Unpacked" & Select Folder</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Click <strong>"Load unpacked"</strong> in Chrome extensions and select the unzipped <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">easynaukri-extension</code> folder.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-100">Pin Extension & Start Harvesting</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pin EasyNaukri to your Chrome toolbar, visit LinkedIn, and click <strong>"⚡ Harvest Emails On Screen"</strong>!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Close Setup Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChromeExtensionSetupModal;
