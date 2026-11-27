// Comprehensive Financial Statements & Nigerian Accounting Standards Engine
// Compliant with:
// - IFRS / IAS 1 (Presentation of Financial Statements), IAS 2 (Inventories),
//   IAS 7 (Statement of Cash Flows), IAS 12 (Income Taxes), IAS 16 (PPE), IAS 20 (Grants),
//   IAS 32 & IFRS 9 (Financial Instruments: Debt vs Equity Classification), IAS 38 (Intangibles)
// - Financial Reporting Council of Nigeria (FRCN) IFRS Adoption Framework
// - Companies and Allied Matters Act (CAMA) 2020 (Sections 27, 124–152, 377–385 & 426)
// - Nigerian Tax Provisions (Finance Act / FIRS: CIT Small/Medium/Large tiers & 3% Tertiary Education Tax)

export type FinancialEntryType =
  | "SHARE_CAPITAL"
  | "SHARE_PREMIUM"
  | "CAPITAL_INTRODUCED"
  | "OPENING_RETAINED_EARNINGS"
  | "DIVIDENDS_PAID"
  | "INVESTOR_ORDINARY_EQUITY"
  | "PREFERENCE_SHARE_CAPITAL"
  | "DEPOSIT_FOR_SHARES"
  | "PARTNER_JV_INVESTMENT"
  | "CONVERTIBLE_INVESTMENT"
  | "REDEEMABLE_PREFERENCE_SHARES"
  | "CONVERTIBLE_CONVERSION"
  | "INVESTMENT_REDEMPTION"
  | "GRANT_INCOME"
  | "DEFERRED_GRANT"
  | "GRANT_AMORTISED"
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
  section: "EQUITY" | "OTHER_INCOME" | "NON_CURRENT_LIABILITY" | "CURRENT_LIABILITY" | "CURRENT_ASSET" | "TAX";
  cashFlowCategory: "Operating" | "Investing" | "Financing" | "Non-Cash";
  standardRef: string;
  hint: string;
}

export const FINANCIAL_ENTRY_TYPES: EntryTypeDefinition[] = [
  // Equity (CAMA 2020 / IAS 1 / IAS 32)
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
    label: "Dividends Paid / Owner & Investor Distributions",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "CAMA 2020 s.426 / IAS 7.34",
    hint: "Cash dividends or profit distributions paid to shareholders, equity investors, or owners out of distributable profits.",
  },

  // Investments Received (CAMA 2020 / IAS 32 / IFRS 9 / FRCN Nigeria)
  {
    code: "INVESTOR_ORDINARY_EQUITY",
    label: "Investor Ordinary Equity Investment (Shares Allotted)",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "CAMA 2020 s.124 / IAS 32.16",
    hint: "Cash investment from an angel, VC, or private investor in exchange for ordinary shares allotted via CAC.",
  },
  {
    code: "PREFERENCE_SHARE_CAPITAL",
    label: "Irredeemable Preference Share Investment (Equity)",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 32.16 / CAMA 2020 s.147",
    hint: "Non-redeemable preference shares with discretionary dividends; recognised strictly in Equity under IAS 32.",
  },
  {
    code: "DEPOSIT_FOR_SHARES",
    label: "Deposit for Shares (Pending CAC Allotment)",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "FRCN Nigeria Practice / IAS 32.16",
    hint: "Irrevocable equity investment cash received ahead of formal CAC Return of Allotment filing.",
  },
  {
    code: "PARTNER_JV_INVESTMENT",
    label: "Silent Partner / Joint Venture Capital Investment",
    section: "EQUITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 1.78(e) / IFRS 11",
    hint: "Equity/capital funding from a syndicate, profit-sharing partner, or joint venture investor without fixed repayment.",
  },
  {
    code: "CONVERTIBLE_INVESTMENT",
    label: "Convertible Note / SAFE / Quasi-Equity Investment",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 32.28 / IFRS 9",
    hint: "Investor funds received via Convertible Loan Note or SAFE prior to priced conversion (Non-Current Financial Liability until converted).",
  },
  {
    code: "REDEEMABLE_PREFERENCE_SHARES",
    label: "Redeemable Preference Shares Investment (Liability)",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 32.18(a) / IFRS 9",
    hint: "Preference shares with mandatory redemption or holder put option; substance-over-form classifies as Financial Liability under IAS 32.",
  },
  {
    code: "CONVERTIBLE_CONVERSION",
    label: "Convertible / SAFE Converted to Ordinary Shares",
    section: "EQUITY",
    cashFlowCategory: "Non-Cash",
    standardRef: "IAS 32.28 / CAMA 2020",
    hint: "Non-cash conversion transferring Convertible Note / SAFE balance from Liabilities into Issued Share Capital upon allotment.",
  },
  {
    code: "INVESTMENT_REDEMPTION",
    label: "Redemption / Buyback of Redeemable Investment",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 32 / IAS 7.17",
    hint: "Cash principal payout redeeming matured convertible notes or redeemable preference shares.",
  },

  // Government & Institutional Grants (IAS 20)
  {
    code: "GRANT_INCOME",
    label: "Government / NGO Income Grant Received",
    section: "OTHER_INCOME",
    cashFlowCategory: "Operating",
    standardRef: "IAS 20.12 & 20.29",
    hint: "Unconditional or working-capital grant (SMEDAN, TEF, BOI, State/NGO) recognised immediately in Profit or Loss.",
  },
  {
    code: "DEFERRED_GRANT",
    label: "Deferred Capital / Asset-Related Grant Received",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Financing",
    standardRef: "IAS 20.24",
    hint: "Cash grant received to acquire factory machinery, workshop assets, or conditional multi-period milestones (held as Deferred Income).",
  },
  {
    code: "GRANT_AMORTISED",
    label: "Deferred Grant Amortised / Released to Income",
    section: "NON_CURRENT_LIABILITY",
    cashFlowCategory: "Non-Cash",
    standardRef: "IAS 20.17 & 20.24",
    hint: "Systematic non-cash release from Deferred Grant Liability to Profit or Loss matching asset depreciation or milestone completion.",
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
  "Buildings",
  "Land (Freehold — Non-Depreciable)",
  "Land & Buildings",
  "Generators & Power Equipment",
  "Motor Vehicles",
  "Furniture & Fittings",
  "Office & Computer Equipment",
  "Right-of-Use Assets (IFRS 16)",
  "Intangible Assets (IAS 38)",
] as const;

export interface CitaAllowanceRate {
  initialRate: number;
  annualRate: number;
  citaClass: string;
}

/**
 * Nigeria Tax Act (NTA) 2025 First Schedule Straight-Line Capital Allowance Rates
 * - Initial Allowances abolished under NTA 2025 (effective 2026)
 * - Class 1 (10% Straight-Line): Buildings, Structures & Intangibles
 * - Class 2 (20% Straight-Line): Plant & Machinery, Power Equipment, Furniture & Fittings, Office/IT Hardware
 * - Class 3 (25% Straight-Line): Motor Vehicles & Software / Electronic Applications
 * - 1% Retention Rule: max cumulative allowance = 99% of cost while asset is held
 */
