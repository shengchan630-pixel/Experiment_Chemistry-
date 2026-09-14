import { useState } from 'react';
import { AddedSubstance, ChemistryState, SUBSTANCES, SubstanceCategory } from '../types';
import { RotateCcw, Droplets, Volume2, VolumeX, Eye, EyeOff, Sparkles, Plus, FlaskRound, Beaker as BeakerIcon, BookOpen, Trash2, Atom, ExternalLink } from 'lucide-react';
import ElementVisuals from './ElementVisuals';
import { PERIODIC_TABLE_1_30, ElementData, CATEGORY_LABELS } from '../data/periodicTable';

interface LabControlsProps {
  chemistry: ChemistryState;
  addedList: AddedSubstance[];
  onAddSubstance: (substanceId: string, volume: number) => void;
  onRemoveSubstance: (index: number) => void;
  onLoadPreset: (preset: AddedSubstance[]) => void;
  onOpenPeriodicTable: () => void;
  isStirring: boolean;
  onStir: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showGuide: boolean;
  onToggleGuide: () => void;
}

const CATEGORIES: { key: 'all' | SubstanceCategory; label: string }[] = [
  { key: 'all', label: '전체 시약' },
  { key: 'element', label: '원소(1~30번)' },
  { key: 'acid_base', label: '산 / 염기' },
  { key: 'indicator', label: '지시약' },
  { key: 'salt', label: '금속염 / 앙금' },
  { key: 'solvent', label: '용매' },
];

const SUBSTANCE_TO_ELEMENT_Z: Record<string, number> = {
  water: 1,      // H
  c_powder: 6,   // C
  na_metal: 11,  // Na
  mg_ribbon: 12, // Mg
  s_powder: 16,  // S
  ca_metal: 20,  // Ca
  fe_metal: 26,  // Fe
  cu_metal: 29,  // Cu
  zn_metal: 30,  // Zn
};

const ELEMENT_Z_TO_SUBSTANCE: Record<number, string> = {
  1: 'water',
  6: 'c_powder',
  11: 'na_metal',
  12: 'mg_ribbon',
  16: 's_powder',
  20: 'ca_metal',
  26: 'fe_metal',
  29: 'cu_metal',
  30: 'zn_metal',
};

const PRESETS: { title: string; desc: string; icon: string; items: AddedSubstance[] }[] = [
  {
    title: '나트륨(Na) 물 반응 & 페놀프탈레인',
    desc: '원자번호 11번 알칼리 금속 Na와 물의 격렬한 반응 (H₂ 기포, 염기화 변색)',
    icon: '⚡',
    items: [
      { substanceId: 'water', volume: 150 },
      { substanceId: 'phenolphthalein', volume: 10 },
      { substanceId: 'na_metal', volume: 20 },
    ],
  },
  {
    title: '마그네슘(Mg) 염산 수소 기포 발생',
    desc: '원자번호 12번 Mg 리본이 묽은 염산과 반응하여 맹렬하게 H₂ 기포 발생',
    icon: '🔥',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'hcl', volume: 60 },
      { substanceId: 'mg_ribbon', volume: 25 },
    ],
  },
  {
    title: '아연(Zn) 염산 수소(H₂) 발생',
    desc: '원자번호 30번 Zn 조각과 염산의 전형적인 수소 발생 실험',
    icon: '🫧',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'hcl', volume: 60 },
      { substanceId: 'zn_metal', volume: 30 },
    ],
  },
  {
    title: '구리(Cu) 표면 은(Ag) 결정 석출',
    desc: '원자번호 29번 Cu와 AgNO₃의 반응성 차이로 은 결정 석출 및 푸른 용액화',
    icon: '🌲',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'agno3', volume: 60 },
      { substanceId: 'cu_metal', volume: 25 },
    ],
  },
  {
    title: '칼슘(Ca) 과립 물 반응 (석회수)',
    desc: '원자번호 20번 Ca 과립이 물과 반응하여 수소 기포 및 흰색 Ca(OH)₂ 침전',
    icon: '🥛',
    items: [
      { substanceId: 'water', volume: 150 },
      { substanceId: 'ca_metal', volume: 30 },
    ],
  },
  {
    title: '산-염기 중화 & 페놀프탈레인',
    desc: 'HCl과 NaOH의 중화 반응 및 염기성 분홍 변색',
    icon: '🌸',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'hcl', volume: 50 },
      { substanceId: 'phenolphthalein', volume: 10 },
      { substanceId: 'naoh', volume: 60 },
    ],
  },
  {
    title: '탄산수소나트륨 CO₂ 기포 발생',
    desc: '베이킹소다와 산이 만나 뽀글뽀글 거품 발생',
    icon: '🫧',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'nahco3', volume: 60 },
      { substanceId: 'hcl', volume: 60 },
    ],
  },
  {
    title: '염화은(AgCl) 흰색 앙금 침전',
    desc: '은 이온과 염소 이온이 결합한 불용성 흰색 앙금',
    icon: '🥛',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'agno3', volume: 50 },
      { substanceId: 'hcl', volume: 50 },
    ],
  },
  {
    title: '요오드화납(PbI₂) 골든 레인 앙금',
    desc: '빛나는 황금빛 노란색 결정 침전 반응',
    icon: '✨',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'pbno32', volume: 50 },
      { substanceId: 'ki', volume: 50 },
    ],
  },
  {
    title: '수산화구리(II) 청록색 앙금',
    desc: 'CuSO₄와 NaOH가 만나 선명한 하늘색 침전',
    icon: '💎',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'cuso4', volume: 50 },
      { substanceId: 'naoh', volume: 50 },
    ],
  },
  {
    title: '티오시안산철 혈적색 착이온',
    desc: 'Fe³⁺와 SCN⁻이 반응하여 피처럼 붉은 와인빛 용액',
    icon: '🍷',
    items: [
      { substanceId: 'water', volume: 100 },
      { substanceId: 'fecl3', volume: 50 },
      { substanceId: 'kscn', volume: 50 },
    ],
  },
];

