export type ContainerMaterial = 'aluminum' | 'stainless' | 'heat_resistant_glass';

export interface MaterialProperty {
  id: ContainerMaterial;
  nameKo: string;
  nameEn: string;
  thermalConductivity: number; // W/(m·K)
  specificHeat: number; // J/(g·K)
  density: number; // g/cm³
  description: string;
  pros: string;
  cons: string;
  color: string;
  accentColor: string;
  outerLossFactor: number; // Heat loss factor to ambient
  innerTransferFactor: number; // Heat transfer factor from outer bath to inner food
}

export const CONTAINER_MATERIALS: Record<ContainerMaterial, MaterialProperty> = {
  aluminum: {
    id: 'aluminum',
    nameKo: '알루미늄',
    nameEn: 'Aluminum',
    thermalConductivity: 205, // 매우 높음
    specificHeat: 0.90,
    density: 2.7,
    description: '열전도율이 매우 높아 열을 순식간에 전달하지만 외벽으로의 방열 손실도 큽니다.',
    pros: '초고속 열전달, 가벼운 무게, 신속한 가열',
    cons: '외벽 방열 손실 큼, 보온성 낮음',
    color: '#94a3b8',
    accentColor: '#38bdf8',
    outerLossFactor: 1.45,
    innerTransferFactor: 1.6,
  },
  stainless: {
    id: 'stainless',
    nameKo: '스테인리스강',
    nameEn: 'Stainless Steel',
    thermalConductivity: 16, // 중간
    specificHeat: 0.50,
    density: 7.9,
    description: '균형 잡힌 열전도성과 강한 내식성, 견고한 내구성으로 표준 조리 용기로 널리 사용됩니다.',
    pros: '균일한 열전달, 우수한 내구성 및 내식성',
    cons: '알루미늄보다 느린 초기 열전도',
    color: '#cbd5e1',
    accentColor: '#64748b',
    outerLossFactor: 1.0,
    innerTransferFactor: 1.0,
  },
  heat_resistant_glass: {
    id: 'heat_resistant_glass',
    nameKo: '내열 유리',
    nameEn: 'Heat-Resistant Glass',
    thermalConductivity: 1.2, // 붕규산 내열유리 (낮음, 단열/보온)
    specificHeat: 0.84,
    density: 2.23,
    description: '붕규산 내열유리로 투명하게 내부 반응을 관찰할 수 있으며, 열전도율이 낮아 보온·단열성이 우수합니다.',
    pros: '탁월한 외벽 단열 보온성, 투명한 반응 관찰',
    cons: '금속 재질 대비 완만한 열전달 속도',
    color: '#bae6fd',
    accentColor: '#0284c7',
    outerLossFactor: 0.45, // 외벽 열손실 적음
    innerTransferFactor: 0.68, // 열전달 완만함 (충분한 시간 후 100°C 도달)
  },
};

export interface AltitudePreset {
  id: string;
  nameKo: string;
  altitude: number; // m
  locationDesc: string;
  expectedBoilingPt: number; // °C
}

export const ALTITUDE_PRESETS: AltitudePreset[] = [
  {
    id: 'sea_level',
    nameKo: '해수면 평지 (0m)',
    altitude: 0,
    locationDesc: '표준 대기압 (1013 hPa) 환경',
    expectedBoilingPt: 100.0,
  },
  {
    id: 'hallasan',
    nameKo: '한라산 백록담 (1,950m)',
    altitude: 1950,
    locationDesc: '기압 약 802 hPa, 등산 취사 환경',
    expectedBoilingPt: 93.4,
  },
  {
    id: 'baekdusan',
    nameKo: '백두산 장군봉 (2,744m)',
    altitude: 2744,
    locationDesc: '기압 약 728 hPa, 고산 저기압',
    expectedBoilingPt: 90.7,
  },
  {
    id: 'tibet',
    nameKo: '티베트 라사 고원 (3,650m)',
    altitude: 3650,
    locationDesc: '기압 약 649 hPa, 물이 90도 아래서 비등',
    expectedBoilingPt: 87.8,
  },
  {
    id: 'everest_bc',
    nameKo: '에베레스트 베이스캠프 (5,364m)',
    altitude: 5364,
    locationDesc: '기압 약 528 hPa, 면의 전분 호화 저해',
    expectedBoilingPt: 82.5,
  },
  {
    id: 'everest_summit',
    nameKo: '에베레스트 정상 (8,848m)',
    altitude: 8848,
    locationDesc: '기압 약 337 hPa (1/3 기압), 물이 71도에서 끓음',
    expectedBoilingPt: 71.2,
  },
];

