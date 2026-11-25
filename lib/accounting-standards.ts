// Comprehensive Financial Statements & Nigerian Accounting Standards Engine
// Compliant with:
// - IFRS / IAS 1 (Presentation of Financial Statements), IAS 2 (Inventories),
//   IAS 7 (Statement of Cash Flows), IAS 12 (Income Taxes), IAS 16 (PPE), IAS 38 (Intangibles)
// - Financial Reporting Council of Nigeria (FRCN) IFRS Adoption Framework
// - Companies and Allied Matters Act (CAMA) 2020 (Sections 377–385 & 426)
// - Nigerian Tax Provisions (Finance Act / FIRS: CIT Small/Medium/Large tiers & 3% Tertiary Education Tax)

export type FinancialEntryType =
  | "SHARE_CAPITAL"
  | "SHARE_PREMIUM"
  | "CAPITAL_INTRODUCED"
  | "OPENING_RETAINED_EARNINGS"
  | "DIVIDENDS_PAID"
  | "LONG_TERM_LOAN"
  | "DIRECTOR_LOAN"
  | "LONG_TERM_LOAN_REPAYMENT"
  | "DEFERRED_TAX_LIABILITY"
  | "TRADE_PAYABLE"
  | "TRADE_PAYABLE_SETTLEMENT"
  | "ACCRUED_EXPENSE"
  | "CUSTOMER_DEPOSIT"
  | "SHORT_TERM_LOAN"
  | "SHORT_TERM_LOAN_REPAYMENT"
  | "STATUTORY_PAYABLE"
  | "STATUTORY_REMITTANCE"
  | "PREPAYMENT"
  | "PREPAYMENT_AMORTISED"
  | "OTHER_RECEIVABLE"
  | "RECEIVABLE_COLLECTED"
  | "TAX_PAID";

export interface EntryTypeDefinition {
  code: FinancialEntryType;
  label: string;
  section: "EQUITY" | "NON_CURRENT_LIABILITY" | "CURRENT_LIABILITY" | "CURRENT_ASSET" | "TAX";
  cashFlowCategory: "Operating" | "Investing" | "Financing" | "Non-Cash";
  standardRef: string;
  hint: string;
}

export const FINANCIAL_ENTRY_TYPES: EntryTypeDefinition[] = [
  // Equity (CAMA 2020 / IAS 1)
  {
    code: "SHARE_CAPITAL",
    label: "Issued Ordinary Share Capital",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "CAMA 2020 s.124 / IAS 1",
    hint: "Issued ordinary share capital paid in cash by shareholders (min. ₦100,000 for private LTD under CAMA 2020).",
  },
  {
    code: "SHARE_PREMIUM",
    label: "Share Premium Account",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "CAMA 2020 s.145 / IAS 1",
    hint: "Excess consideration received above nominal par value of shares issued.",
  },
  {
    code: "CAPITAL_INTRODUCED",
    label: "Owner Capital Injection / General Reserve",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 1.78(e)",
    hint: "Additional capital contributed by owners/promoters or transferred to statutory/general reserves.",
  },
  {
    code: "OPENING_RETAINED_EARNINGS",
    label: "Opening Retained Earnings (Prior Periods)",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 1.106",
    hint: "Accumulated undistributed profits brought forward prior to system onboarding.",
  },
  {
    code: "DIVIDENDS_PAID",
    label: "Dividends Paid / Owner Drawings",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "CAMA 2020 s.426 / IAS 7.34",
    hint: "Cash dividends distributed to shareholders out of distributable profits or proprietor drawings.",
  },

  // Non-Current Liabilities
  {
    code: "LONG_TERM_LOAN",
    label: "Long-Term Bank / BOI Loan Received",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IFRS 9 / IAS 1.69",
    hint: "Proceeds from Bank of Industry (BOI), commercial bank term loans, or SME facilities due after 12 months.",
  },
  {
    code: "DIRECTOR_LOAN",
    label: "Director / Shareholder Long-Term Loan",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 24 / IFRS 9",
    hint: "Long-term loan advanced to the company by a director or related party.",
  },
  {
    code: "LONG_TERM_LOAN_REPAYMENT",
    label: "Repayment of Long-Term Loan Principal",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 7.17(d)",
    hint: "Cash principal repayment reducing long-term bank or director borrowings.",
  },
  {
    code: "DEFERRED_TAX_LIABILITY",
    label: "Deferred Tax Liability Provision",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Non-Cash",
    standardRef: "IAS 12",
    hint: "Temporary differences between carrying amount of PPE and FIRS capital allowances.",
  },

  // Current Liabilities
  {
    code: "TRADE_PAYABLE",
    label: "Trade Payables (Unpaid Suppliers)",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "IAS 1.54(k) / IFRS 9",
    hint: "Amounts owed to leather, sole, and raw material suppliers purchased on credit.",
  },
  {
    code: "TRADE_PAYABLE_SETTLEMENT",
    label: "Settlement of Supplier Trade Payables",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "IAS 7.14",
    hint: "Cash paid to settle previously recorded supplier trade payables.",
  },
  {
    code: "ACCRUED_EXPENSE",
    label: "Accrued Expenses & Other Payables",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "IAS 1.54(k)",
    hint: "Unpaid salaries, utilities, audit fees, or rent incurred but not yet paid at period end.",
  },
  {
    code: "CUSTOMER_DEPOSIT",
    label: "Customer Advance Deposits (Contract Liability)",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "IFRS 15.105",
    hint: "Upfront cash deposits received from wholesale/custom footwear buyers prior to delivery.",
  },
  {
    code: "SHORT_TERM_LOAN",
    label: "Short-Term Borrowing / Working Capital Facility",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IFRS 9 / IAS 1.69",
    hint: "Short-term loan or microfinance facility repayable within 12 months.",
  },
  {
    code: "SHORT_TERM_LOAN_REPAYMENT",
    label: "Repayment of Short-Term Borrowing",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 7.17(d)",
    hint: "Cash principal repayment of short-term borrowing.",
  },
  {
    code: "STATUTORY_PAYABLE",
    label: "Statutory Payables (VAT 7.5%, PAYE, Pension, NSITF)",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "Nigerian VAT Act / PITA / PRA",
    hint: "Output VAT, employee PAYE, contributory pension, ITF, or NSITF awaiting remittance.",
  },
  {
    code: "STATUTORY_REMITTANCE",
    label: "Statutory Remittance Paid (FIRS / SIRS / PFA)",
    section: "CURRENT_LIABILITY",
    cashFlowCategory: "Operating",
    standardRef: "Nigerian Tax / Pension Compliance",
    hint: "Cash remittance of VAT, PAYE, or Pension liabilities.",
  },

  // Current Assets
  {
    code: "PREPAYMENT",
    label: "Prepayments (Prepaid Rent, Insurance, Rates)",
    section: "CURRENT_ASSET",
    cashFlowCategory: "Operating",
    standardRef: "IAS 1.66",
    hint: "Annual/multi-year factory or showroom rent, insurance, or retainers paid in advance.",
  },
  {
    code: "PREPAYMENT_AMORTISED",
    label: "Prepayment Utilised / Amortised",
    section: "CURRENT_ASSET",
    cashFlowCategory: "Operating",
    standardRef: "IAS 1",
    hint: "Portion of prepaid rent/insurance expired and recognised in operating expenses.",
  },
  {
    code: "OTHER_RECEIVABLE",
    label: "Staff Advances, WHT Credit Notes & Other Receivables",
    section: "CURRENT_ASSET",
    cashFlowCategory: "Operating",
    standardRef: "IFRS 9 / Nigerian WHT Regs",
    hint: "Staff salary advances, Withholding Tax (WHT) credit notes, or sundry debtors.",
  },
  {
    code: "RECEIVABLE_COLLECTED",
    label: "Collection of Other Receivables",
    section: "CURRENT_ASSET",
    cashFlowCategory: "Operating",
    standardRef: "IAS 7.14",
    hint: "Cash recovered from staff advances or sundry receivables.",
  },

  // Corporate Tax Payments
  {
    code: "TAX_PAID",
    label: "Income Tax Paid to FIRS (CIT / Education Tax)",
    section: "TAX",
    cashFlowCategory: "Operating",
    standardRef: "IAS 7.35 / FIRS CITA",
    hint: "Actual cash remitted to FIRS for Company Income Tax (CIT) or Tertiary Education Tax (TET).",
  },
];

