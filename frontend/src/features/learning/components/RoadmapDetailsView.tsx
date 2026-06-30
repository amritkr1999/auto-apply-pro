import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { Roadmap } from "../services/learningService";

export const RoadmapDetailsView: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const idNum = Number(roadmapId);
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoadmapDetails = async () => {
      if (isNaN(idNum)) return;
      try {
        setLoading(true);
        setError(null);
        const data = await learningService.getRoadmapDetails(idNum);
        setRoadmap(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load roadmap details. Please return and try again.");
      } finally {
        setLoading(false);
      }
    };
    loadRoadmapDetails();
  }, [roadmapId]);

  const getTopicIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "java":
        return (
          <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 17.2s2.6-.9 4.3-.9c1.6 0 4.1.7 4.1 2.3 0 2.2-3.1 2.4-4.8 2.4-1.9 0-3.6-.9-3.6-2.2 0-.9 1.1-1.6 1.1-1.6zm9-1.9c0-1.8 1.9-2.9 3.9-2.9s3.6.8 3.6 2.4c0 2.2-3 2.5-4.8 2.5-1.9 0-3.6-.9-3.6-2.2 0-.9.9-1.5 1.1-1.5zm.9-8.4c-1.5 1.1-1.2 3.1 1 3.5 2.1.4 3-1.8 1.1-3.6-1.1-1.1-2.1-.8-2.1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 13.9c-2.4 0-4.4-.7-4.4-1.6 0-1.2 2.6-1.5 4.3-1.5 2 0 4.5.7 4.5 1.8 0 1.2-2.3 1.3-4.4 1.3zm6.3-1.3c-2 0-3.7-.6-3.7-1.3 0-1 2.2-1.3 3.6-1.3 1.7 0 3.7.6 3.7 1.5 0 .9-1.9 1.1-3.6 1.1z" />
          </svg>
        );
      case "python":
        return (
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.25.18a3.25 3.25 0 0 0-3 .75 3.25 3.25 0 0 0-.75 3v1.82h3.75a.75.75 0 0 1 .75.75v3.75h1.82a3.25 3.25 0 0 0 3-.75 3.25 3.25 0 0 0 .75-3V3.68a3.25 3.25 0 0 0-3.25-3.25zm-4.5 14.32a3.25 3.25 0 0 0-3 3 3.25 3.25 0 0 0 3 3h3.75a.75.75 0 0 0 .75-.75v-3.75h-1.82a3.25 3.25 0 0 0-3 .75zm-6.07-5.25a3.25 3.25 0 0 0-3.25 3.25v3.82a3.25 3.25 0 0 0 3.25 3.25h1.82v-3.75a.75.75 0 0 1 .75-.75h3.75V9.75h-1.82a3.25 3.25 0 0 0-3-.75z" />
          </svg>
        );
      case "spring":
        return (
          <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1-4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-5 4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5S7 17.33 7 16.5zm5-9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
          </svg>
        );
      case "javascript":
        return (
          <div className="w-5 h-5 bg-yellow-400 text-black font-extrabold flex items-center justify-center rounded text-[10px] tracking-tighter">
            JS
          </div>
        );
      case "react":
        return (
          <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(30 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(90 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(150 12 12)" />
            <circle r="1" cx="12" cy="12" fill="currentColor" />
          </svg>
        );
      case "angular":
        return (
          <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2.7 5.3l1.4 12.2L12 22l7.9-4.5 1.4-12.2L12 2zm0 2.8l5.8 10.2H15l-1.3-3.2H10.3l-1.3 3.2H6.2L12 4.8zm2.2 7.8L12 7.7l-2.2 4.9h4.4z" />
          </svg>
        );
      case "ml":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h7.5M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case "sql":
        return (
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 10.125v3.75" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
    }
  };

  const getTopicColorTheme = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "java":
        return { bg: "bg-orange-50", text: "text-orange-800" };
      case "python":
        return { bg: "bg-blue-50", text: "text-blue-800" };
      case "spring":
        return { bg: "bg-emerald-50", text: "text-emerald-800" };
      case "javascript":
        return { bg: "bg-yellow-50", text: "text-yellow-800" };
      case "react":
        return { bg: "bg-sky-50", text: "text-sky-800" };
      case "angular":
        return { bg: "bg-rose-50", text: "text-rose-800" };
      case "ml":
        return { bg: "bg-purple-50", text: "text-purple-800" };
      case "sql":
        return { bg: "bg-emerald-50", text: "text-emerald-800" };
      default:
        return { bg: "bg-slate-50", text: "text-slate-800" };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading career roadmap path...</p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-slate-800">{error || "Roadmap Unavailable"}</h3>
        <Link to="/learning" className="mt-4 inline-block text-primary hover:underline font-semibold text-sm">
          ← Back to Learning Space
        </Link>
      </div>
    );
  }

  const percent = roadmap.progressPercentage || 0;

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Link to="/learning" className="hover:text-primary transition-colors">LEARNING SPACE</Link>
            <span>/</span>
            <span className="text-slate-600 uppercase">ROADMAPS</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{roadmap.title}</h1>
        </div>
        
        <Link
          to="/learning"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-primary transition-colors focus:outline-none"
        >
          ← Back to Roadmaps
        </Link>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-extrabold">
              Structured Timeline
            </span>
            <h2 className="text-xl font-bold tracking-tight">{roadmap.title} Milestone Map</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">{roadmap.description}</p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="space-y-1 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Path Complete</span>
              <span className="text-lg font-black text-indigo-300">{percent}% Completed</span>
            </div>
            <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden flex-shrink-0">
              <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline Path */}
      <div className="relative pl-6 sm:pl-8 border-l border-slate-200 ml-4 py-4 space-y-12">
        {roadmap.steps && roadmap.steps.map((step) => {
          const stepPercent = step.progressPercentage || 0;
          const isFinished = stepPercent === 100;

          return (
            <div key={step.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isFinished 
                  ? "bg-green-100 border-green-500 text-green-700 shadow-sm shadow-green-100" 
                  : "bg-white border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600"
              }`}>
                {isFinished ? "✓" : step.stepOrder}
              </div>

              {/* Milestone Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-300 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Milestone {step.stepOrder}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">{step.title}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                    <span className="text-[11px] text-slate-500 font-semibold">{stepPercent}% Complete</span>
                    <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${stepPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Subtopic details: click-to-learn worksheets */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Associated Subject Materials</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {step.topics.map((topic) => {
                      const theme = getTopicColorTheme(topic.icon);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => navigate(`/learning/topic/${topic.id}`)}
                          className={`border border-slate-200 hover:border-slate-300 rounded-lg p-3 hover:shadow-sm transition-all duration-200 flex items-center justify-between cursor-pointer group bg-white`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-2 rounded-md ${theme.bg}`}>
                              {getTopicIcon(topic.icon)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-700 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                                {topic.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate">Worksheet</p>
                            </div>
                          </div>
                          <span className="text-slate-300 group-hover:text-primary transition-colors text-xs font-bold shrink-0 ml-2">
                            →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapDetailsView;
