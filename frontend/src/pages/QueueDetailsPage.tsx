import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { outreachService } from "../features/outreach/services/outreachService";

export const QueueDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { id: 1 };
  const userId = user.id;

  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await outreachService.getOutreachQueue(userId);
      setQueueItems(data.filter((item: any) => item.status !== "DRAFT"));
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
        <div className="flex items-center gap-3">
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
              {queueItems.map((item) => {
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

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-700">{item.recipientEmail}</TableCell>
                    <TableCell className="text-slate-500 truncate max-w-[200px]" title={item.subject}>{item.subject}</TableCell>
                    <TableCell>
                      <Badge variant={variant}>{statusText}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {item.status === "SENT" && item.sentAt ? `Dispatched on ${new Date(item.sentAt).toLocaleString()}` : item.errorMessage || "Awaiting dispatch (cron scheduled every 5m)"}
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
