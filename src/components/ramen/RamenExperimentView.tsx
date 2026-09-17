import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SimulationParams,
  SimulationStepState,
} from '../../types/ramenExperiment';
import {
  createInitialSimulationState,
  stepThermodynamics,
} from '../../utils/ramenPhysics';
import DualChamberVisualizer from './DualChamberVisualizer';
import RamenControls from './RamenControls';
import ThermalAnalyticsGraph from './ThermalAnalyticsGraph';
import ScienceGuideCard from './ScienceGuideCard';
import {
  playBoilingBubbleSound,
  playSteamHissSound,
  playReactionChime,
  playGlassTapSound,
} from '../../utils/audio';
import {
  Flame,
  Sparkles,
  ChefHat,
  Zap,
  AlertTriangle,
} from 'lucide-react';

export default function RamenExperimentView() {
  // Simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    containerMaterial: 'aluminum',
    altitude: 0,
    ambientTemp: 20,
    caoMass: 120,
    outerWaterVolume: 80,
    innerWaterVolume: 350,
    noodleMass: 110,
    hasBrothFlakes: true,
  });

  const cookingAccumulatorRef = useRef<number>(0);
  const [state, setState] = useState<SimulationStepState>(() =>
    createInitialSimulationState(params)
  );

  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastSoundTickRef = useRef<number>(0);
  const hasChimedPerfectRef = useRef<boolean>(false);

  // Show temporary toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const t = window.setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, []);

  // Update parameters and recalculate initial equilibrium if not running
  const handleUpdateParams = (updates: Partial<SimulationParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...updates };
      // If stopped, sync initial state
      if (!state.isRunning && state.timeSeconds === 0) {
        setState(createInitialSimulationState(next));
      }
      return next;
    });
  };

  // Start / Resume simulation
  const handleStart = () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
    }));
    if (state.timeSeconds === 0) {
      showToast('🔥 발열팩 반응 개시: 산화 칼슘(CaO)과 물이 반응하여 급격한 열을 방출합니다!');
      if (soundEnabled) {
        playSteamHissSound(0.5);
      }
    }
  };

  // Pause simulation
  const handlePause = () => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  };

  // Reset simulation
  const handleReset = () => {
    cookingAccumulatorRef.current = 0;
    hasChimedPerfectRef.current = false;
    setState(createInitialSimulationState(params));
    showToast('실험이 초기화되었습니다. 조건을 변경하고 다시 가열해보세요.');
    if (soundEnabled) {
      playGlassTapSound();
    }
  };

  // Presets
  const applyPreset = (presetParams: Partial<SimulationParams>, name: string) => {
    handleReset();
    setParams((prev) => {
      const next = { ...prev, ...presetParams };
      setState(createInitialSimulationState(next));
      return next;
    });
    showToast(`시나리오 적용: [${name}]`);
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!state.isRunning) return;

    const intervalMs = 100;
    const dt = (intervalMs / 1000) * simSpeed;

    const timer = setInterval(() => {
      setState((prev) => {
        if (!prev.isRunning || prev.isCompleted) return prev;
        const next = stepThermodynamics(prev, params, dt, cookingAccumulatorRef);

        // Audio cues trigger
        if (soundEnabled) {
          const now = Date.now();
          if (now - lastSoundTickRef.current > 1800) {
            if (next.isInnerBoiling) {
              playBoilingBubbleSound(0.7);
              lastSoundTickRef.current = now;
            } else if (next.outerSteamIntensity > 0.3) {
              playSteamHissSound(0.6);
              lastSoundTickRef.current = now;
            }
          }

          // Chime when noodle reaches perfect cook
          if (next.noodleInfo.state === 'perfect' && !hasChimedPerfectRef.current) {
            playReactionChime();
            hasChimedPerfectRef.current = true;
          }
        }

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.isRunning, simSpeed, params, soundEnabled]);

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
      {/* Preset Scenario Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2">
          <ChefHat className="w-4 h-4 text-amber-600" />
          <span>추천 실험 시나리오:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {/* Preset 1: Aluminum Rapid Boiling */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                {
                  containerMaterial: 'aluminum',
                  caoMass: 120,
                  outerWaterVolume: 80,
                  innerWaterVolume: 350,
                },
                '알루미늄 용기 완숙 비등 (CaO 120g → 100°C 펄펄 끓음)'
              )
            }
            className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-900 border border-slate-200 font-medium transition flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-sky-600" />
            <span>알루미늄 초고속 완숙 (120g)</span>
          </button>

          {/* Preset 2: Stainless Steel Balanced */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                {
                  containerMaterial: 'stainless',
                  caoMass: 130,
                  outerWaterVolume: 90,
                  innerWaterVolume: 350,
                },
                '스테인리스강 용기 완숙 조리 (CaO 130g → 균일 100°C 비등)'
              )
            }
            className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium transition flex items-center gap-1"
          >
            <span>🍳</span>
            <span>스테인리스강 완숙 (130g)</span>
          </button>

          {/* Preset 3: Heat-Resistant Glass */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                {
                  containerMaterial: 'heat_resistant_glass',
                  caoMass: 135,
                  outerWaterVolume: 90,
                  innerWaterVolume: 350,
                },
                '내열 유리 용기 보온 조리 (CaO 135g → 투명 관찰 & 100°C 비등)'
              )
            }
            className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-900 border border-slate-200 font-medium transition flex items-center gap-1"
          >
            <span>🧪</span>
            <span>내열 유리 보온 (135g)</span>
          </button>

          {/* Preset 4: Insufficient Reactant Demonstration (50°C Ceiling) */}
          <button
            type="button"
            onClick={() =>
              applyPreset(
                {
                  containerMaterial: 'aluminum',
                  caoMass: 55,
                  outerWaterVolume: 40,
                  innerWaterVolume: 350,
                },
                '발열량 부족 비교 실험 (CaO 55g → 50°C 한계 도달 시연)'
              )
            }
            className="px-2.5 py-1 text-xs rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold transition flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>[비교] 발열량 부족 (55g, 50°C 한계)</span>
          </button>
        </div>
      </div>

      {/* Live Toast Notification */}
      {toastMessage && (
        <div className="px-4 py-2 bg-slate-900 text-white text-xs md:text-sm font-medium rounded-full shadow-xl border border-amber-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workbench Stage: Visualizer (Left) + Controls (Right) */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dual Chamber Cutaway Visualizer (7 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center w-full">
          <DualChamberVisualizer
            params={params}
            state={state}
            onTapPot={() => {
              if (soundEnabled) playGlassTapSound();
            }}
          />
        </div>

        {/* Right: Interactive Controls (5 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center w-full">
          <RamenControls
            params={params}
            state={state}
            onUpdateParams={handleUpdateParams}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            simSpeed={simSpeed}
            onChangeSpeed={setSimSpeed}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>
      </div>

      {/* Bottom Full-Width: Thermodynamics Analytics Chart */}
      <div className="w-full max-w-5xl">
        <ThermalAnalyticsGraph state={state} />
      </div>

      {/* Science Guide Dialog */}
      <ScienceGuideCard isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
