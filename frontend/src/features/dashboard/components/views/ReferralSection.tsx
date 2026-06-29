import React, { useState, useEffect } from "react";
import { referralService } from "../../../profile/services/referralService";
import type { ReferralRequestDto } from "../../../profile/services/referralService";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Badge from "../../../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../components/ui/Table";

interface Props {
  userId: number;
}

export const ReferralSection: React.FC<Props> = ({ userId }) => {
  const [companyName, setCompanyName] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [requests, setRequests] = useState<ReferralRequestDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const data = await referralService.getReferralRequests(userId);
      setRequests(data);
    } catch (err: any) {
      console.error("Failed to fetch referral requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  // Polling active requests to show real-time scraping progress
  useEffect(() => {
    const activeRequests = requests.filter(r => r.status === "PENDING" || r.status === "SCRAPED");
    if (activeRequests.length === 0) return;

    const interval = setInterval(async () => {
      let updated = false;
      const nextRequests = await Promise.all(requests.map(async (r) => {
        if (r.status === "PENDING" || r.status === "SCRAPED") {
          try {
            const fresh = await referralService.getReferralRequest(r.id);
            if (fresh.status !== r.status) {
              updated = true;
            }
            return fresh;
          } catch (e) {
            return r;
          }
        }
        return r;
      }));

      if (updated) {
        setRequests(nextRequests);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [requests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobId || !jobLink) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      
      const newRequest = await referralService.createReferralRequest(userId, companyName, jobId, jobLink);
      setRequests([newRequest, ...requests]);
      
      setCompanyName("");
      setJobId("");
      setJobLink("");
      setMessage("Referral request submitted successfully! Scraping and matching is in progress...");
    } catch (err: any) {
      setError(err.message || "Failed to submit referral request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-card shadow-sm border border-slate-200 p-6 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🤝</span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Referral Request Center</h2>
          <p className="text-xs text-slate-500">Submit job postings to automatically find and ask employees for referrals</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-card mb-6 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-card mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8 border-b border-slate-100 pb-8">
        <Input
          label="Target Company Name"
          type="text"
          value={companyName}
          placeholder="e.g. Google"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          required
        />

        <Input
          label="Job ID / Requisition ID"
          type="text"
          value={jobId}
          placeholder="e.g. 104523"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobId(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1 w-full">
          <Input
            label="Job Listing URL"
            type="url"
            value={jobLink}
            placeholder="https://careers.google.com/..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobLink(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting Request..." : "Request Automated Referral"}
          </Button>
        </div>
      </form>

      {/* Requests History List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Referral Request History</h3>
        {loading ? (
          <div className="text-sm text-slate-400 italic">Loading history...</div>
        ) : requests.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-card text-slate-400 text-sm italic">
            No referral requests submitted yet. Submit a job URL above to start!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Job Title & Link</TableHead>
                <TableHead>Req ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Matched Professionals</TableHead>
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => {
                let badgeVariant: "neutral" | "success" | "warning" | "error" | "info" = "neutral";
                let statusLabel = req.status;

                if (req.status === "PENDING") {
                  badgeVariant = "info";
                  statusLabel = "Parsing URL...";
                } else if (req.status === "SCRAPED") {
                  badgeVariant = "warning";
                  statusLabel = "Matchmaking...";
                } else if (req.status === "COMPLETED") {
                  badgeVariant = "success";
                  statusLabel = "Emails Sent";
                } else if (req.status === "SCRAPING_FAILED") {
                  badgeVariant = "error";
                  statusLabel = "Parsing Failed";
                }

                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-semibold text-slate-700">{req.companyName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-slate-800 text-sm font-medium">
                          {req.jobTitle || "Parsing job details..."}
                        </span>
                        <a 
                          href={req.jobLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-primary hover:underline truncate max-w-[200px]"
                        >
                          {req.jobLink}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{req.jobId}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">
                      {req.status === "PENDING" || req.status === "SCRAPED" ? "-" : req.matchedProfessionals}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(req.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
};

export default ReferralSection;
