import {
  CONTAINER_MATERIALS,
  ContainerMaterial,
  NoodleInfo,
  NoodleState,
  SimulationParams,
  SimulationStepState,
} from '../types/ramenExperiment';

/**
 * Calculate atmospheric pressure from altitude (m)
 * Using International Standard Atmosphere barometric formula
 */
export function calculatePressureKPa(altitudeMeters: number): number {
  const h = Math.max(0, Math.min(10000, altitudeMeters));
  // P = P0 * (1 - 2.25577e-5 * h)^5.25588
  const ratio = 1 - 2.25577e-5 * h;
  const clampedRatio = Math.max(0.01, ratio);
  return 101.325 * Math.pow(clampedRatio, 5.25588);
}

/**
 * Calculate boiling point of water (°C) from atmospheric pressure (kPa)
 * Using Antoine Equation for water
 */
export function calculateBoilingPoint(pressureKPa: number): number {
  // Pressure in mmHg: 1 kPa = 7.50062 mmHg
  const pMmHg = Math.max(10, pressureKPa * 7.50062);
  // Antoine constants for water (1 to 100°C): A=8.07131, B=1730.63, C=233.426
  const logP = Math.log10(pMmHg);
  const tempC = 1730.63 / (8.07131 - logP) - 233.426;
  return Math.round(tempC * 10) / 10;
}

/**
 * Compute the stoichiometric optimal water for given CaO mass
 * CaO + H2O -> Ca(OH)2
 * 56.08g CaO reacts with 18.02g H2O (0.321 mL/g)
 * In actual flameless heaters, 0.65~0.75x water is optimal:
 * provides enough water for complete hydration + steaming without creating an excessive cold thermal sink
 */
export function getRecommendedOuterWater(caoMassGrams: number): {
  minStoichiometric: number;
  recommended: number;
  maxEffective: number;
} {
  const minStoichiometric = Math.round(caoMassGrams * 0.321);
  const recommended = Math.round(caoMassGrams * 0.68);
  const maxEffective = Math.round(caoMassGrams * 1.3);
  return { minStoichiometric, recommended, maxEffective };
}

export interface EnergySufficiency {
  availableHeatKJ: number;
  requiredHeatKJ: number;
  sufficiencyPercent: number;
  projectedMaxTemp: number;
  status: 'insufficient' | 'marginal' | 'optimal';
  headline: string;
  detail: string;
}

/**
 * Real-time thermodynamic energy balance calculation:
 * Shows whether CaO reactant mass is physically sufficient to boil the inner ramen water
 */
