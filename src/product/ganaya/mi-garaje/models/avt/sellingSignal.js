// Copia literal de avt-ai-main.zip · src/sellingSignal.js (rama main, sin commit; 9/10/2026). No editar: si AVT cambia, se vuelve a copiar.
// ══════════════════════════════════════════════════════════════
// AVT Dynamic Selling Signal
// ══════════════════════════════════════════════════════════════
//
// Computes a live selling signal based on:
// 1. Current position in seasonal cycle
// 2. Forward projection of value over next 12 months
// 3. Depreciation curve slope (category A-G)
// 4. Optimal sell window identification
//
// Returns a signal object for the UI to render dynamically.
// This runs CLIENT-SIDE using the same constants as avt_core.
// ══════════════════════════════════════════════════════════════

// ── Constants (mirrored from avt_core) ───────────────────────

const SEASONAL_ANNUAL = {
  1: 13.14, 2: 13.14, 3: 8.05, 4: 8.05, 5: 8.05,
  6: -5.08, 7: -5.08, 8: 8.05, 9: 13.14,
  10: 8.05, 11: -5.08, 12: -5.08,
};

const DEPR_TABLES = {
  A: [11.85, 9.62, 9.02, 8.18, 7.68, 7.15, 6.78, 6.58, 6.35, 6.16, 5.99, 5.84, 5.71, 5.58, 5.47],
  B: [16.02, 9.94, 9.52, 9.00, 8.86, 8.41, 7.30, 7.07, 6.79, 6.55, 6.33, 6.14, 5.98, 5.82, 5.69],
  C: [18.57, 9.48, 9.38, 9.19, 8.74, 8.07, 7.57, 7.31, 7.02, 6.77, 6.55, 6.35, 6.18, 6.02, 5.88],
  D: [20.00, 10.52, 10.36, 9.95, 9.29, 8.69, 8.19, 7.78, 7.45, 7.16, 6.90, 6.68, 6.48, 6.30, 6.14],
  E: [21.40, 10.43, 10.06, 9.26, 8.69, 8.14, 7.67, 7.20, 6.85, 6.54, 6.28, 6.05, 5.85, 5.67, 5.50],
  F: [24.25, 11.65, 10.18, 9.79, 9.31, 8.70, 8.07, 7.48, 7.09, 6.75, 6.45, 6.20, 5.97, 5.77, 5.59],
  G: [27.90, 12.71, 11.06, 9.75, 9.54, 9.20, 8.64, 7.90, 7.46, 7.09, 6.77, 6.49, 6.25, 6.03, 5.83],
};

const SEGMENT_EXTRA = {
  A: { X: 0.0255, Y: 0.0175, Z: 0.0045 },
  B: { X: 0.0200, Y: 0.0120, Z: 0.0000 },
  C: { X: 0.0150, Y: 0.0100, Z: 0.0020 },
  D: { X: 0.0120, Y: 0.0080, Z: 0.0010 },
  E: { X: 0.0100, Y: 0.0060, Z: 0.0000 },
  F: { X: 0.0080, Y: 0.0040, Z: 0.0000 },
  G: { X: 0.0050, Y: 0.0020, Z: 0.0000 },
};

const MONTH_NAMES_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ── Helpers ──────────────────────────────────────────────────

function kmSegment(km) {
  if (km <= 30000) return 'X';
  if (km <= 80000) return 'Y';
  return 'Z';
}

function getSeasonalFactor(month) {
  return SEASONAL_ANNUAL[month] || 0;
}

function getMonthLabel(month) {
  return MONTH_NAMES_ES[month] || '';
}

// ── Seasonal Momentum ────────────────────────────────────────

function getSeasonalMomentum(currentMonth) {
  const current = getSeasonalFactor(currentMonth);
  const next = getSeasonalFactor(currentMonth === 12 ? 1 : currentMonth + 1);
  const nextNext = getSeasonalFactor(currentMonth >= 11 ? currentMonth - 10 : currentMonth + 2);

  const trend = next - current;
  const acceleration = nextNext - next;

  return { current, next, nextNext, trend, acceleration };
}

// ── Forward Value Projection ─────────────────────────────────

