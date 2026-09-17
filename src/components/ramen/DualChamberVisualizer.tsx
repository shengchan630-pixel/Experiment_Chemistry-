import React from 'react';
import {
  CONTAINER_MATERIALS,
  ContainerMaterial,
  SimulationParams,
  SimulationStepState,
} from '../../types/ramenExperiment';
import { Flame, Thermometer, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  params: SimulationParams;
  state: SimulationStepState;
  onTapPot?: () => void;
}

export default function DualChamberVisualizer({ params, state, onTapPot }: Props) {
  const mat = CONTAINER_MATERIALS[params.containerMaterial];

  // Visual color mappings for materials
  const getMaterialVisual = (matId: ContainerMaterial) => {
    switch (matId) {
      case 'aluminum':
        return {
          fill: 'url(#metal-aluminum)',
          stroke: '#94a3b8',
          accent: '#38bdf8',
          textureName: '알루미늄 (초고속 열전도)',
          badgeColor: 'bg-sky-950/70 text-sky-300 border-sky-700',
        };
      case 'stainless':
        return {
          fill: 'url(#metal-stainless)',
          stroke: '#cbd5e1',
          accent: '#94a3b8',
          textureName: '스테인리스강 (균일 내구성)',
          badgeColor: 'bg-slate-800/80 text-slate-200 border-slate-600',
        };
      case 'heat_resistant_glass':
        return {
          fill: 'url(#heat-resistant-glass)',
          stroke: '#38bdf8',
          accent: '#0284c7',
          textureName: '내열 유리 (보온·투명)',
          badgeColor: 'bg-sky-900/80 text-sky-200 border-sky-500',
        };
      default:
        return {
          fill: 'url(#metal-aluminum)',
          stroke: '#94a3b8',
          accent: '#38bdf8',
          textureName: '알루미늄',
          badgeColor: 'bg-slate-800 text-slate-200 border-slate-700',
        };
    }
  };

  const matVisual = getMaterialVisual(params.containerMaterial);
  const outerVisual = matVisual;
  const innerVisual = matVisual;

  // Outer reaction heat color
  const outerHeatRatio = Math.min(1, Math.max(0, (state.outerTemp - 20) / 80));
  const innerHeatRatio = Math.min(1, Math.max(0, (state.innerTemp - 20) / 80));

  // Noodle visual styling
  const noodleProgress = state.noodleInfo.progressPercent;
  const isNoodleCooked = noodleProgress >= 65;

  // Broth color transition
  // From clear water (rgba(224, 242, 254, 0.4)) to spicy ramen broth (rgba(220, 38, 38, 0.85))
  const brothOpacity = Math.min(0.9, 0.3 + (state.innerTemp / 100) * 0.6);

  return (
    <div
      id="ramen-dual-chamber-visualizer"
      className="relative w-full max-w-lg bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-4 flex flex-col items-center select-none overflow-hidden"
    >
      {/* Background Lab Grid & Ambient Aura */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Heat Glow Aura radiating from reactor */}
      <div
        className="absolute bottom-16 w-64 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: outerHeatRatio > 0.2 ? '#f97316' : '#38bdf8',
          opacity: outerHeatRatio * 0.45,
        }}
      />

      {/* Top Header Information: Container Cross-section Tag */}
      <div className="w-full flex items-center justify-between text-xs mb-3 z-10 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-sky-950/80 text-sky-300 border border-sky-800/80">
            2중 구조 발열 조리기 단면 ({mat.nameKo})
          </span>
          {state.isInnerBoiling && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-950/90 text-red-400 border border-red-800 animate-pulse flex items-center gap-1">
              <Flame className="w-3 h-3" />
              비등(끓는 중)
            </span>
          )}
        </div>

        {/* Reaction Status indicator */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>열전달 및 조리 시뮬레이션</span>
        </div>
      </div>

      {/* Dual Chamber Cutaway SVG Stage */}
      <div
        className="relative w-full h-[340px] flex items-center justify-center cursor-pointer"
        onClick={onTapPot}
        title="클릭하여 조리 상태 관찰"
      >
        <svg
          viewBox="0 0 420 340"
          className="w-full h-full max-h-[340px] drop-shadow-xl"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Aluminum metallic gradient */}
            <linearGradient id="metal-aluminum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="25%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="75%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Stainless steel brushed gradient */}
            <linearGradient id="metal-stainless" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="20%" stopColor="#cbd5e1" />
              <stop offset="45%" stopColor="#f1f5f9" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Heat-resistant glass gradient (transparent & luminous) */}
            <linearGradient id="heat-resistant-glass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="15%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#e0f2fe" stopOpacity="0.35" />
              <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.45" />
            </linearGradient>

            {/* Heat transfer gradient (Outer -> Inner) */}
            <linearGradient id="heat-glow-outer" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.3" />
            </linearGradient>

            {/* Slaked lime milky suspension gradient */}
            <linearGradient id="slaked-lime-bath" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.95" />
            </linearGradient>

            {/* Spicy Ramen Broth gradient */}
            <linearGradient id="spicy-ramen-soup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#dc2626" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0.95" />
            </linearGradient>

            {/* Clear cooking water before heating */}
            <linearGradient id="clear-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>

            {/* Clip path for inner container fluid */}
            <clipPath id="inner-pot-clip">
              <path d="M 85,115 Q 85,225 125,235 L 295,235 Q 335,225 335,115 Z" />
            </clipPath>

            {/* Clip path for outer chamber jacket */}
            <clipPath id="outer-jacket-clip">
              <path d="M 45,90 L 45,260 Q 45,305 105,305 L 315,305 Q 375,305 375,260 L 375,90 L 345,90 L 345,250 Q 345,275 300,275 L 120,275 Q 75,275 75,250 L 75,90 Z" />
            </clipPath>
          </defs>

          {/* ========================================================= */}
          {/* 1. OUTSIDE STEAM VENTS & RISING STEAM                      */}
          {/* ========================================================= */}
          {/* Outer chamber side vents steam */}
          {state.outerSteamIntensity > 0.05 && (
            <g className="animate-pulse" opacity={state.outerSteamIntensity}>
              {/* Left vent steam */}
              <path
                d="M 50,85 C 35,60 25,45 35,20 C 42,5 25,-10 30,-25"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 8"
                opacity="0.65"
              />
              {/* Right vent steam */}
              <path
                d="M 370,85 C 385,60 395,45 385,20 C 378,5 395,-10 390,-25"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 8"
                opacity="0.65"
              />
            </g>
          )}

          {/* Inner food steam (Delicious ramen steam) */}
          {state.innerSteamIntensity > 0.05 && (
            <g opacity={state.innerSteamIntensity}>
              <path
                d="M 170,110 C 155,80 185,50 165,25 C 150,5 170,-15 160,-30"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="4 6"
                className="animate-pulse"
                opacity="0.75"
              />
              <path
                d="M 210,105 C 225,75 195,45 215,20 C 230,0 210,-20 220,-35"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="5 7"
                className="animate-pulse"
                opacity="0.85"
              />
              <path
                d="M 250,110 C 235,80 265,55 245,30 C 230,10 250,-10 240,-25"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 6"
                className="animate-pulse"
                opacity="0.7"
              />
            </g>
          )}

          {/* ========================================================= */}
          {/* 2. OUTER CONTAINER (외벽 재질 & 단열 챔버)                  */}
          {/* ========================================================= */}
          {/* Outer Vessel Outer Shell (Thick insulated wall) */}
          <path
            d="M 40,85 L 40,265 Q 40,315 100,315 L 320,315 Q 380,315 380,265 L 380,85 L 345,85 L 345,255 Q 345,285 295,285 L 125,285 Q 75,285 75,255 L 75,85 Z"
            fill={outerVisual.fill}
            stroke={outerVisual.stroke}
            strokeWidth="3"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
          />

          {/* Outer Vessel Bottom Base Pad (Anti-slip / thermal insulation foot) */}
          <rect x="90" y="315" width="240" height="10" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

          {/* Outer Silicone Side Grips */}
          <rect x="25" y="140" width="15" height="50" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
          <rect x="380" y="140" width="15" height="50" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />

          {/* Outer Chamber Exhaust Steam Vents (Left & Right) */}
          <ellipse cx="55" cy="85" rx="7" ry="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <ellipse cx="365" cy="85" rx="7" ry="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

          {/* ========================================================= */}
          {/* 3. OUTER REACTION CHAMBER FLUID (CaO + H2O Slaking Bath)   */}
          {/* ========================================================= */}
          {/* Reaction fluid fill between outer vessel and inner pot */}
          <g>
            {/* The reaction bath liquid in the bottom & sides */}
            <path
              d="M 75,170 Q 75,285 125,285 L 295,285 Q 345,285 345,170 L 335,185 Q 315,255 210,255 Q 105,255 85,185 Z"
              fill={state.caoConsumedPercent > 5 ? 'url(#slaked-lime-bath)' : 'url(#clear-water)'}
              opacity="0.92"
            />

            {/* Glowing heat gradient when hot */}
            {outerHeatRatio > 0.1 && (
              <path
                d="M 75,170 Q 75,285 125,285 L 295,285 Q 345,285 345,170 L 335,185 Q 315,255 210,255 Q 105,255 85,185 Z"
                fill="url(#heat-glow-outer)"
                opacity={Math.min(0.85, outerHeatRatio * 0.9)}
                className="transition-opacity duration-300"
              />
            )}

            {/* Quicklime CaO Powder / Slaked Lime Sediment at bottom */}
            <path
              d="M 95,275 Q 210,265 325,275 L 320,285 L 100,285 Z"
              fill={state.caoConsumedPercent < 70 ? '#f8fafc' : '#cbd5e1'}
              opacity="0.95"
            />
            {/* Small granules texture for CaO */}
            <circle cx="140" cy="276" r="2.5" fill="#94a3b8" />
            <circle cx="180" cy="274" r="3" fill="#64748b" />
            <circle cx="230" cy="275" r="2.5" fill="#94a3b8" />
            <circle cx="270" cy="276" r="3" fill="#64748b" />

            {/* Outer Chamber Boiling Bubbles (CaO vigorous slaking reaction) */}
            {(state.isOuterBoiling || state.reactionRate > 50) && (
              <g className="animate-pulse">
                <circle cx="110" cy="240" r="3.5" fill="#ffffff" opacity="0.9" />
                <circle cx="130" cy="220" r="4.5" fill="#ffffff" opacity="0.8" />
                <circle cx="160" cy="250" r="5" fill="#ffffff" opacity="0.9" />
                <circle cx="210" cy="245" r="6" fill="#ffffff" opacity="0.95" />
                <circle cx="260" cy="250" r="4.5" fill="#ffffff" opacity="0.85" />
                <circle cx="290" cy="225" r="4" fill="#ffffff" opacity="0.9" />
                <circle cx="310" cy="240" r="3.5" fill="#ffffff" opacity="0.8" />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* 4. INNER CONTAINER (내부 용기: 라면 냄비/트레이)              */}
          {/* ========================================================= */}
          {/* Inner Pot Outer Wall (Resting in the steam jacket) */}
          <path
            d="M 80,110 L 80,120 Q 80,240 120,250 L 300,250 Q 340,240 340,120 L 340,110 L 355,110 L 355,100 L 65,100 L 65,110 Z"
            fill={innerVisual.fill}
            stroke={innerVisual.stroke}
            strokeWidth="2.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
          />

          {/* Inner Pot Rim / Lip */}
          <rect x="65" y="100" width="290" height="8" rx="3" fill={innerVisual.fill} stroke={innerVisual.stroke} strokeWidth="1.5" />

          {/* Inner Food Fluid Area (Water + Spicy Broth + Noodles) */}
          <g clipPath="url(#inner-pot-clip)">
            {/* Background Liquid (Broth) */}
            <rect
              x="80"
              y="115"
              width="260"
              height="125"
              fill={params.hasBrothFlakes ? 'url(#spicy-ramen-soup)' : 'url(#clear-water)'}
              opacity={brothOpacity}
              className="transition-all duration-700"
            />

            {/* Liquid Meniscus & Shimmer on Surface */}
            <ellipse cx="210" cy="120" rx="120" ry="10" fill="#fed7aa" opacity="0.35" />

            {/* Curly Ramen Noodles (Layered wavy SVG paths) */}
            <g
              transform="translate(100, 130)"
              stroke={isNoodleCooked ? '#fbbf24' : '#fef08a'}
              strokeWidth={isNoodleCooked ? '3.8' : '3.0'}
              fill="none"
              strokeLinecap="round"
              className="transition-colors duration-500"
            >
              {/* Noodle strand 1 */}
              <path d="M 10,25 Q 25,10 40,25 T 70,25 T 100,25 T 130,25 T 160,25 T 190,25 T 210,25" />
              {/* Noodle strand 2 */}
              <path d="M 15,40 Q 30,55 45,40 T 75,40 T 105,40 T 135,40 T 165,40 T 195,40 T 215,40" />
              {/* Noodle strand 3 */}
              <path d="M 20,55 Q 35,40 50,55 T 80,55 T 110,55 T 140,55 T 170,55 T 200,55" />
              {/* Noodle strand 4 */}
              <path d="M 30,70 Q 45,85 60,70 T 90,70 T 120,70 T 150,70 T 180,70 T 200,70" />
            </g>

            {/* Ramen Garnish: Scallions, Chili rings, flakes */}
            {params.hasBrothFlakes && (
              <g>
                {/* Green scallion rings */}
                <ellipse cx="145" cy="135" rx="5" ry="3" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
                <ellipse cx="175" cy="145" rx="6" ry="3.5" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
                <ellipse cx="230" cy="138" rx="5.5" ry="3" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
                <ellipse cx="265" cy="148" rx="6" ry="3.5" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
                <ellipse cx="200" cy="155" rx="5" ry="3" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />

                {/* Red chili ring */}
                <ellipse cx="190" cy="136" rx="6" ry="3.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
                <ellipse cx="190" cy="136" rx="2.5" ry="1.5" fill="#991b1b" />

                {/* Egg garnish slice */}
                <ellipse cx="240" cy="165" rx="14" ry="9" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
                <circle cx="240" cy="165" r="5" fill="#f97316" />
              </g>
            )}

            {/* Boiling Convection Bubbles inside Ramen Pot */}
            {state.isInnerSimmering && (
              <g className="animate-pulse">
                <circle cx="130" cy="150" r="3" fill="#ffffff" opacity="0.8" />
                <circle cx="160" cy="130" r="4.5" fill="#ffffff" opacity="0.9" />
                <circle cx="195" cy="125" r="5" fill="#ffffff" opacity="0.95" />
                <circle cx="225" cy="130" r="4" fill="#ffffff" opacity="0.85" />
                <circle cx="260" cy="140" r="3.5" fill="#ffffff" opacity="0.8" />
                <circle cx="170" cy="170" r="3" fill="#ffffff" opacity="0.75" />
                <circle cx="230" cy="165" r="3.5" fill="#ffffff" opacity="0.8" />
              </g>
            )}

            {/* Rolling Boil Wave on surface */}
            {state.isInnerBoiling && (
              <path
                d="M 100,122 Q 130,118 160,122 T 220,122 T 280,122 T 320,122"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.85"
                className="animate-pulse"
              />
            )}
          </g>

          {/* ========================================================= */}
          {/* 5. THERMAL VECTORS (HEAT TRANSFER ARROWS)                  */}
          {/* ========================================================= */}
          {state.heatTransferRate > 5 && (
            <g opacity={Math.min(1, state.heatTransferRate / 100)} className="animate-pulse">
              {/* Heat penetrating from outer to inner bottom */}
              <path d="M 160,265 L 160,245" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="3 3" />
              <path d="M 210,265 L 210,245" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="3 3" />
              <path d="M 260,265 L 260,245" fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="3 3" />

              {/* Heat penetrating sides */}
              <path d="M 85,200 L 105,190" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="2 3" />
              <path d="M 335,200 L 315,190" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="2 3" />
            </g>
          )}
        </svg>

        {/* Live Floating Outer Chamber Thermometer Badge (Left) */}
        <div className="absolute left-1 top-24 bg-slate-900/90 border border-amber-600/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-lg flex flex-col gap-0.5 pointer-events-none text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>외부 발열부 (CaO+물)</span>
          </div>
          <div className="text-base font-black font-mono text-white flex items-baseline gap-1">
            <span>{state.outerTemp.toFixed(1)}</span>
            <span className="text-xs text-amber-400 font-normal">°C</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between gap-1 border-t border-slate-800 pt-0.5">
            <span>용기: {mat.nameKo}</span>
            <span className="text-amber-300 font-mono">{state.caoConsumedPercent.toFixed(0)}% 반응</span>
          </div>
        </div>

        {/* Live Floating Inner Pot Thermometer Badge (Right) */}
        <div className="absolute right-1 top-10 bg-slate-900/90 border border-red-600/70 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-lg flex flex-col gap-0.5 pointer-events-none text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
            <Thermometer className="w-3 h-3 text-rose-500" />
            <span>내부 라면 냄비</span>
          </div>
          <div className="text-base font-black font-mono text-white flex items-baseline gap-1">
            <span>{state.innerTemp.toFixed(1)}</span>
            <span className="text-xs text-rose-400 font-normal">°C</span>
          </div>
          <div className="text-[10px] text-slate-300 flex items-center justify-between gap-1 border-t border-slate-800 pt-0.5">
            <span>용기: {mat.nameKo}</span>
            <span className="text-rose-300 font-mono">
              {state.isInnerBoiling ? '끓는 중 🔥' : state.isInnerSimmering ? '가열 중 ♨️' : '예열 중'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Noodle Doneness Banner */}
      <div className="w-full mt-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">라면 조리 완성도:</span>
            <span style={{ color: state.noodleInfo.color }} className="font-extrabold flex items-center gap-1">
              {isNoodleCooked ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              )}
              {state.noodleInfo.label}
            </span>
          </div>

          <div className="font-mono text-xs font-bold text-slate-200">
            {state.noodleInfo.progressPercent}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${state.noodleInfo.progressPercent}%`,
              backgroundColor: state.noodleInfo.color,
            }}
          />
        </div>

        {/* Evaluation note */}
        <p className="text-[11px] text-slate-400 leading-tight">
          {state.noodleInfo.description}
        </p>
      </div>
    </div>
  );
}
