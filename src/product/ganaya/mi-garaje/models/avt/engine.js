// Copia literal de avt-ai-main.zip · src/App.jsx «AVT Engine» (DEPR … projectForward; rama main, sin commit). 19/10/2026.
// Sin los dos bloques que sobrescriben las tablas desde Firestore (avt_config): el lab usa los valores por defecto del código.
// No editar: si AVT cambia, se vuelve a copiar.
let DEPR = {
  A:[11.84998426,9.620117405,9.024499417,8.183624904,7.675830258,7.152388927,6.781470261,6.576109121,6.353784407,6.161284845,5.992176861,5.841849488,5.706894294,5.584726391,5.473342679],
  B:[16.01966852,9.940116031,9.518819117,8.995756936,8.855476379,8.412727331,7.29849659,7.072619659,6.789384094,6.545646228,6.332705147,6.14435977,5.9760495,5.824331708,5.686550004],
  C:[18.57031588,9.484511435,9.376339915,9.19284781,8.737713135,8.070578195,7.574290436,7.308037809,7.017027286,6.766542767,6.547663542,6.354030588,6.180966283,6.024939063,5.883223492],
  D:[20.00000000,10.51580242,10.35974181,9.953969691,9.292034048,8.691313646,8.185034664,7.783188685,7.445143245,7.155211641,6.902675253,6.679918355,6.481355459,6.302780964,6.140957326],
  E:[21.39620384,10.42649383,10.06357557,9.258043018,8.68712918,8.139424746,7.670781546,7.19854745,6.845461695,6.544316521,6.283326385,6.054160136,5.850735766,5.668493134,5.503935408],
  F:[24.25089464,11.65367853,10.18346423,9.792865782,9.312111672,8.699537571,8.06998414,7.483975955,7.08510777,6.746355575,6.453891038,6.197976825,5.971529315,5.769254412,5.587104469],
  G:[27.90241621,12.70605904,11.05914677,9.74531167,9.543520465,9.195926943,8.638936639,7.900958451,7.463146333,7.092107856,6.772379276,6.49309278,6.24635624,6.026280776,5.828370647],
};
let SEASONAL = {1:0.131,2:0.131,3:0.081,4:0.081,5:0.081,6:-0.051,7:-0.051,8:0.081,9:0.131,10:0.081,11:-0.051,12:-0.051};
let SEG_EXTRA = {
  A:{X:0.0255,Y:0.0175,Z:0.0045},B:{X:0.020,Y:0.012,Z:0.000},
  C:{X:0.015,Y:0.010,Z:0.002},D:{X:0.012,Y:0.008,Z:0.001},
  E:{X:0.010,Y:0.006,Z:0.000},F:{X:0.008,Y:0.004,Z:0.000},
  G:{X:0.005,Y:0.002,Z:0.000},
};
let KM_ADJ_UNDER = 0.0213, KM_ADJ_OVER = -0.0132, AVG_ANNUAL_KM = 15000;
// Category floor — byte-equal mirror of server CLASS_DEFAULTS (functions/index.js cfRunAVT).
// Deliberately NOT Firestore-synced: the server's floor is a hardcoded const too, so keeping
// this a plain const preserves client/server parity for the floor clamp.
const CLASS_FLOORS = { A: 0.08, B: 0.12, C: 0.18, D: 0.22, E: 0.28, F: 0.35, G: 0.40 };
function kmSeg(km) { return km<=30000?"X":km<=80000?"Y":"Z"; }



