import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../../config/api';
import { EmailPreviewModal } from './EmailPreviewModal';
import type { JobPostingFeedDto } from './EmailPreviewModal';

interface HarvestedListSectionProps {
  refreshTrigger?: number;
}

export const HarvestedListSection: React.FC<HarvestedListSectionProps> = ({ refreshTrigger }) => {
  const navigate = useNavigate();

  const [items, setItems] = useState<JobPostingFeedDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HARVESTED' | 'PENDING' | 'SENT'>('ALL');
  
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkTemplate, setBulkTemplate] = useState<string>('AI_PERSONALIZED');
  const [isBulkQueuing, setIsBulkQueuing] = useState<boolean>(false);

  // Single Item Modal State
  const [previewJob, setPreviewJob] = useState<JobPostingFeedDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Status Notification Message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  const fetchHarvestedData = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/v1/jobs/postings/latest?page=0&size=250'));
      if (response.ok) {
        const data: JobPostingFeedDto[] = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching harvested items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvestedData();
  }, [refreshTrigger]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Toggle selection for single item
  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    if (!item) return false;
    const titleStr = item.title ? item.title.toLowerCase() : '';
    const companyStr = item.company ? item.company.toLowerCase() : '';
    const emailStr = item.hrEmail ? item.hrEmail.toLowerCase() : '';
    const queryStr = searchTerm ? searchTerm.toLowerCase() : '';

    const matchesSearch =
      titleStr.includes(queryStr) ||
      companyStr.includes(queryStr) ||
      emailStr.includes(queryStr);

    const status = item.queueStatus || 'HARVESTED';
    if (statusFilter === 'HARVESTED') return matchesSearch && status === 'HARVESTED';
    if (statusFilter === 'PENDING') return matchesSearch && (status === 'PENDING' || status === 'QUEUED');
    if (statusFilter === 'SENT') return matchesSearch && status === 'SENT';

    return matchesSearch;
  });

  // Toggle Select All Visible
  const isAllSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredItems.map((item) => item.id));
      setSelectedIds(allIds);
    }
  };

  // Single Direct Add to Queue
  const handleSingleQueue = async (job: JobPostingFeedDto) => {
    if (!job.hrEmail) return;
    try {
      const res = await fetch(buildApiUrl('/v1/jobs/postings/queue-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          company: job.company,
          hrEmail: job.hrEmail,
          templateName: bulkTemplate
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === job.id ? { ...i, queueStatus: 'PENDING' } : i))
        );
        showNotification(`⚡ Successfully queued outreach email to ${job.hrEmail}!`);
      }
    } catch (err) {
      console.error('Failed to queue email:', err);
    }
  };

  // Bulk Queue Action
  const handleBulkQueue = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkQueuing(true);
    const selectedList = items.filter((item) => selectedIds.has(item.id));
    const payloadItems = selectedList.map((item) => ({
      jobId: item.id,
      title: item.title,
      company: item.company,
      hrEmail: item.hrEmail
    }));

    try {
      const res = await fetch(buildApiUrl('/v1/jobs/postings/queue-emails-batch'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payloadItems,
          templateName: bulkTemplate
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const queuedSet = new Set(selectedList.map((i) => i.id));
        setItems((prev) =>
          prev.map((i) => (queuedSet.has(i.id) ? { ...i, queueStatus: 'PENDING' } : i))
        );
        setSelectedIds(new Set());
        showNotification(
          `⚡ ${data.message || `Added ${selectedIds.size} emails to sending queue!`}`
        );
      } else {
        showNotification(data.message || 'Failed to queue selected emails.', 'error');
      }
    } catch (err) {
      console.error('Error during bulk queueing:', err);
      showNotification('Network error during bulk queueing.', 'error');
    } finally {
      setIsBulkQueuing(false);
    }
  };

  // Summary Metrics Stats
  const totalHarvested = items.length;
  const inQueueCount = items.filter((i) => i.queueStatus === 'PENDING' || i.queueStatus === 'QUEUED').length;
  const sentCount = items.filter((i) => i.queueStatus === 'SENT').length;
  const readyToOutreach = items.filter((i) => !i.queueStatus || i.queueStatus === 'HARVESTED').length;

  // Pagination Slice
  const totalItemsCount = filteredItems.length;
  const totalPages = Math.ceil(totalItemsCount / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItemsCount);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Overview Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total Harvested
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {totalHarvested}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Ready to Outreach
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {readyToOutreach}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            In Sending Queue
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {inQueueCount}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs text-center">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Sent via Gmail
          </span>
          <span className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">
            {sentCount}
          </span>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-500/50'
              : 'bg-red-900 text-red-100 border border-red-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === 'success' ? '⚡' : '⚠️'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => navigate('/outreach/queue')}
            className="underline hover:text-white font-extrabold ml-4 shrink-0"
          >
            View Queue →
          </button>
        </div>
      )}

      {/* Main Vault Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                📋 Harvested Recruiter Emails & Job Vault
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                1-Click Queue Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All recruiter contacts and job postings scraped from LinkedIn, Naukri, and ATS portals. Select items to add them directly to your email dispatch queue.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('HARVESTED')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'HARVESTED'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Not Queued ({readyToOutreach})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                In Queue ({inQueueCount})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search title, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-48"
            />
          </div>
        </div>

        {/* Sticky Bulk Action Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <span>Select All Visible ({filteredItems.length})</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
                {selectedIds.size} Selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Outreach Template:
            </span>
            <select
              value={bulkTemplate}
              onChange={(e) => setBulkTemplate(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="AI_PERSONALIZED">✨ AI Personalized</option>
              <option value="DIRECT_REFERRAL">🎯 Direct Referral</option>
              <option value="SHORT_PITCH">⚡ Short Cold Pitch</option>
            </select>

            <button
              type="button"
              onClick={handleBulkQueue}
              disabled={selectedIds.size === 0 || isBulkQueuing}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {isBulkQueuing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Queuing...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Add Selected ({selectedIds.size}) to Queue</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Item Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm italic">
            Loading harvested emails & job postings...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            No harvested items found matching your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedItems.map((job) => {
                const isSelected = selectedIds.has(job.id);
                const status = job.queueStatus || 'HARVESTED';
                const isQueued = status === 'PENDING' || status === 'QUEUED';
                const isSent = status === 'SENT';

                return (
                  <div
                    key={job.id}
                    className={`border rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500/60'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(job.id)}
                          className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                                  {job.title}
                                </h4>
                                {job.matchScore && (
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                    🔥 {job.matchScore}% Match
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                                {job.company}
                              </span>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              {/* Status Badge */}
                              {isSent ? (
                                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 shrink-0">
                                  ✓ Sent via Gmail
                                </span>
                              ) : isQueued ? (
                                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0 animate-pulse">
                                  ⚡ In Sending Queue
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                                  Harvested (Ready)
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                {job.daysAgo === 0 ? 'Today' : `${job.daysAgo}d ago`}
                              </span>
                            </div>
                          </div>

                          {/* Location & Salary Metadata */}
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-2.5">
                            {job.location && (
                              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 font-medium">
                                📍 {job.location}
                              </span>
                            )}
                            {job.salary && (
                              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 font-semibold">
                                💰 {job.salary}
                              </span>
                            )}
                          </div>

                          {/* Skill & Requirements Badges */}
                          {((job.skillBadges && job.skillBadges.length > 0) || (job.requirements && job.requirements.trim().length > 0)) && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {(job.skillBadges || job.requirements.split(',')).map((skill, idx) => {
                                const cleanSkill = skill.trim();
                                if (!cleanSkill) return null;
                                return (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50"
                                  >
                                    {cleanSkill}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Recruiter Email Box */}
                          {job.hrEmail && (
                            <div className="mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-2.5 rounded-xl flex items-center justify-between text-xs shadow-xs">
                              <div className="flex items-center gap-1.5 truncate">
                                <span>✉️</span>
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                  {job.hrEmail}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                                ✓ MX Verified
                              </span>
                            </div>
                          )}

                          {/* Description Snippet */}
                          {job.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                              {job.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewJob(job);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          👁️ Preview Email
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSingleQueue(job)}
                          disabled={isQueued || isSent}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                            isQueued || isSent
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                          }`}
                        >
                          {isSent ? '✓ Sent' : isQueued ? '⚡ In Queue' : '➕ Add to Queue'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1} - {endIndex} of {totalItemsCount} harvested items
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Single Email Preview Modal */}
      <EmailPreviewModal
        job={previewJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPreviewJob(null);
        }}
        onSuccess={(jobId, msg) => {
          setItems((prev) =>
            prev.map((i) => (i.id === jobId ? { ...i, queueStatus: 'PENDING' } : i))
          );
          showNotification(msg);
        }}
      />
    </div>
  );
};

export default HarvestedListSection;
