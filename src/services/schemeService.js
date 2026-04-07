import { SCHEME_MOCK_DATA, SCHEME_EARNINGS_MONTHLY_RUPEES } from "./schemeMockData.js";

/**
 * @typedef {'policy_count'|'attach_rate'|'plan_type_mix'} SchemeMetricType
 * @typedef {'flat'|'tiered'} PayoutStructure
 * @typedef {'active'|'expiring_soon'|'expired'|'upcoming'} SchemeStatus
 * @typedef {{ threshold: number, payout: number, achieved: boolean }} SchemeTier
 * @typedef {{ staffName: string, sales: number }} SchemeStaffRow
 * @typedef {{ mySales: number, storeTotal: number, targetValue: number }} SchemeProgress
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   brand: string,
 *   validityStart: string,
 *   validityEnd: string,
 *   targetMetric: SchemeMetricType,
 *   targetValue: number,
 *   payoutStructure: PayoutStructure,
 *   flatPayoutAmount: number|null,
 *   tiers: SchemeTier[]|null,
 *   eligibilityProducts: string[],
 *   eligibilitySellerLevels: string[],
 *   progress: SchemeProgress,
 *   status: SchemeStatus,
 *   domain: 'Electronics'|'EV'|'all',
 *   staffBreakdown: SchemeStaffRow[],
 * }} SchemeRecord
 */

/**
 * @param {{ persona: string, domain: 'Electronics'|'EV' }} ctx
 * @returns {Promise<SchemeRecord[]>}
 */
export function fetchSchemes(ctx) {
  const { domain } = ctx;
  const rows = SCHEME_MOCK_DATA.filter((s) => s.domain === domain || s.domain === "all");
  return Promise.resolve(rows.map((r) => ({ ...r })));
}

/**
 * @param {string} id
 * @param {{ persona: string }} ctx
 * @returns {Promise<SchemeRecord|null>}
 */
export function fetchSchemeById(id, ctx) {
  const row = SCHEME_MOCK_DATA.find((s) => s.id === id);
  if (!row) return Promise.resolve(null);
  void ctx;
  return Promise.resolve({ ...row });
}

/**
 * Whether any scheme for this domain is ending soon (for Promoter quick-link dot).
 * @param {{ domain: 'Electronics'|'EV' }} ctx
 * @returns {boolean}
 */
export function hasExpiringSoonScheme(ctx) {
  const { domain } = ctx;
  return SCHEME_MOCK_DATA.some(
    (s) => (s.domain === domain || s.domain === "all") && s.status === "expiring_soon",
  );
}

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   current: number,
 *   target: number,
 *   unitLabel: string,
 *   isPercent: boolean,
 *   gapMore: number,
 *   gapPayoutRupee: number,
 * }} EarningsIngressUrgentScheme
 *
 * @typedef {{
 *   schemeEarningsThisMonthRupees: number,
 *   activeSchemeCount: number,
 *   urgentScheme: EarningsIngressUrgentScheme|null,
 * }} EarningsIngressCardPayload
 */

function pickMostUrgentActiveScheme(schemes) {
  const elig = schemes.filter((s) => s.status === "active" || s.status === "expiring_soon");
  if (!elig.length) return null;
  return [...elig].sort((a, b) => {
    const pa = a.status === "expiring_soon" ? 0 : 1;
    const pb = b.status === "expiring_soon" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return (
      new Date(`${a.validityEnd}T12:00:00`).getTime() - new Date(`${b.validityEnd}T12:00:00`).getTime()
    );
  })[0];
}

export function computeGapToNextTier(scheme, current) {
  if (scheme.tiers && scheme.tiers.length) {
    const next = scheme.tiers.find((t) => !t.achieved && t.threshold > current);
    if (next) {
      return {
        gapMore: Math.max(0, next.threshold - current),
        gapPayout: next.payout,
      };
    }
  }
  if (scheme.payoutStructure === "flat" && scheme.flatPayoutAmount != null) {
    const gap = Math.max(0, scheme.progress.targetValue - current);
    return { gapMore: gap, gapPayout: scheme.flatPayoutAmount };
  }
  return { gapMore: 0, gapPayout: 0 };
}

function buildIngressUrgentStrip(scheme, isDealer) {
  const tgt = scheme.targetMetric === "attach_rate" || scheme.targetMetric === "plan_type_mix";
  const cur = isDealer ? scheme.progress.storeTotal : scheme.progress.mySales;
  const { gapMore, gapPayout } = computeGapToNextTier(scheme, cur);
  const unitLabel =
    scheme.targetMetric === "policy_count" ? "plans" : scheme.targetMetric === "attach_rate" ? "attach" : "mix";
  return {
    id: scheme.id,
    name: scheme.name,
    current: cur,
    target: scheme.progress.targetValue,
    unitLabel,
    isPercent: tgt,
    gapMore,
    gapPayoutRupee: gapPayout,
  };
}

/**
 * @param {{ domain: 'Electronics'|'EV', isDealer: boolean }} ctx
 * @returns {Promise<EarningsIngressCardPayload>}
 */
export function fetchEarningsIngressCard(ctx) {
  const { domain, isDealer } = ctx;
  const rows = SCHEME_MOCK_DATA.filter((s) => s.domain === domain || s.domain === "all");
  const monthly = SCHEME_EARNINGS_MONTHLY_RUPEES[domain] || { my: 0, store: 0 };
  const active = rows.filter((s) => s.status === "active" || s.status === "expiring_soon");
  const urgent = pickMostUrgentActiveScheme(rows);
  const payload = {
    schemeEarningsThisMonthRupees: isDealer ? monthly.store : monthly.my,
    activeSchemeCount: active.length,
    urgentScheme: urgent ? buildIngressUrgentStrip(urgent, isDealer) : null,
  };
  return Promise.resolve(payload);
}

/**
 * Highest payout amount shown in list cards (tier max or flat).
 * @param {{ tiers?: { payout: number }[]|null, payoutStructure: string, flatPayoutAmount: number|null }} scheme
 */
export function maxDisplayPayoutRupees(scheme) {
  if (scheme.payoutStructure === "flat" && scheme.flatPayoutAmount != null) return scheme.flatPayoutAmount;
  if (scheme.tiers && scheme.tiers.length) return Math.max(...scheme.tiers.map((t) => t.payout));
  return 0;
}
