import {
  DEALER_PERSONAL_LEDGER_ELECTRONICS,
  DEALER_PERSONAL_LEDGER_EV,
  DEALER_STORE_TXNS_ELECTRONICS,
  DEALER_STORE_TXNS_EV,
  PROMOTER_LEDGER_ELECTRONICS,
  PROMOTER_LEDGER_EV,
} from "./earningsTransactionsMock.js";

/**
 * @param {{ domain: 'Electronics'|'EV' }} ctx
 */
export function fetchPromoterLedger(ctx) {
  const rows = ctx.domain === "EV" ? PROMOTER_LEDGER_EV : PROMOTER_LEDGER_ELECTRONICS;
  return Promise.resolve(rows.map((r) => ({ ...r })));
}

/**
 * @param {{ domain: 'Electronics'|'EV' }} ctx
 */
export function fetchDealerPersonalCommission(ctx) {
  const rows = ctx.domain === "EV" ? DEALER_PERSONAL_LEDGER_EV : DEALER_PERSONAL_LEDGER_ELECTRONICS;
  return Promise.resolve(rows.map((r) => ({ ...r })));
}

/**
 * @param {{
 *   domain: 'Electronics'|'EV',
 *   promoter: string,
 *   datePreset: 'today'|'7d'|'30d'|'all',
 *   product: string,
 *   status: string,
 * }} ctx
 */
export function fetchDealerStoreTransactions(ctx) {
  const raw = ctx.domain === "EV" ? DEALER_STORE_TXNS_EV : DEALER_STORE_TXNS_ELECTRONICS;
  let rows = raw.map((r) => ({ ...r }));

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };

  if (ctx.datePreset === "today") {
    rows = rows.filter((r) => r.dateIso === today);
  } else if (ctx.datePreset === "7d") {
    const min = cutoff(7);
    rows = rows.filter((r) => r.dateIso >= min);
  } else if (ctx.datePreset === "30d") {
    const min = cutoff(30);
    rows = rows.filter((r) => r.dateIso >= min);
  }

  if (ctx.promoter && ctx.promoter !== "all") {
    rows = rows.filter((r) => r.promoterName === ctx.promoter);
  }

  if (ctx.product && ctx.product !== "all") {
    rows = rows.filter((r) => r.productLabel.includes(ctx.product));
  }

  if (ctx.status && ctx.status !== "all") {
    rows = rows.filter((r) => r.status === ctx.status);
  }

  rows.sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  return Promise.resolve(rows);
}

export function uniquePromoterNames(rows) {
  return [...new Set(rows.map((r) => r.promoterName))].sort();
}

export function promoterListForFilter(domain) {
  const raw = domain === "EV" ? DEALER_STORE_TXNS_EV : DEALER_STORE_TXNS_ELECTRONICS;
  return uniquePromoterNames(raw);
}

/** Dropdown values; filter uses substring match on product label */
export function productFilterOptions(domain) {
  if (domain === "EV") {
    return ["all", "Hero Vida", "ECW", "EBW"];
  }
  return ["all", "Xiaomi", "Redmi", "Oppo", "POCO", "Samsung"];
}
