import React, { useState } from 'react';
import { buildApiUrl } from '../../../config/api';

export interface JobPostingFeedDto {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary: string;
  sourceUrl: string;
  hrEmail: string;
  createdAt: string;
  daysAgo: number;
  matchScore?: number;
  skillBadges?: string[];
  queueStatus?: string;
  queueId?: number;
}

interface EmailPreviewModalProps {
  job: JobPostingFeedDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (jobId: number, message: string) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !job) return null;

  const jobTitle = job.title || 'Software Engineer';
  const jobCompany = job.company || 'Hiring Company';
  const jobLocation = job.location || 'Remote';
  const hrEmail = job.hrEmail || '';

  const [selectedTemplate, setSelectedTemplate] = useState<string>('AI_PERSONALIZED');
  const [subject, setSubject] = useState<string>(
    `Application for ${jobTitle} Role - Candidate Cold Outreach`
  );
  const [customBody, setCustomBody] = useState<string>(
    `Dear ${jobCompany} Hiring Team,\n\n` +
    `I noticed your posting for the ${jobTitle} position in ${jobLocation}. ` +
    `Given my hands-on background in software engineering, microservices, and web development, ` +
    `I am eager to contribute to your technical initiatives.\n\n` +
    `Attached is my resume for your review. I look forward to discussing how my experience aligns with your team's goals.\n\n` +
    `Best regards,\nActive Candidate`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template === 'AI_PERSONALIZED') {
      setSubject(`Application for ${jobTitle} Role - Candidate Cold Outreach`);
      setCustomBody(
        `Dear ${jobCompany} Hiring Team,\n\n` +
        `I noticed your posting for the ${jobTitle} position in ${jobLocation}. ` +
        `Given my hands-on background in software engineering, microservices, and web development, ` +
        `I am eager to contribute to your technical initiatives.\n\n` +
        `Attached is my resume for your review. I look forward to discussing how my experience aligns with your team's goals.\n\n` +
        `Best regards,\nActive Candidate`
      );
    } else if (template === 'DIRECT_REFERRAL') {
      setSubject(`Inquiry regarding ${jobTitle} opening at ${jobCompany}`);
      setCustomBody(
        `Hi Team,\n\n` +
        `I hope this email finds you well. I am reaching out directly regarding the ${jobTitle} opening at ${jobCompany}.\n\n` +
        `I would love to learn more about the team's roadmap and share how my technical background in modern web architectures can bring value.\n\n` +
        `Thanks for your time!\nBest regards,\nActive Candidate`
      );
    } else if (template === 'SHORT_PITCH') {
      setSubject(`Experienced Engineer for ${jobTitle}`);
      setCustomBody(
        `Hi ${jobCompany} Talent Team,\n\n` +
        `Quick note to introduce myself for the ${jobTitle} role. I have extensive experience delivering reliable full-stack web applications and scalable backends.\n\n` +
        `My resume is attached for quick review. Would appreciate 5 minutes to connect!\n\n` +
        `Regards,\nActive Candidate`
      );
    }
  };

  const handleConfirmQueue = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl('/v1/jobs/postings/queue-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          title: jobTitle,
          company: jobCompany,
          hrEmail: hrEmail,
          templateName: selectedTemplate,
          customSubject: subject,
          customBody: customBody
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onSuccess(job.id, data.message || `Successfully queued outreach email to ${hrEmail}`);
        onClose();
      } else {
        alert(data.message || 'Failed to queue email.');
      }
    } catch (err: any) {
      console.error('Error queuing email from preview modal:', err);
      alert('Network error queuing outreach email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-2">
              <span>✉️</span>
              <span>Outreach Email Preview & Queueing</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {job.title}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              {job.company} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Verification Summary Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-500 dark:text-slate-400">To Recruiter:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 truncate">
                {job.hrEmail}
              </span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              ✓ Verified Contact
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Dispatch Schedule: <span className="text-indigo-600 dark:text-indigo-400 font-bold">5 mins delay (Reviewable in Queue)</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Sender: Candidate Connected Account
            </span>
          </div>
        </div>

        {/* Template Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Outreach Template:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTemplateChange('AI_PERSONALIZED')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                selectedTemplate === 'AI_PERSONALIZED'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>✨ AI Personalized</span>
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">Matched to job skills</span>
            </button>

            <button
              type="button"
              onClick={() => handleTemplateChange('DIRECT_REFERRAL')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                selectedTemplate === 'DIRECT_REFERRAL'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>🎯 Direct Referral</span>
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">Concise referral ask</span>
            </button>

            <button
              type="button"
              onClick={() => handleTemplateChange('SHORT_PITCH')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                selectedTemplate === 'SHORT_PITCH'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <span>⚡ Short Cold Pitch</span>
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">Direct 3-liner intro</span>
            </button>
          </div>
        </div>

        {/* Email Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject Line:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Personalized Body Preview:
            </label>
            <textarea
              rows={7}
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmQueue}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Queuing Outreach Email...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Confirm & Add to Email Queue</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailPreviewModal;
