import React from 'react';
import { SimulationStepState } from '../../types/ramenExperiment';
import { Activity, ArrowRightLeft, Wind } from 'lucide-react';

interface Props {
  state: SimulationStepState;
  ambientTemp?: number;
}

export default function ThermalAnalyticsGraph({ state }: Props) {
  const { history, outerTemp, innerTemp, timeSeconds } = state;

  const maxTime = Math.max(120, timeSeconds + 10);
  const minTemp = 0;
  const maxTemp = 135; // °C scale

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const padL = 38;
  const padR = 15;
  const padT = 15;
  const padB = 25;

  const chartW = svgWidth - padL - padR;
  const chartH = svgHeight - padT - padB;

  const scaleX = (t: number) => padL + (t / maxTime) * chartW;
  const scaleY = (temp: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    const ratio = (clamped - minTemp) / (maxTemp - minTemp);
    return padT + (1 - ratio) * chartH;
  };

  // Build SVG path strings
  const buildPath = (key: 'outerTemp' | 'innerTemp') => {
    if (history.length === 0) return '';
    return history
      .map((pt, idx) => {
        const x = scaleX(pt.time);
        const y = scaleY(pt[key]);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const outerPath = buildPath('outerTemp');
  const innerPath = buildPath('innerTemp');

  // Boiling point horizontal line Y (standard 100°C)
  const boilingY = scaleY(100);

  // Minutes and seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="thermal-analytics-card"
      className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl text-white"
    >
      {/* Header and Live Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200">
            실시간 열역학 온도 곡선 및 에너지 수지
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">
            경과: <strong className="text-white">{formatTime(timeSeconds)}</strong>
          </span>
          <span className="text-slate-400">
            발열률: <strong className="text-amber-400">{state.reactionRate} W</strong>
          </span>
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative w-full h-[160px] select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chart-grid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background area */}
          <rect x={padL} y={padT} width={chartW} height={chartH} fill="url(#chart-grid)" rx="4" />

          {/* Horizontal Temperature Reference Grid Lines */}
          {[0, 40, 80, 100, 120].map((t) => {
            const y = scaleY(t);
            return (
              <g key={t}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + chartW}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />
                <text x={padL - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">
                  {t}°
                </text>
              </g>
            );
          })}

          {/* Time axis markings */}
          {[0, 60, 120, 180, 240, 300].map((t) => {
            if (t > maxTime) return null;
            const x = scaleX(t);
            return (
              <g key={t}>
                <line x1={x} y1={padT + chartH} x2={x} y2={padT + chartH + 4} stroke="#475569" />
                <text x={x} y={padT + chartH + 15} textAnchor="middle" fontSize="9" fill="#64748b">
                  {t}s
                </text>
              </g>
            );
          })}

          {/* Boiling Point Line (Cyan Dashed Line, 100°C) */}
          <line
            x1={padL}
            y1={boilingY}
            x2={padL + chartW}
            y2={boilingY}
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={padL + chartW - 4}
            y={boilingY - 4}
            textAnchor="end"
            fontSize="9"
            fill="#22d3ee"
            fontWeight="bold"
          >
            끓는점 100°C
          </text>

          {/* Outer Chamber Temperature Line (Orange) */}
          {outerPath && (
            <path
              d={outerPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Inner Pot Temperature Line (Red) */}
          {innerPath && (
            <path
              d={innerPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current Heads Points */}
          {history.length > 0 && (
            <g>
              {/* Outer temp point */}
              <circle
                cx={scaleX(timeSeconds)}
                cy={scaleY(outerTemp)}
                r="4"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Inner temp point */}
              <circle
                cx={scaleX(timeSeconds)}
                cy={scaleY(innerTemp)}
                r="4"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Thermodynamics Flow Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-[11px]">
        {/* Outer temp legend */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-slate-400">외부 발열부:</span>
          <span className="font-mono font-bold text-amber-400">{outerTemp.toFixed(1)}°C</span>
        </div>

        {/* Inner temp legend */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-slate-400">내부 라면수:</span>
          <span className="font-mono font-bold text-red-400">{innerTemp.toFixed(1)}°C</span>
        </div>

        {/* Heat transfer to food */}
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-slate-400">음식 열전달:</span>
          <span className="font-mono font-bold text-emerald-400">{state.heatTransferRate} W</span>
        </div>

        {/* Heat loss to ambient */}
        <div className="flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-sky-400 shrink-0" />
          <span className="text-slate-400">대기 방열손실:</span>
          <span className="font-mono font-bold text-sky-400">{state.heatLossRate} W</span>
        </div>
      </div>
    </div>
  );
}

