import type { PrepMaterial } from "../types/govtExam";

interface PrepMaterialLinksProps {
  materials?: PrepMaterial[];
}

export const PrepMaterialLinks: React.FC<PrepMaterialLinksProps> = ({ materials }) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-xs text-slate-500">Matching open-source educational guides will be linked upon syllabus parsing.</p>
      </div>
    );
  }

  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case "PYQ_BANK":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">PYQ Bank</span>;
      case "PDF_NOTES":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">PDF Notes</span>;
      case "VIDEO_LINK":
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300">Video Guide</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-700 dark:text-blue-300">Text Guide</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {materials.map((pm) => (
        <a
          key={pm.id}
          href={pm.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-2 group shadow-xs"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {pm.subjectTag}
              </span>
              {getResourceTypeBadge(pm.resourceType)}
            </div>
            <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
              {pm.title}
            </h5>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{pm.providerName || "Open Educational Resource"}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Open Resource ↗
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default PrepMaterialLinks;
