import { AddedSubstance, ChemistryState, PrecipitateInfo, ReactionEvent, SUBSTANCES, Substance } from '../types';

export function getSubstanceById(id: string): Substance | undefined {
  return SUBSTANCES.find((s) => s.id === id);
}

// Convert Hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

// Interpolate two RGB colors
function blendRgb(c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

export function computeChemistryState(
  addedList: AddedSubstance[],
  previousState?: ChemistryState
): ChemistryState {
  const totalVolume = addedList.reduce((acc, item) => acc + item.volume, 0);

  if (totalVolume <= 0) {
    return {
      totalVolume: 0,
      pH: 7.0,
      temperature: 20.0,
      liquidColor: '#38bdf8',
      liquidOpacity: 0.3,
      turbidity: 0,
      precipitates: [],
      isFizzing: false,
      fizzIntensity: 0,
      recentReactions: [],
      dominantName: '빈 비커',
    };
  }

  // Calculate raw amounts of ions & reagents
  let molH = 0;
  let molOH = 0;
  let molHCO3 = 0;
  let molCl = 0;
  let molAg = 0;
  let molCu = 0;
  let molPb = 0;
  let molI = 0;
  let molFe = 0;
  let molSCN = 0;

  let volPhenol = 0;
  let volBtb = 0;

  let amtNa = 0;
  let amtMg = 0;
  let amtCa = 0;
  let amtFe = 0;
  let amtCu = 0;
  let amtZn = 0;
  let amtC = 0;
  let amtS = 0;

  addedList.forEach((item) => {
    const sub = getSubstanceById(item.substanceId);
    if (!sub) return;

    if (sub.ions) {
      if (sub.ions.H) molH += sub.ions.H * item.volume;
      if (sub.ions.OH) molOH += sub.ions.OH * item.volume;
      if (sub.ions.HCO3) molHCO3 += sub.ions.HCO3 * item.volume;
      if (sub.ions.Cl) molCl += sub.ions.Cl * item.volume;
      if (sub.ions.Ag) molAg += sub.ions.Ag * item.volume;
      if (sub.ions.Cu) molCu += sub.ions.Cu * item.volume;
      if (sub.ions.Pb) molPb += sub.ions.Pb * item.volume;
      if (sub.ions.I) molI += sub.ions.I * item.volume;
      if (sub.ions.Fe) molFe += sub.ions.Fe * item.volume;
      if (sub.ions.SCN) molSCN += sub.ions.SCN * item.volume;
    }

    if (sub.elemental) {
      const e = sub.elemental.element;
      const v = item.volume;
      if (e === 'Na') amtNa += v;
      if (e === 'Mg') amtMg += v;
      if (e === 'Ca') amtCa += v;
      if (e === 'Fe') amtFe += v;
      if (e === 'Cu') amtCu += v;
      if (e === 'Zn') amtZn += v;
      if (e === 'C') amtC += v;
      if (e === 'S') amtS += v;
    }

    if (sub.indicatorType === 'phenolphthalein') volPhenol += item.volume;
    if (sub.indicatorType === 'btb') volBtb += item.volume;
  });

  const reactions: ReactionEvent[] = [];
  const precipitates: PrecipitateInfo[] = [];
  let isFizzing = false;
  let fizzIntensity = 0;
  let elementalHeat = 0;

  // 0-A. Sodium Metal Reacting with Water: 2Na + 2H2O -> 2NaOH + H2↑
  if (amtNa > 0 && totalVolume > amtNa) {
    molOH += amtNa * 1.5;
    isFizzing = true;
    fizzIntensity = Math.min(1.0, fizzIntensity + 0.9);
    elementalHeat += amtNa * 0.9;
    reactions.push({
      id: 'reaction_na_water',
      title: '나트륨(Na)과 물의 격렬한 반응',
      equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑ + 열',
      type: 'gas',
      description: '알칼리 금속 나트륨이 물과 폭발적으로 반응하여 수소(H₂) 기포를 뿜고 강염기(NaOH)를 형성합니다.',
      timestamp: Date.now(),
    });
  }

  // 0-B. Calcium Granules Reacting with Water: Ca + 2H2O -> Ca(OH)2↓ + H2↑
  if (amtCa > 0 && totalVolume > amtCa) {
    molOH += amtCa * 0.8;
    isFizzing = true;
    fizzIntensity = Math.min(1.0, fizzIntensity + 0.5);
    elementalHeat += amtCa * 0.4;
    precipitates.push({
      id: 'caoh2',
      name: '수산화칼슘(Ca(OH)₂) 침전',
      formula: 'Ca(OH)₂(s)↓',
      color: '#ffffff',
      amount: amtCa * 0.7,
      description: '칼슘이 물과 반응하여 석회수 침전이 생기며 용액이 뿌옇게 흐려집니다.',
    });
    reactions.push({
      id: 'reaction_ca_water',
      title: '칼슘(Ca)과 물의 반응 (석회수 생성)',
      equation: 'Ca(s) + 2H₂O(l) → Ca(OH)₂(s)↓ + H₂(g)↑',
      type: 'precipitation',
      description: '칼슘 과립이 물과 반응해 수소 기포가 발생하고 불용성 수산화칼슘으로 탁해집니다.',
      timestamp: Date.now(),
    });
  }

  // 0-C. Magnesium Ribbon Reacting with Acid: Mg + 2H⁺ -> Mg²⁺ + H2↑
  if (amtMg > 0 && molH > 0.5) {
    const reactedH = Math.min(molH, amtMg * 1.5);
    molH -= reactedH;
    isFizzing = true;
    fizzIntensity = Math.min(1.0, fizzIntensity + 0.7);
    elementalHeat += reactedH * 0.5;
    reactions.push({
      id: 'reaction_mg_acid',
      title: '마그네슘(Mg)과 산의 수소 기체 발생',
      equation: 'Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)↑',
      type: 'gas',
      description: '마그네슘 리본이 염산에 녹으며 맹렬한 수소(H₂) 기포를 내뿜습니다.',
      timestamp: Date.now(),
    });
  }

  // 0-D. Zinc Metal Reacting with Acid: Zn + 2H⁺ -> Zn²⁺ + H2↑
  if (amtZn > 0 && molH > 0.5) {
    const reactedH = Math.min(molH, amtZn * 1.2);
    molH -= reactedH;
    isFizzing = true;
    fizzIntensity = Math.min(1.0, fizzIntensity + 0.6);
    elementalHeat += reactedH * 0.35;
    reactions.push({
      id: 'reaction_zn_acid',
      title: '아연(Zn)과 산의 수소 기체 발생',
      equation: 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)↑',
      type: 'gas',
      description: '아연 조각이 염산과 만나 부글부글 수소(H₂) 기포를 발생시킵니다.',
      timestamp: Date.now(),
    });
  }

  // 0-E. Copper strip in Silver Nitrate: Cu + 2Ag⁺ -> Cu²⁺ + 2Ag↓
  if (amtCu > 0 && molAg > 0.5) {
    const reactedAg = Math.min(molAg, amtCu * 1.6);
    molAg -= reactedAg;
    molCu += reactedAg * 0.5;
    precipitates.push({
      id: 'ag_crystal',
      name: '은(Ag) 결정 석출',
      formula: 'Ag(s)↓',
      color: '#e2e8f0',
      amount: reactedAg * 0.8,
      description: '구리 표면에 반짝이는 은(Ag) 나뭇가지 결정이 눈부시게 자라납니다.',
    });
    reactions.push({
      id: 'reaction_cu_ag',
      title: '구리 표면 은(Ag) 결정 석출 반응',
      equation: 'Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)↓',
      type: 'precipitation',
      description: '금속의 반응성 차이로 은이 석출되고, 용액은 푸른빛 구리 이온(Cu²⁺)으로 서서히 물듭니다.',
      timestamp: Date.now(),
    });
  }

  // 0-F. Iron in Copper Sulfate: Fe + Cu²⁺ -> Fe²⁺ + Cu↓
  if (amtFe > 0 && molCu > 0.5) {
    const reactedCu = Math.min(molCu, amtFe * 1.2);
    molCu -= reactedCu;
    precipitates.push({
      id: 'cu_sediment',
      name: '구리(Cu) 붉은 금속 석출',
      formula: 'Cu(s)↓',
      color: '#b45309',
      amount: reactedCu * 0.9,
      description: '철 표면에 붉은색 구리 금속 피막이 도금 석출됩니다.',
    });
    reactions.push({
      id: 'reaction_fe_cu',
      title: '철 표면 구리(Cu) 도금 석출 반응',
      equation: 'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)↓',
      type: 'precipitation',
      description: '철이 구리 이온을 환원시켜 붉은 구리 금속으로 석출시키고 푸른색이 옅어집니다.',
      timestamp: Date.now(),
    });
  }

  // 0-G. Sulfur powder sediment
  if (amtS > 0) {
    precipitates.push({
      id: 's_sediment',
      name: '황(S) 노란색 분말 침전',
      formula: 'S₈(s)↓',
      color: '#eab308',
      amount: amtS * 0.7,
      description: '물에 녹지 않는 선명한 노란색 황 분말이 비커 바닥에 가라앉습니다.',
    });
  }

  // 0-H. Carbon active powder
  if (amtC > 0) {
    precipitates.push({
      id: 'c_sediment',
      name: '활성탄 흑색 침전',
      formula: 'C(s)↓',
      color: '#0f172a',
      amount: amtC * 0.8,
      description: '흑색 활성탄 분말이 바닥에 침전되며 유기 색소를 흡착합니다.',
    });
  }

  // 1. Acid-Base Neutralization (중화 반응: H⁺ + OH⁻ → H₂O)
  const neutralizationAmt = Math.min(molH, molOH);
  if (neutralizationAmt > 0.5) {
    molH -= neutralizationAmt;
    molOH -= neutralizationAmt;
    reactions.push({
      id: 'neutralization',
      title: '중화 반응 (발열)',
      equation: 'H⁺(aq) + OH⁻(aq) → H₂O(l) + 열',
      type: 'neutralization',
      description: '산과 염기가 만나 물과 염을 생성하며 온도가 상승합니다.',
      timestamp: Date.now(),
    });
  }

  // 2. Gas Evolution (산 + 탄산수소나트륨: H⁺ + HCO₃⁻ → H₂O + CO₂↑)
  const gasReactionAmt = Math.min(molH, molHCO3);
  if (gasReactionAmt > 0.5) {
    molH -= gasReactionAmt;
    molHCO3 -= gasReactionAmt;
    isFizzing = true;
    fizzIntensity = Math.min(1.0, fizzIntensity + gasReactionAmt / 30);
    reactions.push({
      id: 'gas_co2',
      title: '이산화탄소(CO₂) 기체 발생',
      equation: 'H⁺(aq) + HCO₃⁻(aq) → H₂O(l) + CO₂(g)↑',
      type: 'gas',
      description: '산과 탄산수소이온이 격렬하게 반응하여 거품(CO₂)이 피어오릅니다.',
      timestamp: Date.now(),
    });
  }

  // 3. Precipitation: Ag⁺ + Cl⁻ → AgCl(s)↓ (흰색 앙금)
  const agClAmt = Math.min(molAg, molCl);
  if (agClAmt > 0.5) {
    molAg -= agClAmt;
    molCl -= agClAmt;
    precipitates.push({
      id: 'agcl',
      name: '염화은 앙금',
      formula: 'AgCl(s)↓',
      color: '#ffffff',
      amount: agClAmt,
      description: '물에 녹지 않는 순백색 앙금이 생성되어 용액이 우윳빛으로 탁해집니다.',
    });
    reactions.push({
      id: 'ppt_agcl',
      title: '염화은(AgCl) 흰색 앙금 생성',
      equation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓',
      type: 'precipitation',
      description: '은 이온과 염소 이온이 결합하여 물에 녹지 않는 흰색 앙금을 만듭니다.',
      timestamp: Date.now(),
    });
  }

  // 4. Precipitation: Cu²⁺ + 2OH⁻ → Cu(OH)₂(s)↓ (청록색 앙금)
  const cuOHAmt = Math.min(molCu, molOH / 2);
  if (cuOHAmt > 0.5) {
    molCu -= cuOHAmt;
    molOH -= cuOHAmt * 2;
    precipitates.push({
      id: 'cuoh2',
      name: '수산화구리(II) 앙금',
      formula: 'Cu(OH)₂(s)↓',
      color: '#38bdf8',
      amount: cuOHAmt,
      description: '선명한 청록색 젤라틴 상태의 수산화구리(II) 침전물이 형성됩니다.',
    });
    reactions.push({
      id: 'ppt_cuoh2',
      title: '수산화구리(II) 청록색 앙금 생성',
      equation: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓',
      type: 'precipitation',
      description: '구리 이온과 수산화 이온이 만나 아름다운 하늘색/청록색 앙금을 침전시킵니다.',
      timestamp: Date.now(),
    });
  }

  // 5. Precipitation: Pb²⁺ + 2I⁻ → PbI₂(s)↓ (골든 레인, 황금빛 노란색 앙금)
  const pbI2Amt = Math.min(molPb, molI / 2);
  if (pbI2Amt > 0.5) {
    molPb -= pbI2Amt;
    molI -= pbI2Amt * 2;
    precipitates.push({
      id: 'pbi2',
      name: '요오드화납 앙금',
      formula: 'PbI₂(s)↓',
      color: '#fbbf24',
      amount: pbI2Amt,
      description: '화려한 황금빛 노란색 결정(Golden Rain) 앙금이 눈부시게 침전됩니다.',
    });
    reactions.push({
      id: 'ppt_pbi2',
      title: '요오드화납(PbI₂) 황금빛 앙금 생성',
      equation: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)↓',
      type: 'precipitation',
      description: '납 이온과 요오드화 이온이 결합하여 빛나는 황금빛 결정을 만듭니다.',
      timestamp: Date.now(),
    });
  }

  // 6. Complexation: Fe³⁺ + SCN⁻ → [Fe(SCN)]²⁺ (혈적색 착이온)
  const feScnAmt = Math.min(molFe, molSCN);
  let isComplexRed = false;
  if (feScnAmt > 0.5) {
    molFe -= feScnAmt;
    molSCN -= feScnAmt;
    isComplexRed = true;
    reactions.push({
      id: 'complex_fescn',
      title: '티오시안산철 착이온 형성 (혈적색)',
      equation: 'Fe³⁺(aq) + SCN⁻(aq) → [Fe(SCN)]²⁺(aq)',
      type: 'complex',
      description: '철(III) 이온과 티오시안산 이온이 결합하여 피처럼 짙은 붉은색 착이온을 형성합니다.',
      timestamp: Date.now(),
    });
  }

  // Calculate pH
  let pH = 7.0;
  const netH = molH - molOH;
  if (netH > 0.05) {
    const conc = netH / totalVolume;
    pH = Math.max(1.0, Number((7.0 - Math.min(6.0, Math.log10(1 + conc * 80) * 2.8)).toFixed(1)));
  } else if (netH < -0.05) {
    const conc = Math.abs(netH) / totalVolume;
    pH = Math.min(13.8, Number((7.0 + Math.min(6.8, Math.log10(1 + conc * 80) * 2.8)).toFixed(1)));
  } else {
    pH = 7.0;
  }

  // Calculate Temperature (Room temp 20°C + Neutralization heat + Elemental reaction heat)
  const baseTemp = 20.0;
  const tempIncrease = Math.min(48, ((neutralizationAmt + elementalHeat) / totalVolume) * 90);
  const temperature = Number((baseTemp + tempIncrease).toFixed(1));

  // Determine Liquid Color and Opacity
  let liquidRgb: [number, number, number] = [226, 232, 240]; // Default clear liquid
  let liquidOpacity = 0.35;

  // Check Indicator priority:
  let indicatorColored = false;
  if (volPhenol > 0 && pH >= 8.2) {
    // Phenolphthalein vivid magenta / pink
    const pinkIntensity = Math.min(1, (pH - 8.2) / 2.0);
    const phenolRgb: [number, number, number] = [236, 72, 153]; // #ec4899
    liquidRgb = blendRgb(liquidRgb, phenolRgb, pinkIntensity * 0.9);
    liquidOpacity = 0.75;
    indicatorColored = true;
    if (reactions.length === 0 || !reactions.some((r) => r.id === 'phenol_pink')) {
      reactions.push({
        id: 'phenol_pink',
        title: '페놀프탈레인 변색 (염기성)',
        equation: 'HIn(무색) ⇌ In⁻(붉은색) + H⁺',
        type: 'color_change',
        description: '염기성 용액(pH > 8.2)에서 페놀프탈레인이 선명한 자주색으로 변색합니다.',
        timestamp: Date.now(),
      });
    }
  } else if (volBtb > 0) {
    indicatorColored = true;
    let btbRgb: [number, number, number];
    if (pH < 6.0) {
      btbRgb = [234, 179, 8]; // Yellow #eab308
    } else if (pH <= 7.6) {
      btbRgb = [34, 197, 94]; // Green #22c55e
    } else {
      btbRgb = [37, 99, 235]; // Blue #2563eb
    }
    liquidRgb = btbRgb;
    liquidOpacity = 0.75;
    reactions.push({
      id: 'btb_color',
      title: `BTB 용액 색 변화 (pH ${pH})`,
      equation: 'H-BTB(노랑) ⇌ BTB⁻(파랑)',
      type: 'color_change',
      description: `현재 용액의 액성(pH ${pH})에 따라 ${pH < 6 ? '산성(노란색)' : pH <= 7.6 ? '중성(초록색)' : '염기성(파란색)'}을 나타냅니다.`,
      timestamp: Date.now(),
    });
  }

  // Complexation blood red has immense extinction coefficient
  if (isComplexRed) {
    const bloodRedRgb: [number, number, number] = [185, 28, 28]; // #b91c1c
    liquidRgb = bloodRedRgb;
    liquidOpacity = 0.88;
  } else if (!indicatorColored) {
    // Volume weighted average of original liquid colors
    let totalWeight = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumOpacity = 0;

    addedList.forEach((item) => {
      const sub = getSubstanceById(item.substanceId);
      if (!sub) return;
      const rgb = hexToRgb(sub.color);
      sumR += rgb[0] * item.volume;
      sumG += rgb[1] * item.volume;
      sumB += rgb[2] * item.volume;
      sumOpacity += sub.opacity * item.volume;
      totalWeight += item.volume;
    });

    if (totalWeight > 0) {
      liquidRgb = [sumR / totalWeight, sumG / totalWeight, sumB / totalWeight];
      liquidOpacity = Math.max(0.3, Math.min(0.9, sumOpacity / totalWeight));
    }

    // Residual Cu2+ blue boost
    if (molCu > 1.0) {
      const cuRgb: [number, number, number] = [2, 132, 199];
      const factor = Math.min(0.85, (molCu / totalVolume) * 3);
      liquidRgb = blendRgb(liquidRgb, cuRgb, factor);
      liquidOpacity = Math.max(liquidOpacity, 0.7);
    }

    // Residual Fe3+ amber/yellow boost
    if (molFe > 1.0) {
      const feRgb: [number, number, number] = [217, 119, 6];
      const factor = Math.min(0.85, (molFe / totalVolume) * 3);
      liquidRgb = blendRgb(liquidRgb, feRgb, factor);
      liquidOpacity = Math.max(liquidOpacity, 0.7);
    }
  }

  // Turbidity (cloudiness from precipitates)
  const totalPrecipitateAmount = precipitates.reduce((acc, p) => acc + p.amount, 0);
  const turbidity = Math.min(1.0, totalPrecipitateAmount / 15);

  // If there's AgCl precipitate, make liquid cloudy white/milky
  if (precipitates.some((p) => p.id === 'agcl')) {
    liquidRgb = blendRgb(liquidRgb, [255, 255, 255], Math.min(0.75, turbidity * 0.9));
    liquidOpacity = Math.min(0.95, liquidOpacity + 0.35);
  }

  // If PbI2 precipitate, give a golden cloudy sheen
  if (precipitates.some((p) => p.id === 'pbi2')) {
    liquidRgb = blendRgb(liquidRgb, [251, 191, 36], Math.min(0.8, turbidity * 0.95));
    liquidOpacity = Math.min(0.95, liquidOpacity + 0.3);
  }

  // Dominant Label text
  let dominantName = '혼합 용액';
  if (precipitates.length > 0) {
    dominantName = precipitates[0].name;
  } else if (isComplexRed) {
    dominantName = '[Fe(SCN)]²⁺ 착이온';
  } else if (reactions.some((r) => r.type === 'gas')) {
    dominantName = 'CO₂ 탄산 반응';
  } else if (addedList.length === 1) {
    const singleSub = getSubstanceById(addedList[0].substanceId);
    if (singleSub) dominantName = singleSub.formula;
  } else if (pH < 4) {
    dominantName = `산성 (pH ${pH})`;
  } else if (pH > 10) {
    dominantName = `염기성 (pH ${pH})`;
  } else {
    dominantName = `중성 수용액 (pH ${pH})`;
  }

  return {
    totalVolume,
    pH,
    temperature,
    liquidColor: rgbToHex(liquidRgb[0], liquidRgb[1], liquidRgb[2]),
    liquidOpacity,
    turbidity,
    precipitates,
    isFizzing,
    fizzIntensity,
    recentReactions: reactions,
    dominantName,
  };
}