export default function LabControls({
  chemistry,
  addedList,
  onAddSubstance,
  onRemoveSubstance,
  onLoadPreset,
  onOpenPeriodicTable,
  isStirring,
  onStir,
  onReset,
  soundEnabled,
  onToggleSound,
  showGuide,
  onToggleGuide,
}: LabControlsProps) {
  const [selectedSubstanceId, setSelectedSubstanceId] = useState<string>('water');
  const [doseAmount, setDoseAmount] = useState<number>(50);
  const [selectedCategory, setSelectedCategory] = useState<'all' | SubstanceCategory>('all');
  const [activeTab, setActiveTab] = useState<'reagents' | 'elements' | 'contents' | 'presets'>('reagents');
  const [selectedElementZ, setSelectedElementZ] = useState<number>(11); // default Na (11)
  const [elementCategoryFilter, setElementCategoryFilter] = useState<string>('all');

  const selectedSub = SUBSTANCES.find((s) => s.id === selectedSubstanceId) || SUBSTANCES[0];
  const activeElement = PERIODIC_TABLE_1_30.find((el) => el.atomicNumber === selectedElementZ) || PERIODIC_TABLE_1_30[10];
  const maxBeakerVol = 500;
  const remainingCapacity = Math.max(0, maxBeakerVol - chemistry.totalVolume);

  const filteredSubstances = SUBSTANCES.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const filteredElements = PERIODIC_TABLE_1_30.filter((el) => {
    if (elementCategoryFilter === 'all') return true;
    return el.category === elementCategoryFilter;
  });

  const handleAdd = () => {
    if (remainingCapacity <= 0) return;
    const actualDose = Math.min(doseAmount, remainingCapacity);
    onAddSubstance(selectedSubstanceId, actualDose);
  };

  const handleAddElementToLab = (atomicNumber: number) => {
    const subId = ELEMENT_Z_TO_SUBSTANCE[atomicNumber];
    if (subId) {
      onAddSubstance(subId, Math.min(doseAmount, remainingCapacity));
    }
  };

  const activeElementSubId = ELEMENT_Z_TO_SUBSTANCE[selectedElementZ];
  const activeElementCatInfo = CATEGORY_LABELS[activeElement.category];

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-5">
      {/* Top Header & Toggles */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <FlaskRound className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800">화학 실험 조작대</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Beaker Volume Badge */}
          <div className="flex items-baseline gap-1 text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            <span className={chemistry.totalVolume >= 500 ? 'text-rose-600 font-bold' : 'text-slate-900'}>
              {Math.round(chemistry.totalVolume)}
            </span>
            <span className="text-slate-400">/ 500 mL</span>
          </div>

          {/* Guide Line Toggle */}
          <button
            type="button"
            onClick={onToggleGuide}
            className={`p-1.5 rounded-lg border transition-colors ${
              showGuide
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={showGuide ? '눈금 보조선 끄기' : '눈금 보조선 켜기'}
            aria-label="눈금 보조선 토글"
          >
            {showGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            aria-label="효과음 토글"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Periodic Table 1~30 Quick Launcher Banner */}
      <button
        type="button"
        onClick={onOpenPeriodicTable}
        className="w-full p-2.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 hover:from-sky-100 hover:to-indigo-100 transition flex items-center justify-between group shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Atom className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-950">주기율표 (1~30번) 탐색기</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-200/80 text-indigo-800">
                1 H ~ 30 Zn
              </span>
            </div>
            <span className="text-[10px] text-indigo-600">원자번호 1번부터 30번까지 물성 확인 & 비커 투입</span>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform pr-1">
          열기 →
        </span>
      </button>

      {/* Navigation Tabs: 시약 추가 / 원소 탐색 (1~30) / 비커 내용물 / 추천 실험 */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('reagents')}
          className={`py-1.5 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'reagents'
              ? 'bg-white text-sky-700 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">시약 추가</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`py-1.5 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'elements'
              ? 'bg-white text-indigo-700 shadow-xs font-bold ring-1 ring-indigo-200'
              : 'hover:text-slate-900 text-indigo-900'
          }`}
        >
          <Atom className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
          <span className="truncate">원소 탐색</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contents')}
          className={`py-1.5 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'contents'
              ? 'bg-white text-sky-700 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <BeakerIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">내용물 ({addedList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-1.5 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'presets'
              ? 'bg-white text-sky-700 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">추천 실험</span>
        </button>
      </div>

      {/* TAB 1: REAGENTS SELECTOR & DOSING */}
      {activeTab === 'reagents' && (
        <div className="flex flex-col gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Reagents Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredSubstances.map((sub) => {
              const isSelected = selectedSubstanceId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubstanceId(sub.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 mt-0.5 shadow-inner"
                    style={{ backgroundColor: sub.color }}
                  />
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-xs font-semibold text-slate-800 truncate">{sub.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 truncate">{sub.formula}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Reagent Description Note */}
          <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 flex flex-col gap-0.5">
            <span className="font-semibold text-slate-700">{selectedSub.name} ({selectedSub.formula})</span>
            <span className="text-slate-500 leading-snug">{selectedSub.description}</span>
          </div>

          {/* Direct Link to Real Shape & Bohr Atom Model Inspector */}
          {SUBSTANCE_TO_ELEMENT_Z[selectedSub.id] && (
            <button
              type="button"
              onClick={() => {
                setSelectedElementZ(SUBSTANCE_TO_ELEMENT_Z[selectedSub.id]);
                setActiveTab('elements');
              }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-indigo-200/80 hover:border-indigo-300 text-xs text-indigo-950 group shadow-xs transition"
            >
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-indigo-600 group-hover:rotate-45 transition-transform" />
                <span className="font-bold">
                  {selectedSub.name} 원소 실물 외형 · 보어모형 · 전자껍질 보기
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                상세 관찰 →
              </span>
            </button>
          )}

          {/* Dosage Selector & Add Action */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">투입 용량 선택</span>
              <span className="font-mono font-bold text-sky-700">{doseAmount} mL</span>
            </div>

            {/* Quick Dose Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDoseAmount(amt)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                    doseAmount === amt
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                  }`}
                >
                  +{amt} mL
                </button>
              ))}
            </div>

            {/* Add to Beaker Button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={remainingCapacity <= 0}
              className="mt-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>비커에 {selectedSub.name} {Math.min(doseAmount, remainingCapacity)} mL 추가하기</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ELEMENT INSPECTOR (실물 외형 · 보어 원자모형 · 전자껍질 1~30번) */}
      {activeTab === 'elements' && (
        <div className="flex flex-col gap-3 min-h-[300px]">
          {/* Quick 1~30 Element Selector Grid / Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">원소 선택 (1~30번)</span>
              <button
                type="button"
                onClick={onOpenPeriodicTable}
                className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>전체 주기율표 열기</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Scrollable Horizontal Pill List */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
              {PERIODIC_TABLE_1_30.map((el) => {
                const isSelected = el.atomicNumber === selectedElementZ;
                const cat = CATEGORY_LABELS[el.category];
                return (
                  <button
                    key={el.atomicNumber}
                    type="button"
                    onClick={() => setSelectedElementZ(el.atomicNumber)}
                    className={`shrink-0 px-2 py-1 rounded-xl text-xs flex items-center gap-1 border transition ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 font-bold bg-white text-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-white text-slate-600'
                    }`}
                    style={{
                      borderColor: isSelected ? '#6366f1' : cat.border,
                    }}
                  >
                    <span className="text-[10px] font-mono text-slate-400">{el.atomicNumber}</span>
                    <span className="font-bold" style={{ color: cat.color }}>{el.symbol}</span>
                    <span className="text-[11px] text-slate-700">{el.nameKo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Element Identity Header Card */}
          <div
            className="p-3 rounded-2xl border flex items-start justify-between shadow-xs transition-colors"
            style={{
              backgroundColor: activeElementCatInfo.bgLight,
              borderColor: activeElementCatInfo.border,
            }}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold text-slate-500">
                원자번호 {activeElement.atomicNumber}번
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: activeElementCatInfo.color }}
                >
                  {activeElement.symbol}
                </span>
                <span className="text-base font-bold text-slate-800">{activeElement.nameKo}</span>
                <span className="text-xs text-slate-500 font-medium">({activeElement.nameEn})</span>
              </div>
              <span className="text-[11px] font-mono text-slate-600 mt-0.5">
                원자량: {activeElement.atomicWeight} g/mol · {activeElement.period}주기 {activeElement.group}족
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
                style={{ backgroundColor: activeElementCatInfo.color }}
              >
                {activeElementCatInfo.label}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {activeElement.phase === 'gas' ? '기체' : activeElement.phase === 'liquid' ? '액체' : '고체'}
              </span>
            </div>
          </div>

          {/* THE CORE VISUALIZER: 실물 외형 · 보어 원자모형 · 전자껍질 */}
          <ElementVisuals element={activeElement} initialTab="all" />

          {/* Chemical Description */}
          <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 flex flex-col gap-1">
            <span className="font-semibold text-slate-800">특성 요약</span>
            <p className="leading-snug text-slate-600">{activeElement.description}</p>
            {activeElement.beakerReactivity?.reactionNote && (
              <div className="mt-1 p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 font-medium">
                💡 실험 반응: {activeElement.beakerReactivity.reactionNote}
              </div>
            )}
          </div>

          {/* Add to Beaker Action if substance exists */}
          {activeElementSubId && (
            <button
              type="button"
              onClick={() => handleAddElementToLab(selectedElementZ)}
              disabled={remainingCapacity <= 0}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>비커에 {activeElement.nameKo} ({activeElement.symbol}) 투입하기</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 2: CURRENT BEAKER CONTENTS */}
      {activeTab === 'contents' && (
        <div className="flex flex-col gap-3 min-h-[220px]">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">현재 비커 속 혼합 물질</span>
            <span>총 {addedList.length}종 투입됨</span>
          </div>

          {addedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs gap-1 border border-dashed border-slate-200 rounded-xl">
              <Droplets className="w-6 h-6 stroke-1" />
              <span>현재 비커가 비어있습니다.</span>
              <span className="text-[10px] text-slate-400">'시약 추가' 탭에서 시약을 투입해보세요.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
              {addedList.map((item, idx) => {
                const sub = SUBSTANCES.find((s) => s.id === item.substanceId);
                if (!sub) return null;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{sub.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{sub.formula}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {SUBSTANCE_TO_ELEMENT_Z[sub.id] && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedElementZ(SUBSTANCE_TO_ELEMENT_Z[sub.id]);
                            setActiveTab('elements');
                          }}
                          className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 hover:bg-indigo-100 transition"
                          title="원소 실물 외형 및 보어 원자모형 보기"
                        >
                          <Atom className="w-3 h-3" />
                          <span>외형·모형</span>
                        </button>
                      )}
                      <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {item.volume} mL
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveSubstance(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="이 투입분 제거"
                        aria-label="투입 시약 제거"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Precipitate & Active Reaction Mini Summary */}
          {chemistry.precipitates.length > 0 && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex flex-col gap-1 text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> 침전 앙금 발생 ({chemistry.precipitates[0].name})
              </span>
              <span className="text-[11px] text-amber-700 leading-snug">
                {chemistry.precipitates[0].description}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CURATED PRESETS */}
      {activeTab === 'presets' && (
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
          <span className="text-xs font-semibold text-slate-600">추천 화학 반응 레시피 즉시 실행</span>
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onLoadPreset(preset.items)}
              className="flex items-start gap-3 p-2.5 bg-white hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition group active:scale-[0.99]"
            >
              <span className="text-xl shrink-0 p-1 bg-slate-50 group-hover:bg-white rounded-lg border border-slate-100">
                {preset.icon}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700">{preset.title}</span>
                <span className="text-[11px] text-slate-500 leading-tight mt-0.5">{preset.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Reactions Banner (if any reactions occurred) */}
      {chemistry.recentReactions.length > 0 && (
        <div className="p-3 bg-sky-50/90 border border-sky-200 rounded-xl text-xs flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sky-900 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>감지된 화학 반응 ({chemistry.recentReactions.length}건)</span>
          </div>
          <div className="flex flex-col gap-1">
            {chemistry.recentReactions.map((rxn) => (
              <div key={rxn.id} className="flex flex-col text-[11px] bg-white/80 p-2 rounded-lg border border-sky-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{rxn.title}</span>
                  <span className="font-mono text-[10px] text-sky-700 font-bold">{rxn.equation}</span>
                </div>
                <span className="text-slate-500 mt-0.5 leading-tight">{rxn.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Stir & Empty Beaker */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onStir}
          disabled={chemistry.totalVolume <= 0 || isStirring}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            chemistry.totalVolume <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : isStirring
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm active:scale-95'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isStirring ? 'animate-spin' : ''}`} />
          {isStirring ? '휘젓는 중...' : '유리 막대로 젓기'}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={chemistry.totalVolume === 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          비커 비우기 (세척)
        </button>
      </div>
    </div>
  );
}
