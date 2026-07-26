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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Review Resume Suggestions</h3>
              <p className="text-xs text-slate-400">Select which parsed details you want to apply to your profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Parsed Summary Section */}
          {parsedData.summary && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400 font-medium text-sm">
                  <FileTextIcon className="w-4 h-4" />
                  <span>Professional Summary</span>
                </div>
                <label className="flex items-center space-x-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-300">Use Parsed Summary</span>
                </label>
              </div>
              <p className="text-sm text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 italic leading-relaxed">
                "{parsedData.summary}"
              </p>
            </div>
          )}

          {/* Parsed Skills Section */}
          {parsedSkills.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400 font-medium text-sm">
                  <CodeIcon className="w-4 h-4" />
                  <span>Detected Skills ({parsedSkills.length})</span>
                </div>
                {newSkillsCount > 0 && (
                  <button
                    onClick={toggleAllNewSkills}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    {selectedSkills.size === newSkillsCount ? "Deselect All New" : "Select All New"}
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
                        className="px-3 py-1 text-xs rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700/50 flex items-center space-x-1"
                        title="Skill already on your profile"
                      >
                        <CheckIcon className="w-3 h-3 text-slate-500" />
                        <span>{skill}</span>
                        <span className="text-[10px] text-slate-500 ml-1">(On profile)</span>
                      </span>
                    );
                  }

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700"
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />}
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
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-medium text-sm">
                <BriefcaseIcon className="w-4 h-4" />
                <span>Work Experience ({parsedData.experience.length})</span>
              </div>
              <div className="space-y-3 pt-1">
                {parsedData.experience.map((exp, idx) => {
                  const isChecked = selectedExpIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleExp(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-slate-900/90 border-indigo-500/40 shadow-sm"
                          : "bg-slate-950/30 border-slate-800/80 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-white">
                              {exp.title || "Position"}{" "}
                              <span className="text-indigo-400 font-normal">at {exp.company || "Company"}</span>
                            </h4>
                            {exp.duration && <span className="text-xs text-slate-400">{exp.duration}</span>}
                          </div>
                          {exp.description && (
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
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
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-medium text-sm">
                <GraduationCapIcon className="w-4 h-4" />
                <span>Education ({parsedData.education.length})</span>
              </div>
              <div className="space-y-3 pt-1">
                {parsedData.education.map((edu, idx) => {
                  const isChecked = selectedEduIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleEdu(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-slate-900/90 border-indigo-500/40 shadow-sm"
                          : "bg-slate-950/30 border-slate-800/80 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white">
                            {edu.degree || "Degree"}
                          </h4>
                          {edu.graduation_year && (
                            <p className="text-xs text-slate-400">Graduation Year: {edu.graduation_year}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state fallback */}
          {!parsedData.summary && parsedSkills.length === 0 && (!parsedData.experience || parsedData.experience.length === 0) && (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
              <AlertCircleIcon className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">No structured details could be extracted from this file format.</p>
              <p className="text-xs text-slate-500 mt-1">Try uploading a clear PDF or Word resume.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isApplying ? (
              <span>Applying...</span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Apply Selected Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
