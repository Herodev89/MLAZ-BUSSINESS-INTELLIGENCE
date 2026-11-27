export const FOOTWEAR_LEDGER_CATEGORIES = [
  { id: "Male Sandals", label: "Male Sandals", group: "Male Footwear" },
  { id: "Male Flat Shoes", label: "Male Flat Shoes", group: "Male Footwear" },
  { id: "Male Half-Covered Shoes", label: "Male Half-Covered Shoes", group: "Male Footwear" },
  { id: "Male Covered Shoes", label: "Male Covered Shoes", group: "Male Footwear" },
  { id: "Children Shoes - Male", label: "Children Shoes - Male", group: "Male Footwear" },
  { id: "Female Flat Shoes", label: "Female Flat Shoes", group: "Female Footwear" },
  { id: "Female Half-Covered Shoes", label: "Female Half-Covered Shoes", group: "Female Footwear" },
  { id: "Female Sandals", label: "Female Sandals", group: "Female Footwear" },
  { id: "Female Covered Shoes", label: "Female Covered Shoes", group: "Female Footwear" },
  { id: "Children Shoes - Female", label: "Children Shoes - Female", group: "Female Footwear" },
] as const;

export type FootwearLedgerCategoryId = (typeof FOOTWEAR_LEDGER_CATEGORIES)[number]["id"];
export type FootwearGroup = "Male Footwear" | "Female Footwear";

export const CALENDAR_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const EXACT_CATEGORY_SET = new Set<string>(FOOTWEAR_LEDGER_CATEGORIES.map((c) => c.id));

/**
 * Classifies any MLAZ footwear product name + category into one of the 10 standard ledger categories.
 */
export function classifyFootwearCategory(
  productName: string,
  productCategory?: string
): FootwearLedgerCategoryId {
  if (productCategory && EXACT_CATEGORY_SET.has(productCategory)) {
    return productCategory as FootwearLedgerCategoryId;
  }

  const name = String(productName || "").toLowerCase();
  const cat = String(productCategory || "").toLowerCase();

  // 1. Children Shoes
  if (name.includes("child") || cat === "kids") {
    if (name.includes("female") || name.includes("girl")) {
      return "Children Shoes - Female";
    }
    return "Children Shoes - Male";
  }

  // 2. Female Footwear
  const isFemale = name.includes("female") || name.includes("felame") || name.includes("women") || cat === "women";
  if (isFemale) {
    if (name.includes("half cover") || name.includes("half-cover")) {
      return "Female Half-Covered Shoes";
    }
    if (name.includes("sandal")) {
      return "Female Sandals";
    }
    if (name.includes("cover")) {
      return "Female Covered Shoes";
    }
    return "Female Flat Shoes";
  }

  // 3. Male & Unisex Footwear
  if (name.includes("half cover") || name.includes("half-cover")) {
    return "Male Half-Covered Shoes";
  }
  if (name.includes("cover shoe") || (name.includes("cover") && !name.includes("slipper"))) {
    return "Male Covered Shoes";
  }
  if (
    name.includes("sandal") ||
    name.includes("slide") ||
    name.includes("slipper") ||
    name.includes("pams") ||
    name.includes("h pekka") ||
    cat === "sandals" ||
    cat === "slippers" ||
    cat === "pams"
  ) {
    return "Male Sandals";
  }

  return "Male Flat Shoes";
}

export function getGroupForCategory(catId: FootwearLedgerCategoryId): FootwearGroup {
  const found = FOOTWEAR_LEDGER_CATEGORIES.find((c) => c.id === catId);
  return found ? found.group : "Male Footwear";
}

export interface LedgerCell {
  produced: number;
  sold: number;
  revenue: number;
  net: number;
}

export interface StyleLedgerColumn {
  id: string;
  label: string;
  category: FootwearLedgerCategoryId;
  group: FootwearGroup;
  totalProduced: number;
  totalSold: number;
  totalRevenue: number;
}

export interface MonthlyLedgerResult {
  year: number;
  months: string[];
  // 12 rows keyed by category id
  byCategory: Record<FootwearLedgerCategoryId, LedgerCell>[];
  categoryTotals: Record<FootwearLedgerCategoryId, LedgerCell>;
  // 12 rows keyed by style id
  styles: StyleLedgerColumn[];
  byStyle: Record<string, LedgerCell>[];
  styleTotals: Record<string, LedgerCell>;
  monthlyTotals: LedgerCell[];
  grandTotal: LedgerCell;
}

export interface BuildMonthlyLedgerInput {
  year: number;
  sales: any[];
  productionRuns: any[];
  products?: any[];
  includeInProgressProduction?: boolean;
}

function emptyCell(): LedgerCell {
  return { produced: 0, sold: 0, revenue: 0, net: 0 };
}

