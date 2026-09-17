import React from 'react';
import {
  CONTAINER_MATERIALS,
  ContainerMaterial,
  SimulationParams,
  SimulationStepState,
} from '../../types/ramenExperiment';
import { getRecommendedOuterWater, calculateEnergySufficiency } from '../../utils/ramenPhysics';
import {
  Pause,
  RotateCcw,
  Layers,
  FlaskConical,
  Flame,
  Volume2,
  VolumeX,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  params: SimulationParams;
  state: SimulationStepState;
  onUpdateParams: (updates: Partial<SimulationParams>) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGuide: () => void;
}

export default function RamenControls({
  params,
  state,
  onUpdateParams,
  onStart,
  onPause,
  onReset,
  simSpeed,
  onChangeSpeed,
  soundEnabled,
  onToggleSound,
  onOpenGuide,
}: Props) {
  const currentMat = CONTAINER_MATERIALS[params.containerMaterial];

  const outerWaterGuide = getRecommendedOuterWater(params.caoMass);
  const isWaterTooLow = params.outerWaterVolume < outerWaterGuide.minStoichiometric;
  const isWaterExcessive = params.outerWaterVolume > outerWaterGuide.maxEffective;

  const energyBalance = calculateEnergySufficiency(
    params.caoMass,
    params.outerWaterVolume,
    params.innerWaterVolume,
    params.ambientTemp,
    state.boilingPoint || 100
  );

  return (
    <div
      id="ramen-controls-panel"
      className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-4 sm:p-5 flex flex-col gap-4 text-slate-800"
    >
      {/* Simulation Playback Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {!state.isRunning ? (
            <button
              type="button"
              onClick={onStart}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>{state.timeSeconds === 0 ? '발열팩 작동 시작' : '실험 계속하기'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
            >
              <Pause className="w-4 h-4" />
              <span>일시정지</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="실험 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls & Sound Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 rounded-md font-mono font-semibold transition ${
                  simSpeed === spd
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? '음향 끄기' : '음향 켜기'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1"
            title="원리 가이드"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold hidden sm:inline">원리 설명</span>
          </button>
        </div>
      </div>

      {/* 1. CONTAINER MATERIAL SELECTION */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>1. 용기 재질 선택</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            열전도율 k = {currentMat.thermalConductivity} W/m·K
          </span>
        </div>

        {/* 3 Material Select Buttons: 알루미늄, 스테인리스강, 내열 유리 */}
        <div className="grid grid-cols-3 gap-2">
          {Object.values(CONTAINER_MATERIALS).map((m) => {
            const isSelected = params.containerMaterial === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={state.isRunning}
                onClick={() => onUpdateParams({ containerMaterial: m.id })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                } ${state.isRunning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                    {m.nameKo}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  k = {m.thermalConductivity} W/m·K
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                  {m.pros}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected material detailed note */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-800">{currentMat.nameKo} ({currentMat.nameEn}) 특성:</span>
            <span className="text-slate-500 font-mono">밀도 {currentMat.density} g/cm³ · 비열 {currentMat.specificHeat} J/g·K</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">{currentMat.description}</p>
        </div>
      </div>

      {/* 2. REAGENTS: CALCIUM OXIDE & WATER MASS */}
      <div className="flex flex-col gap-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>2. 외부 반응물 량 (산화 칼슘 CaO & 반응수 H₂O)</span>
          </div>
          <span className="text-[10px] text-amber-600 font-mono font-semibold">
            CaO + H₂O → Ca(OH)₂ + 63.7 kJ/mol
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quicklime CaO mass slider */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">산화 칼슘 (생석회) 질량</span>
              <span className="font-mono font-bold text-amber-950">{params.caoMass} g</span>
            </div>
            <input
              type="range"
              min="30"
              max="180"
              step="5"
              value={params.caoMass}
              onChange={(e) => onUpdateParams({ caoMass: Number(e.target.value) })}
              disabled={state.isRunning}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>
                방출 열량: 약 {Math.round((params.caoMass * 1550) / 1000)} kJ ({Math.round((params.caoMass * 1550) / 4184)} kcal)
              </span>
              <span className={params.caoMass >= 110 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {params.caoMass >= 110 ? '비등 가능 (100°C)' : '열량 부족'}
              </span>
            </div>
          </div>

          {/* Outer Water volume slider */}
          <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-900">외부 주입 반응수 (H₂O)</span>
              <span className="font-mono font-bold text-sky-950">{params.outerWaterVolume} mL</span>
            </div>
            <input
              type="range"
              min="30"
              max="160"
              step="5"
              value={params.outerWaterVolume}
              onChange={(e) => onUpdateParams({ outerWaterVolume: Number(e.target.value) })}
              disabled={state.isRunning}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>권장 수량: {outerWaterGuide.recommended} mL</span>
              <button
                type="button"
                onClick={() => onUpdateParams({ outerWaterVolume: outerWaterGuide.recommended })}
                disabled={state.isRunning}
                className="text-[10px] text-sky-600 underline font-semibold"
              >
                권장비율 맞춤
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Thermodynamic Sufficiency Banner */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-all ${
            energyBalance.status === 'insufficient'
              ? 'bg-amber-50/90 border-amber-300 text-amber-900'
              : energyBalance.status === 'marginal'
              ? 'bg-yellow-50/90 border-yellow-300 text-yellow-900'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-1.5">
              {energyBalance.status === 'insufficient' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{energyBalance.headline}</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/70 border border-current/20">
              열량 충족률 {energyBalance.sufficiencyPercent}% · 최고 예상 {energyBalance.projectedMaxTemp}°C
            </span>
          </div>

          <p className="text-[11px] leading-relaxed opacity-90">{energyBalance.detail}</p>

          {energyBalance.status === 'insufficient' && (
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80 mt-0.5">
              <span className="text-[10px] text-amber-800">
                💡 350mL 라면수를 100°C까지 끓이려면 최소 110g 이상의 CaO가 필요합니다.
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateParams({
                    caoMass: 120,
                    outerWaterVolume: Math.round(120 * 0.68),
                  })
                }
                disabled={state.isRunning}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition shadow-xs"
              >
                120g 최적값 맞춤
              </button>
            </div>
          )}
        </div>

        {/* Chemical Water Stoichiometric Guide Banner */}
        {isWaterTooLow && (
          <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
            ⚠️ 물이 너무 적습니다! 산화 칼슘이 완전히 반응하지 못하고 조기 중단될 수 있습니다.
          </div>
        )}
        {isWaterExcessive && (
          <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
            💡 물이 너무 많으면 과잉 수분이 열을 흡수하여 도달할 수 있는 최고 온도가 낮아집니다.
          </div>
        )}
      </div>

      {/* 3. INNER FOOD CONFIGURATION */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">라면 조리용 물:</span>
          <select
            value={params.innerWaterVolume}
            onChange={(e) => onUpdateParams({ innerWaterVolume: Number(e.target.value) })}
            disabled={state.isRunning}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 font-mono font-semibold outline-hidden"
          >
            <option value="300">300 mL (자작한 진한 국물)</option>
            <option value="350">350 mL (표준 1인분)</option>
            <option value="450">450 mL (넉넉한 국물)</option>
          </select>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.hasBrothFlakes}
            onChange={(e) => onUpdateParams({ hasBrothFlakes: e.target.checked })}
            className="rounded-sm accent-red-600"
          />
          <span className="font-medium text-slate-700">분말 스프 & 건더기 넣기</span>
        </label>
      </div>
    </div>
  );
}