function runAVT(msrp, cat, year, km, asOfDate) {
  // ═══ INPUT GUARDS ═══
  if (!msrp || typeof msrp !== 'number' || msrp <= 0 || !isFinite(msrp)) {
    return { baseValue: 0, msrp: msrp || 0, category: cat || 'C', yearsUsed: 0, hist: [] };
  }
  const currentYear = new Date().getFullYear();
  const safeYear = Math.max(2000, Math.min(currentYear, Math.round(year || currentYear)));
  const safeCat = cat && DEPR[cat] ? cat : 'C';
  const safeKm = Math.max(0, Math.min(999999, Math.round(km || 0)));
  const now = asOfDate instanceof Date && !isNaN(asOfDate) ? asOfDate : new Date();

  const fabDate = new Date(safeYear, 0, 1);
  const totalDays = Math.max(1, Math.floor((now - fabDate) / 86400000) + 1);
  const yearsUsed = Math.max(1, now.getFullYear() - safeYear);
  const expected = AVG_ANNUAL_KM * yearsUsed;
  const basePct = safeKm <= expected ? KM_ADJ_UNDER : KM_ADJ_OVER;
  const seg = kmSeg(safeKm);
  const extra = (SEG_EXTRA[safeCat]||SEG_EXTRA.C)[seg]||0;
  const dailyAdj = (basePct + extra) / 365;
  const deprArr = DEPR[safeCat]||DEPR.C;
  let mv = msrp;
  const hist = [];
  for (let d = 1; d < totalDays; d++) {
    const yrIdx = Math.min(Math.floor(d/365), deprArr.length-1);
    const dailyDepr = (deprArr[yrIdx]/100)/365;
    const dt = new Date(fabDate.getTime()+d*86400000);
    const seas = (SEASONAL[dt.getMonth()+1]||0)/365;
    mv = mv * (1 + dailyAdj - dailyDepr*(1-seas));
    // ═══ PER-ITERATION GUARD ═══
    if (!isFinite(mv) || mv < 0) { mv = 0; break; }
    if (d % 30 === 0 || d === totalDays-1) {
      hist.push({ date: dt, value: Math.round(mv/10)*10 });
    }
  }
  // ═══ OUTPUT CLAMPING + CATEGORY FLOOR (mirrors server cfRunAVT) ═══
  // Without the floor, old vehicles in any category decay toward $0. The server clamps to a
  // per-category fraction of MSRP; apply the same here so the (provisional) client preview
  // never shows a number the server would never compute.
  const clamped = Math.round(Math.max(0, Math.min(msrp, mv)) / 10) * 10;
  const floorValue = Math.round(((CLASS_FLOORS[safeCat] ?? CLASS_FLOORS.C) * msrp) / 10) * 10;
  const finalValue = Math.max(clamped, floorValue);
  return { baseValue: finalValue, msrp, category: safeCat, yearsUsed, hist };
}

// Project forward from a given value — organic curve
// Weekly resolution with real seasonal demand cycles + micro-noise + km tracking
function projectForward(currentValue, cat, monthsAhead, currentKm) {
  // ═══ INPUT GUARD ═══
  if (!currentValue || !isFinite(currentValue) || currentValue <= 0) {
    return [{ week: 0, month: 0, date: new Date(), value: 0, km: currentKm || 0, label: "Hoy" }];
  }
  const safeCat = cat && DEPR[cat] ? cat : 'C';
  const deprArr = DEPR[safeCat]||DEPR.C;
  const lastRate = deprArr[deprArr.length-1];
  const dailyDecay = (lastRate / 100) / 365;
  const now = new Date();
  const weeklyKm = AVG_ANNUAL_KM / 52; // ~288 km/week

  // Seeded pseudo-random for deterministic noise
  let seed = Math.round(currentValue) % 9973;
  const seededRandom = () => { seed = (seed * 16807 + 7) % 2147483647; return (seed % 1000) / 1000; };

  // Seasonal demand multipliers — amplified for visible movement
  const DEMAND = {
    1: 0.035, 2: 0.028, 3: 0.012, 4: 0.005, 5: -0.008,
    6: -0.025, 7: -0.030, 8: 0.010, 9: 0.032,
    10: 0.008, 11: -0.022, 12: -0.028
  };

  const totalWeeks = Math.round(monthsAhead * 4.33);
  const rawPoints = [{ week: 0, month: 0, date: now, value: currentValue, km: currentKm || 0 }];

  let v = currentValue;
  for (let w = 1; w <= totalWeeks; w++) {
    const dt = new Date(now.getTime() + w * 7 * 86400000);
    const mo = dt.getMonth() + 1;
    const monthFrac = w / 4.33;
    const weekDepr = dailyDecay * 7;
    const demandEffect = (DEMAND[mo] || 0) / 4.33;
    const noise = (seededRandom() - 0.48) * 0.003;
    const momentum = w > 1
      ? (rawPoints[w-1].value - rawPoints[Math.max(0, w-2)].value) / rawPoints[w-1].value * 0.08
      : 0;
    const weekChange = -weekDepr + demandEffect + noise + momentum;
    v = v * (1 + weekChange);
    if (!isFinite(v) || v < 0) { v = 0; }

    rawPoints.push({
      week: w,
      month: monthFrac,
      date: dt,
      value: Math.round(v / 10) * 10,
      km: Math.round((currentKm || 0) + w * weeklyKm),
    });
  }

  // Post-hoc: assign milestone labels to the closest week for each target
  const targets = [
    { month: 0, label: "Hoy" },
    { month: 1, label: "1M" },
    { month: 3, label: "3M" },
    { month: 6, label: "6M" },
    { month: 12, label: "12M" },
  ];
  // Mark all as null first
  for (const p of rawPoints) p.label = null;
  for (const t of targets) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < rawPoints.length; i++) {
      const dist = Math.abs(rawPoints[i].month - t.month);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    rawPoints[bestIdx].label = t.label;
  }

  return rawPoints;
}

export { runAVT, projectForward, AVG_ANNUAL_KM };
