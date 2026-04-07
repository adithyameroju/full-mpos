/**
 * Promoter Earnings — transactions mock + client-side filter/summary helpers.
 */

const TEAL = "#1D9E75";
const AMBER = "#BA7517";
const RED = "#E24B4A";

function pad(n) {
  return String(n).padStart(2, "0");
}

function startOfMonday(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** @returns {{ start: Date, end: Date }} */
export function computeDateRange(preset, customStart, customEnd) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  if (preset === "today") {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  if (preset === "this_week") {
    const start = startOfMonday(today);
    return { start, end };
  }
  if (preset === "this_month") {
    const start = startOfMonth(today);
    return { start, end };
  }
  if (preset === "last_month") {
    const firstThis = startOfMonth(today);
    const lastPrev = new Date(firstThis);
    lastPrev.setDate(0);
    const start = startOfMonth(lastPrev);
    const endM = endOfMonth(lastPrev);
    return { start, end: endM };
  }
  if (preset === "custom" && customStart && customEnd) {
    const s = new Date(customStart);
    s.setHours(0, 0, 0, 0);
    const e = new Date(customEnd);
    e.setHours(23, 59, 59, 999);
    return { start: s, end: e };
  }
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export function formatCustomChipLabel(startIso, endIso) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const o = { day: "numeric", month: "short" };
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${e.toLocaleString("en-IN", { month: "short" })}`;
  }
  return `${s.toLocaleString("en-IN", o)} – ${e.toLocaleString("en-IN", o)}`;
}

export function formatTxnRowDateTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const t = `${d.getHours() % 12 || 12}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  if (dday.getTime() === today.getTime()) return `Today, ${t}`;
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (dday.getTime() === yest.getTime()) return `Yesterday, ${t}`;
  return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}, ${t}`;
}

/**
 * @typedef {{
 *   id: string,
 *   occurredAt: string,
 *   deviceBrand: string,
 *   deviceModel: string,
 *   planCode: string,
 *   tenureLabel: string,
 *   premiumRupees: number,
 *   baseCommissionRupees: number,
 *   schemeBonusRupees: number,
 *   schemeName: string,
 *   tdsRupees: number,
 *   netCreditedRupees: number,
 *   pendingCommissionRupees: number,
 *   uiKind: 'credited'|'pending'|'reversed'|'withdrawn',
 *   displayStatus: 'Credited'|'Pending'|'Reversed'|'Withdrawn',
 *   smEarned: boolean,
 *   smApproved: boolean,
 *   smEncashed: boolean,
 *   smReversed: boolean,
 *   reversalReason: string|null,
 *   policyNumber: string,
 *   productCategory: 'Electronics'|'EV'|'White Goods',
 *   planTypeFilter: 'ALD'|'EW'|'Total Protection',
 *   customerNameMask: string,
 *   coverageSummary: string,
 * }} PromoterTxn
 */

function at(daysFromToday, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** Build demo rows relative to "now" so filters always have data */
export function buildPromoterTransactions() {
  /** @type {PromoterTxn[]} */
  const rows = [
    {
      occurredAt: at(0, 14, 34),
      id: "pt1",
      deviceBrand: "Xiaomi",
      deviceModel: "13 Pro",
      planCode: "ALD",
      tenureLabel: "2 year",
      premiumRupees: 4500,
      baseCommissionRupees: 100,
      schemeBonusRupees: 20,
      schemeName: "March boost",
      tdsRupees: 12,
      netCreditedRupees: 108,
      pendingCommissionRupees: 0,
      uiKind: "credited",
      displayStatus: "Credited",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-XM-2025-000981",
      productCategory: "Electronics",
      planTypeFilter: "ALD",
      customerNameMask: "Rahul M.",
      coverageSummary: "Accidental damage + extended warranty bundle.",
    },
    {
      occurredAt: at(0, 11, 5),
      id: "pt2",
      deviceBrand: "Oppo",
      deviceModel: "Reno 10",
      planCode: "EW",
      tenureLabel: "1 year",
      premiumRupees: 3200,
      baseCommissionRupees: 88,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 0,
      netCreditedRupees: 0,
      pendingCommissionRupees: 88,
      uiKind: "pending",
      displayStatus: "Pending",
      smEarned: true,
      smApproved: false,
      smEncashed: false,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-OP-2025-004120",
      productCategory: "Electronics",
      planTypeFilter: "EW",
      customerNameMask: "Sneha K.",
      coverageSummary: "Electronics warranty · labour included.",
    },
    {
      occurredAt: at(0, 9, 40),
      id: "pt3",
      deviceBrand: "Redmi",
      deviceModel: "Note 13",
      planCode: "Total Protection",
      tenureLabel: "2 year",
      premiumRupees: 2100,
      baseCommissionRupees: 45,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 5,
      netCreditedRupees: 40,
      pendingCommissionRupees: 0,
      uiKind: "credited",
      displayStatus: "Credited",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-RM-2025-002200",
      productCategory: "Electronics",
      planTypeFilter: "Total Protection",
      customerNameMask: "Vikram S.",
      coverageSummary: "Screen + liquid damage cover.",
    },
    {
      occurredAt: at(-1, 18, 12),
      id: "pt4",
      deviceBrand: "Samsung",
      deviceModel: "A15",
      planCode: "ALD",
      tenureLabel: "1 year",
      premiumRupees: 2800,
      baseCommissionRupees: 72,
      schemeBonusRupees: 10,
      schemeName: "Weekend SPIFF",
      tdsRupees: 8,
      netCreditedRupees: 74,
      pendingCommissionRupees: 0,
      uiKind: "withdrawn",
      displayStatus: "Withdrawn",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-SM-2025-001900",
      productCategory: "Electronics",
      planTypeFilter: "ALD",
      customerNameMask: "Anita P.",
      coverageSummary: "Accidental + theft rider.",
    },
    {
      occurredAt: at(-2, 16, 0),
      id: "pt5",
      deviceBrand: "POCO",
      deviceModel: "X6",
      planCode: "EW",
      tenureLabel: "2 year",
      premiumRupees: 1900,
      baseCommissionRupees: 120,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 14,
      netCreditedRupees: 106,
      pendingCommissionRupees: 0,
      uiKind: "credited",
      displayStatus: "Credited",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-PC-2025-000811",
      productCategory: "Electronics",
      planTypeFilter: "EW",
      customerNameMask: "Deepak R.",
      coverageSummary: "Standard EW · authorised service.",
    },
    {
      occurredAt: at(-3, 12, 30),
      id: "pt6",
      deviceBrand: "Xiaomi",
      deviceModel: "14",
      planCode: "ALD",
      tenureLabel: "2 year",
      premiumRupees: 5200,
      baseCommissionRupees: 180,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 22,
      netCreditedRupees: -158,
      pendingCommissionRupees: 0,
      uiKind: "reversed",
      displayStatus: "Reversed",
      smEarned: true,
      smApproved: true,
      smEncashed: false,
      smReversed: true,
      reversalReason: "Policy cancelled by customer",
      policyNumber: "POL-XM-2025-000700",
      productCategory: "Electronics",
      planTypeFilter: "ALD",
      customerNameMask: "Kiran L.",
      coverageSummary: "ALD full cover.",
    },
    {
      occurredAt: at(-5, 10, 15),
      id: "pt7",
      deviceBrand: "LG",
      deviceModel: "Washing machine",
      planCode: "EW",
      tenureLabel: "3 year",
      premiumRupees: 4100,
      baseCommissionRupees: 95,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 10,
      netCreditedRupees: 85,
      pendingCommissionRupees: 0,
      uiKind: "credited",
      displayStatus: "Credited",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-WG-2025-000301",
      productCategory: "White Goods",
      planTypeFilter: "EW",
      customerNameMask: "Meera T.",
      coverageSummary: "White goods extended warranty.",
    },
    {
      occurredAt: at(-8, 15, 45),
      id: "pt8",
      deviceBrand: "Hero Vida",
      deviceModel: "V2",
      planCode: "Total Protection",
      tenureLabel: "1 year",
      premiumRupees: 12000,
      baseCommissionRupees: 450,
      schemeBonusRupees: 50,
      schemeName: "EV launch",
      tdsRupees: 50,
      netCreditedRupees: 450,
      pendingCommissionRupees: 0,
      uiKind: "credited",
      displayStatus: "Credited",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-EV-2025-000044",
      productCategory: "EV",
      planTypeFilter: "Total Protection",
      customerNameMask: "Naveen G.",
      coverageSummary: "Battery + motor + controller cover.",
    },
    {
      occurredAt: at(-25, 11, 20),
      id: "pt9",
      deviceBrand: "Realme",
      deviceModel: "12",
      planCode: "ALD",
      tenureLabel: "1 year",
      premiumRupees: 2400,
      baseCommissionRupees: 65,
      schemeBonusRupees: 0,
      schemeName: "",
      tdsRupees: 7,
      netCreditedRupees: 58,
      pendingCommissionRupees: 0,
      uiKind: "withdrawn",
      displayStatus: "Withdrawn",
      smEarned: true,
      smApproved: true,
      smEncashed: true,
      smReversed: false,
      reversalReason: null,
      policyNumber: "POL-RL-2025-000112",
      productCategory: "Electronics",
      planTypeFilter: "ALD",
      customerNameMask: "Pooja D.",
      coverageSummary: "Standard accidental damage.",
    },
  ];

  return rows.map((r) => ({ ...r }));
}

export function fetchPromoterTransactions() {
  return Promise.resolve(buildPromoterTransactions());
}

/**
 * @param {PromoterTxn[]} rows
 * @param {{ start: Date, end: Date }} range
 */
export function filterByDateRange(rows, range) {
  const t0 = range.start.getTime();
  const t1 = range.end.getTime();
  return rows.filter((r) => {
    const t = new Date(r.occurredAt).getTime();
    return t >= t0 && t <= t1;
  });
}

/**
 * @param {PromoterTxn[]} rows
 * @param {{
 *   status: string,
 *   productType: string,
 *   planType: string,
 *   minCommission: string,
 *   maxCommission: string,
 * }} f
 */
export function applySheetFilters(rows, f) {
  let out = rows;
  if (f.status && f.status !== "all") {
    const map = { Credited: "credited", Pending: "pending", Reversed: "reversed", Withdrawn: "withdrawn" };
    const k = map[f.status];
    out = out.filter((r) => r.uiKind === k);
  }
  if (f.productType && f.productType !== "all") {
    out = out.filter((r) => r.productCategory === f.productType);
  }
  if (f.planType && f.planType !== "all") {
    out = out.filter((r) => r.planTypeFilter === f.planType);
  }
  const minV = f.minCommission.trim() === "" ? null : Number(f.minCommission);
  const maxV = f.maxCommission.trim() === "" ? null : Number(f.maxCommission);
  if (minV != null && !Number.isNaN(minV)) {
    out = out.filter((r) => amountForFilter(r) >= minV);
  }
  if (maxV != null && !Number.isNaN(maxV)) {
    out = out.filter((r) => amountForFilter(r) <= maxV);
  }
  return out;
}

function amountForFilter(r) {
  if (r.uiKind === "pending") return r.pendingCommissionRupees;
  if (r.uiKind === "reversed") return Math.abs(r.netCreditedRupees || r.baseCommissionRupees + r.schemeBonusRupees);
  return r.netCreditedRupees || r.pendingCommissionRupees;
}

/**
 * @param {PromoterTxn[]} rows
 */
export function computeSummary(rows) {
  let sales = 0;
  let earned = 0;
  let pending = 0;
  for (const r of rows) {
    sales += 1;
    if (r.uiKind === "pending") {
      pending += r.pendingCommissionRupees;
    } else if (r.uiKind === "reversed") {
      earned += r.netCreditedRupees;
    } else if (r.uiKind === "credited" || r.uiKind === "withdrawn") {
      earned += r.netCreditedRupees;
    }
  }
  return { sales, earned: Math.round(earned), pending: Math.round(pending) };
}

export function buildCsv(rows) {
  const header = [
    "Date",
    "Time",
    "Device",
    "Plan type",
    "Tenure",
    "Premium",
    "Base commission",
    "Scheme bonus",
    "TDS",
    "Net commission",
    "Status",
    "Policy number",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    const d = new Date(r.occurredAt);
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const device = `${r.deviceBrand} ${r.deviceModel}`.replace(/,/g, " ");
    const net =
      r.uiKind === "pending"
        ? r.pendingCommissionRupees
        : r.uiKind === "reversed"
          ? -(r.baseCommissionRupees + r.schemeBonusRupees - r.tdsRupees)
          : r.netCreditedRupees;
    lines.push(
      [
        dateStr,
        timeStr,
        `"${device}"`,
        r.planCode,
        `"${r.tenureLabel}"`,
        r.premiumRupees,
        r.baseCommissionRupees,
        r.schemeBonusRupees,
        r.tdsRupees,
        net,
        r.displayStatus,
        r.policyNumber,
      ].join(","),
    );
  }
  return "\uFEFF" + lines.join("\n");
}

export const PROMOTER_TXN_COLORS = { TEAL, AMBER, RED };
