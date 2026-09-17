import { useState, useRef, useMemo, useEffect } from 'react';
import Beaker from './components/Beaker';
import LabControls from './components/LabControls';
import PeriodicTableModal from './components/PeriodicTableModal';
import RamenExperimentView from './components/ramen/RamenExperimentView';
import { AddedSubstance, ChemistryState } from './types';
import { computeChemistryState } from './utils/chemistry';
import { playGlassTapSound, playPourSound, playStirSound, playFizzSound, playReactionChime } from './utils/audio';
import { FlaskConical, Info, Sparkles, Atom, Flame, Soup } from 'lucide-react';

export default function App() {
  // Navigation mode: 'ramen' (newly added user experiment) | 'beaker' (chemical lab)
  const [activeTab, setActiveTab] = useState<'ramen' | 'beaker'>('ramen');

  // Initial state: 150 mL 증류수
  const [addedList, setAddedList] = useState<AddedSubstance[]>([
    { substanceId: 'water', volume: 150 },
  ]);
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [reactionNotification, setReactionNotification] = useState<string | null>(null);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState<boolean>(false);

  const stirTimeoutRef = useRef<number | null>(null);
  const prevReactionsCountRef = useRef<number>(0);

  // Compute live chemical state from beaker contents
  const chemistry: ChemistryState = useMemo(() => {
    return computeChemistryState(addedList);
  }, [addedList]);

  // Sync label text: custom label takes precedence, otherwise shows dominant formula/name
  const activeLabel = customLabel || chemistry.dominantName;

  // React to new chemical reactions (Audio + Toast Notification)
  useEffect(() => {
    const rxnCount = chemistry.recentReactions.length;
    if (rxnCount > prevReactionsCountRef.current) {
      const latest = chemistry.recentReactions[rxnCount - 1];
      setReactionNotification(`✨ ${latest.title}: ${latest.equation}`);

      if (soundEnabled) {
        if (chemistry.isFizzing) {
          playFizzSound(1.5);
        } else {
          playReactionChime();
        }
      }

      const timer = window.setTimeout(() => {
        setReactionNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
    prevReactionsCountRef.current = rxnCount;
  }, [chemistry.recentReactions, chemistry.isFizzing, soundEnabled]);

  // Add a substance to beaker
  const handleAddSubstance = (substanceId: string, volume: number) => {
    if (soundEnabled) {
      playPourSound(0.5);
    }
    setAddedList((prev) => [...prev, { substanceId, volume }]);
  };

  // Remove a substance addition
  const handleRemoveSubstance = (index: number) => {
    setAddedList((prev) => prev.filter((_, i) => i !== index));
  };

  // Load a curated experiment preset
  const handleLoadPreset = (preset: AddedSubstance[]) => {
    setAddedList(preset);
    setCustomLabel('');
    if (soundEnabled) {
      playPourSound(0.8);
    }
  };

  // Tap glass beaker chime
  const handleTapBeaker = () => {
    if (soundEnabled) {
      playGlassTapSound();
    }
  };

  // Stir with glass rod
  const handleStir = () => {
    if (isStirring || chemistry.totalVolume <= 0) return;
    setIsStirring(true);
    if (soundEnabled) {
      playStirSound();
    }

    if (stirTimeoutRef.current) clearTimeout(stirTimeoutRef.current);
    stirTimeoutRef.current = window.setTimeout(() => {
      setIsStirring(false);
    }, 2400);
  };

  // Empty and clean beaker
  const handleReset = () => {
    setAddedList([]);
    setCustomLabel('');
    if (soundEnabled) {
      playGlassTapSound();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center selection:bg-sky-200">
      {/* Laboratory Ambient Lighting / Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-100 to-slate-200" />

      {/* Subtle Lab Bench Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #94a3b8 1px, transparent 1px),
            linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-5 md:py-8 flex flex-col items-center flex-1">
        {/* Lab Header & Experiment Mode Switcher */}
        <header className="flex flex-col items-center text-center mb-4 md:mb-6 w-full">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/85 border border-slate-200 rounded-full shadow-xs">
              <FlaskConical className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                Interactive Science Laboratory
              </span>
            </div>

            {/* Experiment Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-full border border-slate-300 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('ramen')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'ramen'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Soup className="w-3.5 h-3.5" />
                <span>산화 칼슘 발열 라면 실험</span>
                <span className="text-[10px] bg-amber-300 text-amber-950 px-1.5 py-0.2 rounded-full font-black">
                  신규
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('beaker')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'beaker'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>비커 화학반응 실험실</span>
              </button>
            </div>

            {activeTab === 'beaker' && (
              <button
                type="button"
                onClick={() => setIsPeriodicTableOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xs text-xs font-bold transition hover:shadow-sm"
              >
                <Atom className="w-3.5 h-3.5" />
                <span>주기율표 (1~30)</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {activeTab === 'ramen' ? (
              <span className="flex items-center justify-center gap-2">
                <Flame className="w-7 h-7 text-amber-600" />
                물과 산화 칼슘(생석회) 발열 라면 실험
              </span>
            ) : (
              '화학실험 비커 시뮬레이터'
            )}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
            {activeTab === 'ramen'
              ? '외부 용기의 산화 칼슘(CaO)과 물의 수화 발열 반응(63.7 kJ/mol)으로 내부 용기 라면을 끓입니다. 고도별 기압·비등점 변화, 주변 기온 방열 손실, 2중 용기 재질(알루미늄·스테인리스·세라믹·주철)의 열역학적 영향을 시뮬레이션하세요.'
              : '다양한 화학 시약과 1~30번 원소를 비커에 섞어 산·염기 중화, 앙금 침전, 수소/탄산 기체 발생, 금속 치환 반응을 직접 관찰하세요.'}
          </p>
        </header>

        {/* Reaction Live Toast Notification (for beaker) */}
        {activeTab === 'beaker' && reactionNotification && (
          <div className="mb-4 px-4 py-2 bg-slate-900 text-white text-xs md:text-sm font-medium rounded-full shadow-xl border border-sky-400 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{reactionNotification}</span>
          </div>
        )}

        {/* Experiment Content */}
        {activeTab === 'ramen' ? (
          <main className="w-full flex flex-col items-center">
            <RamenExperimentView />
          </main>
        ) : (
          /* Beaker Workbench Layout */
          <main className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 flex-1">
            {/* Beaker Workbench Stage */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[460px] w-full max-w-[420px]">
              <div className="relative w-full flex flex-col items-center justify-center p-2">
                <Beaker
                  chemistry={chemistry}
                  label={activeLabel}
                  onLabelChange={setCustomLabel}
                  isStirring={isStirring}
                  onTapBeaker={handleTapBeaker}
                  showGuide={showGuide}
                  addedList={addedList}
                />
              </div>
            </div>

            {/* Controls Panel */}
            <aside className="w-full lg:w-auto flex justify-center">
              <LabControls
                chemistry={chemistry}
                addedList={addedList}
                onAddSubstance={handleAddSubstance}
                onRemoveSubstance={handleRemoveSubstance}
                onLoadPreset={handleLoadPreset}
                onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
                isStirring={isStirring}
                onStir={handleStir}
                onReset={handleReset}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                showGuide={showGuide}
                onToggleGuide={() => setShowGuide(!showGuide)}
              />
            </aside>
          </main>
        )}

        {/* Periodic Table Modal (1 to 30) */}
        <PeriodicTableModal
          isOpen={isPeriodicTableOpen}
          onClose={() => setIsPeriodicTableOpen(false)}
          onAddSubstance={handleAddSubstance}
          currentBeakerVolume={chemistry.totalVolume}
        />

        {/* Bottom Lab Guide Info */}
        <footer className="mt-8 text-center text-xs text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {activeTab === 'ramen' ? (
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>
                💡 산화 칼슘(CaO) 65g + 물 80mL 조합 시 최고 발열 온도는 100°C 이상에 도달하여 무불 라면 조리가 가능합니다.
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>비커의 흰색 사각 라벨을 클릭하여 시약명을 직접 편집할 수 있습니다.</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>• 비커를 클릭하면 맑은 유리 소리가 납니다.</span>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
