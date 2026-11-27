"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  Gift,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Scale,
  CheckCircle2,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { NairaIcon } from "@/components/ui/NairaIcon";
import {
  getFinancialStatementsAction,
  createFinancialEntryAction,
  updateFinancialEntryAction,
  deleteFinancialEntryAction,
} from "@/lib/actions/financials";
import {
  FINANCIAL_ENTRY_TYPES,
  type FinancialEntryRecord,
  type FinancialEntryType,
} from "@/lib/accounting-standards";
import { formatAccountingNaira } from "@/lib/financial-export";

type FundingCategory = "ALL" | "INVESTMENT" | "CAPITAL" | "GRANT" | "LOAN" | "OUTFLOW";

const INVESTMENT_TYPES: FinancialEntryType[] = [
  "INVESTOR_ORDINARY_EQUITY",
  "PREFERENCE_SHARE_CAPITAL",
  "DEPOSIT_FOR_SHARES",
  "PARTNER_JV_INVESTMENT",
  "CONVERTIBLE_INVESTMENT",
  "REDEEMABLE_PREFERENCE_SHARES",
  "CONVERTIBLE_CONVERSION",
];

const CAPITAL_TYPES: FinancialEntryType[] = [
  "CAPITAL_INTRODUCED",
  "SHARE_CAPITAL",
  "SHARE_PREMIUM",
  "OPENING_RETAINED_EARNINGS",
];

const GRANT_TYPES: FinancialEntryType[] = [
  "GRANT_INCOME",
  "DEFERRED_GRANT",
  "GRANT_AMORTISED",
];

const LOAN_INFLOW_TYPES: FinancialEntryType[] = [
  "LONG_TERM_LOAN",
  "DIRECTOR_LOAN",
  "SHORT_TERM_LOAN",
];

const OUTFLOW_TYPES: FinancialEntryType[] = [
  "LONG_TERM_LOAN_REPAYMENT",
  "SHORT_TERM_LOAN_REPAYMENT",
  "INVESTMENT_REDEMPTION",
  "DIVIDENDS_PAID",
];

const ALL_FUNDING_TYPES: FinancialEntryType[] = [
  ...INVESTMENT_TYPES,
  ...CAPITAL_TYPES,
  ...GRANT_TYPES,
  ...LOAN_INFLOW_TYPES,
  ...OUTFLOW_TYPES,
];

interface InvestmentOption {
  code: FinancialEntryType;
  shortTitle: string;
  classification: "Equity (CAMA / IAS 32)" | "Financial Liability (IAS 32 / IFRS 9)" | "Non-Cash Reclassification";
  whenToUse: string;
}

const NIGERIAN_INVESTMENT_SELECTOR: InvestmentOption[] = [
  {
    code: "INVESTOR_ORDINARY_EQUITY",
    shortTitle: "Ordinary Share Equity",
    classification: "Equity (CAMA / IAS 32)",
    whenToUse: "Investor receives allotted ordinary shares (CAC Form CAC2A).",
  },
  {
    code: "DEPOSIT_FOR_SHARES",
    shortTitle: "Deposit for Shares",
    classification: "Equity (CAMA / IAS 32)",
    whenToUse: "Committed equity cash received while awaiting CAC share allotment.",
  },
  {
    code: "PREFERENCE_SHARE_CAPITAL",
    shortTitle: "Irredeemable Pref. Shares",
    classification: "Equity (CAMA / IAS 32)",
    whenToUse: "Preference shares with no mandatory redemption & discretionary dividends.",
  },
  {
    code: "PARTNER_JV_INVESTMENT",
    shortTitle: "Silent Partner / JV Equity",
    classification: "Equity (CAMA / IAS 32)",
    whenToUse: "Syndicate, angel, or joint-venture profit-sharing capital without debt terms.",
  },
  {
    code: "CONVERTIBLE_INVESTMENT",
    shortTitle: "Convertible Note / SAFE",
    classification: "Financial Liability (IAS 32 / IFRS 9)",
    whenToUse: "Seed/VC funding that converts into shares at a future valuation round.",
  },
  {
    code: "REDEEMABLE_PREFERENCE_SHARES",
    shortTitle: "Redeemable Pref. Shares",
    classification: "Financial Liability (IAS 32 / IFRS 9)",
    whenToUse: "Preference shares with mandatory buyback/redemption date (treated as Liability).",
  },
  {
    code: "CONVERTIBLE_CONVERSION",
    shortTitle: "Convert Note to Shares",
    classification: "Non-Cash Reclassification",
    whenToUse: "Reclassify existing Convertible Note / SAFE liability into Share Capital.",
  },
  {
    code: "INVESTMENT_REDEMPTION",
    shortTitle: "Redeem Investment Principal",
    classification: "Financial Liability (IAS 32 / IFRS 9)",
    whenToUse: "Cash payout redeeming matured convertible notes or redeemable shares.",
  },
];

