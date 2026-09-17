import React, { useState } from 'react';
import { ElementData, CATEGORY_LABELS } from '../data/periodicTable';
import { Atom, Sparkles, Layers, Box, Maximize2, Play, Pause } from 'lucide-react';

interface ElementVisualsProps {
  element: ElementData;
  initialTab?: 'all' | 'sample' | 'bohr' | 'shells';
  size?: 'normal' | 'large';
  layout?: 'auto' | 'stacked' | 'grid';
  onExpand?: () => void;
}

// Shell labels and color accents
const SHELL_NAMES = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)'];
const SHELL_COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'];

export default function ElementVisuals({
  element,
  initialTab = 'all',
  size = 'normal',
  layout = 'auto',
  onExpand,
}: ElementVisualsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sample' | 'bohr' | 'shells'>(initialTab);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const catInfo = CATEGORY_LABELS[element.category];
  const shells = getElementShells(element.atomicNumber);
  const totalElectrons = shells.reduce((a, b) => a + b, 0);
  const neutrons = Math.round(element.atomicWeight) - element.atomicNumber;
  const isLarge = size === 'large';
  const isGridLayout = layout === 'grid' || (layout === 'auto' && isLarge);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col w-full">
      {/* Top View Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1 text-[11px]">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white/70 border border-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>모두 보기 (3종)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'sample'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>실물 외형</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bohr')}
            className={`py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'bohr'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-sky-500" />
            <span>보어 원자모형</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shells')}
            className={`py-1.5 px-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 shrink-0 ${
              activeTab === 'shells'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>전자껍질</span>
          </button>
        </div>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition shrink-0"
            title="대화면 스튜디오로 확대 보기"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>확대 보기</span>
          </button>
        )}
      </div>

      {/* Visual Canvas Area */}
      <div className={`relative ${isLarge ? 'p-5' : 'p-3'} bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col items-center justify-center select-none w-full overflow-hidden`}>
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {activeTab === 'all' && (
          isGridLayout ? (
            /* 3-Column Spacious Grid Layout */
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {/* 1. Real Sample Appearance */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-between min-h-[360px] shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2 pb-2 border-b border-slate-800/80 w-full justify-center">
                  <Box className="w-4 h-4" />
                  <span>1. 실물 외형 및 물리적 상태</span>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <SampleShapeView element={element} size={size} />
                </div>
              </div>

              {/* 2. Bohr Atomic Model */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-between min-h-[360px] shadow-lg">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-2 pb-2 border-b border-slate-800/80 w-full">
                  <div className="flex items-center gap-2">
                    <Atom className="w-4 h-4" />
                    <span>2. 보어 원자 모형 (전자 궤도)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRotating(!isRotating)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-normal flex items-center gap-1 transition"
                  >
                    {isRotating ? <Pause className="w-2.5 h-2.5 text-amber-400" /> : <Play className="w-2.5 h-2.5 text-emerald-400" />}
                    <span>{isRotating ? '정지' : '회전'}</span>
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <BohrAtomModelView
                    element={element}
                    shells={shells}
                    neutrons={neutrons}
                    isRotating={isRotating}
                    onToggleRotate={() => setIsRotating(!isRotating)}
                    size={size}
                  />
                </div>
              </div>

              {/* 3. Electron Shells Breakdown */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-between min-h-[360px] shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2 pb-2 border-b border-slate-800/80 w-full justify-center">
                  <Layers className="w-4 h-4" />
                  <span>3. 전자 껍질 (K, L, M, N)</span>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <ShellsBreakdownView
                    element={element}
                    shells={shells}
                    totalElectrons={totalElectrons}
                    size={size}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Unified 3-in-1 Compact Dashboard: Fits completely on screen without vertical overflow */
            <div className="w-full flex flex-col gap-2.5 animate-in fade-in duration-200">
              {/* Top Row: 실물 외형 & 보어 원자모형 side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {/* 1. Real Sample Appearance */}
                <div className="bg-slate-900/90 rounded-xl border border-slate-800/90 p-2.5 flex flex-col items-center justify-between shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1 w-full justify-between pb-1 border-b border-slate-800/80">
                    <div className="flex items-center gap-1">
                      <Box className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. 실물 외형</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getPhysicalSampleInfo(element.atomicNumber).crystal}
                    </span>
                  </div>
                  <div className="py-1 flex items-center justify-center w-full min-h-[135px]">
                    <SampleShapeView element={element} size="compact" />
                  </div>
                </div>

                {/* 2. Bohr Atomic Model */}
                <div className="bg-slate-900/90 rounded-xl border border-slate-800/90 p-2.5 flex flex-col items-center justify-between shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-1 w-full pb-1 border-b border-slate-800/80">
                    <div className="flex items-center gap-1">
                      <Atom className="w-3.5 h-3.5 text-sky-400" />
                      <span>2. 보어 원자 모형</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRotating(!isRotating)}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-normal flex items-center gap-0.5 transition"
                    >
                      {isRotating ? <Pause className="w-2 h-2 text-amber-400" /> : <Play className="w-2 h-2 text-emerald-400" />}
                      <span>{isRotating ? '정지' : '회전'}</span>
                    </button>
                  </div>
                  <div className="py-1 flex items-center justify-center w-full min-h-[135px]">
                    <BohrAtomModelView
                      element={element}
                      shells={shells}
                      neutrons={neutrons}
                      isRotating={isRotating}
                      onToggleRotate={() => setIsRotating(!isRotating)}
                      size="compact"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row: 3. Electron Shells Breakdown */}
              <div className="bg-slate-900/90 rounded-xl border border-slate-800/90 p-2.5 flex flex-col shadow-xs w-full">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-400 mb-1.5 pb-1 border-b border-slate-800/80 w-full">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>3. 전자 껍질 에너지 준위 (K, L, M, N 껍질 배치)</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                    {element.electronConfig}
                  </span>
                </div>
                <ShellsBreakdownView
                  element={element}
                  shells={shells}
                  totalElectrons={totalElectrons}
                  size="compact"
                />
              </div>
            </div>
          )
        )}

        {activeTab === 'sample' && (
          <div className="py-2 w-full flex flex-col items-center">
            <SampleShapeView element={element} size={size} />
          </div>
        )}

        {activeTab === 'bohr' && (
          <div className="py-2 w-full flex flex-col items-center">
            <BohrAtomModelView
              element={element}
              shells={shells}
              neutrons={neutrons}
              isRotating={isRotating}
              onToggleRotate={() => setIsRotating(!isRotating)}
              size={size}
            />
          </div>
        )}

        {activeTab === 'shells' && (
          <div className="py-2 w-full flex flex-col items-center">
            <ShellsBreakdownView
              element={element}
              shells={shells}
              totalElectrons={totalElectrons}
              size={size}
            />
          </div>
        )}
      </div>

      {/* Bottom Information Footer */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: catInfo.color }}
          />
          <span className="font-semibold text-slate-700">{element.nameKo} ({element.symbol})</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            {element.phase === 'gas' ? '기체 (Gas)' : element.phase === 'liquid' ? '액체 (Liquid)' : '고체 (Solid)'}
          </span>
        </div>

        <div className="font-mono text-slate-500 text-[10px]">
          {activeTab === 'sample' && getPhysicalSampleInfo(element.atomicNumber).shapeName}
          {activeTab === 'bohr' && `e⁻ = ${totalElectrons}개 (${shells.join('-')})`}
          {activeTab === 'shells' && `${shells.length}개 껍질 활성`}
          {activeTab === 'all' && `원자번호 ${element.atomicNumber}번 종합 시각화`}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. Physical Specimen Shape View (실물 외형)
