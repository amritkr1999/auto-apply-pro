import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../../config/api";

interface ModelStats {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}

interface PurposeStats {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}

interface TelemetryCall {
  timestamp: string;
  model: string;
  purpose: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  execution_time_seconds: number;
  success: boolean;
  error_message?: string;
}

interface TelemetryData {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_estimated_cost: number;
  success_rate: number;
  breakdown_by_model: Record<string, ModelStats>;
  breakdown_by_purpose: Record<string, PurposeStats>;
  production_cost_projections: {
    gemini_1_5_flash: number;
    gemini_1_5_pro: number;
  };
  recent_calls: TelemetryCall[];
}

export const TelemetryDashboard: React.FC = () => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true);
      setError(null);
      
      const userStr = localStorage.getItem("user");
      let token = "";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.token || "";
        } catch (e) {
          console.error("Failed to extract auth token", e);
        }
      }

      try {
        const response = await fetch(`${API_BASE}/drafts/llm-stats`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats (Status ${response.status})`);
        }
        
        const stats = await response.json();
        setData(stats);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while loading AI statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, [refreshKey]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCost = (num: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 }).format(num);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " " + date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Querying AI Pipeline Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to load LLM Telemetry</h3>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-100 transition-colors inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.25" />
          </svg>
          Retry Connection
        </button>
      </div>
    );
  }

  const telemetry = data || {
    total_requests: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_tokens: 0,
    total_estimated_cost: 0.0,
    success_rate: 100.0,
    breakdown_by_model: {},
    breakdown_by_purpose: {},
    production_cost_projections: { gemini_1_5_flash: 0.0, gemini_1_5_pro: 0.0 },
    recent_calls: []
  };

  const inputPercentage = telemetry.total_tokens > 0 
    ? Math.round((telemetry.total_input_tokens / telemetry.total_tokens) * 100)
    : 50;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Model Telemetry</h1>
          <p className="text-slate-500 text-sm mt-1">
            Production cost forecasting, prompt optimization analysis, and model usage statistics (Admin view).
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-sm hover:shadow active:scale-95 inline-flex items-center"
          title="Refresh Data"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.25" />
          </svg>
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Total Calls */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total LLM Requests</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{formatNumber(telemetry.total_requests)}</h2>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md w-fit">
            <span>{telemetry.success_rate}% Success Rate</span>
          </div>
        </div>

        {/* Card 2: Total Tokens */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accumulated Context</span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{formatNumber(telemetry.total_tokens)}</h2>
          <p className="text-slate-400 text-xs mt-3 font-medium">
            In: {formatNumber(telemetry.total_input_tokens)} / Out: {formatNumber(telemetry.total_output_tokens)}
          </p>
        </div>

        {/* Card 3: Est. Production Cost */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Production Cost</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{formatCost(telemetry.total_estimated_cost)}</h2>
          <div className="mt-3 flex items-center text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md w-fit">
            <span>Projected on Gemini 1.5 rates</span>
          </div>
        </div>

        {/* Card 4: Average Response Time */}
        <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Latency</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            {telemetry.recent_calls.length > 0 
              ? (telemetry.recent_calls.reduce((sum, item) => sum + item.execution_time_seconds, 0) / telemetry.recent_calls.length).toFixed(2)
              : "0.00"}s
          </h2>
          <p className="text-slate-400 text-xs mt-3 font-medium">Over last 20 requests</p>
        </div>
      </div>

      {/* Mid Section: Projections & Context Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Token Context Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-2">Token Context Distribution</h3>
          <p className="text-slate-400 text-xs mb-6">Percentage of tokens used in prompts (Input Context) vs completions (Output Context).</p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-indigo-600">Input Prompts ({inputPercentage}%)</span>
                <span className="text-violet-600">Model Responses ({100 - inputPercentage}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${inputPercentage}%` }}
                ></div>
                <div 
                  className="bg-gradient-to-r from-violet-500 to-violet-600 h-full transition-all duration-500" 
                  style={{ width: `${100 - inputPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Input Token Volume</div>
                <div className="text-lg font-bold text-slate-700 mt-1">{formatNumber(telemetry.total_input_tokens)}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Prompt instruction size</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Output Token Volume</div>
                <div className="text-lg font-bold text-slate-700 mt-1">{formatNumber(telemetry.total_output_tokens)}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Generated outreach copy size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Production Cost Projections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-2">Live Production Cost Projections</h3>
          <p className="text-slate-400 text-xs mb-6">Compare projected live execution costs if the entire history were routed to Gemini cloud models.</p>

          <div className="space-y-4">
            {/* Flash projection */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">Gemini 1.5 Flash</div>
                <div className="text-indigo-600 text-xs mt-0.5 font-medium">Cost-Efficient Production Tier</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-indigo-600">{formatCost(telemetry.production_cost_projections.gemini_1_5_flash)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Input: $0.075 / Output: $0.30 (per 1M)</div>
              </div>
            </div>

            {/* Pro projection */}
            <div className="p-4 rounded-xl border border-violet-100 bg-violet-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 text-sm">Gemini 1.5 Pro</div>
                <div className="text-violet-600 text-xs mt-0.5 font-medium">High-Intelligence reasoning Tier</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-violet-600">{formatCost(telemetry.production_cost_projections.gemini_1_5_pro)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Input: $3.50 / Output: $10.50 (per 1M)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model & Stage breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Model Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Breakdown by Model</h3>
          {Object.keys(telemetry.breakdown_by_model).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No model usage recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(telemetry.breakdown_by_model).map(([modelName, stats]) => {
                const totalModelTokens = stats.input_tokens + stats.output_tokens;
                const percentage = telemetry.total_requests > 0
                  ? Math.round((stats.calls / telemetry.total_requests) * 100)
                  : 0;
                return (
                  <div key={modelName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span className="font-mono">{modelName}</span>
                      <span>{stats.calls} calls ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{formatNumber(totalModelTokens)} total tokens</span>
                      <span>Cost: {formatCost(stats.cost)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purpose / Stage Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Breakdown by Pipeline Stage</h3>
          {Object.keys(telemetry.breakdown_by_purpose).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No stage telemetry recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(telemetry.breakdown_by_purpose).map(([purposeName, stats]) => {
                const totalStageTokens = stats.input_tokens + stats.output_tokens;
                const percentage = telemetry.total_requests > 0
                  ? Math.round((stats.calls / telemetry.total_requests) * 100)
                  : 0;
                // format purpose string to readable format
                const formattedPurpose = purposeName
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, c => c.toUpperCase());
                  
                return (
                  <div key={purposeName} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{formattedPurpose}</span>
                      <span>{stats.calls} calls ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{formatNumber(totalStageTokens)} total tokens</span>
                      <span>Cost: {formatCost(stats.cost)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Execution Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Executions</h3>
            <p className="text-slate-400 text-xs mt-0.5">Chronological log of the last 20 LLM instructions executed by the pipeline.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-semibold text-xs bg-slate-50/50">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4">Token Breakdown</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {telemetry.recent_calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent executions logged.
                  </td>
                </tr>
              ) : (
                telemetry.recent_calls.map((call, index) => {
                  const formattedStage = call.purpose
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {formatDate(call.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {call.model}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {formattedStage}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{formatNumber(call.total_tokens)}</span>{" "}
                        <span className="text-slate-400">(In: {formatNumber(call.input_tokens)} / Out: {formatNumber(call.output_tokens)})</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {call.execution_time_seconds.toFixed(2)}s
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {call.success ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Success
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100 cursor-pointer"
                            title={call.error_message || "Execution error"}
                          >
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TelemetryDashboard;
