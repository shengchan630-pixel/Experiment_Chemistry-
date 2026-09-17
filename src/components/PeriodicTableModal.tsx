import { useState, useMemo } from 'react';
import { PERIODIC_TABLE_1_30, CATEGORY_LABELS, ElementData } from '../data/periodicTable';
import ElementVisuals, { getPhysicalSampleInfo } from './ElementVisuals';
import { X, Search, Sparkles, Plus, Check, Atom, Maximize2, Columns, LayoutGrid, Layers, Box } from 'lucide-react';
import { SUBSTANCES } from '../types';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubstance: (substanceId: string, volume: number) => void;
  currentBeakerVolume: number;
}

export default function PeriodicTableModal({
  isOpen,
  onClose,
  onAddSubstance,
  currentBeakerVolume,
}: PeriodicTableModalProps) {
  const [selectedElement, setSelectedElement] = useState<ElementData>(PERIODIC_TABLE_1_30[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [doseAmount, setDoseAmount] = useState<number>(30);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'grid' | 'details'>('details');
  const [viewMode, setViewMode] = useState<'split' | 'studio' | 'table'>('split');

  // Filter elements based on category and search query
  const filteredElements = useMemo(() => {
    return PERIODIC_TABLE_1_30.filter((el) => {
      const matchCat = categoryFilter === 'all' || el.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        el.symbol.toLowerCase().includes(q) ||
        el.nameKo.toLowerCase().includes(q) ||
        el.nameEn.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q;
      return matchCat && matchQuery;
    });
  }, [categoryFilter, searchQuery]);

  // Find if current element corresponds to a lab substance
  const matchingSubstance = useMemo(() => {
    if (!selectedElement) return null;
    return SUBSTANCES.find((s) => s.atomicNumber === selectedElement.atomicNumber);
  }, [selectedElement]);

  if (!isOpen) return null;

  const remainingCapacity = Math.max(0, 500 - currentBeakerVolume);

  const handleAddSelectedToBeaker = () => {
    if (!matchingSubstance || remainingCapacity <= 0) return;
    const actualDose = Math.min(doseAmount, remainingCapacity);
    onAddSubstance(matchingSubstance.id, actualDose);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const selectedCatInfo = CATEGORY_LABELS[selectedElement.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-[98vw] xl:max-w-[1520px] 2xl:max-w-[1680px] h-[95vh] max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Atom className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">주기율표 (1번 ~ 30번) 원소 탐색기</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  원자 모형 & 실물 외형 시각화 스튜디오
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block mt-0.5">
                원소를 선택하여 보어 원자 모형(전자 껍질 회전 궤도)과 실물 시료의 모양 및 물리화학적 특성을 확인하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher on Desktop */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-white text-sky-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="주기율표와 원소 상세를 양옆으로 확인합니다"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>분할 뷰</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'studio'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="원소의 실물 외형, 보어 원자모형, 전자껍질을 대화면 스튜디오로 확대합니다"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                <span>원소 대화면 뷰 (확대)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="주기율표 18족 격자를 와이드 화면으로 확인합니다"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>주기율표 와이드</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="원소기호, 한글명, 원자번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              전체 (30)
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, cat]) => (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition border ${
                  categoryFilter === catKey
                    ? 'shadow-xs text-white'
                    : 'bg-white text-slate-600 hover:opacity-90'
                }`}
                style={{
                  backgroundColor: categoryFilter === catKey ? cat.color : '#ffffff',
                  borderColor: categoryFilter === catKey ? cat.color : cat.border,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Mobile View Mode Switcher Button */}
          <div className="flex md:hidden items-center gap-1 w-full pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'studio' ? 'split' : 'studio')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewMode === 'studio'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{viewMode === 'studio' ? '일반 분할 뷰로 보기' : '원소 모형 대화면 확대 뷰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Screen View Switcher (<lg) for split mode */}
        {viewMode === 'split' && (
          <div className="lg:hidden flex border-b border-slate-200 bg-slate-100/90 p-1 gap-1 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab('grid')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mobileTab === 'grid'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>주기율표 격자 (1~30번)</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('details')}
              className={`flex-1 py-1.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                mobileTab === 'details'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Atom className="w-3.5 h-3.5 text-indigo-600" />
              <span>원소 실물·모형·껍질 ({selectedElement.nameKo})</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW MODE 1: STUDIO (대화면 확대 뷰 - Huge visualizer)    */}
        {/* ========================================================= */}
        {viewMode === 'studio' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            {/* Quick 1~30 Element Picker Strip in Studio Mode */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-sky-600" />
                  <span>원소 선택 슬라이더 (1~30번 원소를 클릭하여 즉시 변경)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  현재 선택: <strong className="text-slate-800">{selectedElement.atomicNumber}번 {selectedElement.nameKo} ({selectedElement.symbol})</strong>
                </span>
              </div>

              {/* Horizontal Pill Bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
                {PERIODIC_TABLE_1_30.map((el) => {
                  const isSelected = el.atomicNumber === selectedElement.atomicNumber;
                  const cat = CATEGORY_LABELS[el.category];
                  return (
                    <button
                      key={el.atomicNumber}
                      type="button"
                      onClick={() => setSelectedElement(el)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 font-bold bg-white text-slate-900 shadow-sm scale-105 z-10'
                          : 'bg-white/80 hover:bg-white text-slate-600'
                      }`}
                      style={{
                        borderColor: isSelected ? cat.color : cat.border,
                      }}
                    >
                      <span className="font-mono text-[10px] text-slate-400">{el.atomicNumber}</span>
                      <span className="font-bold text-sm" style={{ color: cat.color }}>{el.symbol}</span>
                      <span className="text-[11px] text-slate-700">{el.nameKo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Element Identity Banner */}
            <div
              className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: selectedCatInfo.bgLight,
                borderColor: selectedCatInfo.border,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl bg-white border flex flex-col items-center justify-center shadow-xs shrink-0"
                  style={{ borderColor: selectedCatInfo.border }}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400">{selectedElement.atomicNumber}</span>
                  <span className="text-3xl font-black leading-none" style={{ color: selectedCatInfo.color }}>
                    {selectedElement.symbol}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900">{selectedElement.nameKo}</h3>
                    <span className="text-sm font-semibold text-slate-500">({selectedElement.nameEn})</span>
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs ml-2"
                      style={{ backgroundColor: selectedCatInfo.color }}
                    >
                      {selectedCatInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    {selectedElement.description}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-1.5 text-right shrink-0 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                <div className="text-xs font-mono text-slate-700 font-bold">
                  원자량: {selectedElement.atomicWeight} g/mol
                </div>
                <div className="text-xs text-slate-600">
                  {selectedElement.period}주기 {selectedElement.group}족 · {selectedElement.phase === 'gas' ? '기체' : selectedElement.phase === 'liquid' ? '액체' : '고체'}
                </div>
                {matchingSubstance && (
                  <button
                    type="button"
                    onClick={handleAddSelectedToBeaker}
                    disabled={remainingCapacity <= 0}
                    className={`mt-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 ${
                      addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-98'
                    } disabled:opacity-40`}
                  >
                    {addedSuccess ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{addedSuccess ? '비커 투입 완료!' : `비커에 ${selectedElement.nameKo} 투입 (${doseAmount}mL)`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* THE EXPANDED 3-COLUMN STUDIO VISUALIZER */}
            <div className="flex-1 w-full">
              <ElementVisuals
                element={selectedElement}
                initialTab="all"
                size="large"
                layout="grid"
              />
            </div>

            {/* Bottom Comprehensive Properties Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400">전자 배치 상세</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedElement.electronConfig}</span>
                <span className="text-[11px] text-slate-500">주양자수 n=1~4 껍질별 에너지 준위</span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400">물리적 상태 & 결정 구조</span>
                <span className="font-bold text-slate-900 text-sm">
                  {getPhysicalSampleInfo(selectedElement.atomicNumber).shapeName} ({getPhysicalSampleInfo(selectedElement.atomicNumber).crystal})
                </span>
                <span className="text-[11px] text-slate-500">
                  {getPhysicalSampleInfo(selectedElement.atomicNumber).meltingPt !== undefined
                    ? `녹는점: ${getPhysicalSampleInfo(selectedElement.atomicNumber).meltingPt}°C`
                    : '상온 안정 상태'}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400">화학적 족 분류</span>
                <span className="font-bold text-slate-900 text-sm">{selectedCatInfo.label} ({selectedElement.group}족)</span>
                <span className="text-[11px] text-slate-500">{selectedElement.period}주기 전형/전이 원소</span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400">실험실 반응성 가이드</span>
                <span className="font-semibold text-sky-900 text-[11px] leading-snug">
                  {selectedElement.beakerReactivity?.reactionNote || '표준 상태에서 비활성이거나 안정한 물질입니다.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW MODE 2: SPLIT (기본 분할 화면 - Left Grid / Right Detail) */}
        {/* ========================================================= */}
        {viewMode === 'split' && (
          <div className="flex-1 overflow-hidden p-3 sm:p-5 flex flex-col lg:flex-row gap-5">
            {/* Left Column: Periodic Table Authentic Grid Layout (Periods 1 to 4) */}
            <div className={`flex-1 flex-col gap-3 min-w-0 overflow-y-auto pr-1 ${mobileTab === 'details' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
                  <span>원소 선택 격자 (1~30번 원소 지원)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  원소 카드를 클릭하면 우측에 실물 외형 및 보어 원자모형이 표시됩니다.
                </span>
              </div>

              {/* Standard Periodic Table Layout Grid */}
              <div className="overflow-x-auto pb-3">
                <div className="grid grid-cols-18 gap-1.5 min-w-[720px] text-center select-none">
                  {/* Column Group Header Indicators (1 ~ 18) */}
                  {[...Array(18)].map((_, colIdx) => (
                    <div key={colIdx} className="text-[9px] font-mono text-slate-400 font-semibold py-0.5">
                      {colIdx + 1}
                    </div>
                  ))}

                  {/* PERIOD 1: H (col 1), He (col 18) */}
                  {renderElementCell(1, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  <div className="col-span-16 h-12" />
                  {renderElementCell(2, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}

                  {/* PERIOD 2: Li, Be (cols 1-2), B, C, N, O, F, Ne (cols 13-18) */}
                  {renderElementCell(3, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(4, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  <div className="col-span-10 h-12" />
                  {renderElementCell(5, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(6, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(7, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(8, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(9, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(10, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}

                  {/* PERIOD 3: Na, Mg (cols 1-2), Al, Si, P, S, Cl, Ar (cols 13-18) */}
                  {renderElementCell(11, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(12, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  <div className="col-span-10 h-12" />
                  {renderElementCell(13, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(14, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(15, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(16, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(17, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}
                  {renderElementCell(18, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)}

                  {/* PERIOD 4: K(19) ~ Zn(30) across cols 1 to 12 */}
                  {[...Array(12)].map((_, i) => (
                    renderElementCell(19 + i, selectedElement, (el) => { setSelectedElement(el); setMobileTab('details'); }, filteredElements)
                  ))}
                  <div className="col-span-6 h-12 flex items-center justify-center text-[10px] text-slate-300 italic">
                    31~118번 생략 (1~30번 원소 지원)
                  </div>
                </div>
              </div>

              {/* Sticky preview bar to view Real Shape & Bohr Model when in Grid mode on smaller screens */}
              <div className="lg:hidden pt-1">
                <button
                  type="button"
                  onClick={() => setMobileTab('details')}
                  className="w-full p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-between shadow-md transition"
                >
                  <div className="flex items-center gap-2">
                    <Atom className="w-4 h-4" />
                    <span>선택된 {selectedElement.nameKo} ({selectedElement.symbol}) 실물 외형 · 보어 원자모형 보기</span>
                  </div>
                  <span className="text-indigo-200">상세 확인 →</span>
                </button>
              </div>

              {/* Quick Filtered Elements Pill Carousel / List */}
              <div className="mt-1 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  1~30번 전체 순서별 목록 ({filteredElements.length}개 표시)
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {filteredElements.map((el) => {
                    const isSelected = selectedElement.atomicNumber === el.atomicNumber;
                    const cat = CATEGORY_LABELS[el.category];
                    return (
                      <button
                        key={el.atomicNumber}
                        type="button"
                        onClick={() => {
                          setSelectedElement(el);
                          setMobileTab('details');
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition ${
                          isSelected
                            ? 'ring-2 ring-sky-500 font-bold bg-white text-slate-900 shadow-xs'
                            : 'hover:bg-white text-slate-600'
                        }`}
                        style={{
                          backgroundColor: isSelected ? '#ffffff' : cat.bgLight,
                          borderColor: cat.border,
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
            </div>

            {/* Right Column: Generous Detail Panel with its own independent scroll */}
            <div className={`w-full lg:w-[480px] xl:w-[540px] 2xl:w-[600px] shrink-0 bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 flex flex-col gap-3.5 shadow-xs overflow-y-auto ${mobileTab === 'grid' ? 'hidden lg:flex' : 'flex'}`}>
              {/* Mobile return to grid link */}
              <div className="lg:hidden flex items-center justify-between pb-1 border-b border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setMobileTab('grid')}
                  className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>← 주기율표 격자 보기로 돌아가기</span>
                </button>
                <span className="text-[11px] text-slate-400 font-medium">원소 번호 {selectedElement.atomicNumber}번</span>
              </div>

              {/* Top Identity Block */}
              <div
                className="p-3.5 rounded-2xl border flex items-start justify-between shadow-xs"
                style={{
                  backgroundColor: selectedCatInfo.bgLight,
                  borderColor: selectedCatInfo.border,
                }}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    원자번호 {selectedElement.atomicNumber}
                  </span>
                  <span
                    className="text-4xl font-black tracking-tight mt-0.5"
                    style={{ color: selectedCatInfo.color }}
                  >
                    {selectedElement.symbol}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-base font-bold text-slate-800">{selectedElement.nameKo}</span>
                    <span className="text-xs text-slate-500 font-medium">({selectedElement.nameEn})</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: selectedCatInfo.color }}
                  >
                    {selectedCatInfo.label}
                  </span>
                  <span className="text-xs font-mono text-slate-600 font-semibold mt-1">
                    {selectedElement.atomicWeight} g/mol
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedElement.phase === 'gas' ? '기체 (Gas)' : '고체 (Solid)'}
                  </span>
                </div>
              </div>

              {/* Quick Expand Button into Full Studio */}
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-between shadow-sm transition"
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>원소 외형 & 원자모형 대화면으로 확대하기</span>
                </div>
                <span className="text-[11px] text-sky-200">대화면 뷰 →</span>
              </button>

              {/* Element Shape & Atomic Model Interactive Visualizer */}
              <ElementVisuals
                element={selectedElement}
                initialTab="all"
                size="normal"
                onExpand={() => setViewMode('studio')}
              />

              {/* Spec Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">주기 / 족</span>
                  <span className="font-bold text-slate-800">
                    {selectedElement.period}주기 {selectedElement.group}족
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">전자 배치</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] truncate">
                    {selectedElement.electronConfig}
                  </span>
                </div>
              </div>

              {/* Chemical Characteristics & Scientific Note */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs flex flex-col gap-1.5">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  원소 특성 및 설명
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedElement.description}
                </p>

                {selectedElement.beakerReactivity?.reactionNote && (
                  <div className="mt-1 pt-2 border-t border-slate-100 flex flex-col gap-0.5 text-[11px] text-sky-800 bg-sky-50/70 p-2 rounded-lg">
                    <span className="font-bold text-sky-900">💡 실험 반응성:</span>
                    <span>{selectedElement.beakerReactivity.reactionNote}</span>
                  </div>
                )}
              </div>

              {/* Add to Beaker Action (if matching substance exists in lab) */}
              {matchingSubstance ? (
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">투입 용량</span>
                    <div className="flex items-center gap-1">
                      {[10, 25, 50].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDoseAmount(amt)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            doseAmount === amt
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {amt}mL
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSelectedToBeaker}
                    disabled={remainingCapacity <= 0}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 ${
                      addedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-98'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>비커에 {selectedElement.nameKo} 투입 완료!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>비커에 {selectedElement.nameKo} {Math.min(doseAmount, remainingCapacity)}mL 투입하기</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-100 rounded-xl text-center text-[11px] text-slate-400">
                  이 원소는 기체이거나 비커 실험 시약 단체로 지정되지 않은 원소입니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW MODE 3: TABLE (주기율표 와이드 전체 뷰)              */}
        {/* ========================================================= */}
        {viewMode === 'table' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">
                주기율표 18족 와이드 전체 보기 (1~30번 원소)
              </span>
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>선택된 {selectedElement.nameKo} 대화면 모형 보기 →</span>
              </button>
            </div>

            {/* Expanded Table Grid */}
            <div className="overflow-x-auto pb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-18 gap-2 min-w-[900px] text-center select-none">
                {[...Array(18)].map((_, colIdx) => (
                  <div key={colIdx} className="text-[10px] font-mono text-slate-500 font-bold py-1">
                    {colIdx + 1}
                  </div>
                ))}

                {/* PERIOD 1 */}
                {renderElementCell(1, selectedElement, setSelectedElement, filteredElements)}
                <div className="col-span-16 h-14" />
                {renderElementCell(2, selectedElement, setSelectedElement, filteredElements)}

                {/* PERIOD 2 */}
                {renderElementCell(3, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(4, selectedElement, setSelectedElement, filteredElements)}
                <div className="col-span-10 h-14" />
                {renderElementCell(5, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(6, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(7, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(8, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(9, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(10, selectedElement, setSelectedElement, filteredElements)}

                {/* PERIOD 3 */}
                {renderElementCell(11, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(12, selectedElement, setSelectedElement, filteredElements)}
                <div className="col-span-10 h-14" />
                {renderElementCell(13, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(14, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(15, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(16, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(17, selectedElement, setSelectedElement, filteredElements)}
                {renderElementCell(18, selectedElement, setSelectedElement, filteredElements)}

                {/* PERIOD 4 */}
                {[...Array(12)].map((_, i) => (
                  renderElementCell(19 + i, selectedElement, setSelectedElement, filteredElements)
                ))}
                <div className="col-span-6 h-14 flex items-center justify-center text-xs text-slate-400 italic">
                  31~118번 생략 (1~30번 원소 지원)
                </div>
              </div>
            </div>

            {/* Quick Preview Bottom Drawer */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center font-bold shrink-0"
                  style={{ color: selectedCatInfo.color }}
                >
                  <span className="text-[10px] text-slate-400">{selectedElement.atomicNumber}</span>
                  <span className="text-2xl font-black">{selectedElement.symbol}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{selectedElement.nameKo} ({selectedElement.nameEn})</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ backgroundColor: selectedCatInfo.color }}
                    >
                      {selectedCatInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                    {selectedElement.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('studio')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>실물 외형 & 보어 원자모형 대화면 보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  분할 뷰로 열기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="hidden sm:inline">1번 수소(H)부터 30번 아연(Zn)까지 주기 및 족 배치가 완벽하게 정렬되어 있습니다.</span>
            <span className="sm:hidden">1~30번 원소 지원</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to render an element block in the periodic table grid
function renderElementCell(
  atomicNumber: number,
  selectedElement: ElementData,
  setSelectedElement: (el: ElementData) => void,
  filteredElements: ElementData[]
) {
  const el = PERIODIC_TABLE_1_30.find((e) => e.atomicNumber === atomicNumber);
  if (!el) return <div key={atomicNumber} className="h-12" />;

  const isSelected = selectedElement.atomicNumber === el.atomicNumber;
  const isMatchFilter = filteredElements.some((e) => e.atomicNumber === el.atomicNumber);
  const cat = CATEGORY_LABELS[el.category];
  const sample = getPhysicalSampleInfo(el.atomicNumber);

  return (
    <button
      key={el.atomicNumber}
      type="button"
      onClick={() => setSelectedElement(el)}
      className={`h-12 sm:h-13 p-1 rounded-lg border flex flex-col justify-between transition group active:scale-95 relative ${
        isSelected
          ? 'ring-2 ring-sky-500 shadow-md z-10 scale-105'
          : 'hover:scale-102 hover:shadow-xs'
      } ${!isMatchFilter ? 'opacity-25 grayscale' : ''}`}
      style={{
        backgroundColor: isSelected ? '#ffffff' : cat.bgLight,
        borderColor: isSelected ? '#0284c7' : cat.border,
      }}
      title={`${el.atomicNumber}. ${el.nameKo} (${el.symbol}) - ${cat.label} / 외형: ${sample.shapeName}`}
    >
      <div className="flex items-center justify-between w-full leading-none">
        <span className="text-[8.5px] font-mono text-slate-500 font-medium">
          {el.atomicNumber}
        </span>
        <span className="text-[7.5px] text-slate-400 font-sans truncate ml-0.5">
          {el.nameKo.slice(0, 3)}
        </span>
      </div>

      <div
        className="text-sm font-extrabold tracking-tight leading-none"
        style={{ color: cat.color }}
      >
        {el.symbol}
      </div>

      <div className="flex items-center justify-between w-full leading-none text-[7px] font-mono text-slate-400">
        <span className="truncate">{el.atomicWeight.toFixed(1)}</span>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: sample.glowColor }}
          title={sample.shapeName}
        />
      </div>
    </button>
  );
}