function projectForward(currentValue, category, yearOfFab, km, consultDate) {
  if (!currentValue || !isFinite(currentValue) || currentValue <= 0) return [];
  const cat = (category || 'C').toUpperCase();
  const deprTable = DEPR_TABLES[cat] || DEPR_TABLES.A;
  const seg = kmSegment(Math.max(0, km || 0));
  const yearsUsed = Math.max(1, consultDate.getFullYear() - (yearOfFab || consultDate.getFullYear()));
  const expectedKm = 15000 * Math.max(yearsUsed, 1);
  const basePct = km <= expectedKm ? 0.0213 : -0.0132;
  const extraPct = (SEGMENT_EXTRA[cat] || SEGMENT_EXTRA.A)[seg] || 0;
  const dailyKmAdj = (basePct + extraPct) / 365;

  const projections = [];
  let value = currentValue;

  for (let day = 0; day < 365; day++) {
    const projDate = new Date(consultDate);
    projDate.setDate(projDate.getDate() + day);
    const month = projDate.getMonth() + 1;
    const yearIndex = Math.min(
      consultDate.getFullYear() - yearOfFab + Math.floor(day / 365),
      deprTable.length - 1
    );

    const dailyDepr = (deprTable[yearIndex] / 100) / 365;
    const seasonal = (getSeasonalFactor(month) / 100) / 365;
    const effectiveDepr = dailyDepr * (1 - seasonal);

    value = value * (1 + dailyKmAdj - effectiveDepr);
    if (!isFinite(value) || value < 0) { value = 0; }

    if (day === 0 || projDate.getDate() === 1) {
      projections.push({
        date: new Date(projDate),
        month,
        monthLabel: getMonthLabel(month),
        value: Math.round(value / 10) * 10,
        dayIndex: day,
        dailyLoss: currentValue > 0 ? ((currentValue - value) / day || 0) : 0,
        totalLoss: Math.round(currentValue - value),
        totalLossPct: currentValue > 0
          ? Math.round(((currentValue - value) / currentValue) * 1000) / 10
          : 0,
        seasonalFactor: getSeasonalFactor(month),
      });
    }
  }

  return projections;
}

// ── Find Optimal Sell Windows ────────────────────────────────

function findSellWindows(projections) {
  if (projections.length < 3) return [];

  const scored = projections.slice(1).map((p) => {
    const seasonalBoost = p.seasonalFactor > 0 ? p.seasonalFactor : 0;
    const dailyLossRate = p.dayIndex > 0 ? p.totalLoss / p.dayIndex : 0;
    const score = seasonalBoost * 10 - dailyLossRate;

    return {
      ...p,
      score,
      dailyLossRate: Math.round(dailyLossRate * 100) / 100,
      isHighDemand: p.seasonalFactor > 8,
      isPeakDemand: p.seasonalFactor > 12,
      isLowDemand: p.seasonalFactor < 0,
    };
  });

  const ranked = [...scored].sort((a, b) => b.score - a.score);
  return ranked;
}

// ── Compute Sell Signal Level ────────────────────────────────

function computeSignalLevel(momentum) {
  const { current, trend } = momentum;

  if (current >= 13 && trend < -5) return 5;
  if (current >= 8 && trend <= 0) return 4;
  if (current >= 8 && trend > 0) return 3;
  if (current < 0 && trend > 0) return 2;
  return 1;
}

// ── Signal Labels ────────────────────────────────────────────

const SIGNAL_LABELS = {
  5: { label: 'Vender ahora', sublabel: 'Demanda máxima. Ventana cerrándose.', color: '#FF4444', urgency: 'critical' },
  4: { label: 'Buen momento', sublabel: 'Demanda alta. Condiciones favorables.', color: '#FF8800', urgency: 'high' },
  3: { label: 'Momento favorable', sublabel: 'Demanda activa. Mercado estable.', color: '#FFBB00', urgency: 'moderate' },
  2: { label: 'Esperar', sublabel: 'Demanda baja, pero mejorando.', color: '#44AAFF', urgency: 'low' },
  1: { label: 'No es momento', sublabel: 'Demanda baja. Mejor esperar.', color: '#8899AA', urgency: 'none' },
};

