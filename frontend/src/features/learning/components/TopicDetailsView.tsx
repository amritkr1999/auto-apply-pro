import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { Topic, Resource, PracticeQuestion, SubmitResponse } from "../services/learningService";

export const TopicDetailsView: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const idNum = Number(topicId);

  const [parentTopic, setParentTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Topic | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [ratingsState, setRatingsState] = useState<Record<number, { rating: number; comment: string; submitted: boolean; loading: boolean }>>({});
  
  // Interactive State
  const [activeTab, setActiveTab] = useState<"questions" | "documentation" | "videos">("questions");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Question answering state mapping questionId -> selectedOption
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  // Question solve result mapping questionId -> SubmitResponse
  const [solveResults, setSolveResults] = useState<Record<number, SubmitResponse>>({});
  // Expanded question card ID for inline drawer
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopicWorkspace = async () => {
      if (isNaN(idNum)) return;
      try {
        setLoading(true);
        setError(null);
        
        // Find the main topic details in the hierarchy
        const topicsList = await learningService.getTopics();
        const found = topicsList.find(t => t.id === idNum);
        if (!found) {
          throw new Error("Topic not found");
        }
        setParentTopic(found);

        // Select the first subtopic by default, or the main topic itself if no subtopics exist
        if (found.subtopics && found.subtopics.length > 0) {
          const firstSub = found.subtopics[0];
          setSelectedSubtopic(firstSub);
          await loadSubtopicData(firstSub.id);
        } else {
          setSelectedSubtopic(found);
          await loadSubtopicData(found.id);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to load topic details. Please return and try again.");
      } finally {
        setLoading(false);
      }
    };
    loadTopicWorkspace();
  }, [topicId]);

  const loadSubtopicData = async (subtopicId: number) => {
    try {
      const [resData, qData] = await Promise.all([
        learningService.getResources(subtopicId),
        learningService.getQuestions(subtopicId)
      ]);
      setResources(resData);
      setQuestions(qData);
      // Reset interactive state
      setSelectedOptions({});
      setSolveResults({});
      setExpandedQuestionId(null);
    } catch (err) {
      console.error("Failed to load subtopic details", err);
    }
  };

  const handleSubtopicSelect = async (sub: Topic) => {
    setSelectedSubtopic(sub);
    await loadSubtopicData(sub.id);
  };

  const handleResourceToggle = async (resourceId: number) => {
    try {
      const { completed } = await learningService.toggleResource(resourceId);
      setResources(prev =>
        prev.map(r => r.id === resourceId ? { ...r, completed } : r)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionSubmit = async (questionId: number) => {
    const answer = selectedOptions[questionId];
    if (!answer) return;

    try {
      const response = await learningService.submitAnswer(questionId, answer);
      setSolveResults(prev => ({ ...prev, [questionId]: response }));
      if (response.correct) {
        setQuestions(prev =>
          prev.map(q => q.id === questionId ? { ...q, completed: true } : q)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredQuestions = () => {
    return questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            q.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === "ALL" || q.difficulty === difficultyFilter;
      
      const isSolved = q.completed || solveResults[q.id]?.correct;
      const matchesStatus = statusFilter === "ALL" || 
                            (statusFilter === "SOLVED" && isSolved) || 
                            (statusFilter === "UNSOLVED" && !isSolved);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  };

  const docsList = resources.filter(r => r.type === "DOCUMENTATION");
  const videosList = resources.filter(r => r.type === "VIDEO");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading worksheet data...</p>
      </div>
    );
  }

  if (error || !parentTopic || !selectedSubtopic) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-bold text-slate-800">{error || "Topic Details Unavailable"}</h3>
        <Link to="/learning" className="mt-4 inline-block text-primary hover:underline font-semibold text-sm">
          ← Back to Learning Space
        </Link>
      </div>
    );
  }

  const completedQuestionsCount = questions.filter(q => q.completed).length;
  const completedResourcesCount = resources.filter(r => r.completed).length;
  const totalSubtopicItems = questions.length + resources.length;
  const completedSubtopicItems = completedQuestionsCount + completedResourcesCount;
  const progressPercent = totalSubtopicItems > 0 
    ? Math.round((completedSubtopicItems / totalSubtopicItems) * 100) 
    : 0;

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Link to="/learning" className="hover:text-primary transition-colors">LEARNING SPACE</Link>
            <span>/</span>
            <span className="text-slate-600 uppercase">{parentTopic.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{parentTopic.name} Workspace</h1>
        </div>
        
        <Link
          to="/learning"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-primary transition-colors focus:outline-none"
        >
          ← Exit Workspace
        </Link>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* Left Sidebar (Subtopics selection - 3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-2">Subtopics</h3>
          <nav className="space-y-1">
            {parentTopic.subtopics && parentTopic.subtopics.length > 0 ? (
              parentTopic.subtopics.map(sub => {
                const isActive = selectedSubtopic.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubtopicSelect(sub)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      isActive 
                        ? "bg-primary text-white shadow-sm font-bold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {sub.name.includes("Concurrency") ? "Med" : "Hard"}
                    </span>
                  </button>
                );
              })
            ) : (
              <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold bg-primary text-white">
                {parentTopic.name} Core
              </button>
            )}
          </nav>
        </div>

        {/* Right Workspace (Tabs + Contents - 9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Subtopic Workspace Overview Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-indigo-100">{selectedSubtopic.name}</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xl">{selectedSubtopic.description}</p>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Subtopic Progress</span>
                <span className="text-sm font-extrabold">{progressPercent}% Completed</span>
              </div>
              <div className="w-14 bg-slate-800 rounded-full h-2 overflow-hidden flex-shrink-0">
                <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-6">
            <button
              onClick={() => setActiveTab("questions")}
              className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                activeTab === "questions" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Practice Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab("documentation")}
              className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                activeTab === "documentation" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Official Documentation ({docsList.length})
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-3 font-bold text-sm border-b-2 transition-all duration-200 ${
                activeTab === "videos" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Video Tutorials ({videosList.length})
            </button>
          </div>

          {/* Tab Worksheets */}
          <div className="space-y-6">
            {/* TAB: PRACTICE QUESTIONS */}
            {activeTab === "questions" && (
              <div className="space-y-4">
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="relative w-full sm:flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-btn text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="flex-1 sm:flex-initial py-1.5 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-700 focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 sm:flex-initial py-1.5 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-700 focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SOLVED">Solved Only</option>
                      <option value="UNSOLVED">Unsolved Only</option>
                    </select>
                  </div>
                </div>

                {/* Questions list */}
                <div className="space-y-3">
                  {getFilteredQuestions().length > 0 ? (
                    getFilteredQuestions().map(q => {
                      const isExpanded = expandedQuestionId === q.id;
                      const isSolved = q.completed || solveResults[q.id]?.correct;
                      const selectedVal = selectedOptions[q.id] || "";
                      const solveResult = solveResults[q.id] || null;

                      return (
                        <div
                          key={q.id}
                          className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                            isExpanded ? "border-slate-300 ring-1 ring-slate-100" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Accordion Trigger */}
                          <div
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            className="p-4 flex items-center justify-between cursor-pointer select-none gap-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {isSolved ? (
                                <div className="p-1 bg-green-100 text-green-700 rounded-full flex-shrink-0">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-slate-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                  ?
                                </div>
                              )}
                              <span className="font-bold text-slate-800 truncate text-sm sm:text-base">{q.title}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {q.totalRatings && q.totalRatings > 0 ? (
                                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 font-bold">
                                  ⭐ {q.averageRating?.toFixed(1)} ({q.totalRatings})
                                </span>
                              ) : null}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.difficulty === "EASY" ? "bg-green-50 text-green-700" :
                                q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-700" :
                                "bg-rose-50 text-rose-700"
                              }`}>
                                {q.difficulty}
                              </span>
                              <svg
                                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </div>

                          {/* Accordion content */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
                              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line font-medium">{q.content}</p>
                              
                              <div className="space-y-2">
                                {q.choices.map((choice, i) => {
                                  const isSelected = selectedVal === choice;
                                  const isCorrectChoice = solveResult?.correctAnswer === choice;
                                  const isWrongChoice = solveResult && isSelected && !solveResult.correct;

                                  let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                                  if (isSelected && !solveResult) {
                                    optionStyle = "border-primary bg-blue-50/40 text-primary font-bold";
                                  } else if (solveResult) {
                                    if (isCorrectChoice) {
                                      optionStyle = "border-success bg-green-50 text-green-800 font-semibold";
                                    } else if (isWrongChoice) {
                                      optionStyle = "border-error bg-red-50 text-error font-semibold";
                                    } else {
                                      optionStyle = "border-slate-200 bg-white/70 text-slate-400 opacity-60";
                                    }
                                  } else if (q.completed && !solveResult) {
                                    // Previously solved state
                                    optionStyle = "border-slate-200 bg-white/80 text-slate-500";
                                  }

                                  return (
                                    <label
                                      key={i}
                                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 text-xs sm:text-sm ${optionStyle}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={choice}
                                        checked={isSelected}
                                        disabled={solveResult !== null || q.completed}
                                        onChange={(e) => setSelectedOptions({ ...selectedOptions, [q.id]: e.target.value })}
                                        className="mt-0.5 accent-primary h-4 w-4"
                                      />
                                      <span>{choice}</span>
                                    </label>
                                  );
                                })}
                              </div>

                              {q.completed && !solveResult && (
                                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold">
                                  ✓ You have successfully solved this question.
                                </div>
                              )}

                              {!q.completed && !solveResult && (
                                <button
                                  onClick={() => handleQuestionSubmit(q.id)}
                                  disabled={!selectedVal}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-btn text-xs transition-colors disabled:opacity-50"
                                >
                                  Submit Solution
                                </button>
                              )}

                              {solveResult && (
                                <div className={`p-4 rounded-lg border text-xs sm:text-sm space-y-2 ${
                                  solveResult.correct ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50/50 border-red-200 text-slate-700"
                                }`}>
                                  <div className="font-bold flex items-center gap-2">
                                    {solveResult.correct ? (
                                      <span className="text-success">✓ Correct Solution</span>
                                    ) : (
                                      <span className="text-error">✗ Incorrect Answer</span>
                                    )}
                                  </div>
                                  <p className="leading-relaxed"><strong className="text-slate-800">Explanation:</strong> {solveResult.explanation}</p>
                                </div>
                              )}

                              {isSolved && (
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                  <span className="block text-xs font-bold text-slate-700">Rate this question</span>
                                  {ratingsState[q.id]?.submitted ? (
                                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                      Thank you for rating!
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                          const currentRating = ratingsState[q.id]?.rating || 0;
                                          return (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => setRatingsState(prev => ({
                                                ...prev,
                                                [q.id]: { ...(prev[q.id] || { comment: "", submitted: false, loading: false }), rating: star }
                                              }))}
                                              className="text-lg text-amber-400 hover:scale-115 transition-transform"
                                            >
                                              {star <= currentRating ? "★" : "☆"}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder="Optional comment..."
                                          value={ratingsState[q.id]?.comment || ""}
                                          onChange={(e) => setRatingsState(prev => ({
                                            ...prev,
                                            [q.id]: { ...(prev[q.id] || { rating: 0, submitted: false, loading: false }), comment: e.target.value }
                                          }))}
                                          className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-primary font-medium text-slate-800"
                                        />
                                        <button
                                          type="button"
                                          disabled={!ratingsState[q.id]?.rating || ratingsState[q.id]?.loading}
                                          onClick={async () => {
                                            const rState = ratingsState[q.id];
                                            if (!rState || !rState.rating) return;
                                            try {
                                              setRatingsState(prev => ({ ...prev, [q.id]: { ...prev[q.id], loading: true } }));
                                              await learningService.rateQuestion(q.id, { rating: rState.rating, comment: rState.comment });
                                              setRatingsState(prev => ({ ...prev, [q.id]: { ...prev[q.id], submitted: true, loading: false } }));
                                              
                                              // Silent update of average rating in local state
                                              setQuestions(prev => prev.map(item => {
                                                if (item.id === q.id) {
                                                  const newCount = (item.totalRatings || 0) + 1;
                                                  const newAvg = (((item.averageRating || 0) * (item.totalRatings || 0)) + rState.rating) / newCount;
                                                  return { ...item, averageRating: newAvg, totalRatings: newCount };
                                                }
                                                return item;
                                              }));
                                            } catch (err) {
                                              console.error(err);
                                              setRatingsState(prev => ({ ...prev, [q.id]: { ...prev[q.id], loading: false } }));
                                            }
                                          }}
                                          className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                        >
                                          {ratingsState[q.id]?.loading ? "Submitting..." : "Submit"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                      No questions found matching the filter criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTATION */}
            {activeTab === "documentation" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {docsList.length > 0 ? (
                  docsList.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-1">{doc.title}</h4>
                          <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            DOC
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{doc.description}</p>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline"
                        >
                          Open Resource
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>

                        <button
                          onClick={() => handleResourceToggle(doc.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-btn text-[11px] font-bold transition-all duration-200 border ${
                            doc.completed 
                              ? "bg-green-50 border-green-200 text-green-700" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          {doc.completed ? "✓ Read" : "Mark Read"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                    No documentation links available for this subtopic.
                  </div>
                )}
              </div>
            )}

            {/* TAB: VIDEOS */}
            {activeTab === "videos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videosList.length > 0 ? (
                  videosList.map(video => (
                    <div
                      key={video.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-1">{video.title}</h4>
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            VIDEO
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{video.description}</p>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Watch Video
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </a>

                        <button
                          onClick={() => handleResourceToggle(video.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-btn text-[11px] font-bold transition-all duration-200 border ${
                            video.completed 
                              ? "bg-green-50 border-green-200 text-green-700" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          {video.completed ? "✓ Watched" : "Mark Watched"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                    No video links available for this subtopic.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailsView;