// ==========================================
export function SampleShapeView({
  element,
  size = 'normal',
}: {
  element: ElementData;
  size?: 'compact' | 'normal' | 'large';
}) {
  const info = getPhysicalSampleInfo(element.atomicNumber);
  const isLarge = size === 'large';
  const isCompact = size === 'compact';

  const containerSizeClass = isLarge
    ? 'w-64 h-52 sm:w-80 sm:h-64'
    : isCompact
    ? 'w-36 h-28 sm:w-44 sm:h-32'
    : 'w-52 h-40';

  const glowSizeClass = isLarge
    ? 'w-44 h-44 blur-3xl'
    : isCompact
    ? 'w-20 h-20 blur-xl'
    : 'w-28 h-28 blur-2xl';

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full animate-in fade-in duration-200">
      {/* Specimen SVG Rendering Container */}
      <div className={`relative ${containerSizeClass} flex items-center justify-center`}>
        {/* Glow backdrop based on element character */}
        <div
          className={`absolute ${glowSizeClass} rounded-full opacity-40 pointer-events-none`}
          style={{ backgroundColor: info.glowColor }}
        />

        {/* Specimen Object SVG */}
        <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            {/* Metal Luster Gradient */}
            <linearGradient id={`metalGrad_${element.atomicNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={info.highlightColor} />
              <stop offset="35%" stopColor={info.primaryColor} />
              <stop offset="70%" stopColor={info.shadowColor} />
              <stop offset="100%" stopColor={info.highlightColor} />
            </linearGradient>

            {/* Specular Glint */}
            <radialGradient id="glint" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Glass Ampoule Gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="75%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Render Shape by Type */}
          {renderSpecificSampleSvg(element, info)}
        </svg>
      </div>

      {/* Physical Attributes Badge Row */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-xs text-center">
        <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] text-slate-300">
          외형: <strong className="text-white font-semibold">{info.shapeName}</strong>
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] text-slate-300">
          결정: <strong className="text-white font-semibold">{info.crystal}</strong>
        </span>
        {info.meltingPt !== undefined && (
          <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] text-slate-300">
            녹는점: <strong className="text-white font-semibold">{info.meltingPt}°C</strong>
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400 text-center max-w-sm px-2 line-clamp-2">
        {info.description}
      </p>
    </div>
  );
}

// Detailed specimen SVG by element
function renderSpecificSampleSvg(element: ElementData, info: PhysicalSampleInfo) {
  const gradId = `metalGrad_${element.atomicNumber}`;

  // 1. Gas Discharge Tube (H, He, N, O, F, Ne, Cl, Ar)
  if (info.categoryType === 'gas') {
    return (
      <g>
        {/* Ampoule Outer Glass */}
        <rect x="35" y="55" width="130" height="50" rx="25" fill="none" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="35" y="55" width="130" height="50" rx="25" fill="url(#glassGrad)" />

        {/* Electrode Caps */}
        <rect x="25" y="70" width="12" height="20" rx="2" fill="#94a3b8" />
        <rect x="163" y="70" width="12" height="20" rx="2" fill="#94a3b8" />
        <line x1="15" y1="80" x2="25" y2="80" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="175" y1="80" x2="185" y2="80" stroke="#cbd5e1" strokeWidth="2" />

        {/* Gas Plasma Discharge Core */}
        <path
          d="M 45 80 Q 75 74 100 80 T 155 80"
          stroke={info.glowColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeOpacity="0.85"
          filter="blur(3px)"
        />
        <path
          d="M 45 80 Q 75 77 100 80 T 155 80"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        {/* Floating Diatomic Molecule or Atom bubbles */}
        <g opacity="0.9">
          <circle cx="80" cy="74" r="5" fill={info.glowColor} fillOpacity="0.7" />
          <circle cx="87" cy="76" r="5" fill={info.glowColor} fillOpacity="0.7" />
          <line x1="80" y1="74" x2="87" y2="76" stroke="#ffffff" strokeWidth="1.2" />

          <circle cx="120" cy="85" r="4.5" fill={info.glowColor} fillOpacity="0.7" />
          <circle cx="126" cy="83" r="4.5" fill={info.glowColor} fillOpacity="0.7" />
          <line x1="120" y1="85" x2="126" y2="83" stroke="#ffffff" strokeWidth="1.2" />
        </g>

        {/* Glass reflection highlight */}
        <path d="M 45 62 L 155 62" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
        <text x="100" y="48" textAnchor="middle" fill={info.glowColor} fontSize="11" fontWeight="bold" fontFamily="monospace">
          {element.symbol}₂ 기체 방전광
        </text>
      </g>
    );
  }

  // 2. Magnesium Ribbon (Mg)
  if (element.atomicNumber === 12) {
    return (
      <g>
        {/* Coiled metallic ribbon */}
        <path
          d="M 40 105 C 50 40, 80 40, 95 90 C 110 130, 140 120, 150 70 C 155 50, 170 60, 175 80"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Shiny highlights on ribbon edges */}
        <path
          d="M 40 105 C 50 40, 80 40, 95 90 C 110 130, 140 120, 150 70 C 155 50, 170 60, 175 80"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
        {/* Metallic ribbon texture lines */}
        <line x1="65" y1="55" x2="72" y2="67" stroke="#64748b" strokeWidth="1.5" />
        <line x1="125" y1="105" x2="132" y2="117" stroke="#64748b" strokeWidth="1.5" />
        <circle cx="70" cy="58" r="10" fill="url(#glint)" />
        <circle cx="130" cy="110" r="12" fill="url(#glint)" />
      </g>
    );
  }

  // 3. Iron Nail (Fe)
  if (element.atomicNumber === 26) {
    return (
      <g>
        {/* Steel Iron Nail */}
        {/* Nail Head */}
        <rect x="35" y="70" width="10" height="26" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
        {/* Nail Body */}
        <polygon points="45,77 150,78 175,83 150,88 45,89" fill={`url(#${gradId})`} stroke="#1e293b" strokeWidth="1" />
        {/* Longitudinal shine reflection */}
        <line x1="45" y1="81" x2="160" y2="82" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" />
        <circle cx="75" cy="81" r="8" fill="url(#glint)" />
        <text x="100" y="125" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
          단단한 강철 못 (Fe)
        </text>
      </g>
    );
  }

  // 4. Copper Spiral Wire (Cu)
  if (element.atomicNumber === 29) {
    return (
      <g>
        {/* Coiled reddish-bronze copper wire */}
        <path
          d="M 45 95 C 45 45, 80 45, 80 95 C 80 145, 115 145, 115 95 C 115 45, 150 45, 150 95 C 150 135, 175 130, 180 100"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 45 95 C 45 45, 80 45, 80 95 C 80 145, 115 145, 115 95 C 115 45, 150 45, 150 95 C 150 135, 175 130, 180 100"
          fill="none"
          stroke="#fed7aa"
          strokeWidth="2"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />
        <circle cx="62" cy="55" r="12" fill="url(#glint)" />
        <circle cx="132" cy="55" r="12" fill="url(#glint)" />
      </g>
    );
  }

  // 5. Sulfur Crystals / Powder (S)
  if (element.atomicNumber === 16) {
    return (
      <g>
        {/* Bright Yellow Rhombic Crystals */}
        <polygon points="100,35 130,70 100,105 70,70" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        <polygon points="100,35 130,70 100,70" fill="#fde047" opacity="0.9" />
        <polygon points="65,75 90,100 65,125 40,100" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
        <polygon points="135,75 160,100 135,125 110,100" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        {/* Powder grains at base */}
        <ellipse cx="100" cy="125" rx="60" ry="12" fill="#ca8a04" fillOpacity="0.6" />
        <ellipse cx="100" cy="123" rx="55" ry="9" fill="#facc15" fillOpacity="0.9" />
        <circle cx="100" cy="70" r="10" fill="url(#glint)" />
      </g>
    );
  }

  // 6. Carbon (C) - Diamond Octahedral & Graphite Sheet
  if (element.atomicNumber === 6) {
    return (
      <g>
        {/* Diamond Octahedral Gem + Graphite dark luster */}
        <polygon points="100,35 145,75 100,125 55,75" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="100,35 145,75 100,75" fill="#64748b" opacity="0.9" />
        <polygon points="100,35 55,75 100,75" fill="#475569" opacity="0.95" />
        <polygon points="100,125 145,75 100,75" fill="#1e293b" opacity="0.95" />
        <polygon points="100,125 55,75 100,75" fill="#0f172a" opacity="0.95" />
        {/* Sparkle Glint */}
        <circle cx="100" cy="75" r="14" fill="url(#glint)" />
        <text x="100" y="145" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">
          다이아몬드 / 흑연 결정 (C)
        </text>
      </g>
    );
  }

  // 7. Granules / Pellets (Ca, Zn, Sc)
  if (info.shapeType === 'granules') {
    return (
      <g>
        {/* Cluster of faceted metallic beads */}
        <ellipse cx="100" cy="115" rx="60" ry="14" fill="#0f172a" opacity="0.6" />
        {/* Pellet 1 */}
        <polygon points="75,80 95,70 110,85 100,105 80,100" fill={`url(#${gradId})`} stroke="#475569" strokeWidth="1" />
        <polygon points="75,80 95,70 90,90" fill="#ffffff" opacity="0.4" />
        {/* Pellet 2 */}
        <polygon points="110,80 135,72 145,92 130,108 112,98" fill={`url(#${gradId})`} stroke="#475569" strokeWidth="1" />
        <polygon points="110,80 135,72 125,90" fill="#ffffff" opacity="0.4" />
        {/* Pellet 3 */}
        <polygon points="90,55 110,48 122,65 108,78 92,72" fill={`url(#${gradId})`} stroke="#475569" strokeWidth="1" />
        <polygon points="90,55 110,48 105,65" fill="#ffffff" opacity="0.5" />
        <circle cx="105" cy="62" r="10" fill="url(#glint)" />
      </g>
    );
  }

  // 8. Default: Polished Metallic Ingot / Crystal Cube
  return (
    <g>
      {/* Shadow */}
      <ellipse cx="100" cy="120" rx="55" ry="14" fill="#000000" opacity="0.45" />

      {/* 3D Isometric Crystal Ingot */}
      {/* Top Face */}
      <polygon points="100,45 150,70 100,95 50,70" fill={info.highlightColor} stroke="#475569" strokeWidth="1" />
      {/* Left Face */}
      <polygon points="50,70 100,95 100,135 50,110" fill={info.primaryColor} stroke="#334155" strokeWidth="1" />
      {/* Right Face */}
      <polygon points="100,95 150,70 150,110 100,135" fill={info.shadowColor} stroke="#1e293b" strokeWidth="1" />

      {/* Engraved Symbol on Top Face */}
      <text
        x="100"
        y="75"
        textAnchor="middle"
        fill="#0f172a"
        fillOpacity="0.6"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        transform="rotate(-5 100 75)"
      >
        {element.symbol}
      </text>

      {/* Specular highlights along top edges */}
      <line x1="50" y1="70" x2="100" y2="45" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="100" y1="45" x2="150" y2="70" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="100" cy="45" r="9" fill="url(#glint)" />
    </g>
  );
}

