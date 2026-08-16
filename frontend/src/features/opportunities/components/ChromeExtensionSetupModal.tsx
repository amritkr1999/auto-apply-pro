import React, { useState } from 'react';

interface ChromeExtensionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionSetupModal: React.FC<ChromeExtensionSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'webstore' | 'developer'>('webstore');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 p-6 md:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold">
            🔌
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              EasyNaukri Extension Setup
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose the easiest installation method for your browser.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('webstore')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'webstore'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Chrome Web Store (1-Click Non-Tech)
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'developer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Local Developer Mode (Testing)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'webstore' ? (
          <div className="space-y-5 mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="text-base font-bold text-emerald-300">1-Click Official Extension Installation</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                No developer settings required! Click below to open the Chrome Web Store and click <strong>"Add to Chrome"</strong>.
              </p>

              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg hover:scale-105"
              >
                🌐 Open Official Chrome Web Store Page ↗
              </a>
            </div>

            {/* Direct ZIP Download Option in Modal */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-amber-300">Or Download Direct Extension Package (.ZIP)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Download ZIP for unreleased / developer mode installation.</p>
              </div>
              <a
                href="/easynaukri-extension.zip"
                download="easynaukri-extension.zip"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              >
                📥 Download ZIP
              </a>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              📌 <strong>What happens next?</strong> After installing from the Chrome Web Store or loading the unzipped folder, the extension runs automatically whenever you turn ON the <em>Automated Background Harvester</em> toggle.
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* Step 1 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Download Extension Package (.ZIP)</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Click the button to download <code className="text-amber-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">easynaukri-extension.zip</code> and extract it into your Documents folder.
                  </p>
                </div>
              </div>

              <a
                href="/easynaukri-extension.zip"
                download="easynaukri-extension.zip"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              >
                📥 Download ZIP
              </a>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Open Chrome Extensions & Enable Developer Mode</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Go to <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chrome://extensions</code> in Chrome. Toggle ON <strong>"Developer mode"</strong> in the top-right.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Click "Load Unpacked" & Select Unzipped Folder</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Click <strong>"Load unpacked"</strong> (top-left) and select the unzipped <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">easynaukri-extension</code> folder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
          >
            Close Setup Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChromeExtensionSetupModal;
