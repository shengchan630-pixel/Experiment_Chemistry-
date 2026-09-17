import React from 'react';
import { X, BookOpen, Flame, Layers, FlaskConical, Utensils, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScienceGuideCard({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col gap-5 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                산화 칼슘 발열 라면 조리 과학 원리
              </h2>
              <p className="text-xs text-slate-500">
                화학 발열 반응, 2중 용기 열전도 메커니즘, 화학양론적 열역학
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Chemical Reaction Section */}
        <div className="flex flex-col gap-2 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>1. 생석회(산화 칼슘)의 수화 발열 반응</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-amber-200 font-mono text-center text-xs sm:text-sm font-bold text-slate-800">
            CaO(s) + H₂O(l) → Ca(OH)₂(s) + 63.7 kJ/mol
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            산화 칼슘(생석회)에 물을 부으면 수산화 칼슘(소석회)으로 변하는 강력한 발열 수화 반응이 일어납니다.
            생석회 1g당 약 <strong>1,136 J</strong>의 열량이 발생하며, 반응 부위 온도가 순식간에 100°C 이상으로 치솟아
            불이나 전기 없이도 물을 끓일 수 있는 <strong>전투식량 / 발열 도시락</strong>의 핵심 원리입니다.
          </p>
        </div>

        {/* 2. Container Materials & Heat Transfer */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>2. 3대 용기 재질별 열전도율(k) 및 열역학적 특성</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <strong className="text-sky-600">알루미늄 (k ≈ 205 W/m·K)</strong>
              <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                열전도율이 매우 높아 발열부의 열을 라면 국물로 즉시 전달하여 초고속으로 물을 끓이지만, 외부로의 방열 손실도 상대적으로 큽니다.
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <strong className="text-slate-700">스테인리스강 (k ≈ 16 W/m·K)</strong>
              <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                균형 잡힌 열전도율과 강력한 내식성, 견고한 내구성으로 실생활 캠핑 및 취사용 냄비로 가장 널리 사용되는 표준 재질입니다.
              </p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <strong className="text-cyan-600">내열 유리 (k ≈ 1.2 W/m·K)</strong>
              <p className="text-slate-600 text-[11px] mt-1 leading-snug">
                붕규산 내열유리로 투명하게 내부 화학 반응을 관찰할 수 있으며, 열전도율이 낮아 보온 및 외벽 단열 효과가 뛰어납니다.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Stoichiometry & Water Ratio */}
        <div className="flex flex-col gap-2 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            <span>3. 화학 양론적 물-산화 칼슘 비율과 온도의 영향</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            - <strong>화학 양론비:</strong> 산화 칼슘 56g당 물 18g(약 0.32mL/g)이 완전히 소모됩니다.
            <br />
            - <strong>최적 비율 (1.2 ~ 1.5 mL/g):</strong> 실제 발열팩에서는 열 전달 매개체와 증기 생성을 위해 화학양론비보다 약간 많은 양의 물을 넣습니다.
            <br />
            - <strong>과잉수 투입 시:</strong> 물은 비열이 매우 큰 물질(4.184 J/g·°C)이므로, 너무 많은 물을 넣으면 발열 반응 에너지가 물 자체를 데우는 데 낭비되어 최고 도달 온도가 낮아집니다.
            <br />
            - <strong>산화 칼슘 질량 증가:</strong> CaO 양이 많을수록 방출되는 총 열량이 커져 100°C 끓는점에 신속히 도달하고 고온 상태가 오래 유지됩니다.
          </p>
        </div>

        {/* 4. Ramen Starch Gelatinization */}
        <div className="flex flex-col gap-2 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
            <Utensils className="w-4 h-4 text-purple-600" />
            <span>4. 라면 면발의 호화(Gelatinization) 조건</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            라면 면발의 밀가루 전분이 물과 열을 흡수하여 부드럽고 쫄깃하게 익는 현상을 <strong>호화(Gelatinization)</strong>라고 합니다.
            전분의 호화는 <strong>85°C 이상</strong>의 온도에서 활발하게 진행되며, 95~100°C에서 완전히 익어 맛있는 라면이 완성됩니다.
          </p>
        </div>

        {/* 5. Why Temperature Caps at 50°C (Thermodynamics & Heat Deficit) */}
        <div className="flex flex-col gap-2 p-3.5 bg-rose-50/70 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>5. 왜 발열제(반응물)가 부족하면 라면수가 50°C에서 멈출까?</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-rose-200 font-mono text-center text-xs font-bold text-slate-800">
            Q = m · c · ΔT (열량 = 질량 × 비열 × 온도변화)
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            • <strong>비등 필요 열량:</strong> 350mL(350g)의 상온(20°C) 물을 100°C까지 끓이려면 약 <strong>117 kJ</strong>(용기 가열 및 공기 방열 손실 포함 시 약 140 kJ)의 열이 필요합니다.
            <br />
            • <strong>반응물 부족(예: CaO 55~65g):</strong> 방출 가능한 총 열량이 약 <strong>70~80 kJ</strong>에 불과합니다. 필요 열량의 50~60%만 공급되므로 물 온도가 <strong>약 50°C에 도달하는 순간 반응물이 모두 소모</strong>되어 온도가 더 이상 올라가지 못하고 멈춥니다!
            <br />
            • <strong>해결책:</strong> 산화 칼슘(CaO) 질량을 <strong>115g ~ 130g</strong>으로 늘려주면 140 kJ 이상의 열이 공급되어 라면수가 100°C 비등점까지 힘차게 상승합니다.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
