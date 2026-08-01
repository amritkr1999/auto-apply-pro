import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 transition-colors">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span>© {new Date().getFullYear()} EasyNaukri. All rights reserved.</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Made with ❤️ by an Indian for India 🇮🇳</span>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            to="/about"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            About Us
          </Link>
          <Link
            to="/careers"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Careers
          </Link>
          <a
            href="https://www.linkedin.com/company/easynaukri/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"
          >
            <span>💼</span> LinkedIn
          </a>
          <a
            href="https://www.instagram.com/easynaukri.online"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium inline-flex items-center gap-1"
          >
            <span>📷</span> Instagram
          </a>
          <Link
            to="/privacy"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
