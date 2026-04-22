import React from 'react';
import type { ProgressLog } from '../../types/progressLog';

interface Props {
  logs: ProgressLog[];
  targetValue: number;
}

const W = 600;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };

export const WeightProgressChart: React.FC<Props> = ({ logs, targetValue }) => {
  // Logs arrive desc by date — reverse to ascending for chart
  const sorted = [...logs].reverse();

  if (sorted.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[140px] rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-400 dark:text-gray-500">Log at least 2 weigh-ins to see your trend</p>
      </div>
    );
  }

  const values = sorted.map((l) => l.value);
  const allValues = [...values, targetValue];
  const minVal = Math.min(...allValues) - 1;
  const maxVal = Math.max(...allValues) + 1;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / (sorted.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = sorted.map((l, i) => `${toX(i)},${toY(l.value)}`).join(' ');
  const targetY = toY(targetValue);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount }, (_, i) =>
    minVal + ((maxVal - minVal) * i) / (tickCount - 1)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 260, height: H }}
        aria-label="Weight progress chart"
      >
        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} y1={toY(v)}
              x2={W - PAD.right} y2={toY(v)}
              stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
              className="text-gray-900 dark:text-white"
            />
            <text
              x={PAD.left - 6} y={toY(v) + 4}
              textAnchor="end" fontSize={10}
              className="fill-gray-400 dark:fill-gray-500"
            >
              {Math.round(v)}
            </text>
          </g>
        ))}

        {/* Target line */}
        <line
          x1={PAD.left} y1={targetY}
          x2={W - PAD.right} y2={targetY}
          stroke="#10b981" strokeWidth={1.5} strokeDasharray="6 4" strokeOpacity={0.7}
        />
        <text
          x={W - PAD.right + 2} y={targetY + 4}
          fontSize={9} fill="#10b981" fillOpacity={0.85}
        >
          {targetValue}kg
        </text>

        {/* Weight polyline */}
        <polyline
          points={points}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points + X-axis labels */}
        {sorted.map((l, i) => (
          <g key={l.id}>
            <circle cx={toX(i)} cy={toY(l.value)} r={4} fill="#6366f1" />
            <title>{formatDate(l.date)}: {l.value} kg{l.note ? ` — ${l.note}` : ''}</title>
            {(i === 0 || i === sorted.length - 1 || sorted.length <= 6) && (
              <text
                x={toX(i)} y={H - 6}
                textAnchor="middle" fontSize={9}
                className="fill-gray-400 dark:fill-gray-500"
              >
                {formatDate(l.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
