import React, { useEffect, useState } from 'react';
import { buildApiUrl } from '../../../config/api';

interface RawHarvestedJobDto {
  id: number;
  rawText: string;
  createdAt: string;
}

export const RawHarvestedListSection: React.FC = () => {
  const [items, setItems] = useState<RawHarvestedJobDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchRawHarvestedJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/v1/jobs/scraper/raw-harvested/latest?page=0&size=100'));
      if (res.ok) {
        const data: RawHarvestedJobDto[] = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching raw harvested jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawHarvestedJobs();
  }, []);

  const handleCopyText = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) =>
    item.rawText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              📄 Raw Harvested Job Posts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Pristine Feed ({items.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete, unedited raw post text blocks harvested directly from LinkedIn and other job portals.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search raw post content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
          />
          <button
            type="button"
            onClick={fetchRawHarvestedJobs}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Raw Posts Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm italic">
          Loading raw harvested post text blocks...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          No raw harvested job posts found matching your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-400/50"
            >
              {/* Card Meta Bar */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    #ID-{item.id}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    • Harvested {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(item.id, item.rawText)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedId === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <span>✓</span>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copy Raw Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pristine Raw Text Content */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {item.rawText}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RawHarvestedListSection;