export function calculateEnergySufficiency(
  caoMassGrams: number,
  outerWaterVolume: number,
  innerWaterVolume: number,
  ambientTemp: number,
  boilingPt: number = 100
): EnergySufficiency {
  // Commercial active quicklime heating pack enthalpy ~ 1550 J/g
  const availableHeatJoules = caoMassGrams * 1550;
  const deltaT = Math.max(5, boilingPt - ambientTemp);
  const innerHeatNeeded = (innerWaterVolume * 4.184 + 110 * 1.8 + 35 * 0.9) * deltaT;
  const outerHeatNeeded = (outerWaterVolume * 4.184 + caoMassGrams * 1.2 + 45 * 1.6) * deltaT * 0.35;
  const ambientLossEstimate = 14000; // estimated unavoidable loss through insulated walls
  const totalHeatNeeded = innerHeatNeeded + outerHeatNeeded + ambientLossEstimate;

  const sufficiencyPercent = Math.min(200, Math.round((availableHeatJoules / totalHeatNeeded) * 100));

  // Projected max temperature inner water can realistically reach
  const maxRise = (availableHeatJoules / (innerWaterVolume * 4.184 + 110 * 1.8 + outerWaterVolume * 2.2)) * 0.90;
  const projectedMaxTemp = Math.min(boilingPt, Math.round((ambientTemp + maxRise) * 10) / 10);

  if (sufficiencyPercent < 75 || projectedMaxTemp < 65) {
    return {
      availableHeatKJ: Math.round(availableHeatJoules / 100) / 10,
      requiredHeatKJ: Math.round(totalHeatNeeded / 100) / 10,
      sufficiencyPercent,
      projectedMaxTemp,
      status: 'insufficient',
      headline: '발열량 부족 (최고 50~60°C 한계)',
      detail: `생석회(CaO ${caoMassGrams}g)의 발열량(${Math.round(availableHeatJoules / 1000)}kJ)이 라면수 350mL 비등 필요 열량(${Math.round(totalHeatNeeded / 1000)}kJ)에 미치지 못하여 약 ${projectedMaxTemp}°C까지만 오르고 멈춥니다. 110g 이상으로 증량하면 100°C까지 끓습니다.`,
    };
  }

  if (sufficiencyPercent < 95 || projectedMaxTemp < boilingPt - 2) {
    return {
      availableHeatKJ: Math.round(availableHeatJoules / 100) / 10,
      requiredHeatKJ: Math.round(totalHeatNeeded / 100) / 10,
      sufficiencyPercent,
      projectedMaxTemp,
      status: 'marginal',
      headline: '간당간당한 발열량 (약 85~95°C)',
      detail: `비등점 직전까지 도달하나 충분히 강하게 끓어오르지 못할 수 있습니다. 완벽한 조리를 위해 CaO를 조금 더 추가해보세요.`,
    };
  }

  return {
    availableHeatKJ: Math.round(availableHeatJoules / 100) / 10,
    requiredHeatKJ: Math.round(totalHeatNeeded / 100) / 10,
    sufficiencyPercent,
    projectedMaxTemp,
    status: 'optimal',
    headline: '조리 발열량 충분 (100°C 비등 완숙)',
    detail: `열량이 충분하여 라면수가 비등점(${boilingPt}°C)까지 힘차게 끓어오르며 면이 완벽하게 익습니다.`,
  };
}

/**
 * Determine noodle state and texture evaluation
 */
export function evaluateNoodleStatus(
  cookingProgress: number, // 0 ~ 1.5 (1.0 is 100%)
  boilingPt: number,
  maxReachedTemp: number
): NoodleInfo {
  const progressPercent = Math.min(100, Math.round(cookingProgress * 100));

  // If boiling point is too low (< 85°C), high altitude prevents complete starch gelatinization
  if (boilingPt < 85 && maxReachedTemp >= boilingPt - 1.5 && cookingProgress > 0.45) {
    return {
      state: 'undercooked_altitude',
      label: '고산지대 저기압 설익음 (심지 남음)',
      description: `기압이 낮아 물이 ${boilingPt}°C에서 끓어버려, 전분 호화에 필요한 열(85°C 이상)이 부족하여 면 중심부가 익지 않고 푸석거립니다.`,
      color: '#f59e0b',
      progressPercent,
      chewinessScore: 40,
    };
  }

  if (cookingProgress < 0.3) {
    return {
      state: 'raw',
      label: '딱딱한 생면 (미조리)',
      description: '면이 아직 수분과 열을 흡수하지 못해 딱딱한 상태입니다.',
      color: '#94a3b8',
      progressPercent,
      chewinessScore: 15,
    };
  }

  if (cookingProgress < 0.65) {
    return {
      state: 'firm',
      label: '꼬들꼬들한 면 (알 덴테)',
      description: '면발에 탄력이 살아있고 쫄깃한 식감의 꼬들면 상태입니다.',
      color: '#38bdf8',
      progressPercent,
      chewinessScore: 88,
    };
  }

  if (cookingProgress <= 0.92) {
    return {
      state: 'perfect',
      label: '쫄깃하게 잘 익음 (최고의 맛)',
      description: '면발 전체에 국물이 배어들고 전분이 완벽히 호화되어 가장 이상적인 조리 상태입니다.',
      color: '#10b981',
      progressPercent,
      chewinessScore: 100,
    };
  }

  if (cookingProgress <= 1.15) {
    return {
      state: 'soft',
      label: '부드럽게 푹 익은 면',
      description: '부드러운 식감을 선호하는 분들에게 알맞게 푹 익은 면입니다.',
      color: '#a855f7',
      progressPercent,
      chewinessScore: 72,
    };
  }

  return {
    state: 'overcooked',
    label: '불어서 퍼진 면',
    description: '수분을 과도하게 흡수하여 면발의 탄력이 사라지고 퍼진 상태입니다.',
    color: '#ef4444',
    progressPercent: 100,
    chewinessScore: 35,
  };
}

