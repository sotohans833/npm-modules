/**
 * Estimate engine shared by the quote wizard (live preview in the browser) and
 * the API route (authoritative recalculation before the quote is stored), so a
 * tampered client payload can never change the recorded price.
 *
 * ---------------------------------------------------------------------------
 * PLACEHOLDER PRICING — calibrated to published market rates, not to the
 * company's own price book. Swap these tables for the real one before launch.
 * ---------------------------------------------------------------------------
 *
 * The numbers below are midpoints benchmarked in 2026 against what other
 * contractors publish for the Raleigh–Durham market, so a customer comparing
 * three quotes sees something plausible rather than an invented figure:
 *
 *   Diagnostic visit ....... $75–$200 (peak season $75–$150)
 *   AC tune-up ............. $125–$250 · furnace/heat pump $100–$200
 *   Typical repair ......... $150–$650 · Raleigh average $365
 *   Capacitor .............. $250–$400 installed
 *   Evaporator coil ........ $700–$1,500
 *   Blower motor ........... $800–$1,500 (PSC vs variable-speed ECM)
 *   Compressor ............. up to $2,300
 *   Heat pump replacement .. $4,500–$10,000, typical $5,500–$8,000
 *   AC + furnace combined .. $10,000–$14,500
 *   Heat pump + air handler  $9,000–$13,000
 *   Duct replacement (NC) .. $1,200–$7,000, most homes $2,000–$5,000
 *   Whole-home purifier .... $1,000–$3,000 installed · UV lamp $300–$1,000
 *   Whole-home dehumidifier  $1,500–$3,500 installed
 *   Durham permit .......... $65–$150 (folded into the base prices)
 *
 * Sources: Angi, HVAC.com, HomeGuide, HomeAdvisor and local contractor
 * pricing guides for Raleigh, Durham and North Carolina, retrieved 2026.
 *
 * Every quote is still a ballpark for planning only; the on-site inspection is
 * what produces the binding price.
 */

export type QuoteKind = "PART" | "SYSTEM" | "DUCTWORK" | "INDOOR_AIR";

export type Range = { low: number; high: number };

const roundTo = (value: number, step = 25) => Math.round(value / step) * step;

const spread = (mid: number, lowPct = 0.88, highPct = 1.14): Range => ({
  low: roundTo(mid * lowPct),
  high: roundTo(mid * highPct),
});

/* -------------------------------------------------------------------------- */
/* Part replacement                                                            */
/* -------------------------------------------------------------------------- */

export const PARTS = {
  CAPACITOR: { mid: 285, labourHours: 1 },
  CONTACTOR: { mid: 300, labourHours: 1 },
  BLOWER_MOTOR: { mid: 1100, labourHours: 3 },
  CONDENSER_FAN_MOTOR: { mid: 650, labourHours: 2 },
  COMPRESSOR: { mid: 2100, labourHours: 6 },
  EVAPORATOR_COIL: { mid: 1200, labourHours: 5 },
  CONDENSER_COIL: { mid: 1400, labourHours: 5 },
  CONTROL_BOARD: { mid: 640, labourHours: 2 },
  THERMOSTAT: { mid: 430, labourHours: 1 },
  IGNITOR: { mid: 265, labourHours: 1 },
  FLAME_SENSOR: { mid: 235, labourHours: 1 },
  HEAT_EXCHANGER: { mid: 2450, labourHours: 7 },
  TXV_VALVE: { mid: 790, labourHours: 3 },
  // Finding and sealing the leak, then recharging — a recharge on its own runs
  // $150–$400 and rarely solves anything for more than a season.
  REFRIGERANT_LEAK: { mid: 900, labourHours: 4 },
  DRAIN_PUMP: { mid: 250, labourHours: 1 },
} as const;

export type PartId = keyof typeof PARTS;

export type PartInput = {
  part: PartId;
  /** Manufacturer part warranty still active → customer pays labour only. */
  underWarranty?: boolean;
  /** After-hours / weekend / holiday dispatch. */
  emergency?: boolean;
  /** Roof-top or crawlspace units take longer to reach. */
  difficultAccess?: boolean;
};

const LABOUR_RATE = 145; // USD per hour, standard business hours

