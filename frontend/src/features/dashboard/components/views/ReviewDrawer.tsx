import React from "react";
import Button from "../../../../components/ui/Button";

interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onFieldChange: (id: string, field: string, value: string) => void;
  onApprove: (id: string, item: any) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  isOpen,
  onClose,
  item,
  onFieldChange,
  onApprove,
  onDiscard,
}) => {
  if (!isOpen || !item) return null;

  const ccList = item.ccEmails ? item.ccEmails.split(',').map((c: string) => c.trim()) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
        <div className="w-screen max-w-2xl transform transition-transform duration-300 ease-in-out translate-x-0 animate-in slide-in-from-right-full">
          <div className="h-full flex flex-col bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800">
            
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Review & Approve
                </span>
                <h3 className="text-lg font-bold mt-2">Edit Outreach Mail</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Parsed Emails Section */}
              {item.parsedEmails && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                    Parsed Emails from Job Posting:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.parsedEmails.split(',').map((email: string) => {
                      const trimmed = email.trim();
                      if (!trimmed) return null;
                      const isPrimary = item.recipientEmail === trimmed;
                      const isCC = ccList.includes(trimmed);
                      
                      return (
                        <button
                          key={trimmed}
                          type="button"
                          onClick={() => {
                            if (!isPrimary) {
                              const newCc = ccList.filter((c: string) => c !== trimmed).join(', ');
                              onFieldChange(item.id, "recipientEmail", trimmed);
                              onFieldChange(item.id, "ccEmails", newCc);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all border font-semibold flex items-center gap-1.5 ${
                            isPrimary 
                              ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                              : isCC 
                                ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                        >
                          <span>{trimmed}</span>
                          {isPrimary && <span className="text-[8px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1 rounded-full uppercase font-bold">To</span>}
                          {isCC && <span className="text-[8px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1 rounded-full uppercase font-bold">CC</span>}
                          {!isPrimary && !isCC && (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedCc = [...ccList, trimmed].join(', ');
                                onFieldChange(item.id, "ccEmails", updatedCc);
                              }}
                              className="hover:bg-slate-200 dark:hover:bg-slate-800 rounded px-1 text-[10px]"
                              title="Add to CC"
                            >
                              +CC
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recipient Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Recipient Email (To)
                  </label>
                  <input 
                    type="email"
                    value={item.recipientEmail || ''}
                    onChange={(e) => onFieldChange(item.id, "recipientEmail", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-input text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="recruiter@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    CC Emails (Comma-separated)
                  </label>
                  <input 
                    type="text"
                    value={item.ccEmails || ''}
                    onChange={(e) => onFieldChange(item.id, "ccEmails", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-input text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="cc1@company.com, cc2@company.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Subject Line
                </label>
                <input 
                  type="text"
                  value={item.subject}
                  onChange={(e) => onFieldChange(item.id, "subject", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-input text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Subject line"
                />
              </div>

              {/* Email Content Body */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Body (Markdown/HTML supported)
                </label>
                <textarea 
                  value={item.body}
                  onChange={(e) => onFieldChange(item.id, "body", e.target.value)}
                  rows={14}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-input text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono leading-relaxed resize-vertical"
                  placeholder="Write email body..."
                />
              </div>

            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
              <Button 
                variant="outline" 
                onClick={async () => {
                  await onDiscard(item.id);
                  onClose();
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-250 dark:border-rose-900/50 px-5 py-2.5"
              >
                Discard Draft
              </Button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <Button 
                  variant="success" 
                  onClick={async () => {
                    await onApprove(item.id, item);
                    onClose();
                  }}
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 border-none shadow-md"
                >
                  Approve & Schedule
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
