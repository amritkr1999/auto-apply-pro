import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

interface DarkModeToggleProps {
  className?: string;
  variant?: "icon" | "menu-item";
  tooltipPosition?: "bottom" | "top" | "left" | "right";
  style?: React.CSSProperties;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  className = "",
  variant = "icon",
  tooltipPosition = "bottom",
  style = {},
}) => {
  const { resolvedTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  if (variant === "menu-item") {
    return (
      <div
        className="relative group w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          type="button"
          disabled
          aria-label="Dark mode coming soon"
          title="Coming Soon"
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75 border border-slate-200 dark:border-slate-700/50 ${className}`}
          style={style}
        >
          <span className="flex items-center gap-2 font-medium text-xs sm:text-sm">
            {resolvedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Coming Soon
          </span>
        </button>

        {/* Hover Prompt Tooltip */}
        <div
          className={`absolute left-1/2 -top-10 -translate-x-1/2 z-50 transition-all duration-200 pointer-events-none ${
            isHovered ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
          }`}
        >
          <div className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-700/80 whitespace-nowrap">
            Coming Soon
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      </div>
    );
  }

  const tooltipPosClasses = {
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[tooltipPosition];

  const arrowClasses = {
    bottom: "-top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900",
    top: "top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900",
    left: "left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900",
    right: "right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900",
  }[tooltipPosition];

  return (
    <div
      className="relative inline-flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        disabled
        aria-label="Dark mode coming soon"
        title="Coming Soon"
        className={`p-1.5 sm:p-2 rounded-md text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 transition-all focus:outline-none ${className}`}
        style={style}
      >
        {resolvedTheme === "dark" ? (
          <svg className="w-5 h-5 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-indigo-600/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Hover Prompt Tooltip */}
      <div
        className={`absolute ${tooltipPosClasses} z-50 transition-all duration-200 pointer-events-none ${
          isHovered ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="relative px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-700/80 whitespace-nowrap flex items-center gap-1">
          <span>Coming Soon</span>
        </div>
        <div className={`absolute ${arrowClasses}`} />
      </div>
    </div>
  );
};