export function estimatePart(input: PartInput): Range {
  const part = PARTS[input.part];
  const labour = part.labourHours * LABOUR_RATE;
  // Under warranty the component itself is free, so only labour remains.
  let mid = input.underWarranty ? labour : part.mid;
  if (input.emergency) mid *= 1.2;
  if (input.difficultAccess) mid *= 1.1;
  return spread(mid, 0.85, 1.18);
}

/* -------------------------------------------------------------------------- */
/* Full system replacement                                                     */
/* -------------------------------------------------------------------------- */

/** Base covers a 2-ton system including permits, haul-away and start-up. */
export const SYSTEM_TYPES = {
  AC_ONLY: { base: 4200, perTon: 850 },
  HEAT_PUMP: { base: 5600, perTon: 1050 },
  FURNACE_AC: { base: 8400, perTon: 1150 },
  DUAL_FUEL: { base: 9600, perTon: 1200 },
  MINI_SPLIT: { base: 3400, perTon: 1400 },
  PACKAGE_UNIT: { base: 7000, perTon: 1150 },
} as const;

export type SystemTypeId = keyof typeof SYSTEM_TYPES;

export const EFFICIENCY_TIERS = {
  STANDARD: { multiplier: 1.0, seer: 14.3 },
  HIGH: { multiplier: 1.22, seer: 17 },
  PREMIUM: { multiplier: 1.48, seer: 20 },
} as const;

export type EfficiencyTierId = keyof typeof EFFICIENCY_TIERS;

export const BRAND_TIERS = {
  VALUE: 0.93,
  STANDARD: 1.0,
  PREMIUM: 1.12,
} as const;

export type BrandTierId = keyof typeof BRAND_TIERS;

export const DUCT_CONDITIONS = {
  GOOD: 0,
  MINOR_REPAIR: 850,
  PARTIAL_REPLACE: 2400,
  FULL_REPLACE: 4800,
} as const;

export type DuctConditionId = keyof typeof DUCT_CONDITIONS;

export type SystemInput = {
  systemType: SystemTypeId;
  tons: number;
  efficiency: EfficiencyTierId;
  brandTier: BrandTierId;
  ductCondition: DuctConditionId;
  /** Extra indoor heads beyond the first, mini-split only. */
  extraZones?: number;
  smartThermostat?: boolean;
  /** Two-storey homes, tight attics and crawlspaces add labour. */
  difficultAccess?: boolean;
};

export function estimateSystem(input: SystemInput): Range {
  const type = SYSTEM_TYPES[input.systemType];
  const tons = Math.max(1.5, Math.min(6, input.tons));

  // The base price already covers a 2-ton system; larger units scale from there.
  let mid = type.base + Math.max(0, tons - 2) * type.perTon;
  mid *= EFFICIENCY_TIERS[input.efficiency].multiplier;
  mid *= BRAND_TIERS[input.brandTier];

  if (input.systemType === "MINI_SPLIT" && input.extraZones) {
    mid += Math.min(input.extraZones, 5) * 2100;
  }
  mid += DUCT_CONDITIONS[input.ductCondition];
  if (input.smartThermostat) mid += 380;
  if (input.difficultAccess) mid *= 1.08;

  return spread(mid, 0.9, 1.15);
}

/* -------------------------------------------------------------------------- */
/* Ductwork                                                                    */
/* -------------------------------------------------------------------------- */

export type DuctworkInput = {
  scope: "SEAL" | "REPAIR" | "REPLACE";
  squareFeet: number;
  returns?: number;
};

export function estimateDuctwork(input: DuctworkInput): Range {
  const sqft = Math.max(600, Math.min(6000, input.squareFeet));
  // Tuned so a 1,200 sq ft home lands near $2,700 and a 1,800 sq ft home near
  // $4,000 on a full replacement, matching the published NC bands.
  const perSqft = { SEAL: 0.8, REPAIR: 1.05, REPLACE: 1.95 }[input.scope];
  let mid = 450 + sqft * perSqft;
  if (input.returns) mid += Math.min(input.returns, 6) * 450;
  return spread(mid, 0.87, 1.16);
}

/* -------------------------------------------------------------------------- */
/* Indoor air quality                                                          */
/* -------------------------------------------------------------------------- */

