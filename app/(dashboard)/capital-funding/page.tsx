"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  Gift,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
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

type FundingCategory = "ALL" | "CAPITAL" | "GRANT" | "LOAN" | "OUTFLOW";

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
  "DIVIDENDS_PAID",
];

const ALL_FUNDING_TYPES: FinancialEntryType[] = [
  ...CAPITAL_TYPES,
  ...GRANT_TYPES,
  ...LOAN_INFLOW_TYPES,
  ...OUTFLOW_TYPES,
];

function getEntryCategory(code: string): Exclude<FundingCategory, "ALL"> | null {
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
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Issued Ordinary Share Capital (Equity)",
        statementImpact: "SOFP Equity & SOCF Financing Inflow (CAMA 2020 s.27)",
      };
    case "SHARE_PREMIUM":
      return {
        debit: "Cash / Bank Account (Current Asset)",
        credit: "Share Premium Reserve (Equity)",
        statementImpact: "SOFP Equity & SOCF Financing Inflow",
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
        debit: "Retained Earnings / Owner Equity",
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
  CAPITAL: { label: "Owner Capital", className: "badge-success" },
  GRANT: { label: "Grant (IAS 20)", className: "badge-accent" },
  LOAN: { label: "Loan Inflow", className: "badge-warning" },
  OUTFLOW: { label: "Repayment / Drawings", className: "badge-muted" },
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
  const [modalModeLabel, setModalModeLabel] = useState("Record Capital, Grant or Loan");
  const [selectedType, setSelectedType] = useState<FinancialEntryType>("CAPITAL_INTRODUCED");
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

    const shareCapitalTotal = sumOf(["SHARE_CAPITAL", "SHARE_PREMIUM"]);
    const ownerCapitalTotal = sumOf(["CAPITAL_INTRODUCED", "OPENING_RETAINED_EARNINGS"]);
    const totalCapitalInjected = shareCapitalTotal + ownerCapitalTotal;

    const grantIncomeImmediate = sumOf(["GRANT_INCOME"]);
    const deferredGrantTotal = sumOf(["DEFERRED_GRANT"]);
    const grantAmortisedTotal = sumOf(["GRANT_AMORTISED"]);
    const remainingDeferredGrant = Math.max(0, deferredGrantTotal - grantAmortisedTotal);
    const totalGrantsCashReceived = grantIncomeImmediate + deferredGrantTotal;

    const longTermReceived = sumOf(["LONG_TERM_LOAN", "DIRECTOR_LOAN"]);
    const longTermRepaid = sumOf(["LONG_TERM_LOAN_REPAYMENT"]);
    const shortTermReceived = sumOf(["SHORT_TERM_LOAN"]);
    const shortTermRepaid = sumOf(["SHORT_TERM_LOAN_REPAYMENT"]);

    const netLongTermLoans = Math.max(0, longTermReceived - longTermRepaid);
    const netShortTermLoans = Math.max(0, shortTermReceived - shortTermRepaid);
    const netLoansOutstanding = netLongTermLoans + netShortTermLoans;

    const totalLoanRepayments = longTermRepaid + shortTermRepaid;
    const totalDividendsDrawings = sumOf(["DIVIDENDS_PAID"]);

    return {
      shareCapitalTotal,
      ownerCapitalTotal,
      totalCapitalInjected,
      grantIncomeImmediate,
      deferredGrantTotal,
      grantAmortisedTotal,
      remainingDeferredGrant,
      totalGrantsCashReceived,
      longTermReceived,
      shortTermReceived,
      netLongTermLoans,
      netShortTermLoans,
      netLoansOutstanding,
      totalLoanRepayments,
      totalDividendsDrawings,
    };
  }, [fundingEntries]);

  const openQuickModal = (
    defaultType: FinancialEntryType,
    modeTitle: string,
    prefill?: { title?: string; amount?: string; reference?: string; notes?: string }
  ) => {
    setEditingEntry(null);
    setSelectedType(defaultType);
    setModalModeLabel(modeTitle);
    setPresetTitle(prefill?.title || "");
    setPresetAmount(prefill?.amount || "");
    setPresetReference(prefill?.reference || "");
    setPresetNotes(prefill?.notes || "");
    setSaveError(null);
    setShowModal(true);
  };

  const openEditModal = (entry: FinancialEntryRecord) => {
    setEditingEntry(entry);
    setSelectedType(entry.entryType);
    setModalModeLabel("Edit Capital / Grant / Loan Entry");
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
    if (!confirm(`Delete "${entry.title}" (${formatAccountingNaira(entry.amount)})? This will update all Financial Statements.`)) {
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
            Capital, Grants &amp; Loans
          </h1>
          <p className="page-subtitle">
            Record owner capital injections, government/NGO grants (IAS 20), bank/BOI/director loans, loan repayments &amp; drawings. Every entry posts directly into your Financial Statements.
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
              Quick Funding Actions
            </div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>
              Select the transaction type below &mdash; double-entry debit/credit and cash flow classification are handled automatically.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn-accent btn-sm"
              onClick={() => openQuickModal("CAPITAL_INTRODUCED", "Owner Capital Injection / Share Allotment")}
            >
              <NairaIcon size={14} /> + Owner Capital Injection
            </button>
            <button
              className="btn-primary btn-sm"
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
              onClick={() => openQuickModal("LONG_TERM_LOAN_REPAYMENT", "Record Loan Repayment or Owner Drawings")}
            >
              <ArrowUpRight size={14} /> + Loan Repayment / Drawings
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Owner Capital &amp; Shares</span>
            <NairaIcon size={18} color="var(--color-success)" />
          </div>
          <div className="kpi-value" style={{ color: "var(--color-success)" }}>
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
            <Gift size={18} color="var(--color-brand)" />
          </div>
          <div className="kpi-value" style={{ color: "var(--color-brand)" }}>
            {formatAccountingNaira(kpis.totalGrantsCashReceived)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Immediate Income: {formatAccountingNaira(kpis.grantIncomeImmediate)} &bull; Deferred Bal:{" "}
            {formatAccountingNaira(kpis.remainingDeferredGrant)}
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Net Loans Outstanding</span>
            <HandCoins size={18} color="var(--color-warning)" />
          </div>
          <div className="kpi-value" style={{ color: kpis.netLoansOutstanding > 0 ? "var(--color-warning)" : "var(--color-text-primary)" }}>
            {formatAccountingNaira(kpis.netLoansOutstanding)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Long-Term: {formatAccountingNaira(kpis.netLongTermLoans)} &bull; Short-Term:{" "}
            {formatAccountingNaira(kpis.netShortTermLoans)}
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="kpi-label">Repayments &amp; Drawings</span>
            <ArrowUpRight size={18} color="var(--color-text-secondary)" />
          </div>
          <div className="kpi-value">
            {formatAccountingNaira(kpis.totalLoanRepayments + kpis.totalDividendsDrawings)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Loan Principal Paid: {formatAccountingNaira(kpis.totalLoanRepayments)} &bull; Drawings:{" "}
            {formatAccountingNaira(kpis.totalDividendsDrawings)}
          </div>
        </div>
      </div>

      {/* Deferred Grant Release Tracker (shown when deferred capital grants exist) */}
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

      {/* Accounting Standards Reference Strip */}
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
            Owner Capital &amp; Shares (IAS 1 / CAMA 2020)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            Cash injected by owners or shareholders increases <strong>Cash</strong> and <strong>Equity</strong> (SOFP &amp;
            SOCE) and appears under <strong>Financing Activities</strong> &mdash; never counted as taxable revenue.
          </p>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-brand)", marginBottom: 4 }}>
            Government &amp; NGO Grants (IAS 20)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            <strong>Income Grants</strong> post immediately to SOPL Grant Income (Operating Cash Flow).{" "}
            <strong>Capital / Asset Grants</strong> sit in Non-Current Liabilities and release systematically via{" "}
            <em>Deferred Grant Amortised</em>.
          </p>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-warning)", marginBottom: 4 }}>
            Loans, Repayments &amp; Drawings (IFRS 9 / IAS 7)
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.45 }}>
            Loan principal received increases Cash and Liabilities; repayments reduce principal without affecting Profit.
            Interest charges are recorded separately on the <strong>Expenses</strong> page as Finance Cost.
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
              { id: "CAPITAL", label: "Owner Capital" },
              { id: "GRANT", label: "Grants (IAS 20)" },
              { id: "LOAN", label: "Loans Received" },
              { id: "OUTFLOW", label: "Repayments & Drawings" },
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
            placeholder="Search lender, grantor, reference..."
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
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Capital, Grant &amp; Loan Register</h2>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
              Showing {filteredEntries.length} of {fundingEntries.length} funding entries &bull; Balance Sheet Status:{" "}
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
            className="btn-accent btn-sm"
            onClick={() => openQuickModal("CAPITAL_INTRODUCED", "Record Capital, Grant or Loan")}
          >
            <Plus size={14} /> Add Funding Entry
          </button>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars / Description</th>
                <th>Source / Ref</th>
                <th>Type &amp; Standard</th>
                <th>Cash Flow / Effect</th>
                <th style={{ textAlign: "right" }}>Amount (₦)</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 36, color: "var(--color-text-muted)" }}>
                    Loading capital, grants &amp; loans ledger...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                    No capital injections, grants, or loans recorded in this view yet. Use the Quick Funding Actions above
                    to record owner capital, a government/NGO grant, or a loan.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const def = FINANCIAL_ENTRY_TYPES.find((t) => t.code === entry.entryType);
                  const cat = getEntryCategory(entry.entryType) || "CAPITAL";
                  const badge = CATEGORY_BADGE_MAP[cat];
                  const isOutflowOrNonCash =
                    cat === "OUTFLOW" || entry.entryType === "GRANT_AMORTISED";

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
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{def?.standardRef}</span>
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
              maxWidth: 560,
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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
              <div>
                <label className="label">Transaction Classification (IFRS / IAS 20 / CAMA 2020)</label>
                <select
                  name="entryType"
                  className="select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FinancialEntryType)}
                >
                  {selectableTypes.map((t) => {
                    const cat = getEntryCategory(t.code);
                    const prefix =
                      cat === "CAPITAL"
                        ? "Owner Capital"
                        : cat === "GRANT"
                        ? "Grant (IAS 20)"
                        : cat === "LOAN"
                        ? "Loan Inflow"
                        : "Repayment / Drawings";
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
                  {selectedMeta?.standardRef} &bull; {selectedMeta?.cashFlowCategory} Cash Flow
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
                    selectedType === "GRANT_INCOME"
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
                    placeholder="500000"
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
                <label className="label">Grantor / Lender / Investor &amp; Reference No. (Optional)</label>
                <input
                  name="reference"
                  className="input"
                  defaultValue={editingEntry?.reference ?? presetReference}
                  placeholder="e.g., SMEDAN-2026-04 / BOI-LN-001 / Director Transfer Ref"
                />
              </div>

              <div>
                <label className="label">Conditions / Repayment Terms / Notes (Optional)</label>
                <input
                  name="notes"
                  className="input"
                  defaultValue={editingEntry?.notes ?? presetNotes}
                  placeholder="e.g., 24-month tenor @ 9% p.a. / Asset-linked grant over 5-yr life"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSaving}>
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
