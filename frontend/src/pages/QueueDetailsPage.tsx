import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { outreachService } from "../features/outreach/services/outreachService";
import { parseUtcDate, formatDateInTimezone } from "../utils/dateUtils";

export const QueueDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueTimeframe, setQueueTimeframe] = useState<"today" | "week" | "month" | "all">("today");
  const [userTimezone, setUserTimezone] = useState<string>("");

  const filterQueueByDate = (items: any[]) => {
    const now = new Date();
    return items.filter(item => {
      const dateStr = item.sentAt || item.scheduledAt || item.createdAt;
      if (!dateStr) return false;
      const itemDate = parseUtcDate(dateStr);
      if (!itemDate) return false;

      if (queueTimeframe === "today") {
        return itemDate.getDate() === now.getDate() &&
               itemDate.getMonth() === now.getMonth() &&
               itemDate.getFullYear() === now.getFullYear();
      }
      if (queueTimeframe === "week") {
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (queueTimeframe === "month") {
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      return true; // all
    });
  };

  const filteredQueueItems = filterQueueByDate(queueItems);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [data, settings] = await Promise.all([
        outreachService.getOutreachQueue(userId),
        outreachService.getOutreachSettings(userId).catch(() => null)
      ]);
      setQueueItems(data.filter((item: any) => item.status !== "DRAFT"));
      if (settings?.timezone) {
        setUserTimezone(settings.timezone);
      }
    } catch (err) {
      console.error("Failed to load queue items", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs font-semibold text-primary hover:underline mb-2 block"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Email Outreach Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Scheduled recruiter outreach emails, dispatched statuses, and log details</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Filter:</span>
            <select
              value={queueTimeframe}
              onChange={(e) => setQueueTimeframe(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-card text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="today">Current Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <Button size="sm" onClick={() => navigate("/opportunities/import")} className="text-xs font-semibold px-4 py-2">
            Import Opportunity
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm italic">
          Loading email outreach queue...
        </div>
      ) : queueItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-card text-slate-500 text-sm italic">
          No outreach emails currently in the queue. Parse a screenshot and generate an email to get started!
        </div>
      ) : filteredQueueItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-card text-slate-500 text-sm italic">
          No outreach emails found for the selected timeframe.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details / Error Log</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueueItems.map((item) => {
                let statusText = "In Queue";
                let variant: "neutral" | "success" | "warning" | "error" | "info" = "neutral";
                
                if (item.status === "SENT") {
                  statusText = "Sent";
                  variant = "success";
                } else if (item.status === "FAILED") {
                  statusText = "Failed";
                  variant = "error";
                } else if (item.status === "BLACKLISTED") {
                  statusText = "Blacklisted";
                  variant = "error";
                } else if (item.status === "PAUSED") {
                  statusText = "Paused";
                  variant = "warning";
                } else if (item.status === "PENDING") {
                  statusText = "In Queue";
                  variant = "info";
                }

                const formatQueueDetails = (eqItem: any) => {
                  if (eqItem.status === "SENT" && eqItem.sentAt) {
                    return `Dispatched on ${formatDateInTimezone(eqItem.sentAt, userTimezone)}`;
                  }
                  
                  if (eqItem.status === "PENDING" && eqItem.scheduledAt) {
                    const scheduledDate = parseUtcDate(eqItem.scheduledAt);
                    if (scheduledDate) {
                      const scheduledTime = scheduledDate.getTime();
                      const now = Date.now();
                      const diffMs = scheduledTime - now;
                      const diffMins = Math.round(diffMs / 60000);
                      
                      const formattedDate = formatDateInTimezone(scheduledDate, userTimezone);
                      if (diffMs <= 0) {
                        return `Processing dispatch... (Scheduled: ${formattedDate})`;
                      } else if (diffMins < 1) {
                        return `Sending in less than a minute... (Scheduled: ${formattedDate})`;
                      } else if (diffMins === 1) {
                        return `Sending in ~1 minute (Scheduled: ${formattedDate})`;
                      } else if (diffMins < 60) {
                        return `Sending in ~${diffMins} minutes (Scheduled: ${formattedDate})`;
                      } else {
                        const diffHours = Math.round(diffMins / 60);
                        return `Sending in ~${diffHours} hours (Scheduled: ${formattedDate})`;
                      }
                    }
                  }

                  if (eqItem.status === "PAUSED") {
                    return eqItem.errorMessage || "Paused (Daily quota reached or slot ended).";
                  }

                  if (eqItem.status === "FAILED") {
                    return `Failed: ${eqItem.errorMessage || "Unknown error"}`;
                  }

                  if (eqItem.status === "BLACKLISTED") {
                    return "Excluded: Recipient matches your excluded companies list.";
                  }
                  
                  return eqItem.errorMessage || "Awaiting dispatch (cron scheduled)";
                };

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-700">{item.recipientEmail}</TableCell>
                    <TableCell className="text-slate-500 truncate max-w-[200px]" title={item.subject}>{item.subject}</TableCell>
                    <TableCell>
                      <Badge variant={variant}>{statusText}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatQueueDetails(item)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default QueueDetailsPage;
