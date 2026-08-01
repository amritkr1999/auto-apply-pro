import React, { useState, useEffect } from "react";
import type { CandidateProfile, ParsedResumeDto } from "../services/profileService";

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileTextIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const GraduationCapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
  </svg>
);

const AlertCircleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

interface ResumeSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedResumeDto;
  currentProfile: CandidateProfile;
  onApplySuggestions: (updatedProfile: CandidateProfile) => Promise<void>;
}

export const ResumeSuggestionsModal: React.FC<ResumeSuggestionsModalProps> = ({
  isOpen,
  onClose,
  parsedData,
  currentProfile,
  onApplySuggestions,
}) => {
  // 1. Declare ALL hooks unconditionally at top of component
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedExpIndexes, setSelectedExpIndexes] = useState<Set<number>>(new Set());
  const [selectedEduIndexes, setSelectedEduIndexes] = useState<Set<number>>(new Set());
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // 2. Synchronize internal modal state whenever parsedData, currentProfile, or isOpen changes
  useEffect(() => {
    if (parsedData && currentProfile) {
      const existingSkillSet = new Set((currentProfile.skills || []).map((s) => s.toLowerCase()));
      const parsedSkills = parsedData.skills || [];
      const newSkills = parsedSkills.filter((skill) => !existingSkillSet.has(skill.toLowerCase()));

      setIncludeSummary(!!parsedData.summary);
      setSelectedSkills(new Set(newSkills));
      setSelectedExpIndexes(new Set((parsedData.experience || []).map((_, i) => i)));
      setSelectedEduIndexes(new Set((parsedData.education || []).map((_, i) => i)));
    }
  }, [parsedData, currentProfile, isOpen]);

  // 3. Conditional render check AFTER all hooks have executed
  if (!isOpen || !parsedData || !currentProfile) return null;

  const existingSkillSet = new Set((currentProfile.skills || []).map((s) => s.toLowerCase()));
  const parsedSkills = parsedData.skills || [];

  const toggleSkill = (skill: string) => {
    const next = new Set(selectedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setSelectedSkills(next);
  };

  const toggleAllNewSkills = () => {
    const newSkills = parsedSkills.filter((s) => !existingSkillSet.has(s.toLowerCase()));
    if (selectedSkills.size === newSkills.length) {
      setSelectedSkills(new Set());
    } else {
      setSelectedSkills(new Set(newSkills));
    }
  };

  const toggleExp = (index: number) => {
    const next = new Set(selectedExpIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedExpIndexes(next);
  };

  const toggleEdu = (index: number) => {
    const next = new Set(selectedEduIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedEduIndexes(next);
  };

  const handleApply = async () => {
    try {
      setIsApplying(true);

      // Merge skills
      const finalSkillsSet = new Set(currentProfile.skills || []);
      selectedSkills.forEach((skill) => finalSkillsSet.add(skill));

      // Merge summary
      const finalSummary = includeSummary && parsedData.summary ? parsedData.summary : currentProfile.summary;

      // Merge Experience
      const selectedExpEntries = (parsedData.experience || []).filter((_, idx) => selectedExpIndexes.has(idx));
      const finalExperience = [...(currentProfile.experience || []), ...selectedExpEntries];

      // Merge Education
      const selectedEduEntries = (parsedData.education || []).filter((_, idx) => selectedEduIndexes.has(idx));
      const finalEducation = [...(currentProfile.education || []), ...selectedEduEntries];

      const updated: CandidateProfile = {
        ...currentProfile,
        summary: finalSummary,
        skills: Array.from(finalSkillsSet),
        experience: finalExperience,
        education: finalEducation,
      };

      await onApplySuggestions(updated);
      onClose();
    } catch (err) {
      console.error("Failed to apply suggestions", err);
    } finally {
      setIsApplying(false);
    }
  };

  const newSkillsCount = parsedSkills.filter((s) => !existingSkillSet.has(s.toLowerCase())).length;

  const totalSelectedCount =
    (includeSummary && parsedData.summary ? 1 : 0) +
    selectedSkills.size +
    selectedExpIndexes.size +
    selectedEduIndexes.size;

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500/15 via-indigo-500/25 to-purple-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 tracking-tight">
                  Review Resume Suggestions
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  AI Extracted
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                Select which parsed details you want to apply to your candidate profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer focus:outline-none"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-5">
          {/* Parsed Summary Section */}
          {parsedData.summary && (
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                    <FileTextIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm font-heading text-slate-900 dark:text-slate-100">
                    Professional Summary
                  </span>
                </div>
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer select-none px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Apply Parsed Summary</span>
                </label>
              </div>
              <div className="relative p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 border-l-4 border-l-indigo-500 text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic shadow-inner">
                "{parsedData.summary}"
              </div>
            </div>
          )}

          {/* Parsed Skills Section */}
          {parsedSkills.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                    <CodeIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm font-heading text-slate-900 dark:text-slate-100">
                    Detected Skills
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                    {parsedSkills.length}
                  </span>
                </div>
                {newSkillsCount > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllNewSkills}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{selectedSkills.size === newSkillsCount ? "Deselect All New" : "Select All New"}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {parsedSkills.map((skill) => {
                  const isExisting = existingSkillSet.has(skill.toLowerCase());
                  const isSelected = selectedSkills.has(skill);

                  if (isExisting) {
                    return (
                      <span
                        key={skill}
                        className="px-3 py-1.5 text-xs rounded-xl bg-slate-200/50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/50 flex items-center space-x-1.5 cursor-not-allowed font-medium select-none"
                        title="Skill already on your profile"
                      >
                        <CheckIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{skill}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-0.5">(On profile)</span>
                      </span>
                    );
                  }

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all duration-150 flex items-center space-x-2 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-600/70 shadow-sm ring-2 ring-indigo-500/20 active:scale-95"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 active:scale-95"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parsed Work Experience Section */}
          {parsedData.experience && parsedData.experience.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  <BriefcaseIcon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm font-heading text-slate-900 dark:text-slate-100">
                  Work Experience
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                  {parsedData.experience.length}
                </span>
              </div>
              <div className="space-y-3 pt-1">
                {parsedData.experience.map((exp, idx) => {
                  const isChecked = selectedExpIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleExp(idx)}
                      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden ${
                        isChecked
                          ? "bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-500/80 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                          : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {isChecked && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600 dark:bg-indigo-500" />
                      )}
                      <div className="flex items-start space-x-3.5 pl-1">
                        <div
                          className={`mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                              : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                                {exp.title || "Position"}
                              </h4>
                              {exp.company && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-100 dark:border-indigo-900/40">
                                  {exp.company}
                                </span>
                              )}
                            </div>
                            {exp.duration && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/50 font-medium shrink-0">
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-normal">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parsed Education Section */}
          {parsedData.education && parsedData.education.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 space-y-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  <GraduationCapIcon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm font-heading text-slate-900 dark:text-slate-100">
                  Education
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                  {parsedData.education.length}
                </span>
              </div>
              <div className="space-y-3 pt-1">
                {parsedData.education.map((edu, idx) => {
                  const isChecked = selectedEduIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleEdu(idx)}
                      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden ${
                        isChecked
                          ? "bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-500/80 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                          : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {isChecked && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600 dark:bg-indigo-500" />
                      )}
                      <div className="flex items-start space-x-3.5 pl-1">
                        <div
                          className={`mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                              : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                              {edu.degree || "Degree"}
                            </h4>
                            {edu.graduation_year && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/50 font-medium">
                                Class of {edu.graduation_year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state fallback */}
          {!parsedData.summary &&
            parsedSkills.length === 0 &&
            (!parsedData.experience || parsedData.experience.length === 0) && (
              <div className="p-8 text-center bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <AlertCircleIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No structured details could be extracted from this file format.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Try uploading a clear PDF or Word resume document.
                </p>
              </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <span>Selected suggestions:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/60">
              {totalSelectedCount} items
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-4.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || totalSelectedCount === 0}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <span>Applying...</span>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Apply Selected ({totalSelectedCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