export function getNigeriaCitaAllowanceRates(category: string): CitaAllowanceRate {
  if (category.startsWith("Land (")) {
    return { initialRate: 0, annualRate: 0, citaClass: "Land (Non-Qualifying Expenditure)" };
  }
  if (category === "Buildings" || category === "Land & Buildings") {
    return { initialRate: 0, annualRate: 10, citaClass: "NTA 2025 Class 1: Building (10% Straight-Line, 1% Retention)" };
  }
  if (
    category === "Plant & Machinery" ||
    category === "Generators & Power Equipment" ||
    category === "Furniture & Fittings" ||
    category === "Office & Computer Equipment"
  ) {
    return { initialRate: 0, annualRate: 20, citaClass: `NTA 2025 Class 2: ${category} (20% Straight-Line, 1% Retention)` };
  }
  if (category === "Motor Vehicles") {
    return { initialRate: 0, annualRate: 25, citaClass: "NTA 2025 Class 3: Motor Vehicle (25% Straight-Line, 1% Retention)" };
  }
  if (category.includes("Right-of-Use")) {
    return { initialRate: 0, annualRate: 0, citaClass: "IFRS 16 Lease Asset (Rent Deductible as Paid)" };
  }
  return { initialRate: 0, annualRate: 10, citaClass: "NTA 2025 Class 1: Intangible / Software (10% Straight-Line, 1% Retention)" };
}

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
  disposalPaymentStatus?: string;
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
  companySizeTier:
    | "Small Company (≤ ₦100M & Assets ≤ ₦250M — NTA 2025)"
    | "Standard / Large Company (> ₦100M or Assets > ₦250M — NTA 2025)"
    | "Medium Company (Legacy Pre-2026)"
    | "Tax Exempt";
  taxActReference: string;
  citRate: number;
  developmentLevyRate: number;
  tetRate: number;
  policeLevyRate: number;
  depreciationAddBack: number;
  disposalGainLossAdjustment: number;
  capitalAllowanceDeduction: number;
  balancingAdjustment: number;
  assessableProfit: number;
  taxableProfit: number;
  citAmount: number;
  developmentLevyAmount: number;
  minimumTaxTopUp: number;
  tetAmount: number;
  policeLevyAmount: number;
  deferredTaxExpense: number;
  totalTaxExpense: number;
  effectiveTaxRate: number;
  vatThresholdExempt: boolean;
}

