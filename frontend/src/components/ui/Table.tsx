import React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ children, className = "", ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-slate-200 bg-white shadow-sm">
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => {
  return (
    <thead className={`bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = "", ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-100 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = "", ...props }) => {
  return (
    <tr className={`h-[56px] hover:bg-slate-50/50 transition-colors duration-150 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => {
  return (
    <th className={`p-3 text-slate-600 font-semibold align-middle ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...props }) => {
  return (
    <td className={`p-3 text-base-text align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