// ==========================================
// 2. Bohr Atomic Model View (보어 원자 모형)
// ==========================================
interface BohrProps {
  element: ElementData;
  shells: number[];
  neutrons: number;
  isRotating: boolean;
  onToggleRotate: () => void;
  size?: 'compact' | 'normal' | 'large';
}

export function BohrAtomModelView({
  element,
  shells,
  neutrons,
  isRotating,
  onToggleRotate,
  size = 'normal',
}: BohrProps) {
  const isLarge = size === 'large';
  const isCompact = size === 'compact';
  // Shell radii mapping
  const baseRadius = isLarge ? 28 : isCompact ? 22 : 25;
  const shellGap = isLarge ? 18 : isCompact ? 14 : 16;
  const shellRadii = shells.map((_, idx) => baseRadius + idx * shellGap);

  const containerSizeClass = isLarge
    ? 'w-64 h-64 sm:w-72 sm:h-72'
    : isCompact
    ? 'w-36 h-36 sm:w-40 sm:h-40'
    : 'w-52 h-52';

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full animate-in fade-in duration-200">
      {/* SVG Canvas - Perfect Square container prevents vertical squishing */}
      <div
        className={`relative ${containerSizeClass} flex items-center justify-center cursor-pointer`}
        onClick={onToggleRotate}
        title="클릭하여 공전 회전을 일시정지하거나 재생합니다"
      >
        <svg
          viewBox="-115 -115 230 230"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Nucleus Glow */}
            <radialGradient id="nucleusGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>

            {/* Electron Glow */}
            <radialGradient id="electronGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </radialGradient>
          </defs>

          {/* Electron Shell Orbit Rings */}
          {shellRadii.map((r, sIdx) => {
            const electronCount = shells[sIdx];
            const shellColor = SHELL_COLORS[sIdx % SHELL_COLORS.length];
            const rotDuration = 12 + sIdx * 6; // inner faster, outer slower

            return (
              <g key={sIdx}>
                {/* Orbit Path Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke={shellColor}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.45"
                />

                {/* Revolving Electrons Group */}
                <g
                  style={{
                    transformOrigin: '0px 0px',
                    animationName: isRotating ? 'spin' : 'none',
                    animationDuration: `${rotDuration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDirection: sIdx % 2 === 0 ? 'normal' : 'reverse',
                  }}
                >
                  {[...Array(electronCount)].map((_, eIdx) => {
                    const angle = (2 * Math.PI * eIdx) / electronCount;
                    const ex = r * Math.cos(angle);
                    const ey = r * Math.sin(angle);

                    return (
                      <g key={eIdx}>
                        {/* Electron Glow aura */}
                        <circle cx={ex} cy={ey} r="4.5" fill="#22d3ee" fillOpacity="0.4" filter="blur(1px)" />
                        {/* Electron body */}
                        <circle cx={ex} cy={ey} r="2.8" fill="url(#electronGrad)" stroke="#ffffff" strokeWidth="0.6" />
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Central Nucleus (Protons + Neutrons) */}
          <g>
            {/* Pulsing nucleus aura */}
            <circle cx="0" cy="0" r="16" fill="#ef4444" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="0" cy="0" r="14" fill="url(#nucleusGrad)" stroke="#fecaca" strokeWidth="1" />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {element.atomicNumber}+
            </text>
          </g>
        </svg>
      </div>

      {/* Orbit Shell Badges */}
      <div className="mt-1 flex items-center gap-1.5 text-[10px]">
        {shells.map((count, idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 rounded-md border font-mono font-bold"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderColor: SHELL_COLORS[idx],
              color: SHELL_COLORS[idx],
            }}
          >
            {['K', 'L', 'M', 'N'][idx]}:{count}
          </span>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
        <span>양성자: <strong className="text-white">{element.atomicNumber}</strong></span>
        <span>·</span>
        <span>중성자: <strong className="text-white">{neutrons}</strong></span>
        <span>·</span>
        <span>전자: <strong className="text-cyan-400">{element.atomicNumber}</strong></span>
      </div>
    </div>
  );
}

// ==========================================
// 3. Electron Shells Breakdown View (전자 껍질)
// ==========================================
export function ShellsBreakdownView({
  element,
  shells,
  totalElectrons,
  size = 'normal',
}: {
  element: ElementData;
  shells: number[];
  totalElectrons: number;
  size?: 'compact' | 'normal' | 'large';
}) {
  const isLarge = size === 'large';
  const isCompact = size === 'compact';
  const maxCapacities = [2, 8, 18, 32];

  if (isCompact) {
    return (
      <div className="relative z-10 w-full flex flex-col gap-1 animate-in fade-in duration-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full">
          {shells.map((count, idx) => {
            const cap = maxCapacities[idx];
            const pct = Math.min(100, Math.round((count / cap) * 100));
            const color = SHELL_COLORS[idx];
            const isFull = count === cap;

            return (
              <div key={idx} className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold flex items-center gap-1" style={{ color }}>
                    <span>{SHELL_NAMES[idx].split(' ')[0]}</span>
                    {isFull && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="가득참" />}
                  </span>
                  <span className="font-mono text-slate-300 font-semibold">{count}e⁻</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative z-10 w-full ${isLarge ? 'max-w-md p-3' : 'max-w-sm p-1'} flex flex-col gap-2.5 animate-in fade-in duration-200`}>
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
        <span className="font-semibold text-slate-300">전자 배치 상세 (Aufbau Principle)</span>
        <span className="font-mono text-cyan-400 text-[11px] font-bold">
          {element.electronConfig}
        </span>
      </div>

      {/* Shell Progress Bars */}
      <div className="flex flex-col gap-2">
        {shells.map((count, idx) => {
          const cap = maxCapacities[idx];
          const pct = Math.min(100, Math.round((count / cap) * 100));
          const color = SHELL_COLORS[idx];
          const isFull = count === cap;

          return (
            <div key={idx} className="flex flex-col gap-0.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5" style={{ color }}>
                  <span>{SHELL_NAMES[idx]}</span>
                  {isFull && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      가득참
                    </span>
                  )}
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  <strong className="text-white">{count}</strong> / {cap} e⁻ ({pct}%)
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Valence Electron Note */}
      <div className="mt-1 p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 flex items-center justify-between">
        <span>최외각(원자가) 전자 수:</span>
        <span className="font-bold text-amber-400 font-mono text-xs">
          {shells[shells.length - 1]}개 (화학 반응성 결정)
        </span>
      </div>
    </div>
  );
}

// ==========================================
// Electron Shell Calculation (1 ~ 30)
// ==========================================
export function getElementShells(z: number): number[] {
  // Shell K (n=1, max 2), L (n=2, max 8), M (n=3, max 18), N (n=4, max 32)
  const SHELL_CONFIGS: Record<number, number[]> = {
    1: [1],
    2: [2],
    3: [2, 1],
    4: [2, 2],
    5: [2, 3],
    6: [2, 4],
    7: [2, 5],
    8: [2, 6],
    9: [2, 7],
    10: [2, 8],
    11: [2, 8, 1],
    12: [2, 8, 2],
    13: [2, 8, 3],
    14: [2, 8, 4],
    15: [2, 8, 5],
    16: [2, 8, 6],
    17: [2, 8, 7],
    18: [2, 8, 8],
    19: [2, 8, 8, 1],
    20: [2, 8, 8, 2],
    21: [2, 8, 9, 2],
    22: [2, 8, 10, 2],
    23: [2, 8, 11, 2],
    24: [2, 8, 13, 1], // Cr anomaly [Ar] 3d⁵ 4s¹
    25: [2, 8, 13, 2],
    26: [2, 8, 14, 2],
    27: [2, 8, 15, 2],
    28: [2, 8, 16, 2],
    29: [2, 8, 18, 1], // Cu anomaly [Ar] 3d¹⁰ 4s¹
    30: [2, 8, 18, 2],
  };

  return SHELL_CONFIGS[z] || [z];
}

// ==========================================
// Physical Specimen Metadata (1 ~ 30)
// ==========================================
interface PhysicalSampleInfo {
  categoryType: 'gas' | 'metal' | 'crystal' | 'powder';
  shapeType: 'discharge' | 'ingot' | 'ribbon' | 'nail' | 'wire' | 'granules' | 'crystal' | 'powder';
  shapeName: string;
  crystal: string;
  meltingPt?: number;
  glowColor: string;
  primaryColor: string;
  highlightColor: string;
  shadowColor: string;
  description: string;
}

export function getPhysicalSampleInfo(z: number): PhysicalSampleInfo {
  const SAMPLES: Record<number, PhysicalSampleInfo> = {
    1: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '수소 기체 방전관 (H₂)',
      crystal: '분자성 결정 (기체)',
      meltingPt: -259.1,
      glowColor: '#ec4899',
      primaryColor: '#f472b6',
      highlightColor: '#fbcfe8',
      shadowColor: '#be185d',
      description: '투명 유리관 속 수소 분자가 전기 방전으로 핑크-보라빛 고유 스펙트럼 광을 발산합니다.',
    },
    2: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '헬륨 방전관 (He)',
      crystal: '단원자 기체',
      meltingPt: -272.2,
      glowColor: '#fbbf24',
      primaryColor: '#f59e0b',
      highlightColor: '#fef3c7',
      shadowColor: '#b45309',
      description: '고전압 방전 시 온화하고 따뜻한 황금-주황빛 방전광을 내는 가벼운 비활성 기체입니다.',
    },
    3: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '리튬 금속 잉곳 (Li)',
      crystal: '체심입방 (BCC)',
      meltingPt: 180.5,
      glowColor: '#ef4444',
      primaryColor: '#cbd5e1',
      highlightColor: '#f1f5f9',
      shadowColor: '#64748b',
      description: '칼로 쉽게 잘리는 은백색의 매우 가벼운 금속으로, 공기 중 빠르게 산화되므로 광유에 보관합니다.',
    },
    4: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '베릴륨 금속 펠릿 (Be)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 1287,
      glowColor: '#10b981',
      primaryColor: '#94a3b8',
      highlightColor: '#e2e8f0',
      shadowColor: '#475569',
      description: '회색빛의 매우 단단하고 가벼운 금속으로 에메랄드 보석의 핵심 골격을 형성합니다.',
    },
    5: {
      categoryType: 'crystal',
      shapeType: 'crystal',
      shapeName: '붕소 결정체 (B)',
      crystal: '마름모계 (Rhombohedral)',
      meltingPt: 2076,
      glowColor: '#14b8a6',
      primaryColor: '#334155',
      highlightColor: '#64748b',
      shadowColor: '#0f172a',
      description: '흑갈색 금속성 광택을 띠는 극도로 단단한 준금속 결정으로 내열 유리의 주성분입니다.',
    },
    6: {
      categoryType: 'crystal',
      shapeType: 'crystal',
      shapeName: '다이아몬드 & 흑연 (C)',
      crystal: '다이아몬드형 / 육방정계',
      meltingPt: 3550,
      glowColor: '#38bdf8',
      primaryColor: '#475569',
      highlightColor: '#94a3b8',
      shadowColor: '#0f172a',
      description: '지구상에서 가장 단단한 다이아몬드 팔면체와 전도성이 있는 흑연 층상 구조를 가집니다.',
    },
    7: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '질소 기체 방전관 (N₂)',
      crystal: '이원자 분자 (기체)',
      meltingPt: -210.0,
      glowColor: '#60a5fa',
      primaryColor: '#3b82f6',
      highlightColor: '#dbeafe',
      shadowColor: '#1d4ed8',
      description: '대기의 78%를 차지하며 전기 방전 시 아름다운 청자색 오로라 빛을 발산합니다.',
    },
    8: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '산소 분자 앰플 (O₂)',
      crystal: '이원자 분자 (기체)',
      meltingPt: -218.8,
      glowColor: '#38bdf8',
      primaryColor: '#0284c7',
      highlightColor: '#e0f2fe',
      shadowColor: '#0369a1',
      description: '옅은 푸른빛 기체로 극저온 액화 시 선명한 하늘색 상자성 액체가 됩니다.',
    },
    9: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '플루오린 가스 앰플 (F₂)',
      crystal: '이원자 분자 (기체)',
      meltingPt: -219.7,
      glowColor: '#84cc16',
      primaryColor: '#65a30d',
      highlightColor: '#ecfccb',
      shadowColor: '#3f6212',
      description: '연한 황록색의 반응성이 가장 강력한 할로젠 원소로 유리까지 부식시킵니다.',
    },
    10: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '네온사인 방전관 (Ne)',
      crystal: '단원자 기체',
      meltingPt: -248.6,
      glowColor: '#f97316',
      primaryColor: '#ea580c',
      highlightColor: '#ffedd5',
      shadowColor: '#9a3412',
      description: '네온사인의 대명사로 전기가 흐르면 강렬하고 눈부신 붉은 주황빛을 내뿜습니다.',
    },
    11: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '나트륨 잉곳 덩어리 (Na)',
      crystal: '체심입방 (BCC)',
      meltingPt: 97.8,
      glowColor: '#facc15',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#94a3b8',
      description: '버터처럼 잘리는 은백색 금속. 물 위에 뜨며 격렬히 반응하여 수소와 열을 뿜습니다.',
    },
    12: {
      categoryType: 'metal',
      shapeType: 'ribbon',
      shapeName: '마그네슘 리본 코일 (Mg)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 650,
      glowColor: '#ffffff',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#64748b',
      description: '은백색의 얇고 유연한 금속 리본으로 연소 시 눈부신 백색광과 산소와 결합합니다.',
    },
    13: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '알루미늄 금속 잉곳 (Al)',
      crystal: '면심입방 (FCC)',
      meltingPt: 660.3,
      glowColor: '#38bdf8',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#94a3b8',
      description: '가볍고 내식성이 뛰어난 은백색 금속으로 표면에 치밀한 산화 피막을 형성합니다.',
    },
    14: {
      categoryType: 'crystal',
      shapeType: 'crystal',
      shapeName: '규소(실리콘) 결정 잉곳 (Si)',
      crystal: '다이아몬드 입방형',
      meltingPt: 1414,
      glowColor: '#64748b',
      primaryColor: '#475569',
      highlightColor: '#94a3b8',
      shadowColor: '#1e293b',
      description: '현대 반도체의 심장으로 금속성 흑청색 광택을 띠는 고순도 단결정 웨이퍼를 만듭니다.',
    },
    15: {
      categoryType: 'powder',
      shapeType: 'powder',
      shapeName: '붉은 인(적린) 분말 (P)',
      crystal: '사방정계 / 무정형',
      meltingPt: 590,
      glowColor: '#ef4444',
      primaryColor: '#b91c1c',
      highlightColor: '#f87171',
      shadowColor: '#7f1d1d',
      description: '성냥갑 마찰면에 쓰이는 암적색 분말로 공기 중에서 비교적 안정합니다.',
    },
    16: {
      categoryType: 'crystal',
      shapeType: 'crystal',
      shapeName: '황 사방정계 결정 (S₈)',
      crystal: '사방정계 (Orthorhombic)',
      meltingPt: 115.2,
      glowColor: '#eab308',
      primaryColor: '#facc15',
      highlightColor: '#fef08a',
      shadowColor: '#ca8a04',
      description: '선명한 레몬 옐로우 색상의 부서지기 쉬운 결정체로 물에 녹지 않습니다.',
    },
    17: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '염소 가스 앰플 (Cl₂)',
      crystal: '이원자 분자 (기체)',
      meltingPt: -101.5,
      glowColor: '#a3e635',
      primaryColor: '#84cc16',
      highlightColor: '#d9f99d',
      shadowColor: '#4d7c0f',
      description: '황록색의 무겁고 자극적인 냄새를 풍기는 기체로 살균 및 소독에 널리 쓰입니다.',
    },
    18: {
      categoryType: 'gas',
      shapeType: 'discharge',
      shapeName: '아르곤 방전관 (Ar)',
      crystal: '단원자 기체',
      meltingPt: -189.3,
      glowColor: '#a855f7',
      primaryColor: '#8b5cf6',
      highlightColor: '#ede9fe',
      shadowColor: '#6d28d9',
      description: '전기 방전 시 은은하고 신비로운 보라-청색 빛을 내는 불활성 보호 기체입니다.',
    },
    19: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '칼륨 금속 덩어리 (K)',
      crystal: '체심입방 (BCC)',
      meltingPt: 63.5,
      glowColor: '#c084fc',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#64748b',
      description: '나트륨보다 반응성이 더욱 격렬한 은회색 무른 알칼리 금속으로 보라색 불꽃을 냅니다.',
    },
    20: {
      categoryType: 'metal',
      shapeType: 'granules',
      shapeName: '칼슘 금속 과립 (Ca)',
      crystal: '면심입방 (FCC)',
      meltingPt: 842,
      glowColor: '#fb923c',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#94a3b8',
      description: '은백색의 단단한 알칼리 토금속 과립으로 물과 반응해 수산화칼슘 석회수를 형성합니다.',
    },
    21: {
      categoryType: 'metal',
      shapeType: 'granules',
      shapeName: '스칸듐 금속 펠릿 (Sc)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 1541,
      glowColor: '#94a3b8',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#64748b',
      description: '가볍고 강도가 높아 항공우주 알루미늄 합금 및 고강도 프레임에 쓰이는 전이금속입니다.',
    },
    22: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '티타늄 결정 바 (Ti)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 1668,
      glowColor: '#38bdf8',
      primaryColor: '#94a3b8',
      highlightColor: '#e2e8f0',
      shadowColor: '#475569',
      description: '강철만큼 강하지만 무게는 절반이며 바닷물과 산에 전혀 부식되지 않는 귀중한 금속입니다.',
    },
    23: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '바나듐 금속 잉곳 (V)',
      crystal: '체심입방 (BCC)',
      meltingPt: 1910,
      glowColor: '#64748b',
      primaryColor: '#64748b',
      highlightColor: '#94a3b8',
      shadowColor: '#334155',
      description: '강철에 극소량 첨가해도 내충격성과 인성을 극적으로 높여주는 합금 원소입니다.',
    },
    24: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '크롬 도금 잉곳 (Cr)',
      crystal: '체심입방 (BCC)',
      meltingPt: 1907,
      glowColor: '#e0f2fe',
      primaryColor: '#e2e8f0',
      highlightColor: '#ffffff',
      shadowColor: '#94a3b8',
      description: '거울처럼 눈부신 광택과 경도를 자랑하며 스테인리스강의 녹 방지 핵심 피막이 됩니다.',
    },
    25: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '망가니즈 금속 괴 (Mn)',
      crystal: '체심입방 변형',
      meltingPt: 1246,
      glowColor: '#f472b6',
      primaryColor: '#94a3b8',
      highlightColor: '#cbd5e1',
      shadowColor: '#475569',
      description: '철보다 약간 단단하고 부서지기 쉬운 은회색 금속으로 탈산제와 배터리 양극재에 쓰입니다.',
    },
    26: {
      categoryType: 'metal',
      shapeType: 'nail',
      shapeName: '철(쇠못 / 잉곳) (Fe)',
      crystal: '체심입방 (BCC)',
      meltingPt: 1538,
      glowColor: '#fbbf24',
      primaryColor: '#475569',
      highlightColor: '#94a3b8',
      shadowColor: '#1e293b',
      description: '인류 문명의 기둥인 강자성 금속. 황산구리 용액과 만나면 붉은 구리 금속을 석출합니다.',
    },
    27: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '코발트 금속 펠릿 (Co)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 1495,
      glowColor: '#3b82f6',
      primaryColor: '#64748b',
      highlightColor: '#cbd5e1',
      shadowColor: '#334155',
      description: '강한 자성을 띠며 유리와 도자기에 깊고 아름다운 코발트 블루 청색을 입힙니다.',
    },
    28: {
      categoryType: 'metal',
      shapeType: 'ingot',
      shapeName: '니켈 금속 코인/잉곳 (Ni)',
      crystal: '면심입방 (FCC)',
      meltingPt: 1455,
      glowColor: '#10b981',
      primaryColor: '#cbd5e1',
      highlightColor: '#ffffff',
      shadowColor: '#64748b',
      description: '은백색 광택의 내부식성 금속으로 동전(주화) 및 충전식 전지에 널리 사용됩니다.',
    },
    29: {
      categoryType: 'metal',
      shapeType: 'wire',
      shapeName: '구리 전선 / 리본 (Cu)',
      crystal: '면심입방 (FCC)',
      meltingPt: 1084.6,
      glowColor: '#f97316',
      primaryColor: '#b45309',
      highlightColor: '#fed7aa',
      shadowColor: '#78350f',
      description: '특유의 적갈색 금속 광택과 최고의 전기전도도를 지니며, 질산은 속에서 은 결정을 피워냅니다.',
    },
    30: {
      categoryType: 'metal',
      shapeType: 'granules',
      shapeName: '아연 판 / 과립 (Zn)',
      crystal: '조밀육방 (HCP)',
      meltingPt: 419.5,
      glowColor: '#38bdf8',
      primaryColor: '#64748b',
      highlightColor: '#cbd5e1',
      shadowColor: '#334155',
      description: '푸르스름한 은회색 금속. 묽은 염산과 반응하여 뽀글뽀글 활발하게 수소 기체를 발생시킵니다.',
    },
  };

  return SAMPLES[z] || {
    categoryType: 'metal',
    shapeType: 'ingot',
    shapeName: `원소 ${z} 실물 시료`,
    crystal: '결정계',
    glowColor: '#38bdf8',
    primaryColor: '#94a3b8',
    highlightColor: '#e2e8f0',
    shadowColor: '#334155',
    description: '원소 실물 시료입니다.',
  };
}
