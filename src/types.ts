export type SubstanceCategory = 'solvent' | 'acid_base' | 'indicator' | 'salt' | 'element';

export interface Substance {
  id: string;
  name: string;
  formula: string;
  category: SubstanceCategory;
  color: string; // Base solution tint
  opacity: number;
  description: string;
  atomicNumber?: number;
  // Ionic concentrations per mL (arbitrary unit for simulation, e.g. 1 unit = 0.05 mmol)
  ions?: {
    H?: number;
    OH?: number;
    HCO3?: number;
    Cl?: number;
    Na?: number;
    Ag?: number;
    NO3?: number;
    Cu?: number;
    SO4?: number;
    Pb?: number;
    I?: number;
    Fe?: number;
    SCN?: number;
  };
  elemental?: {
    element: 'Na' | 'Mg' | 'Ca' | 'Fe' | 'Cu' | 'Zn' | 'K' | 'C' | 'S';
    massPerUnit: number;
  };
  indicatorType?: 'phenolphthalein' | 'btb';
}

export interface AddedSubstance {
  substanceId: string;
  volume: number; // in mL
}

export interface PrecipitateInfo {
  id: string;
  name: string;
  formula: string;
  color: string;
  amount: number; // in relative units
  description: string;
}

export interface ReactionEvent {
  id: string;
  title: string;
  equation: string;
  type: 'neutralization' | 'precipitation' | 'gas' | 'complex' | 'color_change';
  description: string;
  timestamp: number;
}

export interface ChemistryState {
  totalVolume: number;
  pH: number;
  temperature: number; // in Celsius
  liquidColor: string;
  liquidOpacity: number;
  turbidity: number; // 0 (clear) to 1 (opaque precipitate)
  precipitates: PrecipitateInfo[];
  isFizzing: boolean;
  fizzIntensity: number; // 0 to 1
  recentReactions: ReactionEvent[];
  dominantName: string;
}