function getEntryCategory(code: string): Exclude<FundingCategory, "ALL"> | null {
  if (INVESTMENT_TYPES.includes(code as FinancialEntryType)) return "INVESTMENT";
  if (CAPITAL_TYPES.includes(code as FinancialEntryType)) return "CAPITAL";
  if (GRANT_TYPES.includes(code as FinancialEntryType)) return "GRANT";
  if (LOAN_INFLOW_TYPES.includes(code as FinancialEntryType)) return "LOAN";
  if (OUTFLOW_TYPES.includes(code as FinancialEntryType)) return "OUTFLOW";
  return null;
}

function getDoubleEntryGuide(code: FinancialEntryType): {
  debit: string;
  credit: string;
  statementImpact: string;
} {
  switch (code) {
    case "SHARE_CAPITAL":
    case "INVESTOR_ORDINARY_EQUITY":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Issued Ordinary Share Capital (Equity)",
        statementImpact: "SOFP Equity, SOCE Share Allotment & SOCF Financing Inflow (CAMA 2020 s.124)",
      };
    case "PREFERENCE_SHARE_CAPITAL":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Irredeemable Preference Share Capital (Equity)",
        statementImpact: "SOFP Equity (IAS 32.16), SOCE & SOCF Financing Inflow",
      };
    case "DEPOSIT_FOR_SHARES":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Deposit for Shares — Pending CAC Allotment (Equity)",
        statementImpact: "SOFP Equity (FRCN Nigeria Practice), SOCE & SOCF Financing Inflow",
      };
    case "PARTNER_JV_INVESTMENT":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Partner / Joint Venture Capital Reserve (Equity)",
        statementImpact: "SOFP Equity Reserves (IAS 1 / IFRS 11), SOCE & SOCF Financing Inflow",
      };
    case "CONVERTIBLE_INVESTMENT":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Convertible Notes & SAFE Liability (Non-Current Liability)",
        statementImpact: "SOFP Non-Current Liability (IAS 32.28 / IFRS 9) & SOCF Financing Inflow",
      };
    case "REDEEMABLE_PREFERENCE_SHARES":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Redeemable Preference Share Liability (Non-Current Liability)",
        statementImpact: "SOFP Non-Current Financial Liability (IAS 32.18) & SOCF Financing Inflow",
      };
    case "CONVERTIBLE_CONVERSION":
      return {
        debit: "Convertible Investment Liability (Reduces Liability)",
        credit: "Issued Ordinary Share Capital (Increases Equity)",
        statementImpact: "Non-Cash Debt-to-Equity Conversion (IAS 32.28); Zero Cash Impact",
      };
    case "INVESTMENT_REDEMPTION":
      return {
        debit: "Convertible / Redeemable Liability (Reduces Liability)",
        credit: "Cash / Bank Account (Current Asset)",
        statementImpact: "SOFP Reduces Non-Current Investment Liability & SOCF Financing Outflow",
      };
    case "SHARE_PREMIUM":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Share Premium Reserve (Equity)",
        statementImpact: "SOFP Equity & SOCF Financing Inflow (CAMA 2020 s.145)",
      };
    case "CAPITAL_INTRODUCED":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Owner Capital / General Reserve (Equity)",
        statementImpact: "SOFP Equity, SOCE Contribution & SOCF Financing Inflow",
      };
    case "OPENING_RETAINED_EARNINGS":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Retained Earnings Brought Forward (Equity)",
        statementImpact: "SOFP Opening Equity & SOCE Balance",
      };
    case "GRANT_INCOME":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Grant & Other Operating Income (Profit or Loss)",
        statementImpact: "SOPL Profit (IAS 20.12) & SOCF Operating Inflow",
      };
    case "DEFERRED_GRANT":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Deferred Government Grants (Non-Current Liability)",
        statementImpact: "SOFP Non-Current Liability (IAS 20.24) & SOCF Financing Inflow",
      };
    case "GRANT_AMORTISED":
      return {
        debit: "Deferred Government Grants (Reduces Liability)",
        credit: "Grant & Other Operating Income (Profit or Loss)",
        statementImpact: "Non-Cash Release to SOPL (IAS 20.17); Backed out in Indirect SOCF",
      };
    case "LONG_TERM_LOAN":
    case "DIRECTOR_LOAN":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Long-Term Borrowings (Non-Current Liability)",
        statementImpact: "SOFP Non-Current Liability (IFRS 9) & SOCF Financing Inflow",
      };
    case "SHORT_TERM_LOAN":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Short-Term Borrowings (Current Liability)",
        statementImpact: "SOFP Current Liability (IAS 1.69) & SOCF Financing Inflow",
      };
    case "LONG_TERM_LOAN_REPAYMENT":
      return {
        debit: "Long-Term Borrowings (Reduces Liability)",
        credit: "Cash / Bank Account (Current Asset)",
        statementImpact: "SOFP Reduces Long-Term Debt & SOCF Financing Outflow (IAS 7.17)",
      };
    case "SHORT_TERM_LOAN_REPAYMENT":
      return {
        debit: "Short-Term Borrowings (Reduces Liability)",
        credit: "Cash / Bank Account (Current Asset)",
        statementImpact: "SOFP Reduces Short-Term Debt & SOCF Financing Outflow (IAS 7.17)",
      };
    case "DIVIDENDS_PAID":
      return {
        debit: "Retained Earnings / Distributable Reserves",
        credit: "Cash / Bank Account (Current Asset)",
        statementImpact: "SOCE Distribution (CAMA 2020 s.426) & SOCF Financing Outflow",
      };
    default:
      return {
        debit: "Cash / Asset",
        credit: "Equity / Liability",
        statementImpact: "Automatically reconciled across Financial Statements",
      };
  }
}