export function buildMonthlyFootwearLedger(input: BuildMonthlyLedgerInput): MonthlyLedgerResult {
  const { year, sales, productionRuns, products = [], includeInProgressProduction = false } = input;

  // Build productName -> productCategory lookup from Products catalog
  const productCatLookup = new Map<string, string>();
  const styleDisplayMap = new Map<string, string>();
  for (const p of products) {
    const rawName = String(p.name || "").trim();
    if (!rawName) continue;
    const key = rawName.toLowerCase();
    productCatLookup.set(key, String(p.category || ""));
    styleDisplayMap.set(key, rawName);
  }

  const resolveStyleAndCategory = (rawProductName: string) => {
    const cleaned = String(rawProductName || "Unspecified Style").trim() || "Unspecified Style";
    const key = cleaned.toLowerCase();
    const display = styleDisplayMap.get(key) || cleaned;
    if (!styleDisplayMap.has(key)) styleDisplayMap.set(key, display);
    const prodCat = productCatLookup.get(key);
    const category = classifyFootwearCategory(display, prodCat);
    const group = getGroupForCategory(category);
    return { key, display, category, group };
  };

  // Initialize 12 monthly buckets for categories
  const byCategory: Record<FootwearLedgerCategoryId, LedgerCell>[] = CALENDAR_MONTHS.map(() => {
    const row = {} as Record<FootwearLedgerCategoryId, LedgerCell>;
    for (const c of FOOTWEAR_LEDGER_CATEGORIES) {
      row[c.id] = emptyCell();
    }
    return row;
  });

  const categoryTotals = {} as Record<FootwearLedgerCategoryId, LedgerCell>;
  for (const c of FOOTWEAR_LEDGER_CATEGORIES) {
    categoryTotals[c.id] = emptyCell();
  }

  // Track style buckets dynamically across catalog + activity
  const styleMetaMap = new Map<string, StyleLedgerColumn>();
  const styleMonthlyMap = new Map<string, LedgerCell[]>();

  const ensureStyle = (key: string, display: string, category: FootwearLedgerCategoryId, group: FootwearGroup) => {
    if (!styleMetaMap.has(key)) {
      styleMetaMap.set(key, {
        id: key,
        label: display,
        category,
        group,
        totalProduced: 0,
        totalSold: 0,
        totalRevenue: 0,
      });
      styleMonthlyMap.set(
        key,
        CALENDAR_MONTHS.map(() => emptyCell())
      );
    }
  };

  for (const p of products) {
    if (p.status === "Inactive") continue;
    const info = resolveStyleAndCategory(p.name);
    ensureStyle(info.key, info.display, info.category, info.group);
  }

  const monthlyTotals: LedgerCell[] = CALENDAR_MONTHS.map(() => emptyCell());
  const grandTotal = emptyCell();

  const extractYearMonth = (dateVal: any): { y: number; m: number } | null => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  };

  // 1. Aggregate Production Runs
  for (const run of productionRuns || []) {
    if (run.status === "Cancelled") continue;
    if (!includeInProgressProduction && run.status !== "Completed") continue;
    const ym = extractYearMonth(run.productionDate || run.createdAt);
    if (!ym || ym.y !== year) continue;

    const qty = Math.max(0, Number(run.qtyProduced) || 0);
    if (qty === 0) continue;

    const info = resolveStyleAndCategory(run.productName);
    ensureStyle(info.key, info.display, info.category, info.group);

    byCategory[ym.m][info.category].produced += qty;
    byCategory[ym.m][info.category].net += qty;
    categoryTotals[info.category].produced += qty;
    categoryTotals[info.category].net += qty;

    const sArr = styleMonthlyMap.get(info.key)!;
    sArr[ym.m].produced += qty;
    sArr[ym.m].net += qty;
    styleMetaMap.get(info.key)!.totalProduced += qty;

    monthlyTotals[ym.m].produced += qty;
    monthlyTotals[ym.m].net += qty;
    grandTotal.produced += qty;
    grandTotal.net += qty;
  }

  // 2. Aggregate Sales
  for (const sale of sales || []) {
    if (sale.status === "Cancelled") continue;
    const ym = extractYearMonth(sale.createdAt);
    if (!ym || ym.y !== year) continue;

    const qty = Math.max(0, Number(sale.quantity) || 0);
    const rev = Number(sale.amount) || 0;
    if (qty === 0 && rev === 0) continue;

    const info = resolveStyleAndCategory(sale.productName);
    ensureStyle(info.key, info.display, info.category, info.group);

    byCategory[ym.m][info.category].sold += qty;
    byCategory[ym.m][info.category].revenue += rev;
    byCategory[ym.m][info.category].net -= qty;
    categoryTotals[info.category].sold += qty;
    categoryTotals[info.category].revenue += rev;
    categoryTotals[info.category].net -= qty;

    const sArr = styleMonthlyMap.get(info.key)!;
    sArr[ym.m].sold += qty;
    sArr[ym.m].revenue += rev;
    sArr[ym.m].net -= qty;
    const meta = styleMetaMap.get(info.key)!;
    meta.totalSold += qty;
    meta.totalRevenue += rev;

    monthlyTotals[ym.m].sold += qty;
    monthlyTotals[ym.m].revenue += rev;
    monthlyTotals[ym.m].net -= qty;
    grandTotal.sold += qty;
    grandTotal.revenue += rev;
    grandTotal.net -= qty;
  }

  const styles = Array.from(styleMetaMap.values()).sort((a, b) => {
    const activityA = a.totalSold + a.totalProduced;
    const activityB = b.totalSold + b.totalProduced;
    if (activityB !== activityA) return activityB - activityA;
    return a.label.localeCompare(b.label);
  });

  const byStyle: Record<string, LedgerCell>[] = CALENDAR_MONTHS.map((_, mIdx) => {
    const row: Record<string, LedgerCell> = {};
    for (const s of styles) {
      row[s.id] = styleMonthlyMap.get(s.id)![mIdx];
    }
    return row;
  });

  const styleTotals: Record<string, LedgerCell> = {};
  for (const s of styles) {
    styleTotals[s.id] = {
      produced: s.totalProduced,
      sold: s.totalSold,
      revenue: s.totalRevenue,
      net: s.totalProduced - s.totalSold,
    };
  }

  return {
    year,
    months: [...CALENDAR_MONTHS],
    byCategory,
    categoryTotals,
    styles,
    byStyle,
    styleTotals,
    monthlyTotals,
    grandTotal,
  };
}