function roundCurrency(val: number): number {
  const r = Math.round((val + Number.EPSILON) * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

function toEndOfDay(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59, 999));
  }
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function toStartOfDay(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0));
  }
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate IAS 16 / IAS 38 accumulated depreciation & CITA capital allowance of an asset up to a given date
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
  disposalCashProceeds: number;
  disposalReceivableProceeds: number;
  revaluationTransferredOnDisposal: number;
  citaCumulativeAllowance: number;
  citaBalancingAdjustment: number; // positive = balancing allowance (deductible), negative = balancing charge (taxable)
  isIntangible: boolean;
  isROU: boolean;
} {
  const isIntangible = asset.category.includes("Intangible");
  const isROU = asset.category.includes("Right-of-Use");
  const isFreeholdLand = asset.category.startsWith("Land (") || asset.category === "Land";

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
      disposalCashProceeds: 0,
      disposalReceivableProceeds: 0,
      revaluationTransferredOnDisposal: 0,
      citaCumulativeAllowance: 0,
      citaBalancingAdjustment: 0,
      isIntangible,
      isROU,
    };
  }

  const dispDate = asset.disposalDate ? toEndOfDay(asset.disposalDate) : null;
  const isDisposed = dispDate !== null && dispDate <= cutoff;
  const effectiveEnd = isDisposed && dispDate ? dispDate : cutoff;

  const cost = Number(asset.cost) || 0;
  const residual = Math.min(cost, Math.max(0, Number(asset.residualValue) || 0));
  const depreciableAmount = isFreeholdLand ? 0 : Math.max(0, cost - residual);
  const usefulLifeYears = Math.max(0.5, Number(asset.usefulLifeYears) || 5);
  const reval = Math.max(0, Number(asset.revaluationSurplus) || 0);

  // Land is non-depreciable under IAS 16.58
  const elapsedMs = Math.max(0, effectiveEnd.getTime() - acqDate.getTime());
  const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365.25);

  let accumDep = 0;
  if (!isFreeholdLand && depreciableAmount > 0 && elapsedYears > 0) {
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

  // Nigeria Tax Act (NTA) 2025 Straight-Line Capital Allowance with 1% Retention Rule (no initial allowance)
  const cita = getNigeriaCitaAllowanceRates(asset.category);
  let citaAllowance = 0;
  if (cita.annualRate > 0) {
    const annualAllowancePerYr = cost * (cita.annualRate / 100);
    const yearsCount = Math.max(1, Math.ceil(elapsedYears));
    citaAllowance = Math.min(cost * 0.99, annualAllowancePerYr * yearsCount);
  }
  citaAllowance = roundCurrency(citaAllowance);

  if (isDisposed) {
    const nbvAtDisposal = cost + reval - accumDep;
    const proceeds = Math.max(0, Number(asset.disposalProceeds) || 0);
    const gainLoss = roundCurrency(proceeds - nbvAtDisposal);
    const isReceivable = asset.disposalPaymentStatus === "Receivable";
    const taxWDV = Math.max(0, cost - citaAllowance);
    // Balancing Allowance (>0) if proceeds < Tax WDV; Balancing Charge (<0, capped at allowances claimed) if proceeds > Tax WDV
    const rawBalancing = taxWDV - proceeds;
    const citaBalancingAdjustment =
      cita.initialRate === 0 && cita.annualRate === 0
        ? 0
        : roundCurrency(rawBalancing < 0 ? Math.max(-citaAllowance, rawBalancing) : rawBalancing);

    return {
      acquired: true,
      disposed: true,
      cost: 0,
      accumulatedDepreciation: accumDep, // kept for cumulative expense tracking
      revaluation: 0, // derecognised from Revaluation Reserve per IAS 16.41
      netBookValue: 0,
      disposalGainLoss: gainLoss,
      disposalProceeds: proceeds,
      disposalCashProceeds: isReceivable ? 0 : proceeds,
      disposalReceivableProceeds: isReceivable ? proceeds : 0,
      revaluationTransferredOnDisposal: reval,
      citaCumulativeAllowance: citaAllowance,
      citaBalancingAdjustment,
      isIntangible,
      isROU,
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
    disposalCashProceeds: 0,
    disposalReceivableProceeds: 0,
    revaluationTransferredOnDisposal: 0,
    citaCumulativeAllowance: citaAllowance,
    citaBalancingAdjustment: 0,
    isIntangible,
    isROU,
  };
}

/**
 * Nigeria Tax Act (NTA) 2025 Corporate Tax & 4% Development Levy Engine (Effective 2026)
 * - Small Company (Annual Turnover ≤ ₦100M AND Total Fixed Assets ≤ ₦250M, non-professional service):
 *   0% CIT, 0% Development Levy, 0% CGT (s.56).
 * - Standard / Large Company (Turnover > ₦100M OR Fixed Assets > ₦250M):
 *   30% CIT on Taxable Profit + 4% Development Levy on Assessable Profit (s.59 — consolidates & replaces
 *   former 3% TET, 1% NITDA, 0.25% NASENI & 0.005% Police Trust Fund Levy).
 * - Minimum Effective Tax Rate (15% ETR on PBT) applies where domestic turnover ≥ ₦50 Billion.
 * - VAT Compliance Threshold: Businesses with turnover ≤ ₦50M are exempt from mandatory VAT filing.
 * - Accounting depreciation & disposal gain/loss are adjusted out; NTA 2025 straight-line Capital
 *   Allowances (1% retention rule) are deducted to compute Taxable Profit.
 */
export function calculateNigerianTax(
  turnover: number,
  profitBeforeTax: number,
  depreciationAddBack: number,
  disposalGainLoss: number,
  capitalAllowanceDeduction: number,
  balancingAdjustment: number,
  deferredTaxMovement: number,
  settings: FinancialSettingsRecord,
  totalFixedAssets: number = 0
): NigerianTaxBreakdown {
  let tier: NigerianTaxBreakdown["companySizeTier"] = "Small Company (≤ ₦100M & Assets ≤ ₦250M — NTA 2025)";
  let citRate = 0;
  let isLegacyMedium = false;

  if (settings.taxRegime === "EXEMPT") {
    tier = "Tax Exempt";
    citRate = 0;
  } else if (settings.taxRegime === "SMALL_0") {
    tier = "Small Company (≤ ₦100M & Assets ≤ ₦250M — NTA 2025)";
    citRate = 0;
  } else if (settings.taxRegime === "MEDIUM_20") {
    // Kept strictly for legacy pre-2026 Finance Act comparative reporting
    tier = "Medium Company (Legacy Pre-2026)";
    citRate = 0.2;
    isLegacyMedium = true;
  } else if (settings.taxRegime === "LARGE_30") {
    tier = "Standard / Large Company (> ₦100M or Assets > ₦250M — NTA 2025)";
    citRate = 0.3;
  } else {
    // AUTO detection per Nigeria Tax Act 2025 s.56
    if (turnover <= 100_000_000 && totalFixedAssets <= 250_000_000) {
      tier = "Small Company (≤ ₦100M & Assets ≤ ₦250M — NTA 2025)";
      citRate = 0;
    } else {
      tier = "Standard / Large Company (> ₦100M or Assets > ₦250M — NTA 2025)";
      citRate = 0.3;
    }
  }

  // Assessable Profit: PBT + disallowable accounting depreciation - accounting disposal gain (or + disposal loss)
  const disposalGainLossAdjustment = roundCurrency(-disposalGainLoss);
  const assessableProfit = Math.max(0, roundCurrency(profitBeforeTax + depreciationAddBack + disposalGainLossAdjustment));
  // Taxable Profit: Assessable Profit less NTA 2025 Capital Allowances & Balancing Allowance/(Charge)
  const taxableProfit = Math.max(
    0,
    roundCurrency(assessableProfit - capitalAllowanceDeduction - balancingAdjustment)
  );

  const isSmallOrExempt = citRate === 0;
  // NTA 2025 s.59: 4% Development Levy replaces TET (3%), Police Levy (0.005%), NITDA (1%), NASENI (0.25%)
  const developmentLevyRate = !isSmallOrExempt && !isLegacyMedium && settings.enableTET ? 0.04 : 0;
  const tetRate = isLegacyMedium && settings.enableTET ? 0.03 : 0;
  const policeLevyRate = isLegacyMedium && settings.enablePoliceLevy ? 0.00005 : 0;

  const citAmount = profitBeforeTax > 0 ? roundCurrency(taxableProfit * citRate) : 0;
  const developmentLevyAmount = profitBeforeTax > 0 ? roundCurrency(assessableProfit * developmentLevyRate) : 0;
  const tetAmount = profitBeforeTax > 0 ? roundCurrency(assessableProfit * tetRate) : 0;
  const policeLevyAmount = profitBeforeTax > 0 ? roundCurrency(profitBeforeTax * policeLevyRate) : 0;

  // NTA 2025 15% Minimum Effective Tax Rate for entities with turnover ≥ ₦50 Billion
  const baseTaxTotal = roundCurrency(citAmount + developmentLevyAmount);
  const minEtrFloor = turnover >= 50_000_000_000 && profitBeforeTax > 0 ? roundCurrency(profitBeforeTax * 0.15) : 0;
  const minimumTaxTopUp = minEtrFloor > baseTaxTotal ? roundCurrency(minEtrFloor - baseTaxTotal) : 0;

  const deferredTaxExpense = roundCurrency(deferredTaxMovement);

  const totalTaxExpense = roundCurrency(
    citAmount + developmentLevyAmount + minimumTaxTopUp + tetAmount + policeLevyAmount + deferredTaxExpense
  );
  const effectiveTaxRate = profitBeforeTax > 0 ? roundCurrency((totalTaxExpense / profitBeforeTax) * 100) : 0;

  return {
    companySizeTier: tier,
    taxActReference: isLegacyMedium
      ? "Legacy Finance Act (Pre-2026)"
      : "Nigeria Tax Act (NTA) 2025 (Effective Jan 1, 2026)",
    citRate: citRate * 100,
    developmentLevyRate: developmentLevyRate * 100,
    tetRate: tetRate * 100,
    policeLevyRate: policeLevyRate * 100,
    depreciationAddBack: roundCurrency(depreciationAddBack),
    disposalGainLossAdjustment,
    capitalAllowanceDeduction: roundCurrency(capitalAllowanceDeduction),
    balancingAdjustment: roundCurrency(balancingAdjustment),
    assessableProfit,
    taxableProfit,
    citAmount,
    developmentLevyAmount,
    minimumTaxTopUp,
    tetAmount,
    policeLevyAmount,
    deferredTaxExpense,
    totalTaxExpense,
    effectiveTaxRate,
    vatThresholdExempt: turnover <= 50_000_000,
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
  grantIncomeCash: number;
  grantAmortised: number;
  grantIncomeTotal: number;
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
  preferenceShareCapital: number;
  depositForShares: number;
  sharePremium: number;
  generalReserve: number;
  assetEquityContribution: number;
  revaluationReserve: number;
  revaluationTransferToRE: number;
  manualOpeningRE: number;
  dividendsPaid: number;

  longTermLoans: number;
  assetCreditFinancing: number;
  assetVendorPayable: number;
  deferredGrantReceived: number;
  deferredGrants: number;
  convertibleReceived: number;
  convertibleConverted: number;
  convertibleRedeemed: number;
  convertibleAndRedeemableLiab: number;
  deferredTaxLiability: number;

  tradePayables: number;
  accruedExpenses: number;
  customerDeposits: number;
  shortTermLoans: number;
  statutoryPayables: number;
  salesVatOutput: number;

  taxPaid: number;

  // Cash CapEx, Disposal & CITA tracking
  cashCapExPPE: number;
  cashCapExIntangible: number;
  disposalProceeds: number;
  disposalCashProceeds: number;
  disposalReceivables: number;
  citaCapitalAllowance: number;
  citaBalancingAdjustment: number;
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
      grantIncomeCash: 0,
      grantAmortised: 0,
      grantIncomeTotal: 0,
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
      preferenceShareCapital: 0,
      depositForShares: 0,
      sharePremium: 0,
      generalReserve: 0,
      assetEquityContribution: 0,
      revaluationReserve: 0,
      revaluationTransferToRE: 0,
      manualOpeningRE: 0,
      dividendsPaid: 0,
      longTermLoans: 0,
      assetCreditFinancing: 0,
      assetVendorPayable: 0,
      deferredGrantReceived: 0,
      deferredGrants: 0,
      convertibleReceived: 0,
      convertibleConverted: 0,
      convertibleRedeemed: 0,
      convertibleAndRedeemableLiab: 0,
      deferredTaxLiability: 0,
      tradePayables: 0,
      accruedExpenses: 0,
      customerDeposits: 0,
      shortTermLoans: 0,
      statutoryPayables: 0,
      salesVatOutput: 0,
      taxPaid: 0,
      cashCapExPPE: 0,
      cashCapExIntangible: 0,
      disposalProceeds: 0,
      disposalCashProceeds: 0,
      disposalReceivables: 0,
      citaCapitalAllowance: 0,
      citaBalancingAdjustment: 0,
    };
  }

  // 1. Sales up to cutoff (IFRS 15 Revenue, Trade Receivables IFRS 9, Output VAT FIRS)
  const validSales = inputs.sales.filter((s) => s.status !== "Cancelled");
  const salesUpTo = validSales.filter((s) => !s.createdAt || new Date(s.createdAt) <= cutoff);
  const salesAfter = validSales.filter((s) => s.createdAt && new Date(s.createdAt) > cutoff);

  const netRevenue = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.amount) || 0), 0));
  const salesDiscounts = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.discount) || 0), 0));
  const grossRevenue = roundCurrency(netRevenue + salesDiscounts);
  const cogsFinishedGoods = roundCurrency(salesUpTo.reduce((sum, s) => sum + (Number(s.costPrice) || 0), 0));
  const salesVatOutput = roundCurrency(salesUpTo.reduce((sum, s) => sum + Math.max(0, Number(s.vatAmount) || 0), 0));

  // Unpaid invoice balances (Credit/Partial Wholesale & Pending Sales) = Trade Receivables (IFRS 15.108 / IFRS 9)
  const tradeReceivablesSales = roundCurrency(
    salesUpTo.reduce((sum, s) => {
      const totalInvoice = (Number(s.amount) || 0) + Math.max(0, Number(s.vatAmount) || 0);
      const paid =
        s.amountPaid !== null && s.amountPaid !== undefined
          ? Math.min(totalInvoice, Math.max(0, Number(s.amountPaid) || 0))
          : s.status === "Pending"
          ? 0
          : totalInvoice;
      return sum + Math.max(0, totalInvoice - paid);
    }, 0)
  );

  // Advance deposits received on unfulfilled Orders (Pending/Processing/Ready) = Contract Liabilities (IFRS 15.105)
  const convertedOrderPrefixes = new Set(
    validSales.map((s) => String(s.id || "")).filter((id) => id.startsWith("TX-"))
  );
  const orderDeposits = roundCurrency(
    (inputs.orders || [])
      .filter((o) => {
        if (o.createdAt && new Date(o.createdAt) > cutoff) return false;
        if (o.status === "Cancelled" || o.status === "Confirmed" || o.status === "Delivered") return false;
        const prefix = `TX-${o.id}`;
        for (const sId of Array.from(convertedOrderPrefixes)) {
          if (sId.startsWith(prefix)) return false;
        }
        return (Number(o.amountPaid) || 0) > 0;
      })
      .reduce((sum, o) => sum + Math.max(0, Number(o.amountPaid) || 0), 0)
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
  let disposalCashProceeds = 0;
  let disposalReceivables = 0;
  let cashCapExPPE = 0;
  let cashCapExIntangible = 0;
  let assetCreditFinancing = 0;
  let assetVendorPayable = 0;
  let assetEquityContribution = 0;
  let revaluationReserve = 0;
  let revaluationTransferToRE = 0;
  let citaCapitalAllowance = 0;
  let citaBalancingAdjustment = 0;

  for (const asset of inputs.fixedAssets) {
    const calc = computeAssetDepreciationAtDate(asset, cutoff);
    if (!calc.acquired) continue;

    depreciationExpense += calc.accumulatedDepreciation;
    disposalGainLoss += calc.disposalGainLoss;
    disposalProceeds += calc.disposalProceeds;
    disposalCashProceeds += calc.disposalCashProceeds;
    disposalReceivables += calc.disposalReceivableProceeds;
    revaluationReserve += calc.revaluation;
    revaluationTransferToRE += calc.revaluationTransferredOnDisposal;
    citaCapitalAllowance += calc.citaCumulativeAllowance;
    citaBalancingAdjustment += calc.citaBalancingAdjustment;

    const origCost = Number(asset.cost) || 0;
    if (asset.paymentStatus === "Credit/Loan") {
      assetCreditFinancing += origCost;
    } else if (asset.paymentStatus === "Vendor Credit") {
      assetVendorPayable += origCost;
    } else if (asset.paymentStatus === "Owner Equity") {
      assetEquityContribution += origCost;
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
  disposalCashProceeds = roundCurrency(disposalCashProceeds);
  disposalReceivables = roundCurrency(disposalReceivables);
  cashCapExPPE = roundCurrency(cashCapExPPE);
  cashCapExIntangible = roundCurrency(cashCapExIntangible);
  assetCreditFinancing = roundCurrency(assetCreditFinancing);
  assetVendorPayable = roundCurrency(assetVendorPayable);
  assetEquityContribution = roundCurrency(assetEquityContribution);
  revaluationReserve = roundCurrency(revaluationReserve);
  revaluationTransferToRE = roundCurrency(revaluationTransferToRE);
  citaCapitalAllowance = roundCurrency(citaCapitalAllowance);
  citaBalancingAdjustment = roundCurrency(citaBalancingAdjustment);

  const totalNonCurrentAssets = roundCurrency(ppeNBV + rouNBV + intangibleNBV);

  // 5. Financial Ledger Entries up to cutoff
  const entriesUpTo = inputs.entries.filter((e) => !e.date || new Date(e.date) <= cutoff);
  const sumByType = (t: FinancialEntryType) =>
    roundCurrency(entriesUpTo.filter((e) => e.entryType === t).reduce((s, e) => s + (Number(e.amount) || 0), 0));

  const shareCapital = roundCurrency(
    sumByType("SHARE_CAPITAL") + sumByType("INVESTOR_ORDINARY_EQUITY") + sumByType("CONVERTIBLE_CONVERSION")
  );
  const preferenceShareCapital = sumByType("PREFERENCE_SHARE_CAPITAL");
  const depositForShares = sumByType("DEPOSIT_FOR_SHARES");
  const sharePremium = sumByType("SHARE_PREMIUM");
  const generalReserve = roundCurrency(sumByType("CAPITAL_INTRODUCED") + sumByType("PARTNER_JV_INVESTMENT"));
  const manualOpeningRE = sumByType("OPENING_RETAINED_EARNINGS");
  const dividendsPaid = sumByType("DIVIDENDS_PAID");

  const longTermLoansRaw = sumByType("LONG_TERM_LOAN") + sumByType("DIRECTOR_LOAN") - sumByType("LONG_TERM_LOAN_REPAYMENT");
  const longTermLoans = roundCurrency(longTermLoansRaw);
  const convertibleReceived = roundCurrency(
    sumByType("CONVERTIBLE_INVESTMENT") + sumByType("REDEEMABLE_PREFERENCE_SHARES")
  );
  const convertibleConverted = sumByType("CONVERTIBLE_CONVERSION");
  const convertibleRedeemed = sumByType("INVESTMENT_REDEMPTION");
  const convertibleAndRedeemableLiab = roundCurrency(
    convertibleReceived - convertibleConverted - convertibleRedeemed
  );
  const grantIncomeCash = sumByType("GRANT_INCOME");
  const grantAmortised = sumByType("GRANT_AMORTISED");
  const grantIncomeTotal = roundCurrency(grantIncomeCash + grantAmortised);
  const deferredGrantReceived = sumByType("DEFERRED_GRANT");
  const deferredGrants = roundCurrency(deferredGrantReceived - grantAmortised);
  const deferredTaxLiability = sumByType("DEFERRED_TAX_LIABILITY");

  const tradePayables = roundCurrency(sumByType("TRADE_PAYABLE") - sumByType("TRADE_PAYABLE_SETTLEMENT"));
  const accruedExpenses = sumByType("ACCRUED_EXPENSE");
  const customerDeposits = roundCurrency(sumByType("CUSTOMER_DEPOSIT") + orderDeposits);
  const shortTermLoans = roundCurrency(sumByType("SHORT_TERM_LOAN") - sumByType("SHORT_TERM_LOAN_REPAYMENT"));
  const statutoryPayables = roundCurrency(sumByType("STATUTORY_PAYABLE") - sumByType("STATUTORY_REMITTANCE") + salesVatOutput);

  const prepayments = roundCurrency(sumByType("PREPAYMENT") - sumByType("PREPAYMENT_AMORTISED"));
  const otherReceivables = roundCurrency(sumByType("OTHER_RECEIVABLE") - sumByType("RECEIVABLE_COLLECTED"));
  const totalReceivables = roundCurrency(tradeReceivablesSales + Math.max(0, otherReceivables) + disposalReceivables);

  const taxPaid = sumByType("TAX_PAID");

  const totalCostOfSales = roundCurrency(cogsFinishedGoods + factoryOverhead);
  const profitBeforeTax = roundCurrency(
    netRevenue - totalCostOfSales + grantIncomeTotal - operatingExpenses - depreciationExpense + disposalGainLoss - financeCosts
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
    grantIncomeCash,
    grantAmortised,
    grantIncomeTotal,
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
    preferenceShareCapital,
    depositForShares,
    sharePremium,
    generalReserve,
    assetEquityContribution,
    revaluationReserve,
    revaluationTransferToRE,
    manualOpeningRE,
    dividendsPaid,
    longTermLoans,
    assetCreditFinancing,
    assetVendorPayable,
    deferredGrantReceived,
    deferredGrants,
    convertibleReceived,
    convertibleConverted,
    convertibleRedeemed,
    convertibleAndRedeemableLiab,
    deferredTaxLiability,
    tradePayables,
    accruedExpenses,
    customerDeposits,
    shortTermLoans,
    statutoryPayables,
    salesVatOutput,
    taxPaid,
    cashCapExPPE,
    cashCapExIntangible,
    disposalProceeds,
    disposalCashProceeds,
    disposalReceivables,
    citaCapitalAllowance,
    citaBalancingAdjustment,
  };
}

function deriveBalanceSheetFromSnapshot(snap: CumulativeSnapshot, cumulativeCurrentTax: number) {
  // Net Cash from exact double-entry identity:
  // Cash = PBT - TaxPaid + Dep - DisposalGain - Inv - Rec - Prep + WorkingCapLiab - CashCapEx + DisposalCashProceeds + EquityCashIn - Dividends + NetCashLoans
  const workingCapitalAssets = roundCurrency(snap.totalInventories + snap.tradeReceivablesSales + snap.otherReceivables + snap.prepayments);
  const workingCapitalLiabilities = roundCurrency(
    snap.tradePayables + snap.accruedExpenses + snap.customerDeposits + snap.statutoryPayables
  );
  const equityCashIn = roundCurrency(
    snap.shareCapital +
      snap.preferenceShareCapital +
      snap.depositForShares +
      snap.sharePremium +
      snap.generalReserve +
      snap.manualOpeningRE
  );
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
      snap.disposalCashProceeds +
      equityCashIn -
      snap.dividendsPaid +
      netCashBorrowings +
      snap.deferredGrants +
      snap.convertibleAndRedeemableLiab
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

  const deferredGrantsLiab = Math.max(0, snap.deferredGrants);
  const deferredGrantOverAmortisedAsset = snap.deferredGrants < 0 ? Math.abs(snap.deferredGrants) : 0;

  const convertibleInvestmentsLiab = Math.max(0, snap.convertibleAndRedeemableLiab);
  const convertibleOverConvertedAsset =
    snap.convertibleAndRedeemableLiab < 0 ? Math.abs(snap.convertibleAndRedeemableLiab) : 0;

  const tradeAndOtherReceivables = roundCurrency(
    snap.tradeReceivablesSales +
      otherRecAsset +
      snap.disposalReceivables +
      supplierAdvanceAsset +
      statutoryCreditAsset +
      longTermLoanOverpaymentAsset +
      shortTermLoanOverpaymentAsset +
      deferredGrantOverAmortisedAsset +
      convertibleOverConvertedAsset
  );

  const totalPrepaymentsAndTaxAsset = roundCurrency(prepaymentsAsset + prepaidTaxAsset);

  const totalCurrentAssets = roundCurrency(
    snap.totalInventories + tradeAndOtherReceivables + totalPrepaymentsAndTaxAsset + cashAndEquivalentsAsset
  );

  const totalAssets = roundCurrency(snap.totalNonCurrentAssets + totalCurrentAssets);

  // Equity (includes IAS 16.41 transfer from revaluation reserve upon asset disposal, IAS 32 pref shares & deposits for shares)
  const cumulativePAT = roundCurrency(snap.profitBeforeTax - cumulativeCurrentTax - snap.deferredTaxLiability);
  const retainedEarnings = roundCurrency(snap.manualOpeningRE + cumulativePAT + snap.revaluationTransferToRE - snap.dividendsPaid);
  const totalGeneralReserve = roundCurrency(snap.generalReserve + snap.assetEquityContribution);
  const totalEquity = roundCurrency(
    snap.shareCapital +
      snap.preferenceShareCapital +
      snap.depositForShares +
      snap.sharePremium +
      snap.revaluationReserve +
      totalGeneralReserve +
      retainedEarnings
  );

  // Liabilities
  const totalNonCurrentLiabilities = roundCurrency(
    longTermBorrowingsLiab + convertibleInvestmentsLiab + deferredGrantsLiab + snap.deferredTaxLiability
  );
  const accruedAndOtherPayables = roundCurrency(
    snap.accruedExpenses + snap.assetVendorPayable + prepaymentsCreditAdj + otherRecCreditAdj
  );

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
      disposalReceivables: snap.disposalReceivables,
      tradeAndOtherReceivables,
      prepayments: prepaymentsAsset,
      prepaidTaxAsset,
      cashAndCashEquivalents: cashAndEquivalentsAsset,
      totalCurrentAssets,
    },
    totalAssets,
    equity: {
      shareCapital: snap.shareCapital,
      preferenceShareCapital: snap.preferenceShareCapital,
      depositForShares: snap.depositForShares,
      sharePremium: snap.sharePremium,
      revaluationReserve: snap.revaluationReserve,
      generalReserve: totalGeneralReserve,
      retainedEarnings,
      totalEquity,
    },
    nonCurrentLiabilities: {
      longTermBorrowings: longTermBorrowingsLiab,
      convertibleAndRedeemableInvestments: convertibleInvestmentsLiab,
      deferredGrants: deferredGrantsLiab,
      deferredTaxLiability: snap.deferredTaxLiability,
      totalNonCurrentLiabilities,
    },
    currentLiabilities: {
      tradePayables: tradePayablesLiab,
      accruedExpenses: accruedAndOtherPayables,
      assetVendorPayables: snap.assetVendorPayable,
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

  const closingCutoff = hasEnd ? toEndOfDay(endDate!) : toEndOfDay(new Date(Date.now() + 86_400_000).toISOString());
  const openingCutoff = hasStart ? new Date(toStartOfDay(startDate!).getTime() - 1) : null;

  const openSnap = buildSnapshotAtCutoff(inputs, openingCutoff, !hasStart);
  const closeSnap = buildSnapshotAtCutoff(inputs, closingCutoff, false);

  // Prior tax (if startDate provided)
  const openTax = hasStart
    ? calculateNigerianTax(
        openSnap.netRevenue,
        openSnap.profitBeforeTax,
        openSnap.depreciationExpense,
        openSnap.disposalGainLoss,
        openSnap.citaCapitalAllowance,
        openSnap.citaBalancingAdjustment,
        0,
        inputs.settings,
        openSnap.totalNonCurrentAssets
      )
    : null;
  const openCurrentTax = openTax
    ? openTax.citAmount + openTax.developmentLevyAmount + openTax.minimumTaxTopUp + openTax.tetAmount + openTax.policeLevyAmount
    : 0;

  // Period Income Statement (IAS 1)
  const grossRevenue = roundCurrency(closeSnap.grossRevenue - openSnap.grossRevenue);
  const salesDiscounts = roundCurrency(closeSnap.salesDiscounts - openSnap.salesDiscounts);
  const revenue = roundCurrency(closeSnap.netRevenue - openSnap.netRevenue);

  const cogsFinishedGoods = roundCurrency(closeSnap.cogsFinishedGoods - openSnap.cogsFinishedGoods);
  const factoryOverhead = roundCurrency(closeSnap.factoryOverhead - openSnap.factoryOverhead);
  const costOfSales = roundCurrency(closeSnap.totalCostOfSales - openSnap.totalCostOfSales);
  const grossProfit = roundCurrency(revenue - costOfSales);

  const grantIncomeCash = roundCurrency(closeSnap.grantIncomeCash - openSnap.grantIncomeCash);
  const grantAmortised = roundCurrency(closeSnap.grantAmortised - openSnap.grantAmortised);
  const grantIncome = roundCurrency(grantIncomeCash + grantAmortised);

  const operatingExpenses = roundCurrency(closeSnap.operatingExpenses - openSnap.operatingExpenses);
  const depreciationAndAmortisation = roundCurrency(closeSnap.depreciationExpense - openSnap.depreciationExpense);
  const otherOperatingGainLoss = roundCurrency(closeSnap.disposalGainLoss - openSnap.disposalGainLoss);

  const operatingProfitEBIT = roundCurrency(
    grossProfit + grantIncome - operatingExpenses - depreciationAndAmortisation + otherOperatingGainLoss
  );
  const financeCosts = roundCurrency(closeSnap.financeCosts - openSnap.financeCosts);
  const profitBeforeTax = roundCurrency(operatingProfitEBIT - financeCosts);

  const periodDeferredTax = roundCurrency(closeSnap.deferredTaxLiability - openSnap.deferredTaxLiability);
  const periodCitaCapitalAllowance = roundCurrency(closeSnap.citaCapitalAllowance - openSnap.citaCapitalAllowance);
  const periodCitaBalancingAdjustment = roundCurrency(closeSnap.citaBalancingAdjustment - openSnap.citaBalancingAdjustment);

  // Nigeria Tax Act (NTA) 2025 Corporate Tax for the Period
  const taxBreakdown = calculateNigerianTax(
    revenue,
    profitBeforeTax,
    depreciationAndAmortisation,
    otherOperatingGainLoss,
    periodCitaCapitalAllowance,
    periodCitaBalancingAdjustment,
    periodDeferredTax,
    inputs.settings,
    closeSnap.totalNonCurrentAssets
  );

  const periodCurrentTax = roundCurrency(
    taxBreakdown.citAmount +
      taxBreakdown.developmentLevyAmount +
      taxBreakdown.minimumTaxTopUp +
      taxBreakdown.tetAmount +
      taxBreakdown.policeLevyAmount
  );
  const cumulativeClosingCurrentTax = roundCurrency(openCurrentTax + periodCurrentTax);

  const profitForThePeriod = roundCurrency(profitBeforeTax - taxBreakdown.totalTaxExpense);
  // Total revaluation OCI recognised (preserving revaluation on assets disposed during the period before IAS 16.41 transfer)
  const otherComprehensiveIncomeReval = roundCurrency(
    closeSnap.revaluationReserve +
      closeSnap.revaluationTransferToRE -
      (openSnap.revaluationReserve + openSnap.revaluationTransferToRE)
  );
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
  const revenueByChannel: Record<"Retail" | "Wholesale", { ordersCount: number; units: number; grossRevenue: number; discounts: number; netRevenue: number; cogs: number; grossProfit: number }> = {
    Retail: { ordersCount: 0, units: 0, grossRevenue: 0, discounts: 0, netRevenue: 0, cogs: 0, grossProfit: 0 },
    Wholesale: { ordersCount: 0, units: 0, grossRevenue: 0, discounts: 0, netRevenue: 0, cogs: 0, grossProfit: 0 },
  };
  for (const s of periodSalesList) {
    const prod = s.productName || "Footwear Products";
    if (!revenueByProduct[prod]) revenueByProduct[prod] = { qty: 0, revenue: 0, cogs: 0 };
    revenueByProduct[prod].qty += Number(s.quantity) || 0;
    revenueByProduct[prod].revenue = roundCurrency(revenueByProduct[prod].revenue + (Number(s.amount) || 0));
    revenueByProduct[prod].cogs = roundCurrency(revenueByProduct[prod].cogs + (Number(s.costPrice) || 0));

    const ch: "Retail" | "Wholesale" = s.saleType === "Wholesale" ? "Wholesale" : "Retail";
    const sNet = Number(s.amount) || 0;
    const sDisc = Number(s.discount) || 0;
    const sCogs = Number(s.costPrice) || 0;
    revenueByChannel[ch].ordersCount += 1;
    revenueByChannel[ch].units += Number(s.quantity) || 0;
    revenueByChannel[ch].grossRevenue = roundCurrency(revenueByChannel[ch].grossRevenue + sNet + sDisc);
    revenueByChannel[ch].discounts = roundCurrency(revenueByChannel[ch].discounts + sDisc);
    revenueByChannel[ch].netRevenue = roundCurrency(revenueByChannel[ch].netRevenue + sNet);
    revenueByChannel[ch].cogs = roundCurrency(revenueByChannel[ch].cogs + sCogs);
    revenueByChannel[ch].grossProfit = roundCurrency(revenueByChannel[ch].netRevenue - revenueByChannel[ch].cogs);
  }

  // Opening & Closing Statement of Financial Position (IAS 1)
  const openingPosition = deriveBalanceSheetFromSnapshot(openSnap, openCurrentTax);
  const closingPosition = deriveBalanceSheetFromSnapshot(closeSnap, cumulativeClosingCurrentTax);

  // Statement of Changes in Equity (IAS 1.106)
  const issueOfShareCapital = roundCurrency(closeSnap.shareCapital - openSnap.shareCapital);
  const conversionToShareCapital = roundCurrency(closeSnap.convertibleConverted - openSnap.convertibleConverted);
  const issueOfPreferenceShares = roundCurrency(closeSnap.preferenceShareCapital - openSnap.preferenceShareCapital);
  const issueOfDepositForShares = roundCurrency(closeSnap.depositForShares - openSnap.depositForShares);
  const preferenceAndDepositsMovement = roundCurrency(issueOfPreferenceShares + issueOfDepositForShares);
  const issueOfSharePremium = roundCurrency(closeSnap.sharePremium - openSnap.sharePremium);
  const cashCapitalIntroducedReserve = roundCurrency(closeSnap.generalReserve - openSnap.generalReserve);
  const assetEquityContributionMovement = roundCurrency(closeSnap.assetEquityContribution - openSnap.assetEquityContribution);
  const capitalIntroducedReserve = roundCurrency(
    cashCapitalIntroducedReserve + assetEquityContributionMovement + preferenceAndDepositsMovement
  );
  const priorRetainedEarningsIntroduced = roundCurrency(closeSnap.manualOpeningRE - openSnap.manualOpeningRE);
  const revaluationTransferToRE = roundCurrency(closeSnap.revaluationTransferToRE - openSnap.revaluationTransferToRE);
  const dividendsPaidInPeriod = roundCurrency(closeSnap.dividendsPaid - openSnap.dividendsPaid);

  const statementOfChangesInEquity = {
    opening: {
      shareCapital: openingPosition.equity.shareCapital,
      sharePremium: openingPosition.equity.sharePremium,
      revaluationReserve: openingPosition.equity.revaluationReserve,
      generalReserve: roundCurrency(
        openingPosition.equity.generalReserve +
          openingPosition.equity.preferenceShareCapital +
          openingPosition.equity.depositForShares
      ),
      retainedEarnings: openingPosition.equity.retainedEarnings,
      total: openingPosition.equity.totalEquity,
    },
    profitForPeriod: profitForThePeriod,
    otherComprehensiveIncome: otherComprehensiveIncomeReval,
    totalComprehensiveIncome,
    issueOfShares: issueOfShareCapital,
    conversionToShareCapital,
    preferenceAndDepositsMovement,
    sharePremiumMovement: issueOfSharePremium,
    capitalAndReservesMovement: capitalIntroducedReserve,
    openingRetainedEarningsAdjustment: priorRetainedEarningsIntroduced,
    revaluationTransferToRE,
    dividendsAndDrawings: -dividendsPaidInPeriod,
    closing: {
      shareCapital: closingPosition.equity.shareCapital,
      sharePremium: closingPosition.equity.sharePremium,
      revaluationReserve: closingPosition.equity.revaluationReserve,
      generalReserve: roundCurrency(
        closingPosition.equity.generalReserve +
          closingPosition.equity.preferenceShareCapital +
          closingPosition.equity.depositForShares
      ),
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
    profitBeforeTax + depreciationAndAmortisation - otherOperatingGainLoss - grantAmortised
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
  const periodSalesVatOutput = roundCurrency(closeSnap.salesVatOutput - openSnap.salesVatOutput);
  const closeManualStatutory = roundCurrency(closeSnap.statutoryPayables - closeSnap.salesVatOutput);
  const openManualStatutory = roundCurrency(openSnap.statutoryPayables - openSnap.salesVatOutput);

  const cashReceiptsFromCustomers = roundCurrency(
    revenue +
      periodSalesVatOutput -
      (closeSnap.tradeReceivablesSales - openSnap.tradeReceivablesSales) +
      (closeSnap.customerDeposits - openSnap.customerDeposits)
  );
  const cashReceiptsFromGrants = grantIncomeCash;
  const cashPaidToSuppliersAndProduction = roundCurrency(
    -(costOfSales + (closeSnap.totalInventories - openSnap.totalInventories) - (closeSnap.tradePayables - openSnap.tradePayables))
  );
  const cashPaidForOperatingAndFinance = roundCurrency(
    -(
      operatingExpenses +
      financeCosts +
      (closeSnap.prepayments - openSnap.prepayments) +
      (closeSnap.otherReceivables - openSnap.otherReceivables) -
      (closeSnap.accruedExpenses + closeManualStatutory - (openSnap.accruedExpenses + openManualStatutory))
    )
  );
  const cashPaidForFinanceCosts = roundCurrency(-financeCosts);
  const cashPaidForOperatingOnly = roundCurrency(cashPaidForOperatingAndFinance - cashPaidForFinanceCosts);

  // Investing Activities (IAS 7.16)
  const purchaseOfPPE = roundCurrency(-(closeSnap.cashCapExPPE - openSnap.cashCapExPPE));
  const purchaseOfIntangibles = roundCurrency(-(closeSnap.cashCapExIntangible - openSnap.cashCapExIntangible));
  const proceedsFromDisposalOfPPE = roundCurrency(closeSnap.disposalCashProceeds - openSnap.disposalCashProceeds);
  const netCashFromInvestingActivities = roundCurrency(purchaseOfPPE + purchaseOfIntangibles + proceedsFromDisposalOfPPE);

  // Financing Activities (IAS 7.17 — strictly cash equity, investor capital, quasi-equity debt, borrowings & IAS 20 capital grants)
  const cashOrdinaryShareIssue = roundCurrency(issueOfShareCapital - conversionToShareCapital);
  const proceedsFromShareIssue = roundCurrency(
    cashOrdinaryShareIssue +
      preferenceAndDepositsMovement +
      issueOfSharePremium +
      cashCapitalIntroducedReserve +
      priorRetainedEarningsIntroduced
  );
  const quasiEquityInvestmentsReceived = roundCurrency(closeSnap.convertibleReceived - openSnap.convertibleReceived);
  const investmentsRedeemed = roundCurrency(-(closeSnap.convertibleRedeemed - openSnap.convertibleRedeemed));
  const capitalGrantsReceived = roundCurrency(closeSnap.deferredGrantReceived - openSnap.deferredGrantReceived);
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

  const longTermDrawn = roundCurrency(sumPeriodEntry("LONG_TERM_LOAN") + sumPeriodEntry("DIRECTOR_LOAN"));
  const longTermRepaid = sumPeriodEntry("LONG_TERM_LOAN_REPAYMENT");
  const shortTermDrawn = sumPeriodEntry("SHORT_TERM_LOAN");
  const shortTermRepaid = sumPeriodEntry("SHORT_TERM_LOAN_REPAYMENT");

  const borrowingsReceived = roundCurrency(longTermDrawn + shortTermDrawn);
  const borrowingsRepaid = roundCurrency(-(longTermRepaid + shortTermRepaid));
  const dividendsPaidCashFlow = roundCurrency(-dividendsPaidInPeriod);

  const loanEntryTypes: FinancialEntryType[] = [
    "LONG_TERM_LOAN",
    "DIRECTOR_LOAN",
    "LONG_TERM_LOAN_REPAYMENT",
    "SHORT_TERM_LOAN",
    "SHORT_TERM_LOAN_REPAYMENT",
  ];
  const loanEntries = periodEntries
    .filter((e) => loanEntryTypes.includes(e.entryType))
    .map((e) => ({
      id: e.id,
      date: e.date,
      entryType: e.entryType,
      title: e.title,
      reference: e.reference || "",
      notes: e.notes || "",
      amount: roundCurrency(Number(e.amount) || 0),
    }));

  const financeCostExpenses = inputs.expenses
    .filter((e) => {
      const isFin =
        e.type === "Finance Cost" || e.category === "Interest / Bank Charges" || e.category === "Finance Cost";
      if (!isFin) return false;
      const d = e.date ? new Date(e.date) : null;
      if (d && openingCutoff && d <= openingCutoff) return false;
      if (d && d > closingCutoff) return false;
      return true;
    })
    .map((e) => ({
      id: String(e.id),
      name: String(e.name || "Finance Cost"),
      category: String(e.category || "Interest / Bank Charges"),
      amount: roundCurrency(Number(e.amount) || 0),
      date: String(e.date || ""),
      description: String(e.description || ""),
    }));

  const loanOverpaymentAdvance = roundCurrency(
    (closeSnap.longTermLoans + closeSnap.assetCreditFinancing < 0
      ? Math.abs(closeSnap.longTermLoans + closeSnap.assetCreditFinancing)
      : 0) + (closeSnap.shortTermLoans < 0 ? Math.abs(closeSnap.shortTermLoans) : 0)
  );

  const netCashFromFinancingActivities = roundCurrency(
    proceedsFromShareIssue +
      quasiEquityInvestmentsReceived +
      investmentsRedeemed +
      capitalGrantsReceived +
      netProceedsFromLongTermBorrowings +
      netProceedsFromShortTermBorrowings +
      dividendsPaidCashFlow
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
    const citaInfo = getNigeriaCitaAllowanceRates(asset.category);
    return {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      acquisitionDate: asset.acquisitionDate,
      usefulLifeYears: asset.usefulLifeYears,
      method: asset.depreciationMethod,
      paymentStatus: asset.paymentStatus || "Paid",
      originalCost: Number(asset.cost) || 0,
      revaluation: Number(asset.revaluationSurplus) || 0,
      periodDepreciation: periodDep,
      accumulatedDepreciation: closeCalc.disposed ? closeCalc.accumulatedDepreciation : closeCalc.accumulatedDepreciation,
      carryingAccumulatedDepreciation: closeCalc.disposed ? 0 : closeCalc.accumulatedDepreciation,
      netBookValue: closeCalc.netBookValue,
      disposed: closeCalc.disposed,
      disposalDate: asset.disposalDate || null,
      disposalProceeds: closeCalc.disposalProceeds,
      disposalGainLoss: closeCalc.disposalGainLoss,
      disposalPaymentStatus: asset.disposalPaymentStatus || "Cash",
      citaClass: citaInfo.citaClass,
      citaAllowance: closeCalc.citaCumulativeAllowance,
      citaBalancingAdjustment: closeCalc.citaBalancingAdjustment,
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

  // Nigerian CAMA 2020, FRCN & Nigeria Tax Act (NTA) 2025 Compliance Diagnostics
  const complianceChecks = {
    accountingEquationBalanced: closingPosition.isBalanced,
    cashFlowReconciled: Math.abs(closingCashEquivalents - closingPosition.netCash) < 0.05,
    camaMinimumShareCapitalMet: closingPosition.equity.shareCapital >= 100_000, // CAMA 2020 s.27(2)(a) private company min ₦100,000
    camaDistributableProfitCompliant: dividendsPaidInPeriod === 0 || closingPosition.equity.retainedEarnings >= 0, // CAMA 2020 s.426
    unallocatedOverdraftWarning: closingPosition.currentLiabilities.bankOverdraft > 0 && closingPosition.equity.shareCapital === 0,
    ntaSmallCompanyExempt: taxBreakdown.citRate === 0 && taxBreakdown.developmentLevyRate === 0,
    ntaVatRegistrationRequired: revenue > 50_000_000, // NTA 2025 ₦50M small business VAT filing threshold
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
        "IFRS / IAS 1, IAS 2, IAS 7, IAS 12, IAS 16, IAS 20, IAS 32, IFRS 9, IFRS 15 (FRCN Adopted)",
        "Companies and Allied Matters Act (CAMA) 2020",
        "Nigeria Tax Act (NTA) 2025 (Effective 2026: ₦100M Small Co. Exemption, 4% Development Levy & Straight-Line CA)",
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
      grantIncomeCash,
      grantAmortised,
      grantIncome,
      expensesByCategory,
      revenueByProduct,
      revenueByChannel,
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
        otherNonCashAdjustments: roundCurrency(-otherOperatingGainLoss - grantAmortised),
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
        cashReceiptsFromGrants,
        cashPaidToSuppliersAndProduction,
        cashPaidForOperatingAndFinance,
        cashPaidForOperatingOnly,
        cashPaidForFinanceCosts,
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
        quasiEquityInvestmentsReceived,
        investmentsRedeemed,
        capitalGrantsReceived,
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
      borrowingsSchedule: {
        openingLongTermBorrowings: openingPosition.nonCurrentLiabilities.longTermBorrowings,
        openingShortTermBorrowings: openingPosition.currentLiabilities.shortTermBorrowings,
        longTermDrawn,
        longTermRepaid,
        shortTermDrawn,
        shortTermRepaid,
        borrowingsReceived,
        borrowingsRepaid: roundCurrency(longTermRepaid + shortTermRepaid),
        assetCreditFinancing: roundCurrency(closeSnap.assetCreditFinancing - openSnap.assetCreditFinancing),
        closingLongTermBorrowings: closingPosition.nonCurrentLiabilities.longTermBorrowings,
        closingShortTermBorrowings: closingPosition.currentLiabilities.shortTermBorrowings,
        loanOverpaymentAdvance,
        financeCostsPaid: financeCosts,
        loanEntries,
        financeCostExpenses,
      },
      nonCashInvestingFinancing: roundCurrency(
        closeSnap.assetCreditFinancing -
          openSnap.assetCreditFinancing +
          (closeSnap.assetVendorPayable - openSnap.assetVendorPayable) +
          (closeSnap.assetEquityContribution - openSnap.assetEquityContribution) +
          conversionToShareCapital
      ),
      nonCashConvertibleConversion: conversionToShareCapital,
      nonCashDisposalReceivable: roundCurrency(closeSnap.disposalReceivables - openSnap.disposalReceivables),
    },
    ratios,
    complianceChecks,
  };
}
