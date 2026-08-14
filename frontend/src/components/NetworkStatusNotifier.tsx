import React, { useState, useEffect } from "react";

export const NetworkStatusNotifier: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API check for slow 2G / high latency
    interface NetworkInfo {
      effectiveType?: string;
      rtt?: number;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    }
    const nav = navigator as unknown as {
      connection?: NetworkInfo;
      mozConnection?: NetworkInfo;
      webkitConnection?: NetworkInfo;
    };
    const navConn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (navConn) {
      const checkConnectionSpeed = () => {
        const slow = navConn.effectiveType === "slow-2g" || navConn.effectiveType === "2g" || (navConn.rtt !== undefined && navConn.rtt > 2000);
        setIsSlowConnection(!!slow);
      };

      checkConnectionSpeed();
      navConn.addEventListener?.("change", checkConnectionSpeed);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        navConn.removeEventListener?.("change", checkConnectionSpeed);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (dismissed || (!isOffline && !isSlowConnection)) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 dark:bg-slate-800/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          {isOffline ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m0 0l2.829-2.829m-2.829 2.829L3 3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">
            {isOffline ? "You are offline" : "Slow Connection Detected"}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {isOffline
              ? "Check your internet connection to continue sync."
              : "Pages and responses may take longer to load."}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleRetry}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus:outline-none"
            >
              Retry
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusNotifier;