const CATEGORY_BADGE_MAP: Record<Exclude<FundingCategory, "ALL">, { label: string; className: string }> = {
  INVESTMENT: { label: "Investment Received", className: "badge-success" },
  CAPITAL: { label: "Owner Capital", className: "badge-success" },
  GRANT: { label: "Grant (IAS 20)", className: "badge-accent" },
  LOAN: { label: "Loan Inflow", className: "badge-warning" },
  OUTFLOW: { label: "Repayment / Redemption / Drawings", className: "badge-muted" },
};

export default function CapitalFundingPage() {
  const [entries, setEntries] = useState<FinancialEntryRecord[]>([]);
  const [statements, setStatements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<FundingCategory>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntryRecord | null>(null);
  const [modalModeLabel, setModalModeLabel] = useState("Record Investment, Capital, Grant or Loan");
  const [showInvestmentPicker, setShowInvestmentPicker] = useState(false);
  const [selectedType, setSelectedType] = useState<FinancialEntryType>("INVESTOR_ORDINARY_EQUITY");
  const [presetTitle, setPresetTitle] = useState("");
  const [presetAmount, setPresetAmount] = useState("");
  const [presetReference, setPresetReference] = useState("");
  const [presetNotes, setPresetNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getFinancialStatementsAction();
    if (res.success) {
      setEntries(res.entries || []);
      setStatements(res.statements || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fundingEntries = useMemo(
    () => entries.filter((e) => ALL_FUNDING_TYPES.includes(e.entryType)),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    return fundingEntries.filter((e) => {
      const cat = getEntryCategory(e.entryType);
      if (filterCat !== "ALL" && cat !== filterCat) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const def = FINANCIAL_ENTRY_TYPES.find((t) => t.code === e.entryType);
        const matches =
          (e.title || "").toLowerCase().includes(q) ||
          (e.reference || "").toLowerCase().includes(q) ||
          (e.notes || "").toLowerCase().includes(q) ||
          (def?.label || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [fundingEntries, filterCat, searchTerm]);

  const kpis = useMemo(() => {
    const sumOf = (types: FinancialEntryType[]) =>
      fundingEntries
        .filter((e) => types.includes(e.entryType))
        .reduce<number>((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Owner Capital
    const shareCapitalTotal = sumOf(["SHARE_CAPITAL", "SHARE_PREMIUM"]);
    const ownerCapitalTotal = sumOf(["CAPITAL_INTRODUCED", "OPENING_RETAINED_EARNINGS"]);
    const totalCapitalInjected = shareCapitalTotal + ownerCapitalTotal;

    // External Investments Received (IAS 32 / CAMA 2020)
    const equityInvestmentsCash = sumOf([
      "INVESTOR_ORDINARY_EQUITY",
      "PREFERENCE_SHARE_CAPITAL",
      "DEPOSIT_FOR_SHARES",
      "PARTNER_JV_INVESTMENT",
    ]);
    const quasiEquityReceived = sumOf(["CONVERTIBLE_INVESTMENT", "REDEEMABLE_PREFERENCE_SHARES"]);
    const quasiEquityConverted = sumOf(["CONVERTIBLE_CONVERSION"]);
    const quasiEquityRedeemed = sumOf(["INVESTMENT_REDEMPTION"]);
    const activeConvertibleLiability = Math.max(
      0,
      quasiEquityReceived - quasiEquityConverted - quasiEquityRedeemed
    );
    const totalInvestmentsCashReceived = equityInvestmentsCash + quasiEquityReceived;

    // Grants (IAS 20)
    const grantIncomeImmediate = sumOf(["GRANT_INCOME"]);
    const deferredGrantTotal = sumOf(["DEFERRED_GRANT"]);
    const grantAmortisedTotal = sumOf(["GRANT_AMORTISED"]);
    const remainingDeferredGrant = Math.max(0, deferredGrantTotal - grantAmortisedTotal);
    const totalGrantsCashReceived = grantIncomeImmediate + deferredGrantTotal;

    // Loans & Repayments
    const longTermReceived = sumOf(["LONG_TERM_LOAN", "DIRECTOR_LOAN"]);
    const longTermRepaid = sumOf(["LONG_TERM_LOAN_REPAYMENT"]);
    const shortTermReceived = sumOf(["SHORT_TERM_LOAN"]);
    const shortTermRepaid = sumOf(["SHORT_TERM_LOAN_REPAYMENT"]);

    const netLongTermLoans = Math.max(0, longTermReceived - longTermRepaid);
    const netShortTermLoans = Math.max(0, shortTermReceived - shortTermRepaid);
    const netLoansOutstanding = netLongTermLoans + netShortTermLoans;

    const totalOutflows = longTermRepaid + shortTermRepaid + quasiEquityRedeemed + sumOf(["DIVIDENDS_PAID"]);

    return {
      shareCapitalTotal,
      ownerCapitalTotal,
      totalCapitalInjected,
      equityInvestmentsCash,
      quasiEquityReceived,
      quasiEquityConverted,
      quasiEquityRedeemed,
      activeConvertibleLiability,
      totalInvestmentsCashReceived,
      grantIncomeImmediate,
      deferredGrantTotal,
      grantAmortisedTotal,
      remainingDeferredGrant,
      totalGrantsCashReceived,
      netLongTermLoans,
      netShortTermLoans,
      netLoansOutstanding,
      totalOutflows,
    };
  }, [fundingEntries]);

  const openQuickModal = (
    defaultType: FinancialEntryType,
    modeTitle: string,
    options?: {
      investmentPicker?: boolean;
      title?: string;
      amount?: string;
      reference?: string;
      notes?: string;
    }
  ) => {
    setEditingEntry(null);
    setSelectedType(defaultType);
    setModalModeLabel(modeTitle);
    setShowInvestmentPicker(Boolean(options?.investmentPicker));
    setPresetTitle(options?.title || "");
    setPresetAmount(options?.amount || "");
    setPresetReference(options?.reference || "");
    setPresetNotes(options?.notes || "");
    setSaveError(null);
    setShowModal(true);
  };

  const openEditModal = (entry: FinancialEntryRecord) => {
    setEditingEntry(entry);
    setSelectedType(entry.entryType);
    setModalModeLabel("Edit Funding / Investment Entry");
    setShowInvestmentPicker(
      INVESTMENT_TYPES.includes(entry.entryType) || entry.entryType === "INVESTMENT_REDEMPTION"
    );
    setPresetTitle(entry.title || "");
    setPresetAmount(String(entry.amount || ""));
    setPresetReference(entry.reference || "");
    setPresetNotes(entry.notes || "");
    setSaveError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const fd = new FormData(e.currentTarget);
    const res = editingEntry
      ? await updateFinancialEntryAction(editingEntry.id, fd)
      : await createFinancialEntryAction(fd);

    setIsSaving(false);
    if (res.error) {
      setSaveError(res.error);
      return;
    }

    setShowModal(false);
    setEditingEntry(null);
    await loadData();
  };

  const handleDelete = async (entry: FinancialEntryRecord) => {
    if (
      !confirm(
        `Delete "${entry.title}" (${formatAccountingNaira(entry.amount)})? This will immediately update all Financial Statements.`
      )
    ) {
      return;
    }
    const res = await deleteFinancialEntryAction(entry.id);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadData();
  };

  const selectedMeta = FINANCIAL_ENTRY_TYPES.find((t) => t.code === selectedType);
  const doubleEntryGuide = getDoubleEntryGuide(selectedType);
  const selectableTypes = FINANCIAL_ENTRY_TYPES.filter((t) => ALL_FUNDING_TYPES.includes(t.code));

  const sofp = statements?.statementOfFinancialPosition?.current;
  const isBalanced = sofp?.isBalanced ?? true;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Landmark size={24} color="var(--color-brand)" />
            Investments, Grants, Capital &amp; Loans
          </h1>
          <p className="page-subtitle">
            Categorize investments received (Ordinary Equity, Preference Shares, Deposit for Shares, Partner JV, Convertible Notes/SAFE), IAS 20 grants, owner capital &amp; loans &mdash; auto-posted under Nigerian IFRS &amp; CAMA 2020.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/financial-statements" className="btn-outline btn-sm">
            <Scale size={14} /> View Financial Statements
          </Link>
          <button className="btn-outline btn-sm" onClick={loadData} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 1-Click Action Strip */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          background: "linear-gradient(135deg, var(--color-surface-warm) 0%, #fff 100%)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
              Quick Funding &amp; Investment Actions
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>
              Choose how funds entered or left the business &mdash; the system selects the CAMA 2020 / IAS 32 / IAS 20 / IFRS 9 accounts automatically.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-primary btn-sm"
              onClick={() =>
                openQuickModal("INVESTOR_ORDINARY_EQUITY", "Record Investment Received (Categorize Type)", {
                  investmentPicker: true,
                })
              }
            >
              <Briefcase size={14} /> + Receive Investment
            </button>
            <button
              className="btn-accent btn-sm"
              onClick={() => openQuickModal("CAPITAL_INTRODUCED", "Owner Capital Injection / Share Allotment")}
            >
              <NairaIcon size={14} /> + Owner Capital
            </button>
            <button
              className="btn-outline btn-sm"
              onClick={() => openQuickModal("GRANT_INCOME", "Receive Government / NGO Grant (IAS 20)")}
            >
              <Gift size={14} /> + Receive Grant (IAS 20)
            </button>
            <button
              className="btn-outline btn-sm"
              onClick={() => openQuickModal("LONG_TERM_LOAN", "Receive Bank, BOI or Director Loan")}
            >
              <ArrowDownLeft size={14} /> + Receive Loan
            </button>
            <button
              className="btn-outline btn-sm"
              onClick={() =>
                openQuickModal("LONG_TERM_LOAN_REPAYMENT", "Repayment, Redemption or Distribution")
              }
            >
              <ArrowUpRight size={14} /> + Repay / Distribute
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Investments Received</span>
            <Briefcase size={18} color="var(--color-success)" />
          </div>
          <div className="kpi-value" style={{ color: "var(--color-success)" }}>
            {formatAccountingNaira(kpis.totalInvestmentsCashReceived)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Equity/JV: {formatAccountingNaira(kpis.equityInvestmentsCash)} &bull; Convertible/Redeemable Bal:{" "}
            {formatAccountingNaira(kpis.activeConvertibleLiability)}
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Owner Capital &amp; Shares</span>
            <NairaIcon size={18} color="var(--color-brand)" />
          </div>
          <div className="kpi-value" style={{ color: "var(--color-brand)" }}>
            {formatAccountingNaira(kpis.totalCapitalInjected)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Shares &amp; Premium: {formatAccountingNaira(kpis.shareCapitalTotal)} &bull; Owner Capital:{" "}
            {formatAccountingNaira(kpis.ownerCapitalTotal)}
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Grants Received (IAS 20)</span>
            <Gift size={18} color="var(--color-accent)" />
          </div>
          <div className="kpi-value">
            {formatAccountingNaira(kpis.totalGrantsCashReceived)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Income Grant: {formatAccountingNaira(kpis.grantIncomeImmediate)} &bull; Deferred Bal:{" "}
            {formatAccountingNaira(kpis.remainingDeferredGrant)}
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Net Loans Outstanding</span>
            <HandCoins size={18} color="var(--color-warning)" />
          </div>
          <div
            className="kpi-value"
            style={{ color: kpis.netLoansOutstanding > 0 ? "var(--color-warning)" : "var(--color-text-primary)" }}
          >
            {formatAccountingNaira(kpis.netLoansOutstanding)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Long-Term: {formatAccountingNaira(kpis.netLongTermLoans)} &bull; Repayments/Distributions:{" "}
            {formatAccountingNaira(kpis.totalOutflows)}
          </div>
        </div>
      </div>

      {/* Convertible / Redeemable Investment Conversion Tracker */}
      {kpis.activeConvertibleLiability > 0 && (
        <div
          className="card"
          style={{
            padding: 16,
            marginBottom: 16,
            borderLeft: "4px solid var(--color-success)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Briefcase size={15} color="var(--color-success)" />
              Active Convertible Notes / SAFE &amp; Redeemable Investments (IAS 32 Liability)
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 4 }}>
              Total Quasi-Equity / Redeemable Received:{" "}
              <strong>{formatAccountingNaira(kpis.quasiEquityReceived)}</strong> &bull; Converted to Shares:{" "}
              <strong>{formatAccountingNaira(kpis.quasiEquityConverted)}</strong> &bull; Remaining Liability:{" "}
              <strong style={{ color: "var(--color-success)" }}>
                {formatAccountingNaira(kpis.activeConvertibleLiability)}
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-accent btn-sm"
              onClick={() =>
                openQuickModal("CONVERTIBLE_CONVERSION", "Convert Convertible Note / SAFE to Ordinary Shares", {
                  investmentPicker: true,
                  title: "Conversion of Convertible Note / SAFE to Ordinary Shares",
                  amount: String(kpis.activeConvertibleLiability),
                  notes: "Non-cash equity conversion under IAS 32.28 & CAMA 2020 share allotment.",
                })
              }
            >
              <Plus size={14} /> Convert to Shares (CAC)
            </button>
            <button
              className="btn-outline btn-sm"
              onClick={() =>
                openQuickModal("INVESTMENT_REDEMPTION", "Redeem Convertible / Redeemable Investment", {
                  investmentPicker: true,
                  title: "Principal Redemption of Redeemable Investment",
                  amount: String(kpis.activeConvertibleLiability),
                })
              }
            >
              Redeem in Cash
            </button>
          </div>
        </div>
      )}

      {/* Deferred Grant Release Tracker */}
      {kpis.deferredGrantTotal > 0 && (
        <div
          className="card"
          style={{
            padding: 16,
            marginBottom: 20,
            borderLeft: "4px solid var(--color-brand)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={15} color="var(--color-brand)" />
              IAS 20 Deferred Capital Grant Schedule
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 4 }}>
              Total Capital Grants Received: <strong>{formatAccountingNaira(kpis.deferredGrantTotal)}</strong> &bull;
              Released to Income So Far: <strong>{formatAccountingNaira(kpis.grantAmortisedTotal)}</strong> &bull;
              Unamortised Liability on Balance Sheet:{" "}
              <strong style={{ color: "var(--color-brand)" }}>
                {formatAccountingNaira(kpis.remainingDeferredGrant)}
              </strong>
            </div>
          </div>

          {kpis.remainingDeferredGrant > 0 && (
            <button
              className="btn-accent btn-sm"
              onClick={() =>
                openQuickModal("GRANT_AMORTISED", "Release Deferred Grant Portion to Income (IAS 20.17)", {
                  title: "Annual / Period Deferred Grant Amortisation Release",
                  amount: String(kpis.remainingDeferredGrant),
                  notes: "Systematic non-cash release from Deferred Grant Liability matching related asset depreciation or milestone.",
                })
              }
            >
              <Plus size={14} /> Release Deferred Grant to Income
            </button>
          )}
        </div>
      )}

      {/* Nigerian Accounting Standards Guide Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-success)", marginBottom: 4 }}>
            Investments Received (IAS 32 &amp; CAMA 2020)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            <strong>Ordinary Equity, Irredeemable Pref. Shares, Deposit for Shares &amp; Partner JV</strong> post to{" "}
            <strong>Equity</strong>. <strong>Convertible Notes/SAFE &amp; Redeemable Pref. Shares</strong> post to{" "}
            <strong>Non-Current Liabilities</strong> until converted or redeemed.
          </p>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-brand)", marginBottom: 4 }}>
            Government &amp; NGO Grants (IAS 20)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            <strong>Income Grants</strong> credit Profit or Loss immediately (Operating Cash Flow).{" "}
            <strong>Capital / Asset Grants</strong> sit in Non-Current Liabilities and release over asset useful life via{" "}
            <em>Deferred Grant Amortised</em>.
          </p>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-warning)", marginBottom: 4 }}>
            Loans, Repayments &amp; Distributions (IFRS 9 / IAS 7)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            Loan principal received &amp; repaid flows through <strong>Financing Cash Flows</strong> and Debt
            Liabilities. Interest paid on loans or redeemable instruments goes on <strong>Expenses</strong> as Finance Cost.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(
            [
              { id: "ALL", label: `All (${fundingEntries.length})` },
              { id: "INVESTMENT", label: "Investments Received" },
              { id: "CAPITAL", label: "Owner Capital" },
              { id: "GRANT", label: "Grants (IAS 20)" },
              { id: "LOAN", label: "Loans Received" },
              { id: "OUTFLOW", label: "Repayments / Redemptions / Drawings" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              className={filterCat === tab.id ? "btn-primary btn-sm" : "btn-outline btn-sm"}
              onClick={() => setFilterCat(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: 240 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 32, height: 34, fontSize: 13 }}
            placeholder="Search investor, lender, grantor, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Entries Table */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
              Investments, Capital, Grant &amp; Loan Register
            </h2>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
              Showing {filteredEntries.length} of {fundingEntries.length} entries &bull; Balance Sheet Status:{" "}
              {sofp ? (
                isBalanced ? (
                  <span style={{ color: "var(--color-success)", fontWeight: 700 }}>
                    <CheckCircle2 size={12} style={{ display: "inline", verticalAlign: "middle" }} /> Balanced (₦0.00 Variance)
                  </span>
                ) : (
                  <span style={{ color: "var(--color-error)", fontWeight: 700 }}>
                    Variance {formatAccountingNaira(sofp.balanceVariance)}
                  </span>
                )
              ) : (
                "Syncing..."
              )}
            </p>
          </div>
          <button
            className="btn-primary btn-sm"
            onClick={() =>
              openQuickModal("INVESTOR_ORDINARY_EQUITY", "Record Investment Received (Categorize Type)", {
                investmentPicker: true,
              })
            }
          >
            <Plus size={14} /> Record Funding / Investment
          </button>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars / Description</th>
                <th>Investor / Source Ref</th>
                <th>Category &amp; Standard</th>
                <th>Cash Flow / Effect</th>
                <th style={{ textAlign: "right" }}>Amount (₦)</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 36, color: "var(--color-text-muted)" }}>
                    Loading investments, capital, grants &amp; loans ledger...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                    No investments, capital injections, grants, or loans recorded in this view yet. Use the Quick Actions
                    above to record an investment, grant, capital injection, or loan.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const def = FINANCIAL_ENTRY_TYPES.find((t) => t.code === entry.entryType);
                  const cat = getEntryCategory(entry.entryType) || "CAPITAL";
                  const badge = CATEGORY_BADGE_MAP[cat];
                  const isOutflowOrNonCash =
                    cat === "OUTFLOW" ||
                    entry.entryType === "GRANT_AMORTISED" ||
                    entry.entryType === "CONVERTIBLE_CONVERSION";

                  return (
                    <tr key={entry.id}>
                      <td style={{ fontSize: 12.5, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        {formatDate(entry.date)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{entry.title}</div>
                        {entry.notes && (
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                            {entry.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                        {entry.reference || <span style={{ color: "var(--color-text-muted)" }}>&mdash;</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
                          <span className={badge.className}>{def?.label || entry.entryType}</span>
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                            {def?.section.replace(/_/g, " ")} &bull; {def?.standardRef}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-muted">{def?.cashFlowCategory || "Financing"}</span>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: isOutflowOrNonCash
                            ? "var(--color-text-secondary)"
                            : "var(--color-success)",
                          whiteSpace: "nowrap",
                        }}
                        className="font-tabular"
                      >
                        {formatAccountingNaira(entry.amount)}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: 4 }}>
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => openEditModal(entry)}
                            title="Edit entry"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-ghost btn-sm"
                            style={{ color: "var(--color-error)" }}
                            onClick={() => handleDelete(entry)}
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{modalModeLabel}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {saveError && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: 14,
                  borderRadius: 6,
                  background: "rgba(220, 38, 38, 0.08)",
                  color: "var(--color-error)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Visual Nigerian Investment Category Cards when in Investment Picker mode */}
              {showInvestmentPicker && (
                <div>
                  <label className="label" style={{ marginBottom: 6 }}>
                    Step 1 &mdash; Select Investment Category (Nigerian CAMA 2020 &amp; IAS 32 Recognition)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {NIGERIAN_INVESTMENT_SELECTOR.map((opt) => {
                      const active = selectedType === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => setSelectedType(opt.code)}
                          style={{
                            textAlign: "left",
                            padding: "9px 10px",
                            borderRadius: 8,
                            border: active ? "2px solid var(--color-brand)" : "1px solid var(--color-border)",
                            background: active ? "var(--color-surface-warm)" : "var(--color-bg-card, #fff)",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--color-text-primary)" }}>
                            {opt.shortTitle}
                          </div>
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              color: opt.classification.startsWith("Equity")
                                ? "var(--color-success)"
                                : opt.classification.startsWith("Non-Cash")
                                ? "var(--color-accent)"
                                : "var(--color-warning)",
                              marginTop: 2,
                            }}
                          >
                            {opt.classification}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 3, lineHeight: 1.3 }}>
                            {opt.whenToUse}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="label">
                  {showInvestmentPicker
                    ? "Accounting Classification Selected (Full Catalog)"
                    : "Transaction Classification (IFRS / IAS 20 / IAS 32 / CAMA 2020)"}
                </label>
                <select
                  name="entryType"
                  className="select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FinancialEntryType)}
                >
                  {selectableTypes.map((t) => {
                    const cat = getEntryCategory(t.code);
                    const prefix =
                      cat === "INVESTMENT"
                        ? "Investment Received"
                        : cat === "CAPITAL"
                        ? "Owner Capital"
                        : cat === "GRANT"
                        ? "Grant (IAS 20)"
                        : cat === "LOAN"
                        ? "Loan Inflow"
                        : "Repayment / Redemption / Drawings";
                    return (
                      <option key={t.code} value={t.code}>
                        [{prefix}] {t.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Automatic Double-Entry Preview */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--color-surface-warm)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {selectedMeta?.standardRef} &bull; {selectedMeta?.cashFlowCategory} Cash Flow &bull; SOFP:{" "}
                  {selectedMeta?.section.replace(/_/g, " ")}
                </div>
                <div>{selectedMeta?.hint}</div>
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 6,
                    borderTop: "1px dashed var(--color-border-dark)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>Dr:</strong> {doubleEntryGuide.debit}
                  </div>
                  <div>
                    <strong>Cr:</strong> {doubleEntryGuide.credit}
                  </div>
                </div>
                <div style={{ marginTop: 4, color: "var(--color-brand)", fontWeight: 600 }}>
                  Impact: {doubleEntryGuide.statementImpact}
                </div>
              </div>

              <div>
                <label className="label">Particulars / Description</label>
                <input
                  name="title"
                  className="input"
                  defaultValue={editingEntry?.title ?? presetTitle}
                  placeholder={
                    selectedType === "INVESTOR_ORDINARY_EQUITY"
                      ? "e.g., Seed Equity Investment by Lagos Angel Network (10% Ordinary Shares)"
                      : selectedType === "DEPOSIT_FOR_SHARES"
                      ? "e.g., Equity Commitment Pending CAC Form CAC2A Allotment"
                      : selectedType === "CONVERTIBLE_INVESTMENT"
                      ? "e.g., Pre-Seed Convertible Note / SAFE (18-mo Cap)"
                      : selectedType === "GRANT_INCOME"
                      ? "e.g., SMEDAN / TEF SME Development Grant"
                      : selectedType === "DEFERRED_GRANT"
                      ? "e.g., BOI / State Machinery Equipment Capital Grant"
                      : selectedType.includes("LOAN")
                      ? "e.g., Bank of Industry Working Capital Term Loan"
                      : "e.g., Additional Owner Capital Injection into MLAZ"
                  }
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Amount (₦)</label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input"
                    defaultValue={editingEntry?.amount ?? presetAmount}
                    placeholder="2500000"
                    required
                  />
                </div>
                <div>
                  <label className="label">Transaction Date</label>
                  <input
                    name="date"
                    type="date"
                    className="input"
                    defaultValue={
                      editingEntry?.date
                        ? new Date(editingEntry.date).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Investor / Grantor / Lender &amp; Reference No. (Optional)</label>
                <input
                  name="reference"
                  className="input"
                  defaultValue={editingEntry?.reference ?? presetReference}
                  placeholder="e.g., CAC2A-INV-01 / SAFE-2026 / SMEDAN-04 / BOI-LN-001"
                />
              </div>

              <div>
                <label className="label">Equity % / Conversion Terms / Repayment Notes (Optional)</label>
                <input
                  name="notes"
                  className="input"
                  defaultValue={editingEntry?.notes ?? presetNotes}
                  placeholder="e.g., 10% ordinary equity, CAC filing ref / 20% discount SAFE / 5-yr grant amortisation"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? "Posting Entry..." : editingEntry ? "Save Changes" : "Post to Financial Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
