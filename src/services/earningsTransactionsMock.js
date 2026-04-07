/**
 * Mock ledger / store transaction data for Earnings tab (simulator).
 * Dates use YYYY-MM-DD (local demo “today” aligned with client).
 */

const TODAY = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const YEST = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const DAYS_AGO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/** @typedef {'Available'|'Pending'|'Withdrawn'} TxnStatus */

/**
 * @typedef {{
 *   id: string,
 *   dateIso: string,
 *   timeLabel: string,
 *   productLabel: string,
 *   commissionRupees: number,
 *   status: TxnStatus,
 * }} PromoterLedgerRow
 */

/** @type {PromoterLedgerRow[]} */
export const PROMOTER_LEDGER_ELECTRONICS = [
  {
    id: "pl1",
    dateIso: TODAY(),
    timeLabel: "2 min ago",
    productLabel: "Xiaomi 14 · 2Y Total Protection",
    commissionRupees: 180,
    status: "Available",
  },
  {
    id: "pl2",
    dateIso: TODAY(),
    timeLabel: "18 min ago",
    productLabel: "Redmi Note 13 · 1Y Accidental",
    commissionRupees: 88,
    status: "Pending",
  },
  {
    id: "pl3",
    dateIso: TODAY(),
    timeLabel: "11:20 am",
    productLabel: "Oppo Reno11 · 1Y ALD",
    commissionRupees: 88,
    status: "Available",
  },
  {
    id: "pl4",
    dateIso: YEST(),
    timeLabel: "Yesterday · 6:12 pm",
    productLabel: "Xiaomi 14 Pro · Money Back",
    commissionRupees: 210,
    status: "Available",
  },
  {
    id: "pl5",
    dateIso: DAYS_AGO(2),
    timeLabel: "2 days ago",
    productLabel: "Redmi 13C · Screen protect",
    commissionRupees: 45,
    status: "Withdrawn",
  },
  {
    id: "pl6",
    dateIso: DAYS_AGO(4),
    timeLabel: "4 days ago",
    productLabel: "POCO X6 · 2Y TP",
    commissionRupees: 120,
    status: "Withdrawn",
  },
];

/** @type {PromoterLedgerRow[]} */
export const PROMOTER_LEDGER_EV = PROMOTER_LEDGER_ELECTRONICS.map((r, i) => ({
  ...r,
  id: `ev-pl-${i}`,
  productLabel: ["Hero Vida ECW — V2", "Hero Vida EBW", "Hero Vida ECW", "Hero Vida ECW", "Hero Vida ECW", "Hero Vida ECW"][i % 6],
  commissionRupees: [450, 280, 450, 450, 200, 320][i % 6],
}));

/**
 * @typedef {{
 *   id: string,
 *   dateIso: string,
 *   timeLabel: string,
 *   promoterName: string,
 *   productLabel: string,
 *   commissionRupees: number,
 *   status: TxnStatus,
 * }} DealerStoreTxnRow
 */

/** @type {DealerStoreTxnRow[]} */
export const DEALER_STORE_TXNS_ELECTRONICS = [
  {
    id: "ds1",
    dateIso: TODAY(),
    timeLabel: "3 min ago",
    promoterName: "Arjun Sharma",
    productLabel: "Xiaomi 14 · 2Y TP",
    commissionRupees: 180,
    status: "Available",
  },
  {
    id: "ds2",
    dateIso: TODAY(),
    timeLabel: "22 min ago",
    promoterName: "Meera Iyer",
    productLabel: "Redmi Note 13 · 1Y ALD",
    commissionRupees: 88,
    status: "Pending",
  },
  {
    id: "ds3",
    dateIso: TODAY(),
    timeLabel: "10:05 am",
    promoterName: "Arjun Sharma",
    productLabel: "Oppo Reno11 · ALD",
    commissionRupees: 88,
    status: "Available",
  },
  {
    id: "ds4",
    dateIso: TODAY(),
    timeLabel: "9:40 am",
    promoterName: "Karthik N.",
    productLabel: "POCO M6 · 1Y",
    commissionRupees: 55,
    status: "Pending",
  },
  {
    id: "ds5",
    dateIso: YEST(),
    timeLabel: "Yesterday",
    promoterName: "Meera Iyer",
    productLabel: "Xiaomi 14 Pro · MB",
    commissionRupees: 210,
    status: "Available",
  },
  {
    id: "ds6",
    dateIso: DAYS_AGO(3),
    timeLabel: "3 days ago",
    promoterName: "Arjun Sharma",
    productLabel: "Redmi 13C",
    commissionRupees: 45,
    status: "Withdrawn",
  },
  {
    id: "ds7",
    dateIso: DAYS_AGO(5),
    timeLabel: "5 days ago",
    promoterName: "Karthik N.",
    productLabel: "Samsung A15 · plan",
    commissionRupees: 72,
    status: "Withdrawn",
  },
];

/** @type {DealerStoreTxnRow[]} */
export const DEALER_STORE_TXNS_EV = DEALER_STORE_TXNS_ELECTRONICS.map((r, i) => ({
  ...r,
  id: `ev-${r.id}`,
  productLabel: ["Hero Vida ECW — V2", "Hero Vida EBW", "Hero Vida ECW", "Hero Vida ECW", "Hero Vida ECW", "Hero Vida ECW", "Hero Vida ECW"][i % 7],
  commissionRupees: [450, 280, 450, 200, 450, 200, 310][i % 7],
}));

/** Dealer’s own commission (not aggregated store) — same shape as promoter ledger rows */
export const DEALER_PERSONAL_LEDGER_ELECTRONICS = [
  {
    id: "dl1",
    dateIso: TODAY(),
    timeLabel: "1 hr ago",
    productLabel: "Store override · Xiaomi 14 bundle",
    commissionRupees: 95,
    status: "Available",
  },
  {
    id: "dl2",
    dateIso: YEST(),
    timeLabel: "Yesterday",
    productLabel: "Dealer SPIFF · Redmi launch",
    commissionRupees: 500,
    status: "Pending",
  },
  {
    id: "dl3",
    dateIso: DAYS_AGO(6),
    timeLabel: "6 days ago",
    productLabel: "OEM co-sell bonus",
    commissionRupees: 1200,
    status: "Withdrawn",
  },
];

export const DEALER_PERSONAL_LEDGER_EV = DEALER_PERSONAL_LEDGER_ELECTRONICS.map((r, i) => ({
  ...r,
  id: `ev-${r.id}`,
  productLabel: ["Hero Vida dealer SPIFF", "EV launch kicker", "OEM co-sell"][i % 3],
  commissionRupees: [120, 800, 2400][i % 3],
}));
