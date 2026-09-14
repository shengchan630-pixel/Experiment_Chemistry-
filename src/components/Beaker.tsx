import { useState, useEffect, useRef } from 'react';
import { ChemistryState, AddedSubstance } from '../types';

interface BeakerProps {
  chemistry: ChemistryState;
  label: string;
  onLabelChange: (newLabel: string) => void;
  isStirring: boolean;
  onTapBeaker: () => void;
  showGuide?: boolean;
  addedList?: AddedSubstance[];
}

// Convert volume (0-500 mL) to SVG Y coordinate
// Base (0 mL) is at Y=435, 500 mL is at Y=115
export function volumeToY(vol: number): number {
  const clamped = Math.max(0, Math.min(500, vol));
  const baseY = 435;
  const topY = 115;
  return baseY - (clamped / 500) * (baseY - topY);
}

export default function Beaker({
  chemistry,
  label,
  onLabelChange,
  isStirring,
  onTapBeaker,
  showGuide = true,
  addedList = [],
}: BeakerProps) {
  const { totalVolume, liquidColor, liquidOpacity, turbidity, precipitates, isFizzing, temperature, pH } = chemistry;
  const [wavePhase, setWavePhase] = useState(0);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(label);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; r: number; speed: number; opacity: number }>>([]);
  const animFrameRef = useRef<number | null>(null);

  // Active element presence checks
  const hasNa = addedList.some((s) => s.substanceId === 'na_metal');
  const hasMg = addedList.some((s) => s.substanceId === 'mg_ribbon');
  const hasCa = addedList.some((s) => s.substanceId === 'ca_metal');
  const hasFe = addedList.some((s) => s.substanceId === 'fe_metal');
  const hasCu = addedList.some((s) => s.substanceId === 'cu_metal');
  const hasZn = addedList.some((s) => s.substanceId === 'zn_metal');
  const hasC = addedList.some((s) => s.substanceId === 'c_powder');
  const hasS = addedList.some((s) => s.substanceId === 's_powder');

  const hasAgDepositionOnCu = hasCu && precipitates.some((p) => p.id === 'ag_crystal');
  const hasCuDepositionOnFe = hasFe && precipitates.some((p) => p.id === 'cu_deposit');

  // Sync label prop
  useEffect(() => {
    setLabelText(label);
  }, [label]);

  // Handle wave, bubbling, and fizzing animation
  useEffect(() => {
    let phase = 0;
    const animate = () => {
      phase += isStirring ? 0.15 : isFizzing ? 0.08 : 0.035;
      setWavePhase(phase);

      if (totalVolume > 15) {
        const liquidSurfaceY = volumeToY(totalVolume);
        const maxBubbleCount = isFizzing ? 32 : isStirring ? 20 : 7;

        setBubbles((prev) => {
          const updated = prev
            .map((b) => ({
              ...b,
              y: b.y - b.speed * (isFizzing ? 2.8 : isStirring ? 2.2 : 1),
              x: b.x + Math.sin(phase + b.id) * 0.4,
              opacity: b.y - liquidSurfaceY < 15 ? Math.max(0, (b.y - liquidSurfaceY) / 15) : b.opacity,
            }))
            .filter((b) => b.y > liquidSurfaceY);

          const spawnRate = isFizzing ? 0.75 : isStirring ? 0.35 : 0.1;
          if (Math.random() < spawnRate && updated.length < maxBubbleCount) {
            updated.push({
              id: Math.random(),
              x: 95 + Math.random() * 205,
              y: 430 - Math.random() * 20,
              r: isFizzing ? 1.0 + Math.random() * 2.2 : 1.5 + Math.random() * 2.8,
              speed: isFizzing ? 1.8 + Math.random() * 2.2 : 0.7 + Math.random() * 1.3,
              opacity: 0.85,
            });
          }
          return updated;
        });
      } else {
        setBubbles([]);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [totalVolume, isStirring, isFizzing]);

  const targetY = volumeToY(totalVolume);
  const waveAmplitude = totalVolume > 0 ? (isStirring ? 6 : isFizzing ? 3 : 1.8) : 0;

  const leftX = 84;
  const rightX = 316;
  const midX = (leftX + rightX) / 2;
  const yOffset = Math.sin(wavePhase) * waveAmplitude;
  const meniscusDip = isStirring ? 7 * Math.cos(wavePhase * 1.3) : 3.5;
  const surfaceY = targetY + yOffset;

  // Liquid volume path inside beaker cavity
  const liquidPath =
    totalVolume <= 0
      ? ''
      : `
        M ${leftX} ${surfaceY}
        Q ${midX} ${surfaceY + meniscusDip} ${rightX} ${surfaceY}
        L ${rightX} 415
        Q ${rightX} 435 295 435
        L 105 435
        Q ${leftX} 435 ${leftX} 415
        Z
      `;

  // Height for bottom precipitate sediment layer
  const totalPptAmount = precipitates.reduce((acc, p) => acc + p.amount, 0);
  const pptHeight = Math.min(32, Math.max(0, totalPptAmount * 0.9));
  const pptTopY = 435 - pptHeight;

  const handleLabelSubmit = () => {
    setIsEditingLabel(false);
    onLabelChange(labelText);
  };

  return (
    <div className="relative flex flex-col items-center select-none" id="beaker-container">
      {/* Top Status Bar: pH & Temperature readouts */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        {/* pH Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-inner"
            style={{
              backgroundColor:
                pH < 6.0 ? '#eab308' : pH <= 7.6 ? '#22c55e' : '#2563eb',
            }}
          />
          <span>pH {pH}</span>
          <span className="text-[10px] text-slate-400">
            ({pH < 6 ? '산성' : pH <= 7.6 ? '중성' : '염기성'})
          </span>
        </div>

        {/* Temperature Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-xs text-xs font-semibold transition-all ${
          temperature > 28
            ? 'bg-rose-50 border-rose-200 text-rose-700 ring-1 ring-rose-300'
            : 'bg-white/90 border-slate-200 text-slate-700'
        }`}>
          <span className={`text-xs ${temperature > 28 ? 'animate-bounce' : ''}`}>🌡️</span>
          <span>{temperature} °C</span>
          {temperature > 28 && (
            <span className="text-[10px] text-rose-500 font-bold">발열</span>
          )}
        </div>
      </div>

      {/* SVG Beaker Viewport */}
      <div
        className="relative cursor-pointer transition-transform active:scale-[0.99]"
        onClick={onTapBeaker}
        title="비커를 클릭하여 톡톡 두드려보세요"
      >
        <svg
          viewBox="0 0 400 480"
          className="w-full max-w-[380px] h-auto drop-shadow-2xl overflow-visible"
          id="beaker-svg"
        >
          <defs>
            {/* Ambient Glass Highlight Gradients */}
            <linearGradient id="glassWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="3%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="8%" stopColor="#e2e8f0" stopOpacity="0.05" />
              <stop offset="92%" stopColor="#e2e8f0" stopOpacity="0.05" />
              <stop offset="97%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
            </linearGradient>

            {/* Glass Rim Gradient */}
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#94a3b8" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
            </linearGradient>

            {/* Bottom Glass Base Gradient */}
            <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.4" />
            </linearGradient>

            {/* Dynamic Liquid Gradient */}
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity={liquidOpacity * 0.9} />
              <stop offset="65%" stopColor={liquidColor} stopOpacity={liquidOpacity} />
              <stop offset="100%" stopColor={liquidColor} stopOpacity={Math.min(1, liquidOpacity * 1.25)} />
            </linearGradient>

            {/* Liquid Surface Meniscus Gradient */}
            <linearGradient id="meniscusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="20%" stopColor={liquidColor} stopOpacity="0.8" />
              <stop offset="80%" stopColor={liquidColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
            </linearGradient>

            {/* Metal Luster Gradients for Elements in Beaker */}
            <linearGradient id="naMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="cuMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="40%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>

            <linearGradient id="steelNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="cuCoatedNailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>

            {/* Beaker Inner Clip Path */}
            <clipPath id="beakerInnerCavity">
              <path
                d="
                  M 84 65
                  L 84 415
                  Q 84 435 105 435
                  L 295 435
                  Q 316 435 316 415
                  L 316 65
                  Z
                "
              />
            </clipPath>
          </defs>

          {/* Table Surface Contact Shadow */}
          <ellipse
            cx="200"
            cy="448"
            rx="125"
            ry="14"
            fill="#0f172a"
            fillOpacity="0.12"
            filter="blur(5px)"
          />
          <ellipse
            cx="200"
            cy="444"
            rx="112"
            ry="7"
            fill="#0f172a"
            fillOpacity="0.2"
          />

          {/* Liquid Color Glow on Lab Table */}
          {totalVolume > 0 && (
            <ellipse
              cx="200"
              cy="445"
              rx="105"
              ry="10"
              fill={liquidColor}
              fillOpacity={0.25}
              filter="blur(8px)"
            />
          )}

          {/* Beaker Back Wall Reflection */}
          <path
            d="
              M 84 65
              L 84 415
              Q 84 435 105 435
              L 295 435
              Q 316 435 316 415
              L 316 65
              Z
            "
            fill="#f8fafc"
            fillOpacity="0.4"
          />

          {/* Liquid Content Layer (Clipped to beaker interior) */}
          <g clipPath="url(#beakerInnerCavity)">
            {totalVolume > 0 && (
              <>
                {/* Main Liquid Body */}
                <path d={liquidPath} fill="url(#liquidGrad)" />

                {/* Turbidity Cloudiness Layer (When precipitate is suspended) */}
                {turbidity > 0 && (
                  <path
                    d={liquidPath}
                    fill={precipitates.some((p) => p.id === 'agcl') ? '#ffffff' : precipitates[0]?.color || '#ffffff'}
                    fillOpacity={turbidity * 0.45}
                    filter="blur(1px)"
                  />
                )}

                {/* Bottom Precipitate Sediment Layer */}
                {precipitates.length > 0 && pptHeight > 0 && (
                  <g id="precipitate-sediment">
                    {/* Sediment base block */}
                    <path
                      d={`
                        M ${leftX} ${pptTopY}
                        Q ${midX} ${pptTopY - 2} ${rightX} ${pptTopY}
                        L ${rightX} 415
                        Q ${rightX} 435 295 435
                        L 105 435
                        Q ${leftX} 435 ${leftX} 415
                        Z
                      `}
                      fill={precipitates[0].color}
                      fillOpacity={0.92}
                    />
                    {/* Sediment surface texture particles */}
                    <ellipse
                      cx="200"
                      cy={pptTopY}
                      rx="95"
                      ry="3.5"
                      fill="#ffffff"
                      fillOpacity="0.4"
                    />
                  </g>
                )}

                {/* Bottom Caustic Reflection */}
                <ellipse
                  cx="200"
                  cy="428"
                  rx="95"
                  ry="5"
                  fill="#ffffff"
                  fillOpacity="0.25"
                />

                {/* Internal Fluid Bubbles / Effervescence */}
                {bubbles.map((b) => (
                  <circle
                    key={b.id}
                    cx={b.x}
                    cy={b.y}
                    r={b.r}
                    fill="#ffffff"
                    fillOpacity={b.opacity}
                  />
                ))}

                {/* ======================================================== */}
                {/* Real-world Shapes of Added Chemical Elements (원소 실물) */}
                {/* ======================================================== */}

                {/* 1. Copper Metal Strip (Cu) leaning against beaker */}
                {hasCu && (
                  <g id="element-shape-cu">
                    <polygon
                      points="110,315 124,312 172,428 158,430"
                      fill="url(#cuMetalGrad)"
                      stroke="#78350f"
                      strokeWidth="1"
                    />
                    <line
                      x1="117"
                      y1="316"
                      x2="165"
                      y2="428"
                      stroke="#fed7aa"
                      strokeWidth="1.5"
                      strokeOpacity="0.75"
                    />
                    {/* Silver Crystal needles sprouting on copper if AgNO3 reaction */}
                    {hasAgDepositionOnCu && (
                      <g stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.95">
                        <line x1="140" y1="368" x2="148" y2="360" />
                        <line x1="148" y1="360" x2="155" y2="363" />
                        <line x1="148" y1="360" x2="146" y2="352" />
                        <line x1="150" y1="392" x2="160" y2="387" />
                        <line x1="160" y1="387" x2="168" y2="391" />
                        <line x1="160" y1="387" x2="162" y2="379" />
                      </g>
                    )}
                  </g>
                )}

                {/* 2. Steel Iron Nail (Fe) resting horizontally on bottom */}
                {hasFe && (
                  <g id="element-shape-fe">
                    {/* Nail Head */}
                    <rect
                      x="125"
                      y="420"
                      width="5"
                      height="12"
                      rx="1"
                      fill={hasCuDepositionOnFe ? '#b45309' : '#475569'}
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                    {/* Nail Shank & Pointed Tip */}
                    <polygon
                      points="130,423 235,423 252,426 235,429 130,429"
                      fill={hasCuDepositionOnFe ? 'url(#cuCoatedNailGrad)' : 'url(#steelNailGrad)'}
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                    {/* Specular highlight along nail */}
                    <line
                      x1="130"
                      y1="425"
                      x2="230"
                      y2="425"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeOpacity={hasCuDepositionOnFe ? '0.35' : '0.65'}
                    />
                  </g>
                )}

                {/* 3. Magnesium Ribbon (Mg) curled in liquid */}
                {hasMg && (
                  <g id="element-shape-mg">
                    <path
                      d="M 140 345 Q 165 375 190 360 T 235 390 T 260 418"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 140 345 Q 165 375 190 360 T 235 390 T 260 418"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeOpacity="0.8"
                      strokeLinecap="round"
                    />
                    {/* Continuous microbubbles streaming from Mg surface */}
                    {[...Array(6)].map((_, i) => (
                      <circle
                        key={i}
                        cx={148 + i * 20 + Math.sin(wavePhase + i) * 2}
                        cy={350 + (i % 3) * 20 - ((wavePhase * 25 + i * 15) % 80)}
                        r={1.2 + (i % 2) * 0.8}
                        fill="#ffffff"
                        fillOpacity="0.8"
                      />
                    ))}
                  </g>
                )}

                {/* 4. Calcium Granules (Ca) at bottom */}
                {hasCa && (
                  <g id="element-shape-ca">
                    <ellipse cx="140" cy="427" rx="8" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
                    <ellipse cx="154" cy="429" rx="7" ry="5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
                    <ellipse cx="168" cy="426" rx="9" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="138" cy="425" r="1.5" fill="#ffffff" />
                    <circle cx="152" cy="427" r="1.2" fill="#ffffff" />
                    {/* Bubbling streams from Ca */}
                    <circle cx="140" cy={415 - ((wavePhase * 20) % 50)} r="1.2" fill="#ffffff" fillOpacity="0.7" />
                    <circle cx="168" cy={415 - ((wavePhase * 20 + 25) % 50)} r="1.5" fill="#ffffff" fillOpacity="0.7" />
                  </g>
                )}

                {/* 5. Zinc Faceted Granules (Zn) at bottom */}
                {hasZn && (
                  <g id="element-shape-zn">
                    <polygon points="230,428 242,422 250,428 244,434 232,433" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
                    <polygon points="242,422 250,428 247,425" fill="#ffffff" opacity="0.4" />
                    <polygon points="252,429 265,424 272,430 262,434" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
                    <polygon points="265,424 272,430 268,426" fill="#ffffff" opacity="0.4" />
                    {/* Effervescence from zinc */}
                    <circle cx="240" cy={418 - ((wavePhase * 22) % 40)} r="1.2" fill="#ffffff" fillOpacity="0.8" />
                    <circle cx="260" cy={418 - ((wavePhase * 22 + 20) % 40)} r="1.5" fill="#ffffff" fillOpacity="0.8" />
                  </g>
                )}

                {/* 6. Activated Carbon Powder (C) Particles */}
                {hasC && (
                  <g id="element-shape-c" opacity="0.85">
                    {[
                      { x: 130, y: 428, r: 2.2 },
                      { x: 145, y: 426, r: 1.8 },
                      { x: 160, y: 429, r: 2.5 },
                      { x: 180, y: 427, r: 2.0 },
                      { x: 210, y: 428, r: 2.2 },
                      { x: 235, y: 426, r: 1.9 },
                      { x: 260, y: 429, r: 2.4 },
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={pt.r} fill="#1e293b" stroke="#0f172a" strokeWidth="0.6" />
                    ))}
                  </g>
                )}

                {/* 7. Bright Yellow Sulfur Powder (S) Crystals */}
                {hasS && (
                  <g id="element-shape-s" opacity="0.95">
                    {[
                      { x: 175, y: 428, r: 2.5 },
                      { x: 190, y: 426, r: 3.0 },
                      { x: 205, y: 429, r: 2.2 },
                      { x: 220, y: 427, r: 2.8 },
                    ].map((pt, i) => (
                      <g key={i}>
                        <polygon
                          points={`${pt.x},${pt.y - pt.r} ${pt.x + pt.r},${pt.y} ${pt.x},${pt.y + pt.r} ${pt.x - pt.r},${pt.y}`}
                          fill="#facc15"
                          stroke="#ca8a04"
                          strokeWidth="0.6"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* 8. Sodium Metal Chunk (Na) Floating & Darting on surface */}
                {hasNa && totalVolume > 20 && (
                  <g id="element-shape-na">
                    {/* Steam wisps from molten sodium reaction */}
                    <path
                      d={`
                        M ${midX + Math.sin(wavePhase * 3) * 35} ${surfaceY - 3}
                        Q ${midX + Math.sin(wavePhase * 3) * 35 + Math.cos(wavePhase * 2) * 8} ${surfaceY - 20}
                          ${midX + Math.sin(wavePhase * 3) * 35 - 5} ${surfaceY - 35}
                      `}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeOpacity="0.6"
                    />
                    {/* Molten silvery sodium bead */}
                    <ellipse
                      cx={midX + Math.sin(wavePhase * 3) * 35}
                      cy={surfaceY + 1}
                      rx="7.5"
                      ry="5.5"
                      fill="url(#naMetalGrad)"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    {/* Specular highlight */}
                    <circle
                      cx={midX + Math.sin(wavePhase * 3) * 35 - 2}
                      cy={surfaceY - 1}
                      r="2"
                      fill="#ffffff"
                    />
                    {/* Fizzing ring around bead */}
                    <circle
                      cx={midX + Math.sin(wavePhase * 3) * 35}
                      cy={surfaceY + 1}
                      r="10"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                  </g>
                )}

                {/* Fizzing Carbonation Foam Rim when CO2 is actively releasing */}
                {isFizzing && (
                  <g opacity="0.8">
                    {[...Array(14)].map((_, i) => (
                      <circle
                        key={i}
                        cx={leftX + 15 + i * 15 + Math.sin(wavePhase + i) * 3}
                        cy={surfaceY + 1.5 + (i % 2 === 0 ? 1 : -1)}
                        r={2.2 + (i % 3)}
                        fill="#ffffff"
                        fillOpacity="0.75"
                      />
                    ))}
                  </g>
                )}

                {/* Curved Meniscus Top Rim */}
                <path
                  d={`
                    M ${leftX} ${surfaceY}
                    Q ${midX} ${surfaceY + meniscusDip} ${rightX} ${surfaceY}
                  `}
                  fill="none"
                  stroke="url(#meniscusGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Surface Liquid Highlight Line */}
                <path
                  d={`
                    M ${leftX + 25} ${surfaceY + (isStirring ? 2 : 1)}
                    Q ${midX} ${surfaceY + meniscusDip - 1} ${rightX - 35} ${surfaceY + (isStirring ? 2 : 1)}
                  `}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.5"
                  strokeWidth="1.2"
                />
              </>
            )}

            {/* Thermal Vapor wisps when hot (> 30°C) */}
            {temperature > 30 && totalVolume > 30 && (
              <g opacity={Math.min(0.7, (temperature - 25) / 25)}>
                <path
                  d={`
                    M 150 ${surfaceY - 5}
                    Q ${160 + Math.sin(wavePhase) * 10} ${surfaceY - 30} 155 ${surfaceY - 55}
                  `}
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeOpacity="0.35"
                />
                <path
                  d={`
                    M 230 ${surfaceY - 5}
                    Q ${240 + Math.cos(wavePhase) * 10} ${surfaceY - 35} 235 ${surfaceY - 60}
                  `}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeOpacity="0.3"
                />
              </g>
            )}

            {/* Stirring Rod (Visible when stirring) */}
            {isStirring && (
              <g className="transition-all duration-300">
                <line
                  x1={185 + Math.sin(wavePhase * 2) * 14}
                  y1={30}
                  x2={205 - Math.sin(wavePhase * 2) * 14}
                  y2={Math.max(surfaceY + 20, 420)}
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeOpacity="0.8"
                />
                <line
                  x1={185 + Math.sin(wavePhase * 2) * 14 - 1}
                  y1={30}
                  x2={205 - Math.sin(wavePhase * 2) * 14 - 1}
                  y2={Math.max(surfaceY + 20, 420)}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.9"
                />
              </g>
            )}
          </g>

          {/* White Frosted Writing Patch (내열 라벨 표기 구역) */}
          <g
            className="cursor-pointer hover:opacity-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingLabel(true);
            }}
          >
            <rect
              x="105"
              y="180"
              width="80"
              height="55"
              rx="4"
              fill="#ffffff"
              fillOpacity="0.85"
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
            {/* Frosted texture lines */}
            <line x1="110" y1="198" x2="180" y2="198" stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2 2" />
            <line x1="110" y1="216" x2="180" y2="216" stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2 2" />
            <text
              x="145"
              y="194"
              textAnchor="middle"
              fill="#1e293b"
              fontSize="11"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {labelText || '라벨 입력'}
            </text>
            <text
              x="145"
              y="226"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8.5"
              fontFamily="system-ui, sans-serif"
            >
              {chemistry.dominantName}
            </text>
          </g>

          {/* Beaker Brand & Spec Stamp */}
          <g opacity="0.85">
            <text
              x="145"
              y="125"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.5"
              fontFamily="system-ui, sans-serif"
              filter="drop-shadow(0 0.5px 1px rgba(0,0,0,0.5))"
            >
              500 ml
            </text>
            <text
              x="145"
              y="140"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.8"
              fontFamily="system-ui, sans-serif"
              filter="drop-shadow(0 0.5px 1px rgba(0,0,0,0.5))"
            >
              APPROX. VOL.
            </text>
            <text
              x="145"
              y="153"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
              filter="drop-shadow(0 0.5px 1px rgba(0,0,0,0.5))"
            >
              BORO 3.3
            </text>
          </g>

          {/* White Enamel Graduation Markings (정밀 측정 눈금) */}
          <g id="graduation-marks">
            {[
              { vol: 500, y: 115, major: true },
              { vol: 450, y: 147, major: false },
              { vol: 400, y: 179, major: true },
              { vol: 350, y: 211, major: false },
              { vol: 300, y: 243, major: true },
              { vol: 250, y: 275, major: false },
              { vol: 200, y: 307, major: true },
              { vol: 150, y: 339, major: false },
              { vol: 100, y: 371, major: true },
              { vol: 50,  y: 403, major: false },
            ].map((mark) => (
              <g key={mark.vol}>
                <line
                  x1={mark.major ? 268 : 284}
                  y1={mark.y}
                  x2={313}
                  y2={mark.y}
                  stroke="#ffffff"
                  strokeWidth={mark.major ? 2 : 1.3}
                  strokeLinecap="round"
                  filter="drop-shadow(0 0.5px 1px rgba(0,0,0,0.45))"
                />
                {mark.major && (
                  <text
                    x="256"
                    y={mark.y + 4}
                    textAnchor="end"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="monospace, system-ui"
                    filter="drop-shadow(0 0.5px 1.5px rgba(0,0,0,0.6))"
                  >
                    {mark.vol}
                  </text>
                )}
              </g>
            ))}
          </g>

          {/* Eye-level Meniscus Reading Guide Line */}
          {showGuide && totalVolume > 0 && (
            <g id="meniscus-guide" className="pointer-events-none">
              <line
                x1="65"
                y1={targetY}
                x2="335"
                y2={targetY}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <circle cx="70" cy={targetY} r="3" fill="#38bdf8" />
              <circle cx="330" cy={targetY} r="3" fill="#38bdf8" />
              <rect
                x="320"
                y={targetY - 10}
                width="62"
                height="20"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.85"
              />
              <text
                x="351"
                y={targetY + 3.5}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {Math.round(totalVolume)} mL
              </text>
            </g>
          )}

          {/* Glass Outer Wall Layer with Refraction Gradient */}
          <path
            d="
              M 84 65
              L 84 415
              Q 84 435 105 435
              L 295 435
              Q 316 435 316 415
              L 316 65
            "
            fill="url(#glassWallGrad)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Thick Solid Borosilicate Glass Base */}
          <path
            d="
              M 84 425
              L 84 429
              Q 84 445 108 445
              L 292 445
              Q 316 445 316 429
              L 316 425
              Q 316 438 295 438
              L 105 438
              Q 84 438 84 425
              Z
            "
            fill="url(#baseGrad)"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Griffin Spout (Pour Lip on Top-Left) and Top Flared Rim */}
          <path
            d="
              M 58 55
              C 68 59, 78 63, 84 65
              L 316 65
              C 322 64, 328 61, 331 58
              L 332 63
              C 326 67, 318 69, 314 69
              L 86 69
              C 76 68, 64 63, 56 59
              Z
            "
            fill="url(#rimGrad)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />

          {/* Spout Glass Lip Corner Detail */}
          <path
            d="M 56 58 Q 50 56 56 54 Q 68 57 82 64"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />

          {/* Vertical Glass Highlights */}
          <path
            d="M 92 80 L 92 410"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />
          <path
            d="M 98 85 L 98 395"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          <path
            d="M 308 80 L 308 410"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          {/* Top Rim Oval Opening Outline */}
          <ellipse
            cx="200"
            cy="65"
            rx="116"
            ry="7"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
        </svg>

        {/* Inline Label Editor Modal / Popover if editing label */}
        {isEditingLabel && (
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl border border-slate-700 z-30 flex flex-col gap-2 w-52"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-medium text-slate-300">비커 라벨 작성</span>
            <input
              type="text"
              className="bg-slate-800 text-sm px-2.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-sky-400 text-white"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="예: 반응 혼합물"
              maxLength={16}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLabelSubmit();
                if (e.key === 'Escape') setIsEditingLabel(false);
              }}
            />
            <div className="flex justify-end gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setIsEditingLabel(false)}
                className="px-2.5 py-1 text-xs rounded text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLabelSubmit}
                className="px-3 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500 font-medium text-white"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Under-beaker Stand / Surface label */}
      <div className="mt-2 text-center flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/80 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isFizzing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          500 mL 그리핀 비커 (Griffin Beaker)
        </div>

        {/* Active Elemental Specimens in Beaker Badge List */}
        {addedList.some((s) =>
          ['na_metal', 'mg_ribbon', 'ca_metal', 'fe_metal', 'cu_metal', 'zn_metal', 'c_powder', 's_powder'].includes(s.substanceId)
        ) && (
          <div className="flex flex-wrap items-center justify-center gap-1 max-w-xs animate-in fade-in">
            {hasNa && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[10.5px] font-semibold text-amber-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Na (나트륨 금속구)
              </span>
            )}
            {hasMg && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-[10.5px] font-semibold text-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Mg (마그네슘 리본)
              </span>
            )}
            {hasFe && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10.5px] font-semibold text-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                {hasCuDepositionOnFe ? 'Fe (구리 피막 철못)' : 'Fe (강철 못)'}
              </span>
            )}
            {hasCu && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-300 text-[10.5px] font-semibold text-orange-900">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                {hasAgDepositionOnCu ? 'Cu (은결정 석출 구리판)' : 'Cu (구리 금속판)'}
              </span>
            )}
            {hasCa && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 border border-sky-300 text-[10.5px] font-semibold text-sky-900">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Ca (칼슘 펠릿 과립)
              </span>
            )}
            {hasZn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 border border-blue-300 text-[10.5px] font-semibold text-blue-900">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Zn (아연 과립)
              </span>
            )}
            {hasC && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-[10.5px] font-semibold text-stone-900">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                C (탄소 분말)
              </span>
            )}
            {hasS && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-100 border border-yellow-300 text-[10.5px] font-semibold text-yellow-900">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                S (황 결정 분말)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