export const FIXED_ASSET_CATEGORIES = [
  "Plant & Machinery",
  "Land & Buildings",
  "Generators & Power Equipment",
  "Motor Vehicles",
  "Furniture & Fittings",
  "Office & Computer Equipment",
  "Right-of-Use Assets (IFRS 16)",
  "Intangible Assets (IAS 38)",
] as const;

export interface FixedAssetRecord {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  cost: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: string;
  revaluationSurplus: number;
  disposalDate?: string | null;
  disposalProceeds?: number;
  paymentStatus?: string;
  notes?: string;
}

export interface FinancialEntryRecord {
  id: string;
  entryType: FinancialEntryType;
  section: string;
  title: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export interface FinancialSettingsRecord {
  id: string;
  companyLegalName: string;
  rcNumber: string;
  tinNumber: string;
  financialYearStartMonth: number;
  taxRegime: "AUTO" | "EXEMPT" | "SMALL_0" | "MEDIUM_20" | "LARGE_30";
  enableTET: number;
  enablePoliceLevy: number;
  vatRate: number;
  preparedBy: string;
  approvedBy: string;
}

export interface RawFinancialInputs {
  sales: any[];
  expenses: any[];
  products: any[];
  rawMaterials: any[];
  productionRuns: any[];
  orders: any[];
  fixedAssets: FixedAssetRecord[];
  entries: FinancialEntryRecord[];
  settings: FinancialSettingsRecord;
}

export interface NigerianTaxBreakdown {
  companySizeTier: "Small Company (≤ ₦25M)" | "Medium Company (₦25M – ₦100M)" | "Large Company (> ₦100M)" | "Tax Exempt";
  citRate: number;
  tetRate: number;
  policeLevyRate: number;
  assessableProfit: number;
  taxableProfit: number;
  citAmount: number;
  tetAmount: number;
  policeLevyAmount: number;
  deferredTaxExpense: number;
  totalTaxExpense: number;
  effectiveTaxRate: number;
}

function roundCurrency(val: number): number {
  const r = Math.round((val + Number.EPSILON) * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

function toEndOfDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toStartOfDay(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate IAS 16 / IAS 38 accumulated depreciation of an asset up to a given date
 */
export function computeAssetDepreciationAtDate(asset: FixedAssetRecord, cutoff: Date): {
  acquired: boolean;
  disposed: boolean;
  cost: number;
  accumulatedDepreciation: number;
  revaluation: number;
  netBookValue: number;
  disposalGainLoss: number;
  disposalProceeds: number;
  isIntangible: boolean;
  isROU: boolean;
} {
  const acqDate = toStartOfDay(asset.acquisitionDate);
  if (acqDate > cutoff) {
    return {
      acquired: false,
      disposed: false,
      cost: 0,
      accumulatedDepreciation: 0,
      revaluation: 0,
      netBookValue: 0,
      disposalGainLoss: 0,
      disposalProceeds: 0,
      isIntangible: asset.category.includes("Intangible"),
      isROU: asset.category.includes("Right-of-Use"),
    };
  }

  const dispDate = asset.disposalDate ? toEndOfDay(asset.disposalDate) : null;
  const isDisposed = dispDate !== null && dispDate <= cutoff;
  const effectiveEnd = isDisposed && dispDate ? dispDate : cutoff;

  const cost = Number(asset.cost) || 0;
  const residual = Math.min(cost, Math.max(0, Number(asset.residualValue) || 0));
  const depreciableAmount = Math.max(0, cost - residual);
  const usefulLifeYears = Math.max(0.5, Number(asset.usefulLifeYears) || 5);
  const reval = Math.max(0, Number(asset.revaluationSurplus) || 0);

  // Land is non-depreciable under IAS 16.58 unless it's Buildings
  const elapsedMs = Math.max(0, effectiveEnd.getTime() - acqDate.getTime());
  const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);

  let accumDep = 0;
  if (depreciableAmount > 0 && elapsedYears > 0) {
    if (asset.depreciationMethod === "Reducing Balance") {
      const annualRate = Math.min(0.5, 1 - Math.pow(Math.max(residual, cost * 0.05) / cost, 1 / usefulLifeYears));
      const carrying = cost * Math.pow(1 - annualRate, elapsedYears);
      accumDep = Math.min(depreciableAmount, Math.max(0, cost - carrying));
    } else {
      // Straight-Line (IAS 16.62)
      const annualDep = depreciableAmount / usefulLifeYears;
      accumDep = Math.min(depreciableAmount, annualDep * elapsedYears);
    }
  }
  accumDep = roundCurrency(accumDep);

  if (isDisposed) {
    const nbvAtDisposal = cost + reval - accumDep;
    const proceeds = Number(asset.disposalProceeds) || 0;
    const gainLoss = roundCurrency(proceeds - nbvAtDisposal);
    return {
      acquired: true,
      disposed: true,
      cost: 0,
      accumulatedDepreciation: accumDep, // kept for cumulative expense tracking
      revaluation: reval,
      netBookValue: 0,
      disposalGainLoss: gainLoss,
      disposalProceeds: proceeds,
      isIntangible: asset.category.includes("Intangible"),
      isROU: asset.category.includes("Right-of-Use"),
    };
  }

  return {
    acquired: true,
    disposed: false,
    cost,
    accumulatedDepreciation: accumDep,
    revaluation: reval,
    netBookValue: roundCurrency(cost + reval - accumDep),
    disposalGainLoss: 0,
    disposalProceeds: 0,
    isIntangible: asset.category.includes("Intangible"),
    isROU: asset.category.includes("Right-of-Use"),
  };
}

/**
 * Nigerian Corporate Income Tax (CIT) & Tertiary Education Tax (TET) Engine
 * Under Nigeria Finance Act / FIRS CITA:
 * - Small Company (Turnover <= ₦25M): 0% CIT, Exempt from TET
 * - Medium Company (₦25M < Turnover <= ₦100M): 20% CIT + 3% TET on Assessable Profit
 * - Large Company (Turnover > ₦100M): 30% CIT + 3% TET on Assessable Profit
 */
export function calculateNigerianTax(
  turnover: number,
  profitBeforeTax: number,
  depreciationAddBack: number,
  capitalAllowanceDeduction: number,
  deferredTaxMovement: number,
  settings: FinancialSettingsRecord
): NigerianTaxBreakdown {
  let tier: NigerianTaxBreakdown["companySizeTier"] = "Small Company (≤ ₦25M)";
  let citRate = 0;

  if (settings.taxRegime === "EXEMPT") {
    tier = "Tax Exempt";
    citRate = 0;
  } else if (settings.taxRegime === "SMALL_0") {
    tier = "Small Company (≤ ₦25M)";
    citRate = 0;
  } else if (settings.taxRegime === "MEDIUM_20") {
    tier = "Medium Company (₦25M – ₦100M)";
    citRate = 0.2;
  } else if (settings.taxRegime === "LARGE_30") {
    tier = "Large Company (> ₦100M)";
    citRate = 0.3;
  } else {
    // AUTO detection per Finance Act thresholds
    if (turnover <= 25_000_000) {
      tier = "Small Company (≤ ₦25M)";
      citRate = 0;
    } else if (turnover <= 100_000_000) {
      tier = "Medium Company (₦25M – ₦100M)";
      citRate = 0.2;
    } else {
      tier = "Large Company (> ₦100M)";
      citRate = 0.3;
    }
  }

  // Assessable Profit under CITA: PBT + disallowable accounting depreciation
  const assessableProfit = Math.max(0, roundCurrency(profitBeforeTax + depreciationAddBack));
  // Total/Taxable Profit: Assessable Profit less FIRS Capital Allowances (approximated by capitalAllowanceDeduction)
  const taxableProfit = Math.max(0, roundCurrency(assessableProfit - capitalAllowanceDeduction));

  const isSmallOrExempt = citRate === 0;
  const tetRate = !isSmallOrExempt && settings.enableTET ? 0.03 : 0;
  const policeLevyRate = !isSmallOrExempt && settings.enablePoliceLevy ? 0.00005 : 0;

  const citAmount = profitBeforeTax > 0 ? roundCurrency(taxableProfit * citRate) : 0;
  const tetAmount = profitBeforeTax > 0 ? roundCurrency(assessableProfit * tetRate) : 0;
  const policeLevyAmount = profitBeforeTax > 0 ? roundCurrency(profitBeforeTax * policeLevyRate) : 0;
  const deferredTaxExpense = roundCurrency(deferredTaxMovement);

  const totalTaxExpense = roundCurrency(citAmount + tetAmount + policeLevyAmount + deferredTaxExpense);
  const effectiveTaxRate = profitBeforeTax > 0 ? roundCurrency((totalTaxExpense / profitBeforeTax) * 100) : 0;

  return {
    companySizeTier: tier,
    citRate: citRate * 100,
    tetRate: tetRate * 100,
    policeLevyRate: policeLevyRate * 100,
    assessableProfit,
    taxableProfit,
    citAmount,
    tetAmount,
    policeLevyAmount,
    deferredTaxExpense,
    totalTaxExpense,
    effectiveTaxRate,
  };
}

interface CumulativeSnapshot {
  // Income / Expense cumulative
  grossRevenue: number;
  salesDiscounts: number;
  netRevenue: number;
  cogsFinishedGoods: number;
  factoryOverhead: number;
  totalCostOfSales: number;
  operatingExpenses: number;
  financeCosts: number;
  depreciationExpense: number;
  disposalGainLoss: number;
  profitBeforeTax: number;

  // Assets at cutoff
  ppeCost: number;
  ppeAccumDep: number;
  ppeRevaluation: number;
  ppeNBV: number;
  rouNBV: number;
  intangibleNBV: number;
  totalNonCurrentAssets: number;

  inventoryRawMaterials: number;
  inventoryWIP: number;
  inventoryFinishedGoods: number;
  totalInventories: number;

  tradeReceivablesSales: number;
  otherReceivables: number;
  totalReceivables: number;
  prepayments: number;

  // Equity & Liability ledger balances at cutoff
  shareCapital: number;
  sharePremium: number;
  generalReserve: number;
  revaluationReserve: number;
  manualOpeningRE: number;
  dividendsPaid: number;

  longTermLoans: number;
  assetCreditFinancing: number;
  deferredTaxLiability: number;

  tradePayables: number;
  accruedExpenses: number;
  customerDeposits: number;
  shortTermLoans: number;
  statutoryPayables: number;

  taxPaid: number;

  // Cash CapEx & Disposal tracking
  cashCapExPPE: number;
  cashCapExIntangible: number;
  disposalProceeds: number;
}

function buildSnapshotAtCutoff(inputs: RawFinancialInputs, cutoff: Date | null, isZeroStart: boolean): CumulativeSnapshot {
  if (isZeroStart || !cutoff) {
    return {
      grossRevenue: 0,
      salesDiscounts: 0,
      netRevenue: 0,
      cogsFinishedGoods: 0,
      factoryOverhead: 0,
      totalCostOfSales: 0,
      operatingExpenses: 0,
      financeCosts: 0,
      depreciationExpense: 0,
      disposalGainLoss: 0,
      profitBeforeTax: 0,
      ppeCost: 0,
      ppeAccumDep: 0,
      ppeRevaluation: 0,
      ppeNBV: 0,
      rouNBV: 0,
      intangibleNBV: 0,
      totalNonCurrentAssets: 0,
      inventoryRawMaterials: 0,
      inventoryWIP: 0,
      inventoryFinishedGoods: 0,
      totalInventories: 0,
      tradeReceivablesSales: 0,
      otherReceivables: 0,
      totalReceivables: 0,
      prepayments: 0,
      shareCapital: 0,
      sharePremium: 0,
      generalReserve: 0,
      revaluationReserve: 0,
      manualOpeningRE: 0,
      dividendsPaid: 0,
      longTermLoans: 0,
      assetCreditFinancing: 0,
      deferredTaxLiability: 0,
      tradePayables: 0,
      accruedExpenses: 0,
      customerDeposits: 0,
      shortTermLoans: 0,
      statutoryPayables: 0,
      taxPaid: 0,
      cashCapExPPE: 0,
      cashCapExIntangible: 0,
      disposalProceeds: 0,
    };
  }

  // 1. Sales up to cutoff
  const validSales = inputs.sales.filter((s) => s.status !== "Cancelled");
  const salesUpTo = validSales.filter((s) => !s.createdAt || new Date(s.createdAt) <= cutoff);
  const salesAfter = validSales.filter((s) => s.createdAt && new Date(s.createdAt) > cutoff);

  const netRevenue = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.amount) || 0), 0));
  const salesDiscounts = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.discount) || 0), 0));
  const grossRevenue = roundCurrency(netRevenue + salesDiscounts);
  const cogsFinishedGoods = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.costPrice) || 0), 0));

  // Pending sales represent Trade Receivables (IFRS 15 / IFRS 9)
  const tradeReceivablesSales = roundCurrency(
    salesUpTo.filter((s) => s.status === "Pending").reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  );

  // 2. Expenses up to cutoff
  const expensesUpTo = inputs.expenses.filter((e) => !e.date || new Date(e.date) <= cutoff);
  const factoryOverhead = roundCurrency(
    expensesUpTo.filter((e) => e.type === "Factory Overhead").reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  );
  const financeCosts = roundCurrency(
    expensesUpTo
      .filter((e) => e.type === "Finance Cost" || e.category === "Interest / Bank Charges" || e.category === "Finance Cost")
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  );
  const operatingExpenses = roundCurrency(
    expensesUpTo
      .filter(
        (e) =>
          e.type !== "Factory Overhead" &&
          e.type !== "Finance Cost" &&
          e.category !== "Interest / Bank Charges" &&
          e.category !== "Finance Cost"
      )
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  );

  // 3. Inventories (IAS 2: Raw Materials, Work-in-Progress, Finished Goods)
  const liveFinishedGoods = inputs.products.reduce((acc, p) => {
    if (p.status === "Inactive") return acc;
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      return acc + p.variants.reduce((vSum: number, v: any) => vSum + (Number(v.costPrice) || 0) * Math.max(0, Number(v.stock) || 0), 0);
    }
    return acc + (Number(p.costPrice) || 0) * Math.max(0, Number(p.stock) || 0);
  }, 0);

  const cogsAfterCutoff = salesAfter.reduce((sum, s) => sum + (Number(s.costPrice) || 0), 0);
  const prodCompletedAfterCutoff = inputs.productionRuns
    .filter((r) => r.status === "Completed" && r.productionDate && new Date(r.productionDate) > cutoff)
    .reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

  const inventoryFinishedGoods = roundCurrency(Math.max(0, liveFinishedGoods + cogsAfterCutoff - prodCompletedAfterCutoff));

  const inventoryRawMaterials = roundCurrency(
    inputs.rawMaterials
      .filter((m) => !m.date || new Date(m.date) <= cutoff)
      .reduce((sum, m) => sum + Math.max(0, Number(m.quantity) || 0) * Math.max(0, Number(m.costPerUnit) || 0), 0)
  );

  const inventoryWIP = roundCurrency(
    inputs.productionRuns
      .filter((r) => r.status === "In Progress" && (!r.productionDate || new Date(r.productionDate) <= cutoff))
      .reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0)
  );

  const totalInventories = roundCurrency(inventoryRawMaterials + inventoryWIP + inventoryFinishedGoods);

  // 4. Fixed Assets (IAS 16 PPE, IFRS 16 ROU, IAS 38 Intangibles)
  let ppeCost = 0;
  let ppeAccumDep = 0;
  let ppeRevaluation = 0;
  let ppeNBV = 0;
  let rouNBV = 0;
  let intangibleNBV = 0;
  let depreciationExpense = 0;
  let disposalGainLoss = 0;
  let disposalProceeds = 0;
  let cashCapExPPE = 0;
  let cashCapExIntangible = 0;
  let assetCreditFinancing = 0;
  let revaluationReserve = 0;

  for (const asset of inputs.fixedAssets) {
    const calc = computeAssetDepreciationAtDate(asset, cutoff);
    if (!calc.acquired) continue;

    depreciationExpense += calc.accumulatedDepreciation;
    disposalGainLoss += calc.disposalGainLoss;
    disposalProceeds += calc.disposalProceeds;
    revaluationReserve += calc.revaluation;

    const origCost = Number(asset.cost) || 0;
    if (asset.paymentStatus === "Credit/Loan") {
      assetCreditFinancing += origCost;
    } else if (calc.isIntangible) {
      cashCapExIntangible += origCost;
    } else {
      cashCapExPPE += origCost;
    }

    if (!calc.disposed) {
      if (calc.isIntangible) {
        intangibleNBV += calc.netBookValue;
      } else if (calc.isROU) {
        rouNBV += calc.netBookValue;
      } else {
        ppeCost += calc.cost;
        ppeAccumDep += calc.accumulatedDepreciation;
        ppeRevaluation += calc.revaluation;
        ppeNBV += calc.netBookValue;
      }
    }
  }

  ppeCost = roundCurrency(ppeCost);
  ppeAccumDep = roundCurrency(ppeAccumDep);
  ppeRevaluation = roundCurrency(ppeRevaluation);
  ppeNBV = roundCurrency(ppeNBV);
  rouNBV = roundCurrency(rouNBV);
  intangibleNBV = roundCurrency(intangibleNBV);
  depreciationExpense = roundCurrency(depreciationExpense);
  disposalGainLoss = roundCurrency(disposalGainLoss);
  disposalProceeds = roundCurrency(disposalProceeds);
  cashCapExPPE = roundCurrency(cashCapExPPE);
  cashCapExIntangible = roundCurrency(cashCapExIntangible);
  assetCreditFinancing = roundCurrency(assetCreditFinancing);
  revaluationReserve = roundCurrency(revaluationReserve);

  const totalNonCurrentAssets = roundCurrency(ppeNBV + rouNBV + intangibleNBV);

  // 5. Financial Ledger Entries up to cutoff
  const entriesUpTo = inputs.entries.filter((e) => !e.date || new Date(e.date) <= cutoff);
  const sumByType = (t: FinancialEntryType) =>
    roundCurrency(entriesUpTo.filter((e) => e.entryType === t).reduce((s, e) => s + (Number(e.amount) || 0), 0));

  const shareCapital = sumByType("SHARE_CAPITAL");
  const sharePremium = sumByType("SHARE_PREMIUM");
  const generalReserve = sumByType("CAPITAL_INTRODUCED");
  const manualOpeningRE = sumByType("OPENING_RETAINED_EARNINGS");
  const dividendsPaid = sumByType("DIVIDENDS_PAID");

  const longTermLoansRaw = sumByType("LONG_TERM_LOAN") + sumByType("DIRECTOR_LOAN") - sumByType("LONG_TERM_LOAN_REPAYMENT");
  const longTermLoans = roundCurrency(longTermLoansRaw);
  const deferredTaxLiability = sumByType("DEFERRED_TAX_LIABILITY");

  const tradePayables = roundCurrency(sumByType("TRADE_PAYABLE") - sumByType("TRADE_PAYABLE_SETTLEMENT"));
  const accruedExpenses = sumByType("ACCRUED_EXPENSE");
  const customerDeposits = sumByType("CUSTOMER_DEPOSIT");
  const shortTermLoans = roundCurrency(sumByType("SHORT_TERM_LOAN") - sumByType("SHORT_TERM_LOAN_REPAYMENT"));
  const statutoryPayables = roundCurrency(sumByType("STATUTORY_PAYABLE") - sumByType("STATUTORY_REMITTANCE"));

  const prepayments = roundCurrency(sumByType("PREPAYMENT") - sumByType("PREPAYMENT_AMORTISED"));
  const otherReceivables = roundCurrency(sumByType("OTHER_RECEIVABLE") - sumByType("RECEIVABLE_COLLECTED"));
  const totalReceivables = roundCurrency(tradeReceivablesSales + Math.max(0, otherReceivables));

  const taxPaid = sumByType("TAX_PAID");

  const totalCostOfSales = roundCurrency(cogsFinishedGoods + factoryOverhead);
  const profitBeforeTax = roundCurrency(
    netRevenue - totalCostOfSales - operatingExpenses - depreciationExpense + disposalGainLoss - financeCosts
  );

  return {
    grossRevenue,
    salesDiscounts,
    netRevenue,
    cogsFinishedGoods,
    factoryOverhead,
    totalCostOfSales,
    operatingExpenses,
    financeCosts,
    depreciationExpense,
    disposalGainLoss,
    profitBeforeTax,
    ppeCost,
    ppeAccumDep,
    ppeRevaluation,
    ppeNBV,
    rouNBV,
    intangibleNBV,
    totalNonCurrentAssets,
    inventoryRawMaterials,
    inventoryWIP,
    inventoryFinishedGoods,
    totalInventories,
    tradeReceivablesSales,
    otherReceivables,
    totalReceivables,
    prepayments,
    shareCapital,
    sharePremium,
    generalReserve,
    revaluationReserve,
    manualOpeningRE,
    dividendsPaid,
    longTermLoans,
    assetCreditFinancing,
    deferredTaxLiability,
    tradePayables,
    accruedExpenses,
    customerDeposits,
    shortTermLoans,
    statutoryPayables,
    taxPaid,
    cashCapExPPE,
    cashCapExIntangible,
    disposalProceeds,
  };
}