export const SUBSTANCES: Substance[] = [
  // 용매 (Solvent)
  {
    id: 'water',
    name: '증류수',
    formula: 'H₂O',
    category: 'solvent',
    color: '#38bdf8',
    opacity: 0.35,
    description: '순수한 증류수 (중성, 희석용 용매)',
  },

  // 산 / 염기 (Acids & Bases)
  {
    id: 'hcl',
    name: '묽은 염산',
    formula: 'HCl (0.5M)',
    category: 'acid_base',
    color: '#e2e8f0',
    opacity: 0.3,
    description: '강산성 수용액 (H⁺ 및 Cl⁻ 이온 공급)',
    ions: { H: 1.0, Cl: 1.0 },
  },
  {
    id: 'naoh',
    name: '수산화나트륨',
    formula: 'NaOH (0.5M)',
    category: 'acid_base',
    color: '#e2e8f0',
    opacity: 0.3,
    description: '강염기성 수용액 (Na⁺ 및 OH⁻ 이온 공급)',
    ions: { Na: 1.0, OH: 1.0 },
  },
  {
    id: 'nahco3',
    name: '탄산수소나트륨',
    formula: 'NaHCO₃',
    category: 'acid_base',
    color: '#e2e8f0',
    opacity: 0.35,
    description: '산과 반응하여 CO₂ 기포를 발생시키는 베이킹소다 수용액',
    ions: { Na: 0.8, HCO3: 0.8 },
  },

  // 지시약 (Indicators)
  {
    id: 'phenolphthalein',
    name: '페놀프탈레인',
    formula: 'C₂₀H₁₄O₄',
    category: 'indicator',
    color: '#f8fafc',
    opacity: 0.25,
    description: '산성/중성에서는 무색, 염기성(pH>8.2)에서 선명한 붉은 자주색',
    indicatorType: 'phenolphthalein',
  },
  {
    id: 'btb',
    name: 'BTB 용액',
    formula: 'Bromothymol Blue',
    category: 'indicator',
    color: '#22c55e',
    opacity: 0.7,
    description: '산성: 노란색, 중성: 초록색, 염기성: 파란색으로 변하는 지시약',
    indicatorType: 'btb',
  },

  // 무기염 / 침전 및 착화 반응 시약 (Salts & Transition metals)
  {
    id: 'cuso4',
    name: '황산구리(II) 수용액',
    formula: 'CuSO₄',
    category: 'salt',
    color: '#0284c7',
    opacity: 0.75,
    description: '선명한 푸른색. NaOH와 만나면 청록색 수산화구리 침전 형성',
    ions: { Cu: 0.8, SO4: 0.8 },
  },
  {
    id: 'agno3',
    name: '질산은 수용액',
    formula: 'AgNO₃',
    category: 'salt',
    color: '#f1f5f9',
    opacity: 0.3,
    description: '무색 투명. 염소 이온(Cl⁻)과 만나면 흰색 염화은(AgCl) 앙금 침전',
    ions: { Ag: 0.8, NO3: 0.8 },
  },
  {
    id: 'ki',
    name: '요오드화칼륨 수용액',
    formula: 'KI',
    category: 'salt',
    color: '#f8fafc',
    opacity: 0.25,
    description: '무색 투명. 납 이온(Pb²⁺)과 만나면 황금빛 요오드화납(PbI₂) 침전',
    ions: { I: 0.8 },
  },
  {
    id: 'pbno32',
    name: '질산납 수용액',
    formula: 'Pb(NO₃)₂',
    category: 'salt',
    color: '#f8fafc',
    opacity: 0.3,
    description: '무색 투명. I⁻와 반응하여 황금빛 노란색 앙금(골든 레인) 형성',
    ions: { Pb: 0.4, NO3: 0.8 },
  },
  {
    id: 'fecl3',
    name: '염화철(III) 수용액',
    formula: 'FeCl₃',
    category: 'salt',
    color: '#d97706',
    opacity: 0.75,
    description: '황갈색 용액. KSCN과 만나면 핏빛 붉은색 착이온 형성, Cl⁻ 포함',
    ions: { Fe: 0.6, Cl: 1.8 },
  },
  {
    id: 'kscn',
    name: '티오시안산칼륨',
    formula: 'KSCN',
    category: 'salt',
    color: '#f8fafc',
    opacity: 0.3,
    description: '무색 투명. Fe³⁺와 반응하여 선명한 혈적색 착물 [Fe(SCN)]²⁺ 형성',
    ions: { SCN: 0.8 },
  },

  // 원소 단체 (Periodic Table Elements 1~30)
  {
    id: 'na_metal',
    name: '나트륨 금속 조각',
    formula: 'Na (원자번호 11)',
    category: 'element',
    color: '#cbd5e1',
    opacity: 0.85,
    atomicNumber: 11,
    description: '물과 격렬히 반응하여 수소(H₂) 기체를 내뿜고 수산화나트륨(강염기)을 생성합니다.',
    elemental: { element: 'Na', massPerUnit: 1.0 },
  },
  {
    id: 'mg_ribbon',
    name: '마그네슘 리본',
    formula: 'Mg (원자번호 12)',
    category: 'element',
    color: '#94a3b8',
    opacity: 0.9,
    atomicNumber: 12,
    description: '산(HCl)과 반응하여 격렬하게 수소(H₂) 기포를 발생시키는 가벼운 금속입니다.',
    elemental: { element: 'Mg', massPerUnit: 1.0 },
  },
  {
    id: 'ca_metal',
    name: '칼슘 과립',
    formula: 'Ca (원자번호 20)',
    category: 'element',
    color: '#cbd5e1',
    opacity: 0.85,
    atomicNumber: 20,
    description: '물과 반응하여 수소 기포가 발생하고 불용성 수산화칼슘 석회수로 뿌옇게 변합니다.',
    elemental: { element: 'Ca', massPerUnit: 1.0 },
  },
  {
    id: 'fe_metal',
    name: '철 분말 / 못',
    formula: 'Fe (원자번호 26)',
    category: 'element',
    color: '#475569',
    opacity: 0.95,
    atomicNumber: 26,
    description: '황산구리(CuSO₄) 용액과 반응하여 붉은 구리를 표면에 석출시키고 용액을 탈색합니다.',
    elemental: { element: 'Fe', massPerUnit: 1.0 },
  },
  {
    id: 'cu_metal',
    name: '구리 조각 / 리본',
    formula: 'Cu (원자번호 29)',
    category: 'element',
    color: '#b45309',
    opacity: 0.95,
    atomicNumber: 29,
    description: '질산은(AgNO₃) 용액과 반응하여 은(Ag) 결정을 석출시키고 푸른색 Cu²⁺를 방출합니다.',
    elemental: { element: 'Cu', massPerUnit: 1.0 },
  },
  {
    id: 'zn_metal',
    name: '아연 조각 / 판',
    formula: 'Zn (원자번호 30)',
    category: 'element',
    color: '#64748b',
    opacity: 0.9,
    atomicNumber: 30,
    description: '염산(HCl)과 만나면 Zn + 2HCl → ZnCl₂ + H₂↑ 수소 기포를 왕성하게 발생시킵니다.',
    elemental: { element: 'Zn', massPerUnit: 1.0 },
  },
  {
    id: 'c_powder',
    name: '활성탄 흑연 분말',
    formula: 'C (원자번호 6)',
    category: 'element',
    color: '#1e293b',
    opacity: 0.95,
    atomicNumber: 6,
    description: '탄소 동소체 흑연/활성탄 분말로 용액 내 색소 물질을 물리적으로 흡착합니다.',
    elemental: { element: 'C', massPerUnit: 1.0 },
  },
  {
    id: 's_powder',
    name: '황 분말',
    formula: 'S (원자번호 16)',
    category: 'element',
    color: '#eab308',
    opacity: 0.9,
    atomicNumber: 16,
    description: '선명한 노란색의 황 고체 분말로 물에 녹지 않고 바닥에 노랗게 가라앉습니다.',
    elemental: { element: 'S', massPerUnit: 1.0 },
  },
];

