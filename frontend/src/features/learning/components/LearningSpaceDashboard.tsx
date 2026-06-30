import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { Topic, DailyContent, Progress, Roadmap } from "../services/learningService";

export const LearningSpaceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeView, setActiveView] = useState<"topics" | "roadmaps">("topics");
  const [daily, setDaily] = useState<DailyContent | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submitResult, setSubmitResult] = useState<{ correct: boolean; correctAnswer: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [topicsData, dailyData, progressData, roadmapsData] = await Promise.all([
          learningService.getTopics(),
          learningService.getDailyContent(),
          learningService.getProgress(),
          learningService.getRoadmaps()
        ]);
        setTopics(topicsData);
        setDaily(dailyData);
        setProgress(progressData);
        setRoadmaps(roadmapsData);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load learning space. Please make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!daily?.question || !selectedAnswer || submitResult) return;

    try {
      const result = await learningService.submitAnswer(daily.question.id, selectedAnswer);
      setSubmitResult(result);
      // Refresh progress metrics
      const progressData = await learningService.getProgress();
      setProgress(progressData);
    } catch (err) {
      console.error(err);
    }
  };

  const getTopicIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "java":
        return (
          <svg className="w-10 h-10 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 17.2s2.6-.9 4.3-.9c1.6 0 4.1.7 4.1 2.3 0 2.2-3.1 2.4-4.8 2.4-1.9 0-3.6-.9-3.6-2.2 0-.9 1.1-1.6 1.1-1.6zm9-1.9c0-1.8 1.9-2.9 3.9-2.9s3.6.8 3.6 2.4c0 2.2-3 2.5-4.8 2.5-1.9 0-3.6-.9-3.6-2.2 0-.9.9-1.5 1.1-1.5zm.9-8.4c-1.5 1.1-1.2 3.1 1 3.5 2.1.4 3-1.8 1.1-3.6-1.1-1.1-2.1-.8-2.1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 13.9c-2.4 0-4.4-.7-4.4-1.6 0-1.2 2.6-1.5 4.3-1.5 2 0 4.5.7 4.5 1.8 0 1.2-2.3 1.3-4.4 1.3zm6.3-1.3c-2 0-3.7-.6-3.7-1.3 0-1 2.2-1.3 3.6-1.3 1.7 0 3.7.6 3.7 1.5 0 .9-1.9 1.1-3.6 1.1z" />
          </svg>
        );
      case "python":
        return (
          <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.25.18a3.25 3.25 0 0 0-3 .75 3.25 3.25 0 0 0-.75 3v1.82h3.75a.75.75 0 0 1 .75.75v3.75h1.82a3.25 3.25 0 0 0 3-.75 3.25 3.25 0 0 0 .75-3V3.68a3.25 3.25 0 0 0-3.25-3.25zm-4.5 14.32a3.25 3.25 0 0 0-3 3 3.25 3.25 0 0 0 3 3h3.75a.75.75 0 0 0 .75-.75v-3.75h-1.82a3.25 3.25 0 0 0-3 .75zm-6.07-5.25a3.25 3.25 0 0 0-3.25 3.25v3.82a3.25 3.25 0 0 0 3.25 3.25h1.82v-3.75a.75.75 0 0 1 .75-.75h3.75V9.75h-1.82a3.25 3.25 0 0 0-3-.75z" />
          </svg>
        );
      case "spring":
        return (
          <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1-4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-5 4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5S7 17.33 7 16.5zm5-9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
          </svg>
        );
      case "javascript":
        return (
          <div className="w-10 h-10 bg-yellow-400 text-black font-black flex items-center justify-center rounded text-lg tracking-tighter">
            JS
          </div>
        );
      case "react":
        return (
          <svg className="w-10 h-10 text-sky-400 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(30 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(90 12 12)" />
            <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(150 12 12)" />
            <circle r="1.5" cx="12" cy="12" fill="currentColor" />
          </svg>
        );
      case "angular":
        return (
          <svg className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2.7 5.3l1.4 12.2L12 22l7.9-4.5 1.4-12.2L12 2zm0 2.8l5.8 10.2H15l-1.3-3.2H10.3l-1.3 3.2H6.2L12 4.8zm2.2 7.8L12 7.7l-2.2 4.9h4.4z" />
          </svg>
        );
      case "cpp":
        return (
          <div className="w-10 h-10 bg-indigo-600 text-white font-extrabold flex items-center justify-center rounded text-sm">
            C++
          </div>
        );
      case "flutter":
        return (
          <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.3 2.3L5 11.6l4.7 4.7 9.3-9.3zM14.3 21.7L9.6 17l4.7-4.7 4.7 4.7z" />
          </svg>
        );
      case "go":
        return (
          <div className="w-10 h-10 bg-sky-200 text-sky-800 font-extrabold flex items-center justify-center rounded text-lg italic">
            Go
          </div>
        );
      case "kafka":
        return (
          <svg className="w-10 h-10 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12h16M12 4v16" strokeLinecap="round" />
            <circle cx="12" cy="12" r="5" fill="white" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      case "redis":
        return (
          <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
    }
  };

  const getTopicColorTheme = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "java":
        return { bg: "bg-orange-50", border: "hover:border-orange-300", accent: "bg-orange-500" };
      case "python":
        return { bg: "bg-blue-50", border: "hover:border-blue-300", accent: "bg-blue-500" };
      case "spring":
        return { bg: "bg-emerald-50", border: "hover:border-emerald-300", accent: "bg-emerald-500" };
      case "javascript":
        return { bg: "bg-yellow-50", border: "hover:border-yellow-300", accent: "bg-yellow-500" };
      case "react":
        return { bg: "bg-sky-50", border: "hover:border-sky-300", accent: "bg-sky-400" };
      case "angular":
        return { bg: "bg-rose-50", border: "hover:border-rose-300", accent: "bg-rose-500" };
      case "cpp":
        return { bg: "bg-indigo-50", border: "hover:border-indigo-300", accent: "bg-indigo-600" };
      case "flutter":
        return { bg: "bg-cyan-50", border: "hover:border-cyan-300", accent: "bg-cyan-400" };
      case "go":
        return { bg: "bg-sky-50", border: "hover:border-sky-300", accent: "bg-sky-500" };
      case "kafka":
        return { bg: "bg-slate-50", border: "hover:border-slate-300", accent: "bg-slate-700" };
      case "redis":
        return { bg: "bg-red-50", border: "hover:border-red-300", accent: "bg-red-500" };
      default:
        return { bg: "bg-slate-50", border: "hover:border-slate-300", accent: "bg-primary" };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Entering the Learning Space...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto text-center mt-10">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-red-800 mb-2">Error Loading Learning Space</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-btn transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overallPercent = progress?.overallPercentage || 0;

  return (
    <div className="space-y-8 flex-1">
      {/* 1. Header & Progress Panel */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Skill Acquisition
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Candidate Learning Space</h1>
            <p className="text-slate-300 max-w-xl text-sm sm:text-base">
              Expand your tech stack, practice interview questions, and study official documentations to boost your candidacy.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-center gap-5 min-w-[280px]">
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-white/10 fill-none" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-indigo-400 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallPercent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold">{overallPercent}%</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Overall Progress</h4>
              <p className="text-sm font-medium">
                <span className="text-indigo-300 font-bold">{progress?.solvedQuestions}</span> / {progress?.totalQuestions} Questions
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-indigo-300 font-bold">{progress?.completedResources}</span> / {progress?.totalResources} Resources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Daily Engagement Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Tip (Left / 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg className="w-32 h-32 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Tip of the Day</h2>
            </div>
            {daily?.tip ? (
              <div className="space-y-2">
                <h3 className="font-bold text-indigo-950 text-base">{daily.tip.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{daily.tip.content}</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No tip available for today.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Refreshes Daily</span>
            <span>💡 Developer Best Practice</span>
          </div>
        </div>

        {/* Question of the Day (Right / 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Question of the Day</h2>
              </div>
              {daily?.question && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  daily.question.difficulty === "EASY" ? "bg-green-100 text-green-700" :
                  daily.question.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                  "bg-rose-100 text-rose-700"
                }`}>
                  {daily.question.difficulty}
                </span>
              )}
            </div>

            {daily?.question ? (
              <form onSubmit={handleDailySubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{daily.question.topicName}</span>
                  <h3 className="font-bold text-slate-800 text-base mt-1">{daily.question.title}</h3>
                  <p className="text-slate-600 text-sm mt-2 font-medium">{daily.question.content}</p>
                </div>

                <div className="space-y-2">
                  {daily.question.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice;
                    const isCorrectChoice = submitResult?.correctAnswer === choice;
                    const isWrongChoice = submitResult && isSelected && !submitResult.correct;

                    let choiceStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
                    if (isSelected && !submitResult) {
                      choiceStyle = "border-primary bg-blue-50/50 text-primary font-medium";
                    } else if (submitResult) {
                      if (isCorrectChoice) {
                        choiceStyle = "border-success bg-green-50 text-success font-semibold";
                      } else if (isWrongChoice) {
                        choiceStyle = "border-error bg-red-50 text-error font-semibold";
                      } else {
                        choiceStyle = "border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 text-sm ${choiceStyle}`}
                      >
                        <input
                          type="radio"
                          name="daily-q"
                          value={choice}
                          checked={isSelected}
                          disabled={submitResult !== null}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          className="mt-0.5 accent-primary h-4 w-4"
                        />
                        <span>{choice}</span>
                      </label>
                    );
                  })}
                </div>

                {!submitResult ? (
                  <button
                    type="submit"
                    disabled={!selectedAnswer}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-btn transition-colors disabled:opacity-50 text-sm"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className={`p-4 rounded-lg border text-sm space-y-2 ${
                    submitResult.correct ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50/50 border-red-200 text-slate-700"
                  }`}>
                    <div className="flex items-center gap-2">
                      {submitResult.correct ? (
                        <span className="font-extrabold text-success text-base">✓ Correct!</span>
                      ) : (
                        <span className="font-extrabold text-error text-base">✗ Incorrect</span>
                      )}
                    </div>
                    <p className="leading-relaxed"><strong className="text-slate-800">Explanation:</strong> {submitResult.explanation}</p>
                  </div>
                )}
              </form>
            ) : (
              <p className="text-slate-400 text-sm">No question available for today.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Toggleable Subjects & Roadmaps View */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveView("topics")}
              className={`pb-3 font-extrabold text-sm border-b-2 transition-all duration-200 focus:outline-none ${
                activeView === "topics"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Core Subjects
            </button>
            <button
              onClick={() => setActiveView("roadmaps")}
              className={`pb-3 font-extrabold text-sm border-b-2 transition-all duration-200 focus:outline-none ${
                activeView === "roadmaps"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Career Roadmaps
            </button>
          </div>
        </div>

        {activeView === "topics" ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Choose a Topic</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Select a language or framework to access reference links and subtopic worksheets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topics.map((topic) => {
                const theme = getTopicColorTheme(topic.icon);
                const topicProgress = progress?.topicProgress?.find((p) => p.topicId === topic.id);
                const solvedCount = topicProgress?.solvedQuestions || 0;
                const totalCount = topicProgress?.totalQuestions || 0;
                const resSolved = topicProgress?.completedResources || 0;
                const resTotal = topicProgress?.totalResources || 0;
                const percent = topicProgress?.percentage || 0;

                return (
                  <div
                    key={topic.id}
                    onClick={() => navigate(`/learning/topic/${topic.id}`)}
                    className={`bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between ${theme.border} group`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${theme.bg} group-hover:scale-110 transition-transform duration-300`}>
                          {getTopicIcon(topic.icon)}
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                          Enter Space →
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-slate-800 group-hover:text-slate-900 text-base">{topic.name}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{topic.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Progress: {percent}%</span>
                        <span>Q: {solvedCount}/{totalCount} | R: {resSolved}/{resTotal}</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${theme.accent} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>

                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {topic.subtopics.slice(0, 2).map((sub) => (
                            <span key={sub.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium truncate max-w-[100px]">
                              {sub.name}
                            </span>
                          ))}
                          {topic.subtopics.length > 2 && (
                            <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                              +{topic.subtopics.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Select a Career Path</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Structured learning timelines combining multiple topics to master a specialization.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {roadmaps.map((rm) => {
                const percent = rm.progressPercentage || 0;
                
                let cardTheme = "hover:border-indigo-300";
                let progressAccent = "bg-indigo-500";
                let iconColor = "text-indigo-600 bg-indigo-50";
                
                const titleLower = rm.title.toLowerCase();
                if (titleLower.includes("java full stack") || titleLower.includes("java backend")) {
                  cardTheme = "hover:border-orange-300";
                  progressAccent = "bg-orange-500";
                  iconColor = "text-orange-600 bg-orange-50";
                } else if (titleLower.includes("python")) {
                  cardTheme = "hover:border-blue-300";
                  progressAccent = "bg-blue-500";
                  iconColor = "text-blue-600 bg-blue-50";
                } else if (titleLower.includes("ai engineer")) {
                  cardTheme = "hover:border-purple-300";
                  progressAccent = "bg-purple-500";
                  iconColor = "text-purple-600 bg-purple-50";
                } else if (titleLower.includes("frontend")) {
                  cardTheme = "hover:border-rose-300";
                  progressAccent = "bg-rose-500";
                  iconColor = "text-rose-600 bg-rose-50";
                } else if (titleLower.includes("data analyst")) {
                  cardTheme = "hover:border-emerald-300";
                  progressAccent = "bg-emerald-500";
                  iconColor = "text-emerald-600 bg-emerald-50";
                }

                return (
                  <div
                    key={rm.id}
                    onClick={() => navigate(`/learning/roadmap/${rm.id}`)}
                    className={`bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between ${cardTheme} group`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                          {rm.icon === "cpu" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m10.5-5.25v1.5M3 12h1.5m16.5-.75h-1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                          ) : rm.icon === "chart" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                            </svg>
                          ) : rm.icon === "database" ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 10.125v3.75m16.5 0v3.75m-16.5-3.75v3.75" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c2.917 0 5.747.294 8.5.862m-21 10.398c0-.552.448-1 1-1h6.25a1 1 0 011 1v3.834a1 1 0 01-1 1H2.5a1 1 0 01-1-1v-3.834z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                          View Roadmap →
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-bold text-slate-800 group-hover:text-slate-900 text-base">{rm.title}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{rm.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Completion: {percent}%</span>
                        <span>Structured Learning Path</span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${progressAccent} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningSpaceDashboard;