/**
 * Initialize simulation state
 */
export function createInitialSimulationState(params: SimulationParams): SimulationStepState {
  const pressureKPa = calculatePressureKPa(params.altitude);
  const boilingPt = calculateBoilingPoint(pressureKPa);

  return {
    timeSeconds: 0,
    isRunning: false,
    isCompleted: false,

    outerTemp: params.ambientTemp,
    caoConsumedPercent: 0,
    reactionRate: 0,
    slakedLimeProducedGrams: 0,
    isOuterBoiling: false,
    outerSteamIntensity: 0,

    innerTemp: params.ambientTemp,
    boilingPoint: boilingPt,
    atmosphericPressureKPa: Math.round(pressureKPa * 10) / 10,
    isInnerSimmering: false,
    isInnerBoiling: false,
    innerSteamIntensity: 0,

    noodleInfo: {
      state: 'raw',
      label: '딱딱한 생면 (미조리)',
      description: '아직 발열 반응이 시작되지 않았습니다.',
      color: '#94a3b8',
      progressPercent: 0,
      chewinessScore: 15,
    },

    heatTransferRate: 0,
    heatLossRate: 0,

    history: [
      {
        time: 0,
        outerTemp: params.ambientTemp,
        innerTemp: params.ambientTemp,
        boilingPt,
        noodleProgress: 0,
      },
    ],
  };
}

/**
 * Advance thermodynamics and reaction by dt seconds
 */
