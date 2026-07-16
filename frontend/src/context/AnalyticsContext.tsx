import React, { createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

interface AnalyticsContextType {
  trackEvent: (eventName: string, eventParams?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const gaInitialized = useRef(false);
  const clarityInitialized = useRef(false);

  // Initialize GA4 dynamically
  useEffect(() => {
    if (!GA_ID || gaInitialized.current) return;

    try {
      // Create gtag function script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };

      window.gtag("js", new Date());
      window.gtag("config", GA_ID, {
        page_path: window.location.pathname + window.location.search,
      });

      gaInitialized.current = true;
      console.log("[Analytics] Google Analytics 4 initialized with ID:", GA_ID);
    } catch (error) {
      console.error("[Analytics] Failed to initialize Google Analytics 4:", error);
    }
  }, []);

  // Initialize Microsoft Clarity dynamically
  useEffect(() => {
    if (!CLARITY_ID || clarityInitialized.current) return;

    try {
      // Clarity tracking snippet
      (function (c: any, l: Document, a: string, r: string, i: string, t?: any, y?: any) {
        c[a] =
          c[a] ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = true;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode?.insertBefore(t, y);
      })(window, document, "clarity", "script", CLARITY_ID);

      clarityInitialized.current = true;
      console.log("[Analytics] Microsoft Clarity initialized with ID:", CLARITY_ID);
    } catch (error) {
      console.error("[Analytics] Failed to initialize Microsoft Clarity:", error);
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (GA_ID && window.gtag) {
      window.gtag("config", GA_ID, {
        page_path: location.pathname + location.search,
      });
      console.log("[Analytics] Page view tracked:", location.pathname + location.search);
    }
  }, [location]);

  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    // Track in Google Analytics
    if (GA_ID && window.gtag) {
      window.gtag("event", eventName, eventParams);
      console.log(`[Analytics] GA Event: ${eventName}`, eventParams);
    }

    // Track in Microsoft Clarity
    if (CLARITY_ID && window.clarity) {
      window.clarity("event", eventName);
      console.log(`[Analytics] Clarity Event: ${eventName}`);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return a fallback no-op if context is missing
    return {
      trackEvent: (name, params) => {
        console.warn("[Analytics] Provider missing. Event skipped:", name, params);
      },
    };
  }
  return context;
};