function deriveBalanceSheetFromSnapshot(snap: CumulativeSnapshot, cumulativeCurrentTax: number) {
  // Net Cash from exact double-entry identity:
  // Cash = PBT - TaxPaid + Dep - DisposalGain - Inv - Rec - Prep + WorkingCapLiab - CashCapEx + DisposalProceeds + EquityCashIn - Dividends + NetCashLoans
  const workingCapitalAssets = roundCurrency(snap.totalInventories + snap.tradeReceivablesSales + snap.otherReceivables + snap.prepayments);
  const workingCapitalLiabilities = roundCurrency(
    snap.tradePayables + snap.accruedExpenses + snap.customerDeposits + snap.statutoryPayables
  );
  const equityCashIn = roundCurrency(snap.shareCapital + snap.sharePremium + snap.generalReserve + snap.manualOpeningRE);
  const netCashBorrowings = roundCurrency(snap.longTermLoans + snap.shortTermLoans);
  const totalCashCapEx = roundCurrency(snap.cashCapExPPE + snap.cashCapExIntangible);

  const netCash = roundCurrency(
    snap.profitBeforeTax -
      snap.taxPaid +
      snap.depreciationExpense -
      snap.disposalGainLoss -
      workingCapitalAssets +
      workingCapitalLiabilities -
      totalCashCapEx +
      snap.disposalProceeds +
      equityCashIn -
      snap.dividendsPaid +
      netCashBorrowings
  );

  const cashAndEquivalentsAsset = netCash >= 0 ? netCash : 0;
  const bankOverdraftLiability = netCash < 0 ? roundCurrency(Math.abs(netCash)) : 0;

  // Tax Payable vs Prepaid Tax Asset
  const netTaxLiability = roundCurrency(cumulativeCurrentTax - snap.taxPaid);
  const currentTaxPayable = netTaxLiability >= 0 ? netTaxLiability : 0;
  const prepaidTaxAsset = netTaxLiability < 0 ? roundCurrency(Math.abs(netTaxLiability)) : 0;

  // Handle signed working capital / loan balances cleanly
  const prepaymentsAsset = snap.prepayments >= 0 ? snap.prepayments : 0;
  const prepaymentsCreditAdj = snap.prepayments < 0 ? Math.abs(snap.prepayments) : 0;

  const otherRecAsset = snap.otherReceivables >= 0 ? snap.otherReceivables : 0;
  const otherRecCreditAdj = snap.otherReceivables < 0 ? Math.abs(snap.otherReceivables) : 0;

  const tradePayablesLiab = snap.tradePayables >= 0 ? snap.tradePayables : 0;
  const supplierAdvanceAsset = snap.tradePayables < 0 ? Math.abs(snap.tradePayables) : 0;

  const statutoryPayablesLiab = snap.statutoryPayables >= 0 ? snap.statutoryPayables : 0;
  const statutoryCreditAsset = snap.statutoryPayables < 0 ? Math.abs(snap.statutoryPayables) : 0;

  const longTermBorrowingsLiab = Math.max(0, roundCurrency(snap.longTermLoans + snap.assetCreditFinancing));
  const longTermLoanOverpaymentAsset = snap.longTermLoans + snap.assetCreditFinancing < 0 ? Math.abs(snap.longTermLoans + snap.assetCreditFinancing) : 0;

  const shortTermBorrowingsLiab = Math.max(0, snap.shortTermLoans);
  const shortTermLoanOverpaymentAsset = snap.shortTermLoans < 0 ? Math.abs(snap.shortTermLoans) : 0;

  const tradeAndOtherReceivables = roundCurrency(
    snap.tradeReceivablesSales +
      otherRecAsset +
      supplierAdvanceAsset +
      statutoryCreditAsset +
      longTermLoanOverpaymentAsset +
      shortTermLoanOverpaymentAsset
  );

  const totalPrepaymentsAndTaxAsset = roundCurrency(prepaymentsAsset + prepaidTaxAsset);

  const totalCurrentAssets = roundCurrency(
    snap.totalInventories + tradeAndOtherReceivables + totalPrepaymentsAndTaxAsset + cashAndEquivalentsAsset
  );

  const totalAssets = roundCurrency(snap.totalNonCurrentAssets + totalCurrentAssets);

  // Equity
  const cumulativePAT = roundCurrency(snap.profitBeforeTax - cumulativeCurrentTax - snap.deferredTaxLiability);
  const retainedEarnings = roundCurrency(snap.manualOpeningRE + cumulativePAT - snap.dividendsPaid);
  const totalEquity = roundCurrency(
    snap.shareCapital + snap.sharePremium + snap.revaluationReserve + snap.generalReserve + retainedEarnings
  );

  // Liabilities
  const totalNonCurrentLiabilities = roundCurrency(longTermBorrowingsLiab + snap.deferredTaxLiability);
  const accruedAndOtherPayables = roundCurrency(snap.accruedExpenses + prepaymentsCreditAdj + otherRecCreditAdj);

  const totalCurrentLiabilities = roundCurrency(
    tradePayablesLiab +
      accruedAndOtherPayables +
      snap.customerDeposits +
      statutoryPayablesLiab +
      shortTermBorrowingsLiab +
      bankOverdraftLiability +
      currentTaxPayable
  );

  const totalLiabilities = roundCurrency(totalNonCurrentLiabilities + totalCurrentLiabilities);
  const totalEquityAndLiabilities = roundCurrency(totalEquity + totalLiabilities);
  const balanceVariance = roundCurrency(totalAssets - totalEquityAndLiabilities);

  return {
    netCash,
    cashAndEquivalentsAsset,
    bankOverdraftLiability,
    nonCurrentAssets: {
      ppeCost: snap.ppeCost,
      ppeAccumulatedDepreciation: snap.ppeAccumDep,
      ppeRevaluation: snap.ppeRevaluation,
      ppeCarryingAmount: snap.ppeNBV,
      rightOfUseAssets: snap.rouNBV,
      intangibleAssets: snap.intangibleNBV,
      totalNonCurrentAssets: snap.totalNonCurrentAssets,
    },
    currentAssets: {
      inventoriesRawMaterials: snap.inventoryRawMaterials,
      inventoriesWIP: snap.inventoryWIP,
      inventoriesFinishedGoods: snap.inventoryFinishedGoods,
      totalInventories: snap.totalInventories,
      tradeReceivables: snap.tradeReceivablesSales,
      otherReceivables: roundCurrency(tradeAndOtherReceivables - snap.tradeReceivablesSales),
      tradeAndOtherReceivables,
      prepayments: prepaymentsAsset,
      prepaidTaxAsset,
      cashAndCashEquivalents: cashAndEquivalentsAsset,
      totalCurrentAssets,
    },
    totalAssets,
    equity: {
      shareCapital: snap.shareCapital,
      sharePremium: snap.sharePremium,
      revaluationReserve: snap.revaluationReserve,
      generalReserve: snap.generalReserve,
      retainedEarnings,
      totalEquity,
    },
    nonCurrentLiabilities: {
      longTermBorrowings: longTermBorrowingsLiab,
      deferredTaxLiability: snap.deferredTaxLiability,
      totalNonCurrentLiabilities,
    },
    currentLiabilities: {
      tradePayables: tradePayablesLiab,
      accruedExpenses: accruedAndOtherPayables,
      contractLiabilities: snap.customerDeposits,
      statutoryPayables: statutoryPayablesLiab,
      shortTermBorrowings: shortTermBorrowingsLiab,
      bankOverdraft: bankOverdraftLiability,
      currentTaxPayable,
      totalCurrentLiabilities,
    },
    totalLiabilities,
    totalEquityAndLiabilities,
    isBalanced: Math.abs(balanceVariance) < 0.05,
    balanceVariance,
  };
}

