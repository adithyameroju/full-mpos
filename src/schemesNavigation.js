export const SCHEMES_FROM_TAB_KEY = "schemesFromTab";

/** @param {'home'|'earnings'|'team'} tab */
export function setSchemesEntryTab(tab) {
  try {
    sessionStorage.setItem(SCHEMES_FROM_TAB_KEY, tab);
  } catch (_) {
    /* ignore */
  }
}

/** @returns {'home'|'earnings'|'team'} */
export function getSchemesEntryTab() {
  try {
    const v = sessionStorage.getItem(SCHEMES_FROM_TAB_KEY);
    if (v === "home" || v === "earnings" || v === "team") return v;
  } catch (_) {
    /* ignore */
  }
  return "home";
}
