import React, { useState, useEffect } from "react";
import "./walkthrough.css";

interface TourStep {
  title: string;
  description: string;
  targetSelector?: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const WalkthroughTour: React.FC = () => {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Retrieve user information to identify role & unique key
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "guest";
  const role = user?.role || "CANDIDATE";

  // Build steps list based on user role
  const steps: TourStep[] = React.useMemo(() => {
    if (role === "RECRUITER") {
      return [
        {
          title: "Welcome, Recruiter! 💼",
          description: "Let's take a quick 1-minute tour of your dashboard to help you source and manage candidate pipelines efficiently.",
        },
        {
          title: "Dashboard Overview",
          description: "This is your main command header. It displays your current focus and sourcing status.",
          targetSelector: "[data-tour='recruiter-header']",
          placement: "bottom",
        },
        {
          title: "Sourcing Statistics",
          description: "Quick stats on your sourced candidates, active campaigns, and response rates are highlighted here.",
          targetSelector: "[data-tour='recruiter-stats']",
          placement: "bottom",
        },
        {
          title: "Outreach Campaigns",
          description: "View and manage active outreach campaigns sent to candidates, showing their open and response rates.",
          targetSelector: "[data-tour='recruiter-campaigns']",
          placement: "top",
        },
        {
          title: "Navigation Sidebar",
          description: "Manage your outreach lists, candidate profiles, and edit settings using the sidebar layout.",
          targetSelector: "[data-tour='sidebar-nav']",
          placement: "right",
        },
        {
          title: "Profile & Settings",
          description: "Update your hiring preferences, personal information, and replay this tour at any time from here.",
          targetSelector: "[data-tour='sidebar-profile']",
          placement: "right",
        },
        {
          title: "Ready to Hire! 🎉",
          description: "You are now set to source talent. If you ever need help, click the 'Guided Tour 💡' button in the header.",
        }
      ];
    }

    if (role === "COMPANY") {
      return [
        {
          title: "Welcome to Auto Apply Pro! 🏢",
          description: "Let's take a quick 1-minute tour to help you manage corporate job listings, applicant queues, and recruiting teams.",
        },
        {
          title: "Corporate Dashboard",
          description: "This is your corporate workspace. You can oversee job postings and internal recruiter performances.",
          targetSelector: "[data-tour='company-header']",
          placement: "bottom",
        },
        {
          title: "Hiring Pipeline",
          description: "Monitor your active job listings, internal recruiters, and total applicants received.",
          targetSelector: "[data-tour='company-stats']",
          placement: "bottom",
        },
        {
          title: "Active Job Listings",
          description: "A summary of currently active job postings and applicants. Add or modify listings directly.",
          targetSelector: "[data-tour='company-postings']",
          placement: "top",
        },
        {
          title: "Sidebar Access",
          description: "Navigate quickly to corporate settings, job listings, and recruiter profiles using this sidebar.",
          targetSelector: "[data-tour='sidebar-nav']",
          placement: "right",
        },
        {
          title: "Corporate Settings",
          description: "Review billing details, update your corporate profile, or replay this tour from the settings section.",
          targetSelector: "[data-tour='sidebar-profile']",
          placement: "right",
        },
        {
          title: "You're All Set! 🚀",
          description: "Start managing your talent pool now. You can re-run this tour anytime using the 'Guided Tour 💡' button in the header.",
        }
      ];
    }

    // Default: CANDIDATE Role Tour
    return [
      {
        title: "Welcome to Auto Apply Pro! 🚀",
        description: "Let's take a quick 1-minute tour of your candidate dashboard to automate your job application outreach.",
      },
      {
        title: "Candidate Dashboard",
        description: "This is your main view. Here you can track submitted applications, pending drafts, match suggestions, and sent emails.",
        targetSelector: "[data-tour='dashboard-header']",
        placement: "bottom",
      },
      {
        title: "Quick Navigation Sidebar",
        description: "Jump between active applications, upload and parse screenshots of job postings, manage outreach templates, and review billing.",
        targetSelector: "[data-tour='sidebar-nav']",
        placement: "right",
      },
      {
        title: "Gmail Automation Status",
        description: "Verify your email connection status here. Ensure your Gmail is connected to automatically draft and send outreach emails.",
        targetSelector: "[data-tour='gmail-status']",
        placement: "bottom",
      },
      {
        title: "Cold Email Campaigns",
        description: "Toggle this switch to run automated HR cold outreach campaigns. The system will dispatch tailored emails to recruiters within your quotas.",
        targetSelector: "[data-tour='campaign-widget']",
        placement: "top",
      },
      {
        title: "Daily learning space",
        description: "Keep up your learning streak and check out daily tips and questions of the day to sharpen your skills.",
        targetSelector: "[data-tour='learning-preview']",
        placement: "top",
      },
      {
        title: "Profile & Resume settings",
        description: "Upload your resume, manage account details, and customize your automated outreach preferences.",
        targetSelector: "[data-tour='sidebar-profile']",
        placement: "right",
      },
      {
        title: "You're Ready to Automate! 🎉",
        description: "Upload your resume and connect your Gmail to get started. You can replay this tour anytime using the 'Guided Tour 💡' button in the header.",
      }
    ];
  }, [role]);

  // Check storage and custom events to activate tour
  useEffect(() => {
    if (!userId || userId === "guest") return;

    const completed = localStorage.getItem(`walkthrough_completed_${userId}`);
    if (!completed) {
      setActive(true);
      setCurrentStep(0);
    }

    // Event listener to start tour programmatically
    const handleStartTour = () => {
      setActive(true);
      setCurrentStep(0);
    };

    window.addEventListener("start-walkthrough", handleStartTour);
    return () => {
      window.removeEventListener("start-walkthrough", handleStartTour);
    };
  }, [userId]);

  const activeStep = steps[currentStep];

  // Track coordinates of target element
  useEffect(() => {
    if (!active || !activeStep || !activeStep.targetSelector) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(activeStep.targetSelector!);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();

    // Event listeners
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    // Poll for changes in case content loads asynchronously
    const timer = setInterval(updateRect, 500);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      clearInterval(timer);
    };
  }, [active, activeStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        // Space bar overrides scroll default when tour is active
        if (e.key === " ") e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, currentStep, steps.length]);