export function stepThermodynamics(
  prev: SimulationStepState,
  params: SimulationParams,
  dt: number = 1.0,
  cookingAccumulatorRef: { current: number }
): SimulationStepState {
  const mat = CONTAINER_MATERIALS[params.containerMaterial];
  const outerMat = mat;
  const innerMat = mat;

  const pressureKPa = calculatePressureKPa(params.altitude);
  const boilingPt = calculateBoilingPoint(pressureKPa);

  // Stoichiometry
  // CaO = 56.08 g/mol, H2O = 18.015 g/mol
  // Delta H = -63.7 kJ/mol CaO = 1136 J per gram of CaO
  const totalCaoGrams = params.caoMass;
  const totalWaterOuterGrams = params.outerWaterVolume; // 1 mL = 1 g

  // Available moles
  const molesCao = totalCaoGrams / 56.08;
  const molesWater = totalWaterOuterGrams / 18.015;
  const maxReactableMoles = Math.min(molesCao, molesWater);
  const maxReactableCaoGrams = maxReactableMoles * 56.08;

  // Reaction progress
  const currentConsumedFraction = prev.caoConsumedPercent / 100;
  const remainingReactableGrams = Math.max(0, maxReactableCaoGrams * (1 - currentConsumedFraction));

  // Reaction kinetics:
  // In commercial self-heating meal packs, granulated CaO with retardant porous matrix
  // provides sustained heating power over 180~250 seconds (3~4 minutes).
  // Hydration rate increases with temperature (Arrhenius), while diffusion through product layer controls the burn time.
  const tempBoost = 1.0 + Math.min(2.0, (prev.outerTemp - 20) / 32);
  const baseRateFractionPerSec = 0.0036 * tempBoost;
  const reactedGramsThisStep = Math.min(remainingReactableGrams, maxReactableCaoGrams * baseRateFractionPerSec * dt);

  const newConsumedGrams = maxReactableCaoGrams * currentConsumedFraction + reactedGramsThisStep;
  const newConsumedPercent = maxReactableCaoGrams > 0 ? Math.min(100, (newConsumedGrams / maxReactableCaoGrams) * 100) : 100;

  // Heat generated:
  // Active composite quicklime heating pack (with hydration promoter & activator) ~ 1550 J/g
  const heatGeneratedJoules = reactedGramsThisStep * 1550;
  const reactionPowerWatts = dt > 0 ? heatGeneratedJoules / dt : 0;

  // Slaked lime Ca(OH)2 produced (74.09 g / 56.08 g CaO = 1.321 g Ca(OH)2 per g CaO)
  const slakedLimeProducedGrams = Math.round(newConsumedGrams * 1.321 * 10) / 10;

  // Thermal Capacities (J/K)
  // Lightweight outdoor meal-pack containers:
  // Outer insulated casing (lightweight PP/foam shell ~45g, specific heat ~1.6)
  const outerVesselHeatCap = 45 * 1.6;
  // Water & reagent in outer chamber: liquid water 4.184 J/(g·K), CaO/Ca(OH)2 ~1.2 J/(g·K)
  const outerContentsHeatCap = totalWaterOuterGrams * 4.184 + totalCaoGrams * 1.2;
  const totalOuterHeatCap = Math.max(70, outerVesselHeatCap + outerContentsHeatCap);

  // Inner food bowl (thin camping container ~35g)
  const innerVesselHeatCap = 35 * innerMat.specificHeat;
  // Inner food: ramen water (4.184 J/g·K) + noodles (1.8 J/g·K)
  const innerContentsHeatCap = params.innerWaterVolume * 4.184 + params.noodleMass * 1.8;
  const totalInnerHeatCap = Math.max(90, innerVesselHeatCap + innerContentsHeatCap);

  // Heat Transfer between Outer Bath and Inner Pot (Watts)
  // In dual-chamber flameless cookers, boiling outer water generates 100°C steam.
  // Condensation of this steam on the inner pot transfers enormous latent heat (2260 J/g).
  const baseTransferCoeff = 24.0 * innerMat.innerTransferFactor;
  const tempDiffInner = prev.outerTemp - prev.innerTemp;
  const steamCondensationBoost = 1.0 + (prev.outerTemp > 75 ? Math.min(3.2, (prev.outerTemp - 75) * 0.12) : 0);
  const heatTransferRateWatts = baseTransferCoeff * tempDiffInner * steamCondensationBoost;

  // Heat Loss from Outer Container to Ambient (Watts)
  // Outdoor self-heating food container has an insulated outer shell
  const baseLossCoeff = 1.25 * outerMat.outerLossFactor;
  const tempDiffAmbient = prev.outerTemp - params.ambientTemp;
  const heatLossRateWatts = Math.max(0, baseLossCoeff * tempDiffAmbient);

  // Temperature derivatives
  // dT_outer = (Q_rxn - Q_transfer - Q_loss) * dt / C_outer
  const netHeatOuterJoules = (reactionPowerWatts - heatTransferRateWatts - heatLossRateWatts) * dt;
  let newOuterTemp = prev.outerTemp + netHeatOuterJoules / totalOuterHeatCap;

  // Outer chamber boiling & steam condensation:
  // When outer water reaches boiling point, further reaction heat vaporizes water into pressurized steam.
  // In a closed dual-chamber system, this steam condenses directly onto the inner container,
  // transferring massive latent heat (2,260 J/g) directly into the ramen broth!
  const outerBoilingLimit = boilingPt + 1.5;
  let isOuterBoiling = false;
  let outerSteamIntensity = 0;
  let steamCondensationHeatJoules = 0;

  if (newOuterTemp >= outerBoilingLimit) {
    isOuterBoiling = true;
    // Latent heat of steam: Excess heat above boiling is converted into steam and condenses on inner bowl
    const excessHeatJoules = Math.max(0, (newOuterTemp - outerBoilingLimit) * totalOuterHeatCap);
    steamCondensationHeatJoules = excessHeatJoules * 0.88;
    outerSteamIntensity = Math.min(1.0, 0.45 + (reactionPowerWatts / 300) * 0.45);
    // Outer temp is held at boiling limit with slight steam pulsation
    newOuterTemp = outerBoilingLimit + Math.sin(prev.timeSeconds * 0.5) * 0.4;
  } else if (newOuterTemp > 75) {
    outerSteamIntensity = (newOuterTemp - 75) / 28;
  }

  // dT_inner = (Q_transfer + Q_steam_condensation - inner_loss) * dt / C_inner
  // Natural cooling through covered insulated lid: ~0.35 W/K * (T_inner - T_ambient)
  const innerTopLossWatts = 0.35 * (prev.innerTemp - params.ambientTemp);
  const netHeatInnerJoules = (heatTransferRateWatts - innerTopLossWatts) * dt + steamCondensationHeatJoules;
  let newInnerTemp = prev.innerTemp + netHeatInnerJoules / totalInnerHeatCap;

  // Inner chamber boiling limit: water boils at altitude boiling point!
  let isInnerBoiling = false;
  let isInnerSimmering = false;
  let innerSteamIntensity = 0;

  if (newInnerTemp >= boilingPt) {
    isInnerBoiling = true;
    isInnerSimmering = true;
    newInnerTemp = boilingPt; // Held at boiling point by latent heat of ramen water
    innerSteamIntensity = Math.min(1.0, 0.65 + Math.min(0.35, (heatTransferRateWatts - innerTopLossWatts) / 80));
  } else if (newInnerTemp >= boilingPt - 6) {
    isInnerSimmering = true;
    innerSteamIntensity = Math.max(0.15, (newInnerTemp - (boilingPt - 6)) / 8);
  } else if (newInnerTemp > 65) {
    innerSteamIntensity = 0.08 + (newInnerTemp - 65) / 90;
  }

  // Noodle cooking progress integration:
  // Gelatinization rate:
  // Requires temp > 68°C.
  // Standard ramen cooks in 180s (3 minutes) at 100°C.
  // Rate at T = (1 / 180) * ((T - 65) / 35)^2.5 when T >= 70°C.
  if (newInnerTemp >= 70) {
    const tempFactor = Math.pow(Math.max(0, (newInnerTemp - 68) / 32), 2.2);
    // Base speed: 1.0 progress in 180 seconds at 100°C
    const progressPerSecond = (1.0 / 180) * tempFactor * dt;
    cookingAccumulatorRef.current = cookingAccumulatorRef.current + progressPerSecond;
  }

  const noodleInfo = evaluateNoodleStatus(
    cookingAccumulatorRef.current,
    boilingPt,
    Math.max(newInnerTemp, prev.innerTemp)
  );

  const newTime = prev.timeSeconds + dt;

  // Update log sample every ~2 seconds
  const shouldSampleHistory = Math.floor(newTime) % 2 === 0 && Math.floor(newTime) !== Math.floor(prev.timeSeconds);
  let newHistory = prev.history;
  if (shouldSampleHistory) {
    newHistory = [
      ...prev.history,
      {
        time: Math.round(newTime),
        outerTemp: Math.round(newOuterTemp * 10) / 10,
        innerTemp: Math.round(newInnerTemp * 10) / 10,
        boilingPt,
        noodleProgress: noodleInfo.progressPercent,
      },
    ];
    if (newHistory.length > 300) {
      newHistory = newHistory.slice(newHistory.length - 300);
    }
  }

  // Check completion: Reagents exhausted and temperature cooled down or 600s reached
  const isCompleted = (newConsumedPercent >= 99 && newOuterTemp <= params.ambientTemp + 5) || newTime >= 600;

  return {
    timeSeconds: newTime,
    isRunning: !isCompleted && prev.isRunning,
    isCompleted,

    outerTemp: Math.max(params.ambientTemp, Math.round(newOuterTemp * 10) / 10),
    caoConsumedPercent: Math.round(newConsumedPercent * 10) / 10,
    reactionRate: Math.round(reactionPowerWatts),
    slakedLimeProducedGrams,
    isOuterBoiling,
    outerSteamIntensity: Math.min(1.0, Math.max(0, outerSteamIntensity)),

    innerTemp: Math.max(params.ambientTemp, Math.round(newInnerTemp * 10) / 10),
    boilingPoint: boilingPt,
    atmosphericPressureKPa: Math.round(pressureKPa * 10) / 10,
    isInnerSimmering,
    isInnerBoiling,
    innerSteamIntensity: Math.min(1.0, Math.max(0, innerSteamIntensity)),

    noodleInfo,

    heatTransferRate: Math.round(heatTransferRateWatts),
    heatLossRate: Math.round(heatLossRateWatts),

    history: newHistory,
  };
}