export function generateFinancialStatements(inputs: RawFinancialInputs, startDate?: string, endDate?: string) {
  const hasStart = Boolean(startDate && startDate.trim());
  const hasEnd = Boolean(endDate && endDate.trim());

  const closingCutoff = hasEnd ? toEndOfDay(endDate!) : toEndOfDay(new Date().toISOString());
  const openingCutoff = hasStart ? new Date(toStartOfDay(startDate!).getTime() - 1) : null;

  const openSnap = buildSnapshotAtCutoff(inputs, openingCutoff, !hasStart);
  const closeSnap = buildSnapshotAtCutoff(inputs, closingCutoff, false);

  // Prior tax (if startDate provided)
  const openTax = hasStart
    ? calculateNigerianTax(
        openSnap.netRevenue,
        openSnap.profitBeforeTax,
        openSnap.depreciationExpense,
        openSnap.depreciationExpense, // capital allowances approx equal to accounting depreciation unless deferred tax entered
        0,
        inputs.settings
      )
    : null;
  const openCurrentTax = openTax ? openTax.citAmount + openTax.tetAmount + openTax.policeLevyAmount : 0;

  // Period Income Statement (IAS 1)
  const grossRevenue = roundCurrency(closeSnap.grossRevenue - openSnap.grossRevenue);
  const salesDiscounts = roundCurrency(closeSnap.salesDiscounts - openSnap.salesDiscounts);
  const revenue = roundCurrency(closeSnap.netRevenue - openSnap.netRevenue);

  const cogsFinishedGoods = roundCurrency(closeSnap.cogsFinishedGoods - openSnap.cogsFinishedGoods);
  const factoryOverhead = roundCurrency(closeSnap.factoryOverhead - openSnap.factoryOverhead);
  const costOfSales = roundCurrency(closeSnap.totalCostOfSales - openSnap.totalCostOfSales);
  const grossProfit = roundCurrency(revenue - costOfSales);

  const operatingExpenses = roundCurrency(closeSnap.operatingExpenses - openSnap.operatingExpenses);
  const depreciationAndAmortisation = roundCurrency(closeSnap.depreciationExpense - openSnap.depreciationExpense);
  const otherOperatingGainLoss = roundCurrency(closeSnap.disposalGainLoss - openSnap.disposalGainLoss);

  const operatingProfitEBIT = roundCurrency(
    grossProfit - operatingExpenses - depreciationAndAmortisation + otherOperatingGainLoss
  );
  const financeCosts = roundCurrency(closeSnap.financeCosts - openSnap.financeCosts);
  const profitBeforeTax = roundCurrency(operatingProfitEBIT - financeCosts);

  const periodDeferredTax = roundCurrency(closeSnap.deferredTaxLiability - openSnap.deferredTaxLiability);

  // Nigerian Corporate Tax for the Period (Finance Act / FIRS)
  const taxBreakdown = calculateNigerianTax(
    revenue,
    profitBeforeTax,
    depreciationAndAmortisation,
    depreciationAndAmortisation,
    periodDeferredTax,
    inputs.settings
  );

  const periodCurrentTax = roundCurrency(taxBreakdown.citAmount + taxBreakdown.tetAmount + taxBreakdown.policeLevyAmount);
  const cumulativeClosingCurrentTax = roundCurrency(openCurrentTax + periodCurrentTax);

  const profitForThePeriod = roundCurrency(profitBeforeTax - taxBreakdown.totalTaxExpense);
  const otherComprehensiveIncomeReval = roundCurrency(closeSnap.revaluationReserve - openSnap.revaluationReserve);
  const totalComprehensiveIncome = roundCurrency(profitForThePeriod + otherComprehensiveIncomeReval);

  // Expense category breakdown for Note 3 / SoPL
  const periodExpensesList = inputs.expenses.filter((e) => {
    if (e.type === "Factory Overhead" || e.type === "Finance Cost" || e.category === "Interest / Bank Charges") return false;
    const d = e.date ? new Date(e.date) : null;
    if (d && openingCutoff && d <= openingCutoff) return false;
    if (d && d > closingCutoff) return false;
    return true;
  });

  const expensesByCategory: Record<string, number> = {};
  for (const e of periodExpensesList) {
    const cat = e.category || "General & Administrative";
    expensesByCategory[cat] = roundCurrency((expensesByCategory[cat] || 0) + (Number(e.amount) || 0));
  }

  // Revenue by product for Note 3
  const periodSalesList = inputs.sales.filter((s) => {
    if (s.status === "Cancelled") return false;
    const d = s.createdAt ? new Date(s.createdAt) : null;
    if (d && openingCutoff && d <= openingCutoff) return false;
    if (d && d > closingCutoff) return false;
    return true;
  });

  const revenueByProduct: Record<string, { qty: number; revenue: number; cogs: number }> = {};
  for (const s of periodSalesList) {
    const prod = s.productName || "Footwear Products";
    if (!revenueByProduct[prod]) revenueByProduct[prod] = { qty: 0, revenue: 0, cogs: 0 };
    revenueByProduct[prod].qty += Number(s.quantity) || 0;
    revenueByProduct[prod].revenue = roundCurrency(revenueByProduct[prod].revenue + (Number(s.amount) || 0));
    revenueByProduct[prod].cogs = roundCurrency(revenueByProduct[prod].cogs + (Number(s.costPrice) || 0));
  }

  // Opening & Closing Statement of Financial Position (IAS 1)
  const openingPosition = deriveBalanceSheetFromSnapshot(openSnap, openCurrentTax);
  const closingPosition = deriveBalanceSheetFromSnapshot(closeSnap, cumulativeClosingCurrentTax);

  // Statement of Changes in Equity (IAS 1.106)
  const issueOfShareCapital = roundCurrency(closeSnap.shareCapital - openSnap.shareCapital);
  const issueOfSharePremium = roundCurrency(closeSnap.sharePremium - openSnap.sharePremium);
  const capitalIntroducedReserve = roundCurrency(closeSnap.generalReserve - openSnap.generalReserve);
  const priorRetainedEarningsIntroduced = roundCurrency(closeSnap.manualOpeningRE - openSnap.manualOpeningRE);
  const dividendsPaidInPeriod = roundCurrency(closeSnap.dividendsPaid - openSnap.dividendsPaid);

  const statementOfChangesInEquity = {
    opening: {
      shareCapital: openingPosition.equity.shareCapital,
      sharePremium: openingPosition.equity.sharePremium,
      revaluationReserve: openingPosition.equity.revaluationReserve,
      generalReserve: openingPosition.equity.generalReserve,
      retainedEarnings: openingPosition.equity.retainedEarnings,
      total: openingPosition.equity.totalEquity,
    },
    profitForPeriod: profitForThePeriod,
    otherComprehensiveIncome: otherComprehensiveIncomeReval,
    totalComprehensiveIncome,
    issueOfShares: issueOfShareCapital,
    sharePremiumMovement: issueOfSharePremium,
    capitalAndReservesMovement: capitalIntroducedReserve,
    openingRetainedEarningsAdjustment: priorRetainedEarningsIntroduced,
    dividendsAndDrawings: -dividendsPaidInPeriod,
    closing: {
      shareCapital: closingPosition.equity.shareCapital,
      sharePremium: closingPosition.equity.sharePremium,
      revaluationReserve: closingPosition.equity.revaluationReserve,
      generalReserve: closingPosition.equity.generalReserve,
      retainedEarnings: closingPosition.equity.retainedEarnings,
      total: closingPosition.equity.totalEquity,
    },
  };

  // Statement of Cash Flows (IAS 7 — Both Indirect & Direct Methods)
  const changeInInventories = roundCurrency(-(closeSnap.totalInventories - openSnap.totalInventories));
  const changeInReceivables = roundCurrency(
    -(closeSnap.tradeReceivablesSales + closeSnap.otherReceivables - (openSnap.tradeReceivablesSales + openSnap.otherReceivables))
  );
  const changeInPrepayments = roundCurrency(-(closeSnap.prepayments - openSnap.prepayments));
  const changeInPayablesAndAccruals = roundCurrency(
    closeSnap.tradePayables +
      closeSnap.accruedExpenses +
      closeSnap.customerDeposits +
      closeSnap.statutoryPayables -
      (openSnap.tradePayables + openSnap.accruedExpenses + openSnap.customerDeposits + openSnap.statutoryPayables)
  );

  const operatingCashBeforeWorkingCapital = roundCurrency(
    profitBeforeTax + depreciationAndAmortisation - otherOperatingGainLoss
  );
  const cashGeneratedFromOperations = roundCurrency(
    operatingCashBeforeWorkingCapital +
      changeInInventories +
      changeInReceivables +
      changeInPrepayments +
      changeInPayablesAndAccruals
  );
  const incomeTaxesPaid = roundCurrency(closeSnap.taxPaid - openSnap.taxPaid);
  const netCashFromOperatingActivities = roundCurrency(cashGeneratedFromOperations - incomeTaxesPaid);

  // Direct Method Operating Breakdown (IAS 7.18a — reconciles identically to netCashFromOperatingActivities)
  const cashReceiptsFromCustomers = roundCurrency(
    revenue -
      (closeSnap.tradeReceivablesSales - openSnap.tradeReceivablesSales) +
      (closeSnap.customerDeposits - openSnap.customerDeposits)
  );
  const cashPaidToSuppliersAndProduction = roundCurrency(
    -(costOfSales + (closeSnap.totalInventories - openSnap.totalInventories) - (closeSnap.tradePayables - openSnap.tradePayables))
  );
  const cashPaidForOperatingAndFinance = roundCurrency(
    -(
      operatingExpenses +
      financeCosts +
      (closeSnap.prepayments - openSnap.prepayments) +
      (closeSnap.otherReceivables - openSnap.otherReceivables) -
      (closeSnap.accruedExpenses + closeSnap.statutoryPayables - (openSnap.accruedExpenses + openSnap.statutoryPayables))
    )
  );

  // Investing Activities (IAS 7.16)
  const purchaseOfPPE = roundCurrency(-(closeSnap.cashCapExPPE - openSnap.cashCapExPPE));
  const purchaseOfIntangibles = roundCurrency(-(closeSnap.cashCapExIntangible - openSnap.cashCapExIntangible));
  const proceedsFromDisposalOfPPE = roundCurrency(closeSnap.disposalProceeds - openSnap.disposalProceeds);
  const netCashFromInvestingActivities = roundCurrency(purchaseOfPPE + purchaseOfIntangibles + proceedsFromDisposalOfPPE);

  // Financing Activities (IAS 7.17)
  const proceedsFromShareIssue = roundCurrency(
    issueOfShareCapital + issueOfSharePremium + capitalIntroducedReserve + priorRetainedEarningsIntroduced
  );
  const netProceedsFromLongTermBorrowings = roundCurrency(closeSnap.longTermLoans - openSnap.longTermLoans);
  const netProceedsFromShortTermBorrowings = roundCurrency(closeSnap.shortTermLoans - openSnap.shortTermLoans);

  // Separate gross loan inflows & repayments in period for clean IAS 7.21 presentation
  const periodEntries = inputs.entries.filter((e) => {
    const d = e.date ? new Date(e.date) : null;
    if (d && openingCutoff && d <= openingCutoff) return false;
    if (d && d > closingCutoff) return false;
    return true;
  });
  const sumPeriodEntry = (t: FinancialEntryType) =>
    roundCurrency(periodEntries.filter((e) => e.entryType === t).reduce((s, e) => s + (Number(e.amount) || 0), 0));

  const borrowingsReceived = roundCurrency(
    sumPeriodEntry("LONG_TERM_LOAN") + sumPeriodEntry("DIRECTOR_LOAN") + sumPeriodEntry("SHORT_TERM_LOAN")
  );
  const borrowingsRepaid = roundCurrency(
    -(sumPeriodEntry("LONG_TERM_LOAN_REPAYMENT") + sumPeriodEntry("SHORT_TERM_LOAN_REPAYMENT"))
  );
  const dividendsPaidCashFlow = roundCurrency(-dividendsPaidInPeriod);

  const netCashFromFinancingActivities = roundCurrency(
    proceedsFromShareIssue + netProceedsFromLongTermBorrowings + netProceedsFromShortTermBorrowings + dividendsPaidCashFlow
  );

  const netIncreaseInCash = roundCurrency(
    netCashFromOperatingActivities + netCashFromInvestingActivities + netCashFromFinancingActivities
  );
  const openingCashEquivalents = openingPosition.netCash;
  const closingCashEquivalents = roundCurrency(openingCashEquivalents + netIncreaseInCash);

  // PPE Movement Schedule for Note 4 (IAS 16.73)
  const ppeSchedule = inputs.fixedAssets.map((asset) => {
    const openCalc = openingCutoff ? computeAssetDepreciationAtDate(asset, openingCutoff) : null;
    const closeCalc = computeAssetDepreciationAtDate(asset, closingCutoff);
    const periodDep = roundCurrency(
      closeCalc.accumulatedDepreciation - (openCalc ? openCalc.accumulatedDepreciation : 0)
    );
    return {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      acquisitionDate: asset.acquisitionDate,
      usefulLifeYears: asset.usefulLifeYears,
      method: asset.depreciationMethod,
      originalCost: Number(asset.cost) || 0,
      revaluation: Number(asset.revaluationSurplus) || 0,
      periodDepreciation: periodDep,
      accumulatedDepreciation: closeCalc.disposed ? 0 : closeCalc.accumulatedDepreciation,
      netBookValue: closeCalc.netBookValue,
      disposed: closeCalc.disposed,
    };
  });

  // Financial Ratios & Health Indicators
  const curAssets = closingPosition.currentAssets.totalCurrentAssets;
  const curLiab = closingPosition.currentLiabilities.totalCurrentLiabilities;
  const quickAssets = roundCurrency(curAssets - closingPosition.currentAssets.totalInventories - closingPosition.currentAssets.prepayments);

  const ratios = {
    currentRatio: curLiab > 0 ? roundCurrency(curAssets / curLiab) : curAssets > 0 ? 99.9 : 0,
    quickRatio: curLiab > 0 ? roundCurrency(quickAssets / curLiab) : quickAssets > 0 ? 99.9 : 0,
    workingCapital: roundCurrency(curAssets - curLiab),
    debtToEquityRatio:
      closingPosition.equity.totalEquity > 0
        ? roundCurrency(closingPosition.totalLiabilities / closingPosition.equity.totalEquity)
        : 0,
    grossProfitMargin: revenue > 0 ? roundCurrency((grossProfit / revenue) * 100) : 0,
    operatingProfitMargin: revenue > 0 ? roundCurrency((operatingProfitEBIT / revenue) * 100) : 0,
    netProfitMargin: revenue > 0 ? roundCurrency((profitForThePeriod / revenue) * 100) : 0,
    returnOnEquity:
      closingPosition.equity.totalEquity > 0
        ? roundCurrency((profitForThePeriod / closingPosition.equity.totalEquity) * 100)
        : 0,
    returnOnAssets:
      closingPosition.totalAssets > 0 ? roundCurrency((profitForThePeriod / closingPosition.totalAssets) * 100) : 0,
  };

  // Nigerian CAMA 2020 & FRCN Compliance Diagnostics
  const complianceChecks = {
    accountingEquationBalanced: closingPosition.isBalanced,
    cashFlowReconciled: Math.abs(closingCashEquivalents - closingPosition.netCash) < 0.05,
    camaMinimumShareCapitalMet: closingPosition.equity.shareCapital >= 100_000, // CAMA 2020 s.27(2)(a) private company min ₦100,000
    camaDistributableProfitCompliant: dividendsPaidInPeriod === 0 || closingPosition.equity.retainedEarnings >= 0, // CAMA 2020 s.426
    unallocatedOverdraftWarning: closingPosition.currentLiabilities.bankOverdraft > 0 && closingPosition.equity.shareCapital === 0,
  };

  return {
    meta: {
      companyLegalName: inputs.settings.companyLegalName || "MLAZ LIMITED",
      rcNumber: inputs.settings.rcNumber || "RC-1849201",
      tinNumber: inputs.settings.tinNumber || "20491827-0001",
      preparedBy: inputs.settings.preparedBy || "Financial Controller",
      approvedBy: inputs.settings.approvedBy || "Managing Director",
      periodStart: hasStart ? startDate! : null,
      periodEnd: hasEnd ? endDate! : new Date().toISOString().split("T")[0],
      hasComparative: hasStart,
      currency: "NGN (₦)",
      standardsApplied: [
        "IFRS / IAS 1, IAS 2, IAS 7, IAS 12, IAS 16 (FRCN Adopted)",
        "Companies and Allied Matters Act (CAMA) 2020",
        "Nigeria Finance Act (CIT & Tertiary Education Tax)",
      ],
    },
    incomeStatement: {
      grossRevenue,
      salesDiscounts,
      revenue,
      cogsFinishedGoods,
      factoryOverhead,
      costOfSales,
      grossProfit,
      expensesByCategory,
      revenueByProduct,
      operatingExpenses,
      depreciationAndAmortisation,
      otherOperatingGainLoss,
      operatingProfitEBIT,
      financeCosts,
      profitBeforeTax,
      taxBreakdown,
      profitForThePeriod,
      otherComprehensiveIncomeReval,
      totalComprehensiveIncome,
    },
    statementOfFinancialPosition: {
      current: closingPosition,
      comparative: hasStart ? openingPosition : null,
    },
    statementOfChangesInEquity,
    statementOfCashFlows: {
      indirect: {
        profitBeforeTax,
        depreciationAndAmortisation,
        otherNonCashAdjustments: -otherOperatingGainLoss,
        operatingCashBeforeWorkingCapital,
        changeInInventories,
        changeInReceivables,
        changeInPrepayments,
        changeInPayablesAndAccruals,
        cashGeneratedFromOperations,
        incomeTaxesPaid: -incomeTaxesPaid,
        netCashFromOperatingActivities,
      },
      direct: {
        cashReceiptsFromCustomers,
        cashPaidToSuppliersAndProduction,
        cashPaidForOperatingAndFinance,
        incomeTaxesPaid: -incomeTaxesPaid,
        netCashFromOperatingActivities,
      },
      investing: {
        purchaseOfPPE,
        purchaseOfIntangibles,
        proceedsFromDisposalOfPPE,
        netCashFromInvestingActivities,
      },
      financing: {
        proceedsFromShareIssue,
        borrowingsReceived,
        borrowingsRepaid,
        dividendsPaid: dividendsPaidCashFlow,
        netCashFromFinancingActivities,
      },
      netIncreaseInCash,
      openingCashEquivalents,
      closingCashEquivalents,
      reconciliation: {
        cashAndBankBalances: closingPosition.currentAssets.cashAndCashEquivalents,
        bankOverdrafts: -closingPosition.currentLiabilities.bankOverdraft,
        netCashAndCashEquivalents: closingPosition.netCash,
      },
    },
    notes: {
      ppeSchedule,
      nonCashInvestingFinancing: roundCurrency(closeSnap.assetCreditFinancing - openSnap.assetCreditFinancing),
    },
    ratios,
    complianceChecks,
  };
}
