import React from 'react';

interface ChromeExtensionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChromeExtensionSetupModal: React.FC<ChromeExtensionSetupModalProps> = ({ isOpen, onClose }) => {
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
              EasyNaukri Chrome Extension Setup Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Run automated background job harvesting & 1-click recruiter email discovery directly from your browser.
            </p>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          {/* Step 1 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Download Extension Package</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The extension package is pre-built in your Auto Apply Pro project directory under <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">auto-apply-pro/extension</code>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Open Chrome Extensions & Enable Developer Mode</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Open Google Chrome and navigate to <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chrome://extensions</code> in your address bar. Toggle ON <strong>"Developer mode"</strong> in the top-right corner.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Click "Load Unpacked" & Select Extension Folder</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Click the <strong>"Load unpacked"</strong> button in the top-left corner and select the <code className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">auto-apply-pro/extension</code> folder from your computer.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits & Actions */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-xs text-emerald-300">
          ✨ <strong>Automatic Functionality</strong>: Once loaded, toggle ON <em>Automated Background Harvester</em> in your settings. The extension will automatically harvest new jobs & recruiter emails in the background!
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChromeExtensionSetupModal;
