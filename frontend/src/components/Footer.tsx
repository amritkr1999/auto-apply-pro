import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Auto Apply Pro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