  const handleNext = () => {
    console.log("Walkthrough: handleNext called. Current step:", currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    console.log("Walkthrough: handleBack called. Current step:", currentStep);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    console.log("Walkthrough: handleSkip called.");
    handleComplete();
  };

  const handleComplete = () => {
    console.log("Walkthrough: Tour completed / saved.");
    setActive(false);
    localStorage.setItem(`walkthrough_completed_${userId}`, "true");
  };

  if (!active || !activeStep) return null;

  const hasTarget = !!activeStep.targetSelector && !!rect;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Tooltip position inline styling (fallback coordinates calculation)
  const getTooltipStyle = (): React.CSSProperties => {
    if (!hasTarget || !rect) {
      return {}; // Handled by centered modal CSS class
    }

    const margin = 16;
    const placement = activeStep.placement || "bottom";

    switch (placement) {
      case "top":
        return {
          top: `${rect.top - margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: `${rect.bottom + margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - margin}px`,
          transform: "translate(-100%, -50%)",
        };
      case "right":
      default:
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + margin}px`,
          transform: "translate(0, -50%)",
        };
    }
  };

  const placement = activeStep.placement || "bottom";

  return (
    <div className="tour-backdrop">
      {/* SVG Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full z-[1]">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* The white background shows the screen details */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* The black cutout creates a transparent window on the target */}
            {hasTarget && rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="12"
                fill="black"
                className="tour-spotlight-rect"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.6)"
          mask="url(#tour-spotlight-mask)"
          className="tour-backdrop-overlay pointer-events-auto"
          onClick={handleSkip} // Clicking backdrop skips/closes tour
        />
      </svg>

      {/* Target pulse spotlight outline */}
      {hasTarget && rect && (
        <div
          className="tour-target-highlight"
          style={{
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
          }}
        />
      )}

      {/* Tour Dialog Popover Card */}
      <div
        className={`tour-tooltip-card ${!hasTarget ? "tour-modal-center" : ""}`}
        style={getTooltipStyle()}
        role="dialog"
        aria-labelledby="tour-card-title"
      >
        {/* Placement arrow anchor */}
        {hasTarget && (
          <div className={`tour-arrow tour-arrow-${placement}`} />
        )}

        {/* Step Progression Badge */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="tour-step-badge">
            {isFirst ? "Welcome" : isLast ? "Completion" : `Step ${currentStep} of ${steps.length - 2}`}
          </span>
          {!isLast && (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors focus:outline-none"
              title="Skip tour"
            >
              Skip Tour
            </button>
          )}
        </div>

        {/* Heading Title */}
        <h2 id="tour-card-title" className="tour-title mb-2">
          {activeStep.title}
        </h2>

        {/* Content text */}
        <p className="tour-description mb-6">
          {activeStep.description}
        </p>

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex space-x-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`tour-dot ${idx === currentStep ? "active" : ""}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-600 rounded-btn transition-colors focus:outline-none"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover font-semibold text-xs text-white rounded-btn shadow-sm transition-colors focus:outline-none"
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkthroughTour;
