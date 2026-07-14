import React, { useState } from "react";
import type { DailyActivity } from "../services/dashboardService";

interface ActivityChartProps {
  data: DailyActivity[];
  loading: boolean;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, loading }) => {
  const [hoveredBar, setHoveredBar] = useState<{
    dayName: string;
    type: string;
    value: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[380px] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Loading activity analytics...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-[380px] flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 italic">
        No activity logs found for the last 7 days.
      </div>
    );
  }

  // Dimensions
  const svgWidth = 700;
  const svgHeight = 280;
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Find max value in data for Y scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.emailsSent, d.questionsSolved, d.topicsCompleted)),
    6 // minimum grid scale height
  );

  // Round up maxVal to a multiple of 3 or 4 for nice gridlines
  const yAxisMax = Math.ceil(maxVal / 3) * 3;

  // Helper to scale Y values
  const getY = (val: number) => {
    return chartHeight - (val / yAxisMax) * chartHeight;
  };

  const groupWidth = chartWidth / data.length;
  const barWidth = 10;
  const barSpacing = 3;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-visible hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📊</span> Activity Analytics
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your daily performance over the past 7 days</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-indigo-500 to-violet-600 block shadow-sm shadow-indigo-200"></span>
            <span>Emails Sent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-rose-500 to-pink-600 block shadow-sm shadow-rose-200"></span>
            <span>Questions Solved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-teal-600 block shadow-sm shadow-emerald-200"></span>
            <span>Topics Completed</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas wrapper with overflow visible for tooltips */}
      <div className="relative overflow-visible w-full overflow-x-auto select-none scrollbar-thin">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="questionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <linearGradient id="topicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 1, 2, 3].map((i) => {
            const yVal = (yAxisMax / 3) * i;
            const yPos = getY(yVal) + padding.top;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500"
                >
                  {Math.round(yVal)}
                </text>
              </g>
            );
          })}

          {/* Render Columns */}
          {data.map((day, dIdx) => {
            const groupX = padding.left + dIdx * groupWidth + (groupWidth - (barWidth * 3 + barSpacing * 2)) / 2;

            // Bar configs
            const barData = [
              {
                type: "Emails Sent",
                value: day.emailsSent,
                grad: "url(#emailGrad)",
                color: "indigo",
                shadow: "shadow-indigo-200",
                offsetX: 0,
              },
              {
                type: "Questions Solved",
                value: day.questionsSolved,
                grad: "url(#questionGrad)",
                color: "rose",
                shadow: "shadow-rose-200",
                offsetX: barWidth + barSpacing,
              },
              {
                type: "Topics Completed",
                value: day.topicsCompleted,
                grad: "url(#topicGrad)",
                color: "emerald",
                shadow: "shadow-emerald-200",
                offsetX: (barWidth + barSpacing) * 2,
              },
            ];

            return (
              <g key={dIdx}>
                {/* X Axis label */}
                <text
                  x={padding.left + dIdx * groupWidth + groupWidth / 2}
                  y={svgHeight - 15}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-500 dark:fill-slate-400"
                >
                  {day.date}
                </text>

                {/* Day Divider Lines (optional/subtle) */}
                {dIdx > 0 && (
                  <line
                    x1={padding.left + dIdx * groupWidth}
                    y1={padding.top}
                    x2={padding.left + dIdx * groupWidth}
                    y2={svgHeight - padding.bottom}
                    stroke="rgba(148, 163, 184, 0.05)"
                    strokeWidth="1"
                  />
                )}

                {/* Three bars */}
                {barData.map((bar, bIdx) => {
                  const barHeight = (bar.value / yAxisMax) * chartHeight;
                  const x = groupX + bar.offsetX;
                  const y = getY(bar.value) + padding.top;
                  
                  // Height buffer so we draw at least a tiny pill for values > 0
                  const actualHeight = bar.value > 0 ? Math.max(barHeight, 6) : 0;
                  const actualY = bar.value > 0 ? (getY(bar.value) + padding.top - (actualHeight - barHeight)) : y;

                  return (
                    <rect
                      key={bIdx}
                      x={x}
                      y={actualY}
                      width={barWidth}
                      height={actualHeight}
                      fill={bar.grad}
                      rx={3}
                      ry={3}
                      className="cursor-pointer transition-all duration-300 hover:brightness-110 origin-bottom"
                      style={{
                        transformBox: "fill-box",
                      }}
                      onMouseEnter={() => {
                        setHoveredBar({
                          dayName: day.date + " (" + day.fullDate + ")",
                          type: bar.type,
                          value: bar.value,
                          color: bar.color,
                          x: x + barWidth / 2,
                          y: actualY,
                        });
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Solid X axis line */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="1"
          />

          {/* Native SVG Floating Tooltip */}
          {hoveredBar && (
            <g transform={`translate(${hoveredBar.x}, ${hoveredBar.y - 12})`}>
              {/* Drop shadow filter definition can be avoided by utilizing SVG styling properties */}
              <rect
                x="-75"
                y="-45"
                width="150"
                height="40"
                rx="6"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="-32"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontWeight="800"
                letterSpacing="0.05em"
              >
                {hoveredBar.dayName.toUpperCase()}
              </text>
              <text
                x="0"
                y="-15"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="700"
              >
                {hoveredBar.type}: {hoveredBar.value}
              </text>
              {/* Tiny triangle arrow pointing to the bar */}
              <polygon
                points="-4,-5 4,-5 0,0"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.5"
                transform="translate(0, 0)"
              />
              {/* Overlapping triangle fill to cover the stroke */}
              <polygon
                points="-3.5,-5.5 3.5,-5.5 0,-0.5"
                fill="#0f172a"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