// ── Dynamic Copy Generator ───────────────────────────────────

function generateDynamicCopy(level, momentum, currentMonth, dailyLoss, nextPeak, daysUntilPeak) {
  const monthName = getMonthLabel(currentMonth);
  const SELL_URL = 'https://www.subascars.com/como-vender-mi-auto-en-peru';

  switch (level) {
    case 5:
      return {
        headline: `${monthName}: ventana de venta cerrándose`,
        body: `Estás en el pico de demanda estacional. Tu auto pierde $${dailyLoss}/día. ` +
              `Después de este mes, la demanda cae y tu valor baja más rápido.`,
        ctaText: 'Vender ahora →',
        ctaUrl: SELL_URL,
      };
    case 4:
      return {
        headline: `${monthName}: buen momento para vender`,
        body: `La demanda del mercado está alta (${momentum.current > 0 ? '+' : ''}${momentum.current}%). ` +
              `Cada día que pasa pierdes ~$${dailyLoss} en valor.`,
        ctaText: 'Vender mi auto →',
        ctaUrl: SELL_URL,
      };
    case 3:
      return {
        headline: `Mercado activo en ${monthName}`,
        body: `Condiciones favorables con demanda de +${momentum.current}%. ` +
              `Si planeas vender este año, este es un momento razonable.`,
        ctaText: 'Ver opciones de venta →',
        ctaUrl: SELL_URL,
      };
    case 2:
      return {
        headline: `${monthName}: demanda recuperándose`,
        body: `El mercado está en ciclo bajo pero mejorando. ` +
              `La próxima ventana fuerte es ${nextPeak} (en ${daysUntilPeak} días).`,
        ctaText: `Preparar venta para ${nextPeak} →`,
        ctaUrl: SELL_URL,
      };
    case 1:
      return {
        headline: `${monthName}: mejor esperar`,
        body: `Demanda estacional baja (${momentum.current}%). ` +
              `Vender ahora significa menor precio. Próximo pico: ${nextPeak} en ${daysUntilPeak} días.`,
        ctaText: 'Activar alerta de venta →',
        ctaUrl: SELL_URL,
      };
    default:
      return {
        headline: 'Señal de mercado',
        body: 'Calculando condiciones de mercado...',
        ctaText: 'Vender mi auto →',
        ctaUrl: SELL_URL,
      };
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT: computeSellingSignal()
// ══════════════════════════════════════════════════════════════

export function computeSellingSignal(currentValue, category, yearOfFab, km, consultDate = new Date(), marketContext = null) {
  // ═══ INPUT GUARD ═══
  if (!currentValue || !isFinite(currentValue) || currentValue <= 0) {
    const neutral = SIGNAL_LABELS[1];
    return {
      signal: { level: 1, ...neutral },
      seasonal: { currentMonth: '', currentFactor: 0, currentFactorLabel: '0% demanda', trend: 'estable', trendArrow: '→', nextMonth: '', nextFactor: 0 },
      timing: { bestMonths: [], worstMonths: [], nextPeakMonth: null, daysUntilPeak: 0, dailyValueLoss: 0, monthlyValueLoss: 0 },
      projection: { currentValue: 0, value30d: 0, value90d: 0, value180d: 0, value365d: 0, loss30d: 0, loss90d: 0, loss180d: 0, loss365d: 0, monthlyProjections: [] },
      copy: { headline: '', body: '', ctaText: '', ctaUrl: '' },
    };
  }
  const safeDate = consultDate instanceof Date && !isNaN(consultDate) ? consultDate : new Date();
  const currentMonth = safeDate.getMonth() + 1;
  const momentum = getSeasonalMomentum(currentMonth);
  const projections = projectForward(currentValue, category, yearOfFab, km, safeDate);
  const sellWindows = findSellWindows(projections);

  // Adjust signal level using live market data when available
  let signalLevel = computeSignalLevel(momentum);
  if (marketContext) {
    const trend = marketContext.trend;
    const demand = marketContext.demand;
    // Boost signal if live demand is high
    if (demand && demand.buyer_searches_7d >= 5 && signalLevel < 4) signalLevel = Math.min(signalLevel + 1, 4);
    // Boost signal if price trend is rising
    if (trend && trend.change_30d_pct > 3 && signalLevel < 4) signalLevel = Math.min(signalLevel + 1, 4);
    // Lower signal if price is crashing and demand is zero
    if (trend && trend.change_30d_pct < -5 && (!demand || demand.buyer_searches_7d === 0) && signalLevel > 1) signalLevel = Math.max(signalLevel - 1, 1);
  }
  const signalInfo = SIGNAL_LABELS[signalLevel];

  // Seasonal info
  const trendDirection = momentum.trend > 2 ? 'subiendo' : momentum.trend < -2 ? 'bajando' : 'estable';
  const trendArrow = momentum.trend > 2 ? '↗' : momentum.trend < -2 ? '↘' : '→';
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  // Timing info
  const bestMonths = sellWindows.slice(0, 3).map(w => ({
    monthLabel: w.monthLabel,
    value: w.value,
    totalLoss: w.totalLoss,
    totalLossPct: w.totalLossPct,
    isPeakDemand: w.isPeakDemand,
    isHighDemand: w.isHighDemand,
  }));

  const worstMonths = sellWindows.slice(-2).map(w => ({
    monthLabel: w.monthLabel,
    totalLoss: w.totalLoss,
    totalLossPct: w.totalLossPct,
  }));

  // Find next peak month (>12% seasonal)
  const peakMonths = [1, 2, 9];
  let nextPeakMonth = null;
  let daysUntilPeak = 0;
  for (const pm of peakMonths) {
    const pmDate = new Date(safeDate.getFullYear(), pm - 1, 1);
    if (pmDate <= safeDate) pmDate.setFullYear(pmDate.getFullYear() + 1);
    const diff = Math.ceil((pmDate - safeDate) / (1000 * 60 * 60 * 24));
    if (!nextPeakMonth || diff < daysUntilPeak) {
      nextPeakMonth = getMonthLabel(pm);
      daysUntilPeak = diff;
    }
  }

  // Daily/monthly loss at current rate
  const proj30 = projections.find(p => p.dayIndex >= 28) || projections[projections.length - 1];
  const dailyValueLoss = proj30 ? Math.round(proj30.totalLoss / proj30.dayIndex) : 0;
  const monthlyValueLoss = dailyValueLoss * 30;

  // Projection snapshots
  const findNearest = (targetDay) => {
    let closest = projections[0];
    for (const p of projections) {
      if (Math.abs(p.dayIndex - targetDay) < Math.abs(closest.dayIndex - targetDay)) closest = p;
    }
    return closest;
  };

  const p30 = findNearest(30);
  const p90 = findNearest(90);
  const p180 = findNearest(180);
  const p365 = findNearest(365);

  // Dynamic copy
  const copy = generateDynamicCopy(signalLevel, momentum, currentMonth, dailyValueLoss, nextPeakMonth, daysUntilPeak);

  return {
    signal: {
      level: signalLevel,
      ...signalInfo,
    },
    seasonal: {
      currentMonth: getMonthLabel(currentMonth),
      currentFactor: momentum.current,
      currentFactorLabel: `${momentum.current > 0 ? '+' : ''}${momentum.current}% demanda`,
      trend: trendDirection,
      trendArrow,
      nextMonth: getMonthLabel(nextMonth),
      nextFactor: momentum.next,
    },
    timing: {
      bestMonths,
      worstMonths,
      nextPeakMonth,
      daysUntilPeak,
      dailyValueLoss,
      monthlyValueLoss,
    },
    projection: {
      currentValue,
      value30d: p30?.value || currentValue,
      value90d: p90?.value || currentValue,
      value180d: p180?.value || currentValue,
      value365d: p365?.value || currentValue,
      loss30d: p30?.totalLoss || 0,
      loss90d: p90?.totalLoss || 0,
      loss180d: p180?.totalLoss || 0,
      loss365d: p365?.totalLoss || 0,
      monthlyProjections: projections,
    },
    copy,
  };
}

export { SEASONAL_ANNUAL, MONTH_NAMES_ES, getSeasonalFactor, getMonthLabel };