export interface AmbientPreset {
  id: string;
  nameKo: string;
  temperature: number; // °C
  icon: string;
  description: string;
}

export const AMBIENT_PRESETS: AmbientPreset[] = [
  {
    id: 'winter_freeze',
    nameKo: '혹한기 동계 설산 (-15°C)',
    temperature: -15,
    icon: '❄️',
    description: '외벽을 통한 대류/전도 열손실이 극심한 환경',
  },
  {
    id: 'late_autumn',
    nameKo: '쌀쌀한 늦가을 야외 (5°C)',
    temperature: 5,
    icon: '🍂',
    description: '서늘한 야외 캠핑 환경',
  },
  {
    id: 'room_temp',
    nameKo: '실내 표준 상온 (20°C)',
    temperature: 20,
    icon: '🏠',
    description: '온화하고 안정된 일반 실내 조건',
  },
  {
    id: 'summer_heat',
    nameKo: '한여름 무더위 (35°C)',
    temperature: 35,
    icon: '☀️',
    description: '외부 방열이 억제되어 열이 내부에 집중되는 환경',
  },
];

export type NoodleState =
  | 'raw' // 0~30% 딱딱함
  | 'firm' // 30~65% 꼬들꼬들 (알덴테)
  | 'perfect' // 65~90% 쫄깃하게 최적 조리
  | 'soft' // 90~100% 푹 익음
  | 'overcooked' // 100%+ 퍼짐
  | 'undercooked_altitude'; // 고산지대 저기압으로 인해 끓는점이 85도 미만이라 전분이 충분히 호화되지 못해 설익음

export interface NoodleInfo {
  state: NoodleState;
  label: string;
  description: string;
  color: string;
  progressPercent: number; // 0 ~ 100%
  chewinessScore: number; // 0 ~ 100
}

export interface SimulationParams {
  // Container material (Unified)
  containerMaterial: ContainerMaterial;

  // Environment
  altitude: number; // m (0 ~ 9000)
  ambientTemp: number; // °C (-20 ~ 45)

  // Outer Chamber Reagents (CaO + H2O)
  caoMass: number; // g (20 ~ 160)
  outerWaterVolume: number; // mL (30 ~ 220)

  // Inner Chamber Food
  innerWaterVolume: number; // mL (250 ~ 500)
  noodleMass: number; // g (default 110)
  hasBrothFlakes: boolean;
}

export interface SimulationStepState {
  timeSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;

  // Outer Chamber
  outerTemp: number; // °C
  caoConsumedPercent: number; // 0 ~ 100%
  reactionRate: number; // J/s generated
  slakedLimeProducedGrams: number; // g of Ca(OH)2
  isOuterBoiling: boolean;
  outerSteamIntensity: number; // 0 ~ 1

  // Inner Chamber
  innerTemp: number; // °C
  boilingPoint: number; // °C at current altitude
  atmosphericPressureKPa: number; // kPa
  isInnerSimmering: boolean;
  isInnerBoiling: boolean;
  innerSteamIntensity: number; // 0 ~ 1

  // Noodle status
  noodleInfo: NoodleInfo;

  // Thermodynamics rates
  heatTransferRate: number; // W (from outer to inner)
  heatLossRate: number; // W (from outer to ambient)

  // History log for chart (sampled every second)
  history: Array<{
    time: number;
    outerTemp: number;
    innerTemp: number;
    boilingPt: number;
    noodleProgress: number;
  }>;
}
