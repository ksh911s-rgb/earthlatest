export interface SubResourceInfo {
  id: string;
  name: string;
  unit: string;
  icon: string;
  share: number; // percentage share of max
  color: string;
  barColor: string;
  percent: number;
  remaining: number;
  max: number;
  statusText: string;
  statusClass: string;
  description: string;
}

export function calculateSubResources(
  currentResource: number,
  maxResource: number,
  resourcePercent: number
): SubResourceInfo[] {
  const max = Math.max(1, maxResource);

  if (currentResource <= 0 || resourcePercent <= 0) {
    return [
      {
        id: 'oil',
        name: '원유·석유',
        unit: '만 배럴',
        icon: '🛢️',
        share: 35,
        color: '#F59E0B',
        barColor: 'from-amber-600 to-yellow-500',
        percent: 0,
        remaining: 0,
        max: Math.round(max * 0.35),
        statusText: '유전 전면 고갈',
        statusClass: 'text-red-400 bg-red-950/80 border-red-500/40',
        description: '공장 및 자동차 연료',
      },
      {
        id: 'gas',
        name: '천연가스',
        unit: '억 m³',
        icon: '💨',
        share: 20,
        color: '#06B6D4',
        barColor: 'from-cyan-600 to-sky-400',
        percent: 0,
        remaining: 0,
        max: Math.round(max * 0.2),
        statusText: '공급 차단',
        statusClass: 'text-red-400 bg-red-950/80 border-red-500/40',
        description: '발전소 및 난방 에너지',
      },
      {
        id: 'coal',
        name: '석탄·광물',
        unit: '만 톤',
        icon: '🪨',
        share: 25,
        color: '#94A3B8',
        barColor: 'from-slate-600 to-zinc-400',
        percent: 0,
        remaining: 0,
        max: Math.round(max * 0.25),
        statusText: '채굴 한계 돌파',
        statusClass: 'text-red-400 bg-red-950/80 border-red-500/40',
        description: '제철 및 기초 원자재',
      },
      {
        id: 'wood',
        name: '산림·목재',
        unit: '만 ha',
        icon: '🪵',
        share: 20,
        color: '#10B981',
        barColor: 'from-emerald-600 to-green-400',
        percent: 0,
        remaining: 0,
        max: Math.round(max * 0.2),
        statusText: '전소 및 사막화',
        statusClass: 'text-red-400 bg-red-950/80 border-red-500/40',
        description: '생태계 및 생물 자원',
      },
    ];
  }

  const p = Math.max(0, Math.min(100, resourcePercent));

  // Realistic depletion curves:
  // 1) Wood/Timber: Rapidly cleared in early/mid industrial development
  const woodP = Math.max(0, Math.min(100, Math.round(Math.pow(p / 100, 1.4) * 100)));

  // 2) Coal/Minerals: Heavy sustained consumption since steam revolution
  const coalP = Math.max(0, Math.min(100, Math.round(Math.pow(p / 100, 1.15) * 100)));

  // 3) Oil: Lifeblood of 3rd~6th stages, continuous drain
  const oilP = Math.max(0, Math.min(100, Math.round(Math.pow(p / 100, 0.95) * 100)));

  // 4) Natural Gas: Peak usage in modern/high-tech stages
  const gasP = Math.max(
    0,
    Math.min(100, Math.round(p > 15 ? Math.pow(p / 100, 0.85) * 100 : p * 1.0))
  );

  const getStatus = (pct: number) => {
    if (pct <= 0) {
      return {
        text: '완전 고갈',
        class: 'text-red-400 bg-red-950/80 border-red-500/40 animate-pulse',
      };
    }
    if (pct < 20) {
      return {
        text: '고갈 위기',
        class: 'text-rose-400 bg-rose-950/70 border-rose-500/40 animate-pulse',
      };
    }
    if (pct < 50) {
      return {
        text: '주의 경보',
        class: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
      };
    }
    return {
      text: '안정',
      class: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30',
    };
  };

  const oilStatus = getStatus(oilP);
  const gasStatus = getStatus(gasP);
  const coalStatus = getStatus(coalP);
  const woodStatus = getStatus(woodP);

  return [
    {
      id: 'oil',
      name: '원유·석유',
      unit: '만 배럴',
      icon: '🛢️',
      share: 35,
      color: '#F59E0B',
      barColor: 'from-amber-600 to-yellow-500',
      percent: oilP,
      remaining: Math.round(max * 0.35 * (oilP / 100)),
      max: Math.round(max * 0.35),
      statusText: oilStatus.text,
      statusClass: oilStatus.class,
      description: '공장 및 자동차 연료',
    },
    {
      id: 'gas',
      name: '천연가스',
      unit: '억 m³',
      icon: '💨',
      share: 20,
      color: '#06B6D4',
      barColor: 'from-cyan-600 to-sky-400',
      percent: gasP,
      remaining: Math.round(max * 0.2 * (gasP / 100)),
      max: Math.round(max * 0.2),
      statusText: gasStatus.text,
      statusClass: gasStatus.class,
      description: '발전소 및 난방 에너지',
    },
    {
      id: 'coal',
      name: '석탄·광물',
      unit: '만 톤',
      icon: '🪨',
      share: 25,
      color: '#94A3B8',
      barColor: 'from-slate-600 to-zinc-400',
      percent: coalP,
      remaining: Math.round(max * 0.25 * (coalP / 100)),
      max: Math.round(max * 0.25),
      statusText: coalStatus.text,
      statusClass: coalStatus.class,
      description: '제철 및 기초 원자재',
    },
    {
      id: 'wood',
      name: '산림·목재',
      unit: '만 ha',
      icon: '🪵',
      share: 20,
      color: '#10B981',
      barColor: 'from-emerald-600 to-green-400',
      percent: woodP,
      remaining: Math.round(max * 0.2 * (woodP / 100)),
      max: Math.round(max * 0.2),
      statusText: woodStatus.text,
      statusClass: woodStatus.class,
      description: '생태계 및 생물 자원',
    },
  ];
}