export const IAQ_PRODUCTS = {
  MEDIA_FILTER: 650,
  UV_LAMP: 650,
  AIR_PURIFIER: 1650,
  WHOLE_HOME_HUMIDIFIER: 1150,
  DEHUMIDIFIER: 2400,
  ERV: 2900,
} as const;

export type IaqProductId = keyof typeof IAQ_PRODUCTS;

export function estimateIaq(input: { products: IaqProductId[] }): Range {
  const mid = input.products.reduce((sum, id) => sum + IAQ_PRODUCTS[id], 0);
  if (mid === 0) return { low: 0, high: 0 };
  // Bundled installs share one visit, so the marginal item is cheaper.
  const bundleDiscount = input.products.length > 1 ? 0.93 : 1;
  return spread(mid * bundleDiscount, 0.9, 1.12);
}

/* -------------------------------------------------------------------------- */
/* Sizing + savings helpers (public calculators)                               */
/* -------------------------------------------------------------------------- */

/**
 * Rough Manual-J style sizing for the North Carolina climate. A real
 * load calculation is still required before ordering equipment — this only
 * sets the customer's expectation before the visit.
 */
export function estimateTonnage(input: {
  squareFeet: number;
  ceilingHeight?: number;
  insulation: "POOR" | "AVERAGE" | "GOOD";
  sunExposure: "SHADED" | "AVERAGE" | "SUNNY";
  occupants?: number;
  stories?: number;
}): { tons: number; btu: number } {
  const sqft = Math.max(300, Math.min(6000, input.squareFeet));

  // Durham sits in IECC climate zone 4A: ~22 BTU per square foot baseline.
  let btu = sqft * 22;

  btu *= { POOR: 1.15, AVERAGE: 1, GOOD: 0.9 }[input.insulation];
  btu *= { SHADED: 0.93, AVERAGE: 1, SUNNY: 1.1 }[input.sunExposure];

  const ceiling = input.ceilingHeight ?? 8;
  if (ceiling > 8) btu *= 1 + (ceiling - 8) * 0.03;

  // Every occupant beyond two adds roughly 600 BTU of sensible load.
  if (input.occupants && input.occupants > 2) btu += (input.occupants - 2) * 600;
  if (input.stories && input.stories > 1) btu *= 1.05;

  // Equipment is sold in half-ton steps; 12,000 BTU = 1 ton.
  const tons = Math.min(6, Math.max(1.5, Math.round((btu / 12000) * 2) / 2));
  return { tons, btu: Math.round(btu) };
}

/**
 * Annual cooling-cost delta when moving from an old SEER rating to a new one.
 * Uses equivalent full-load hours for the Raleigh–Durham cooling season.
 */
export function estimateAnnualSavings(input: {
  tons: number;
  currentSeer: number;
  newSeer: number;
  centsPerKwh?: number;
  coolingHours?: number;
}) {
  const rate = (input.centsPerKwh ?? 12.5) / 100;
  const hours = input.coolingHours ?? 1200;
  const btuPerHour = input.tons * 12000;

  const kwh = (seer: number) => (btuPerHour / seer / 1000) * hours;

  const currentCost = kwh(input.currentSeer) * rate;
  const newCost = kwh(input.newSeer) * rate;
  const annualSavings = Math.max(0, currentCost - newCost);

  return {
    currentAnnualCost: Math.round(currentCost),
    newAnnualCost: Math.round(newCost),
    annualSavings: Math.round(annualSavings),
    tenYearSavings: Math.round(annualSavings * 10),
  };
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                  */
/* -------------------------------------------------------------------------- */

export type QuoteAnswers =
  | ({ kind: "PART" } & PartInput)
  | ({ kind: "SYSTEM" } & SystemInput)
  | ({ kind: "DUCTWORK" } & DuctworkInput)
  | ({ kind: "INDOOR_AIR" } & { products: IaqProductId[] });

export function estimate(answers: QuoteAnswers): Range {
  switch (answers.kind) {
    case "PART":
      return estimatePart(answers);
    case "SYSTEM":
      return estimateSystem(answers);
    case "DUCTWORK":
      return estimateDuctwork(answers);
    case "INDOOR_AIR":
      return estimateIaq(answers);
    default:
      return { low: 0, high: 0 };
  }
}

export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
