import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { learningService } from "../services/learningService";
import type { Topic } from "../services/learningService";

export const SubmitQuestionForm: React.FC = () => {
  const navigate = useNavigate();

  // Master topics list
  const [subjects, setSubjects] = useState<Topic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0);

  // Status State
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setFetchingTopics(true);
        const data = await learningService.getTopics();
        setSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects/topics", err);
        setError("Failed to load subjects and topics. Please reload the page.");
      } finally {
        setFetchingTopics(false);
      }
    };
    loadTopics();
  }, []);

  const handleSubjectChange = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(0);
    const foundSubject = subjects.find((s) => s.id === subjectId) || null;
    setTopics(foundSubject?.subtopics || []);
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    if (choices.length >= 6) return;
    setChoices([...choices, ""]);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    if (correctChoiceIndex >= newChoices.length) {
      setCorrectChoiceIndex(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedSubjectId) {
      setError("Please select a Subject.");
      return;
    }
    if (!selectedTopicId) {
      setError("Please select a Topic.");
      return;
    }
    if (!title.trim() || title.trim().length < 10 || title.trim().length > 150) {
      setError("Question title must be between 10 and 150 characters.");
      return;
    }
    if (!content.trim() || content.trim().length < 30) {
      setError("Question content must be at least 30 characters long.");
      return;
    }

    const filteredChoices = choices.map((c) => c.trim()).filter((c) => c !== "");
    if (filteredChoices.length < 2) {
      setError("Please provide at least 2 non-empty options/choices.");
      return;
    }

    const correctAnswer = choices[correctChoiceIndex]?.trim();
    if (!correctAnswer) {
      setError("Correct answer choice cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      await learningService.submitQuestion({
        title: title.trim(),
        content: content.trim(),
        difficulty,
        choices: filteredChoices,
        correctAnswer,
        explanation: explanation.trim(),
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center bg-white rounded-xl shadow-sm border border-slate-200 mt-10">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Question Submitted!</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Thank you for contributing! Your question has been sent to our administrative moderation queue. You will see it in the active practice quiz list once approved.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setSuccess(false);
              setTitle("");
              setContent("");
              setExplanation("");
              setChoices(["", "", "", ""]);
              setCorrectChoiceIndex(0);
            }}
            className="px-5 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-btn transition-colors border border-primary/20"
          >
            Submit Another Question
          </button>
          <Link
            to="/learning/submissions"
            className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-btn transition-colors"
          >
            View My Submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 mt-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/learning" className="text-xs text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors font-medium">
            ← Back to Learning Space
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-2">Contribute a Question</h1>
          <p className="text-slate-500 text-xs mt-1">Help the community learn by submitting multiple choice questions to our worksheets.</p>
        </div>
        <Link
          to="/learning/submissions"
          className="px-4 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-btn bg-white hover:bg-slate-50 hover:text-primary transition-all font-semibold"
        >
          My Submissions
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <span className="font-bold">Error submitting question:</span> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Step 1: Subject and Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject *</label>
            {fetchingTopics ? (
              <div className="h-10 bg-slate-100 rounded-btn animate-pulse" />
            ) : (
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
              >
                <option value={0}>Select Subject (e.g. Java, Python)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic *</label>
            {fetchingTopics ? (
              <div className="h-10 bg-slate-100 rounded-btn animate-pulse" />
            ) : (
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(Number(e.target.value))}
                disabled={!selectedSubjectId}
                className="w-full py-2 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-400 font-medium"
              >
                <option value={0}>Select Subtopic (e.g. Concurrency)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Step 2: Title and Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Question Title *</label>
            <input
              type="text"
              placeholder="e.g. Garbage Collection GC algorithms, closures..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Difficulty *</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full py-2 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-semibold"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Question Description / Problem Statement *</label>
          <textarea
            rows={4}
            placeholder="Type your question prompt here. Supports markdown syntax."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        {/* Step 3: Choices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700">Multiple Choice Options *</label>
            <button
              type="button"
              onClick={addChoice}
              disabled={choices.length >= 6}
              className="text-xs font-bold text-primary hover:text-primary-dark disabled:text-slate-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Option
            </button>
          </div>
          <p className="text-slate-400 text-[10px] mb-3">Add options and use the radio button to select which option is the CORRECT answer.</p>

          <div className="space-y-3">
            {choices.map((choice, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctChoice"
                  checked={correctChoiceIndex === idx}
                  onChange={() => setCorrectChoiceIndex(idx)}
                  className="w-4 h-4 text-primary focus:ring-primary border-slate-300 focus:outline-none cursor-pointer"
                />
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={choice}
                  onChange={(e) => handleChoiceChange(idx, e.target.value)}
                  className="flex-1 py-1.5 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                />
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Explanation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Explanation (Optional)</label>
          <textarea
            rows={3}
            placeholder="Explain why the correct answer is right. This will be shown to users after they answer the question."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-btn text-xs bg-white text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        {/* Submit row */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/learning")}
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-btn transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-btn transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Question"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
