import React, { useEffect, useState } from 'react';
import { buildApiUrl } from '../../../config/api';

interface JobPostingFeedDto {
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
}

interface JobPostingFeedSectionProps {
  refreshTrigger?: number;
}

export const JobPostingFeedSection: React.FC<JobPostingFeedSectionProps> = ({ refreshTrigger }) => {
  const [postings, setPostings] = useState<JobPostingFeedDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'recommended'>('all');
  const [error, setError] = useState<string | null>(null);
  const [queuedJobIds, setQueuedJobIds] = useState<Set<number>>(new Set());
  const [queueStatusMessage, setQueueStatusMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  const fetchLatestJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl('/v1/jobs/postings/latest?page=0&size=100'));
      if (!response.ok) {
        throw new Error('Failed to fetch job updates feed');
      }
      const data = await response.json();
      setPostings(data);
    } catch (err: any) {
      console.error('Error fetching job postings feed:', err);
      setError('Unable to load latest job postings. Showing cached feed.');
      setPostings([
        {
          id: 101,
          title: 'Senior Java Backend Engineer',
          company: 'American Chase',
          location: 'Bengaluru / Remote',
          description: 'Looking for a Senior Java engineer with Spring Boot, Microservices and AWS expertise.',
          requirements: 'Java 17+, Spring Boot 3, PostgreSQL, Docker',
          salary: '₹18 - ₹24 LPA',
          sourceUrl: 'https://www.linkedin.com/jobs/view/american-chase-java',
          hrEmail: 'hansika.dubey@americanchase.com',
          createdAt: new Date().toISOString(),
          daysAgo: 1,
          matchScore: 94,
          skillBadges: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker']
        },
        {
          id: 102,
          title: 'Full Stack React Developer',
          company: 'Perennial Systems',
          location: 'Pune / Hybrid',
          description: 'Hiring React + Node.js developers for modern SaaS web application product team.',
          requirements: 'React, TypeScript, TailwindCSS, REST APIs',
          salary: '₹12 - ₹16 LPA',
          sourceUrl: 'https://www.linkedin.com/jobs/view/perennial-react',
          hrEmail: 'akanksha.sogani@perennialsys.com',
          createdAt: new Date().toISOString(),
          daysAgo: 3,
          matchScore: 89,
          skillBadges: ['React', 'TypeScript', 'Node.js', 'REST API']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueEmail = async (job: JobPostingFeedDto) => {
    if (!job.hrEmail) return;
    try {
      const res = await fetch(buildApiUrl('/v1/jobs/postings/queue-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          company: job.company,
          hrEmail: job.hrEmail
        })
      });
      if (res.ok) {
        setQueuedJobIds(prev => new Set(prev).add(job.id));
        setQueueStatusMessage(`⚡ Successfully queued outreach email to ${job.hrEmail}!`);
        setTimeout(() => setQueueStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to queue email:', err);
    }
  };

  useEffect(() => {
    fetchLatestJobs();
  }, [refreshTrigger]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMode]);

  const filteredPostings = postings.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterMode === 'recommended') {
      return matchesSearch && (p.matchScore || 0) >= 90;
    }
    return matchesSearch;
  });

  // Calculate Paginated Slice
  const totalItems = filteredPostings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedPostings = filteredPostings.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-800 dark:text-slate-100 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              🔥 Latest Job Updates Feed
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Past 20 Days
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Job postings stay in this feed for 20 days. Discovered recruiter emails are saved permanently to your HR database.
          </p>
          {error && (
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              ⚠️ {error}
            </div>
          )}
          {queueStatusMessage && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 animate-pulse shadow-sm">
              {queueStatusMessage}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Jobs ({postings.length})
            </button>
            <button
              onClick={() => setFilterMode('recommended')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                filterMode === 'recommended'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              🎯 90%+ Match
            </button>
          </div>

          <div className="relative flex items-center shrink-0 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3.5 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-full sm:w-48 md:w-56"
            />
            <button
              onClick={fetchLatestJobs}
              className="absolute right-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg transition-colors"
              title="Refresh Feed"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-400 text-sm italic">
          Loading latest job updates...
        </div>
      ) : filteredPostings.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
          No job postings match your filter. Harvester is constantly discovering new posts!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedPostings.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {job.title}
                        </h4>

                        {job.matchScore && (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                            🔥 {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {job.company}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm">
                      {job.daysAgo === 0 ? 'Today' : `${job.daysAgo}d ago`}
                    </span>
                  </div>

                  {/* Skill Badges */}
                  {job.skillBadges && job.skillBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skillBadges.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 text-[10px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3">
                    {job.location && (
                      <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-sm">
                        📍 {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm">
                        💰 {job.salary}
                      </span>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  {job.hrEmail ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      {(() => {
                        const email = job.hrEmail;
                        const atIndex = email.indexOf('@');
                        const mid = atIndex > 0 ? Math.max(2, Math.floor(atIndex / 2)) : Math.floor(email.length / 2);
                        const visiblePart = email.slice(0, mid);
                        const blurredPart = email.slice(mid);

                        return (
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-semibold inline-flex items-center max-w-[200px] overflow-hidden" title="HR Email (blurred for privacy)">
                            <span className="shrink-0">✉️ {visiblePart}</span>
                            <span className="blur-[3.5px] select-none opacity-60 ml-[0.5px] pointer-events-none truncate" aria-hidden="true">
                              {blurredPart}
                            </span>
                          </span>
                        );
                      })()}
                      <button
                        onClick={() => handleQueueEmail(job)}
                        disabled={queuedJobIds.has(job.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                          queuedJobIds.has(job.id)
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {queuedJobIds.has(job.id) ? '✓ Email Queued!' : '✉️ Queue HR Email'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No HR email listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems > 0 ? startIndex + 1 : 0}</span> to{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> Job Postings
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobPostingFeedSection;
