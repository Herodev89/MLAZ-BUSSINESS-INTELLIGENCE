"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Scale,
  TrendingUp,
  Landmark,
  ArrowLeftRight,
  BookOpen,
  Database,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Building2,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getFinancialStatementsAction,
  createFixedAssetAction,
  updateFixedAssetAction,
  deleteFixedAssetAction,
  createFinancialEntryAction,
  updateFinancialEntryAction,
  deleteFinancialEntryAction,
  updateFinancialSettingsAction,
} from "@/lib/actions/financials";
import {
  FINANCIAL_ENTRY_TYPES,
  FIXED_ASSET_CATEGORIES,
  FixedAssetRecord,
  FinancialEntryRecord,
  FinancialSettingsRecord,
} from "@/lib/accounting-standards";
import {
  formatAccountingNaira,
  exportFinancialStatementsPDF,
  exportFinancialStatementsCSV,
  ExportStatementScope,
} from "@/lib/financial-export";

type ActiveTab = "SOFP" | "SOPL" | "SOCE" | "SOCF" | "NOTES" | "LEDGER";

export default function FinancialStatementsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("SOFP");
  const [cashFlowMethod, setCashFlowMethod] = useState<"INDIRECT" | "DIRECT">("INDIRECT");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [statements, setStatements] = useState<any>(null);
  const [fixedAssets, setFixedAssets] = useState<FixedAssetRecord[]>([]);
  const [entries, setEntries] = useState<FinancialEntryRecord[]>([]);
  const [settings, setSettings] = useState<FinancialSettingsRecord | null>(null);

  // Modals for Ledger & Fixed Assets
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntryRecord | null>(null);
  const [selectedEntryType, setSelectedEntryType] = useState<string>("SHARE_CAPITAL");

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAssetRecord | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  const loadStatements = useCallback(async (sDate?: string, eDate?: string) => {
    setLoading(true);
    const res = await getFinancialStatementsAction(sDate, eDate);
    if (res.success && res.statements) {
      setStatements(res.statements);
      setFixedAssets(res.fixedAssets || []);
      setEntries(res.entries || []);
      setSettings(res.settings || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStatements(startDate || undefined, endDate || undefined);
  }, [startDate, endDate, loadStatements]);

  const applyPreset = (preset: "ALL" | "YTD" | "THIS_MONTH" | "H1" | "H2") => {
    const now = new Date();
    const yr = now.getFullYear();
    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "YTD") {
      setStartDate(`${yr}-01-01`);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "THIS_MONTH") {
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setStartDate(`${yr}-${m}-01`);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "H1") {
      setStartDate(`${yr}-01-01`);
      setEndDate(`${yr}-06-30`);
    } else if (preset === "H2") {
      setStartDate(`${yr}-07-01`);
      setEndDate(`${yr}-12-31`);
    }
  };

  const openNewEntry = (defaultType: string = "SHARE_CAPITAL") => {
    setEditingEntry(null);
    setSelectedEntryType(defaultType);
    setShowEntryModal(true);
  };

  const openEditEntry = (entry: FinancialEntryRecord) => {
    setEditingEntry(entry);
    setSelectedEntryType(entry.entryType);
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = editingEntry
      ? await updateFinancialEntryAction(editingEntry.id, formData)
      : await createFinancialEntryAction(formData);

    setIsSaving(false);
    if (res.success) {
      setShowEntryModal(false);
      loadStatements(startDate || undefined, endDate || undefined);
    } else {
      alert(res.error || "Failed to save financial entry");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Delete this ledger entry? Financial statements will automatically recalculate.")) return;
    const res = await deleteFinancialEntryAction(id);
    if (res.success) loadStatements(startDate || undefined, endDate || undefined);
    else alert(res.error);
  };

  const openNewAsset = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const openEditAsset = (asset: FixedAssetRecord) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
  };

  const handleSaveAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = editingAsset
      ? await updateFixedAssetAction(editingAsset.id, formData)
      : await createFixedAssetAction(formData);

    setIsSaving(false);
    if (res.success) {
      setShowAssetModal(false);
      loadStatements(startDate || undefined, endDate || undefined);
    } else {
      alert(res.error || "Failed to save fixed asset");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Remove this asset from the Non-Current Assets (PPE) register?")) return;
    const res = await deleteFixedAssetAction(id);
    if (res.success) loadStatements(startDate || undefined, endDate || undefined);
    else alert(res.error);
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSettingsMsg(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateFinancialSettingsAction(formData);
    setIsSaving(false);
    if (res.success) {
      setSettingsMsg("Statutory & Nigerian tax settings saved.");
      loadStatements(startDate || undefined, endDate || undefined);
    } else {
      alert(res.error);
    }
  };

  const jumpToNote = () => {
    setActiveTab("NOTES");
  };

  const fmt = formatAccountingNaira;
  const sofp = statements?.statementOfFinancialPosition?.current;
  const comp = statements?.statementOfFinancialPosition?.comparative;
  const sopl = statements?.incomeStatement;
  const soce = statements?.statementOfChangesInEquity;
  const socf = statements?.statementOfCashFlows;
  const meta = statements?.meta;
  const ratios = statements?.ratios;
  const checks = statements?.complianceChecks;

  const selectedEntryMeta = FINANCIAL_ENTRY_TYPES.find((t) => t.code === selectedEntryType);

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 className="page-title">Financial Statements</h1>
            <span className="badge-brand">IFRS / FRCN</span>
            <span className="badge-accent">CAMA 2020 &amp; FIRS Tax</span>
            {checks?.accountingEquationBalanced && (
              <span className="badge-success">
                <CheckCircle2 size={12} /> Balanced (Assets = Equity + Liabilities)
              </span>
            )}
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            {meta ? `${meta.companyLegalName} (${meta.rcNumber} • TIN: ${meta.tinNumber})` : "MLAZ LIMITED"} — Statement
            of Financial Position, Profit or Loss &amp; OCI, Changes in Equity &amp; Cash Flows
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/fixed-assets" className="btn-outline btn-sm">
            <Building2 size={14} /> Assets &amp; Disposals
          </Link>
          <button className="btn-outline btn-sm" onClick={() => openNewAsset()}>
            <Plus size={14} /> Add Fixed Asset (PPE)
          </button>
          <button className="btn-outline btn-sm" onClick={() => openNewEntry("SHARE_CAPITAL")}>
            <Plus size={14} /> Record Equity / Liability
          </button>
          <button
            className="btn-outline btn-sm"
            onClick={() => exportFinancialStatementsCSV(statements, "FULL_PACKAGE")}
            disabled={!statements}
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button
            className="btn-accent btn-sm"
            onClick={() => exportFinancialStatementsPDF(statements, "FULL_PACKAGE", cashFlowMethod)}
            disabled={!statements}
          >
            <Download size={14} /> Full Annual Report (PDF)
          </button>
        </div>
      </div>

      {/* ── Advisory Banner if Share Capital Not Yet Recorded ── */}
      {checks?.unallocatedOverdraftWarning && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderRadius: 10,
            background: "var(--color-warning-bg)",
            border: "1px solid rgba(199,123,0,0.3)",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <AlertTriangle size={18} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: "var(--color-text-primary)" }}>
            <strong>Accounting Setup Tip (CAMA 2020 s.27 &amp; IAS 7):</strong> Your operational inventory/assets exceed
            recorded paid-up capital, resulting in an implied working capital overdraft of{" "}
            <strong>{fmt(sofp?.currentLiabilities?.bankOverdraft)}</strong>. Record your{" "}
            <strong>Issued Share Capital</strong> or <strong>Owner Capital Injection</strong> to reflect initial business
            funding.
          </div>
          <button className="btn-accent btn-sm" onClick={() => openNewEntry("SHARE_CAPITAL")}>
            + Record Share Capital
          </button>
        </div>
      )}

      {/* ── Date Filter & Fiscal Presets Bar ── */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
              Period Start (Comparative Opening)
            </label>
            <input
              type="date"
              className="input"
              style={{ width: 170, padding: "6px 10px" }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label" style={{ fontSize: 12, marginBottom: 4 }}>
              Reporting Date (As At / Period End)
            </label>
            <input
              type="date"
              className="input"
              style={{ width: 170, padding: "6px 10px" }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="btn-outline btn-sm" onClick={() => applyPreset("ALL")}>
            All Time
          </button>
          <button className="btn-outline btn-sm" onClick={() => applyPreset("YTD")}>
            This Year (YTD)
          </button>
          <button className="btn-outline btn-sm" onClick={() => applyPreset("THIS_MONTH")}>
            This Month
          </button>
          <button className="btn-outline btn-sm" onClick={() => applyPreset("H1")}>
            H1 (Jan–Jun)
          </button>
          <button className="btn-outline btn-sm" onClick={() => applyPreset("H2")}>
            H2 (Jul–Dec)
          </button>
        </div>
      </div>

      {/* ── Executive KPI Summary ── */}
      {sofp && sopl && socf && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Total Assets (IAS 1)
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }} className="font-tabular">
              {fmt(sofp.totalAssets)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              Current: {fmt(sofp.currentAssets.totalCurrentAssets)}
            </div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Total Equity
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }} className="font-tabular">
              {fmt(sofp.equity.totalEquity)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              Retained: {fmt(sofp.equity.retainedEarnings)}
            </div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Total Liabilities
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 4 }} className="font-tabular">
              {fmt(sofp.totalLiabilities)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              Current: {fmt(sofp.currentLiabilities.totalCurrentLiabilities)}
            </div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Profit After Tax (PAT)
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: sopl.profitForThePeriod >= 0 ? "var(--color-success)" : "var(--color-error)",
                marginTop: 4,
              }}
              className="font-tabular"
            >
              {fmt(sopl.profitForThePeriod)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              Net Margin: {ratios?.netProfitMargin}%
            </div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Closing Cash (IAS 7)
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: socf.closingCashEquivalents >= 0 ? "var(--color-success)" : "var(--color-error)",
                marginTop: 4,
              }}
              className="font-tabular"
            >
              {fmt(socf.closingCashEquivalents)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              Operating CF: {fmt(socf.indirect.netCashFromOperatingActivities)}
            </div>
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
              Nigerian Tax (CIT + TET)
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-warning)", marginTop: 4 }} className="font-tabular">
              {fmt(sopl.taxBreakdown.totalTaxExpense)}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {sopl.taxBreakdown.companySizeTier}
            </div>
          </div>
        </div>
      )}

      {/* ── Statement Navigation Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 18,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {[
          { id: "SOFP", label: "Statement of Financial Position", icon: Scale },
          { id: "SOPL", label: "Profit or Loss & OCI", icon: TrendingUp },
          { id: "SOCE", label: "Statement of Equity", icon: Landmark },
          { id: "SOCF", label: "Statement of Cash Flows", icon: ArrowLeftRight },
          { id: "NOTES", label: "Notes & Financial Ratios", icon: BookOpen },
          { id: "LEDGER", label: "Ledger, PPE & Tax Setup", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                borderBottom: isAct ? "3px solid var(--color-accent)" : "3px solid transparent",
                background: isAct ? "var(--color-surface-card)" : "transparent",
                color: isAct ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontWeight: isAct ? 700 : 500,
                fontSize: 13.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} style={{ color: isAct ? "var(--color-accent)" : "var(--color-text-muted)" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && !statements ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--color-text-muted)" }}>
          Computing IFRS &amp; Nigerian Financial Statements...
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: STATEMENT OF FINANCIAL POSITION (IAS 1 / CAMA 2020)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "SOFP" && sofp && (
            <div className="card">
              <div
                className="card-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    STATEMENT OF FINANCIAL POSITION
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                    As at {meta.periodEnd} • Prepared under IAS 1 (FRCN) &amp; CAMA 2020 (Expressed in Nigerian Naira ₦)
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => exportFinancialStatementsCSV(statements, "SOFP")}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    className="btn-accent btn-sm"
                    onClick={() => exportFinancialStatementsPDF(statements, "SOFP")}
                  >
                    <Download size={13} /> Print / PDF
                  </button>
                </div>
              </div>

              <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                <table className="table font-tabular">
                  <thead>
                    <tr>
                      <th>Assets, Equity &amp; Liabilities</th>
                      <th style={{ width: 70, textAlign: "center" }}>Note</th>
                      <th style={{ width: 200, textAlign: "right" }}>As at {meta.periodEnd} (₦)</th>
                      {comp && <th style={{ width: 200, textAlign: "right" }}>Opening ({meta.periodStart}) (₦)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {/* ASSETS */}
                    <tr style={{ background: "var(--color-surface-warm)" }}>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 800, color: "var(--color-brand)", letterSpacing: "0.04em" }}>
                        ASSETS
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 10 }}>
                        Non-Current Assets
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Property, plant and equipment (Cost less accumulated depreciation)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          4
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentAssets.ppeCarryingAmount)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentAssets.ppeCarryingAmount)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Right-of-use assets (IFRS 16 Leases)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          4
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentAssets.rightOfUseAssets)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentAssets.rightOfUseAssets)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Intangible assets (IAS 38)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          4
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentAssets.intangibleAssets)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentAssets.intangibleAssets)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Non-Current Assets</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sofp.nonCurrentAssets.totalNonCurrentAssets)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                          {fmt(comp.nonCurrentAssets.totalNonCurrentAssets)}
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Current Assets
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>
                        Inventories (Raw materials: {fmt(sofp.currentAssets.inventoriesRawMaterials)} • WIP:{" "}
                        {fmt(sofp.currentAssets.inventoriesWIP)} • Finished: {fmt(sofp.currentAssets.inventoriesFinishedGoods)})
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          5
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentAssets.totalInventories)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentAssets.totalInventories)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Trade and other receivables (Pending customer invoices &amp; WHT credits)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          6
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentAssets.tradeAndOtherReceivables)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentAssets.tradeAndOtherReceivables)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Prepayments &amp; tax assets (Prepaid rent, insurance &amp; tax credits)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          6
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(sofp.currentAssets.prepayments + sofp.currentAssets.prepaidTaxAsset)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right" }}>
                          {fmt(comp.currentAssets.prepayments + comp.currentAssets.prepaidTaxAsset)}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Cash and cash equivalents (Cash in hand &amp; bank balances)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          7
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentAssets.cashAndCashEquivalents)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentAssets.cashAndCashEquivalents)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Current Assets</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sofp.currentAssets.totalCurrentAssets)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                          {fmt(comp.currentAssets.totalCurrentAssets)}
                        </td>
                      )}
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface-warm)", fontSize: 15 }}>
                      <td>TOTAL ASSETS</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(sofp.totalAssets)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                          {fmt(comp.totalAssets)}
                        </td>
                      )}
                    </tr>

                    {/* EQUITY AND LIABILITIES */}
                    <tr style={{ background: "var(--color-surface-warm)" }}>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 800, color: "var(--color-brand)", letterSpacing: "0.04em", paddingTop: 18 }}>
                        EQUITY AND LIABILITIES
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 10 }}>
                        Equity Attributable to Owners of the Company
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Issued ordinary share capital</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          8
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.equity.shareCapital)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.equity.shareCapital)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Share premium</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          8
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.equity.sharePremium)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.equity.sharePremium)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Revaluation &amp; owner capital reserves</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          8
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(sofp.equity.revaluationReserve + sofp.equity.generalReserve)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right" }}>
                          {fmt(comp.equity.revaluationReserve + comp.equity.generalReserve)}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Retained earnings</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          8
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.equity.retainedEarnings)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.equity.retainedEarnings)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Equity</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sofp.equity.totalEquity)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                          {fmt(comp.equity.totalEquity)}
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Non-Current Liabilities
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Long-term bank / BOI loans &amp; asset financing</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          9
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentLiabilities.longTermBorrowings)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentLiabilities.longTermBorrowings)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Deferred government grants (IAS 20)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          9
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentLiabilities.deferredGrants || 0)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentLiabilities.deferredGrants || 0)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Deferred tax liabilities (IAS 12)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          10
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.nonCurrentLiabilities.deferredTaxLiability)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.nonCurrentLiabilities.deferredTaxLiability)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Non-Current Liabilities</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sofp.nonCurrentLiabilities.totalNonCurrentLiabilities)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                          {fmt(comp.nonCurrentLiabilities.totalNonCurrentLiabilities)}
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td colSpan={comp ? 4 : 3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Current Liabilities
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Trade payables &amp; accrued expenses</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          9
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(sofp.currentLiabilities.tradePayables + sofp.currentLiabilities.accruedExpenses)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right" }}>
                          {fmt(comp.currentLiabilities.tradePayables + comp.currentLiabilities.accruedExpenses)}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Contract liabilities (Customer advance deposits — IFRS 15)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          9
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentLiabilities.contractLiabilities)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentLiabilities.contractLiabilities)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Statutory payables (VAT 7.5%, PAYE, Pension, NSITF)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          9
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentLiabilities.statutoryPayables)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentLiabilities.statutoryPayables)}</td>}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Short-term borrowings &amp; bank overdraft (IAS 7.8)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          7
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(sofp.currentLiabilities.shortTermBorrowings + sofp.currentLiabilities.bankOverdraft)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right" }}>
                          {fmt(comp.currentLiabilities.shortTermBorrowings + comp.currentLiabilities.bankOverdraft)}
                        </td>
                      )}
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Current income tax payable (FIRS CIT &amp; 3% Education Tax)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          10
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.currentLiabilities.currentTaxPayable)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.currentLiabilities.currentTaxPayable)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Current Liabilities</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sofp.currentLiabilities.totalCurrentLiabilities)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                          {fmt(comp.currentLiabilities.totalCurrentLiabilities)}
                        </td>
                      )}
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Liabilities</td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>{fmt(sofp.totalLiabilities)}</td>
                      {comp && <td style={{ textAlign: "right" }}>{fmt(comp.totalLiabilities)}</td>}
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface-warm)", fontSize: 15 }}>
                      <td>TOTAL EQUITY AND LIABILITIES</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(sofp.totalEquityAndLiabilities)}
                      </td>
                      {comp && (
                        <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                          {fmt(comp.totalEquityAndLiabilities)}
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: STATEMENT OF PROFIT OR LOSS AND OCI (IAS 1 / FIRS TAX)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "SOPL" && sopl && (
            <div className="card">
              <div
                className="card-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    STATEMENT OF PROFIT OR LOSS AND OTHER COMPREHENSIVE INCOME
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                    {meta.periodStart ? `For the period ${meta.periodStart} to ${meta.periodEnd}` : `Up to ${meta.periodEnd}`} •
                    IAS 1 &amp; Nigeria Finance Act Corporate Taxation
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => exportFinancialStatementsCSV(statements, "SOPL")}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    className="btn-accent btn-sm"
                    onClick={() => exportFinancialStatementsPDF(statements, "SOPL")}
                  >
                    <Download size={13} /> Print / PDF
                  </button>
                </div>
              </div>

              <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                <table className="table font-tabular">
                  <thead>
                    <tr>
                      <th>Particulars</th>
                      <th style={{ width: 70, textAlign: "center" }}>Note</th>
                      <th style={{ width: 220, textAlign: "right" }}>Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        Revenue from contracts with customers (Gross: {fmt(sopl.grossRevenue)} less Discounts:{" "}
                        {fmt(sopl.salesDiscounts)})
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          3
                        </button>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(sopl.revenue)}</td>
                    </tr>
                    {sopl.revenueByChannel && (
                      <>
                        <tr>
                          <td style={{ paddingLeft: 28, fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                            — Retail Sales ({sopl.revenueByChannel.Retail?.ordersCount || 0} txns,{" "}
                            {sopl.revenueByChannel.Retail?.units || 0} units)
                          </td>
                          <td></td>
                          <td style={{ textAlign: "right", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                            {fmt(sopl.revenueByChannel.Retail?.netRevenue || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28, fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                            — Wholesale Sales ({sopl.revenueByChannel.Wholesale?.ordersCount || 0} txns,{" "}
                            {sopl.revenueByChannel.Wholesale?.units || 0} units)
                          </td>
                          <td></td>
                          <td style={{ textAlign: "right", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                            {fmt(sopl.revenueByChannel.Wholesale?.netRevenue || 0)}
                          </td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td style={{ paddingLeft: 24 }}>
                        Cost of sales (Direct goods COGS: {fmt(sopl.cogsFinishedGoods)} • Factory overheads:{" "}
                        {fmt(sopl.factoryOverhead)})
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          3
                        </button>
                      </td>
                      <td style={{ textAlign: "right", color: "var(--color-error)" }}>{fmt(-sopl.costOfSales)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Gross Profit</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sopl.grossProfit)}
                      </td>
                    </tr>
                    {sopl.grantIncome !== 0 && (
                      <tr>
                        <td style={{ paddingLeft: 24 }}>
                          Grant &amp; other operating income (IAS 20: Immediate {fmt(sopl.grantIncomeCash || 0)} &bull; Released{" "}
                          {fmt(sopl.grantAmortised || 0)})
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                            8
                          </button>
                        </td>
                        <td style={{ textAlign: "right", color: "var(--color-success)", fontWeight: 600 }}>
                          {fmt(sopl.grantIncome)}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Operating &amp; Administrative Expenses
                      </td>
                    </tr>
                    {Object.entries(sopl.expensesByCategory as Record<string, number>).map(([cat, amt]) => (
                      <tr key={cat}>
                        <td style={{ paddingLeft: 28 }}>{cat}</td>
                        <td></td>
                        <td style={{ textAlign: "right" }}>{fmt(-amt)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Depreciation &amp; amortisation of non-current assets (IAS 16 / IAS 38)</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          4
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(-sopl.depreciationAndAmortisation)}</td>
                    </tr>
                    {sopl.otherOperatingGainLoss !== 0 && (
                      <tr>
                        <td style={{ paddingLeft: 28 }}>Gain / (Loss) on disposal of property, plant &amp; equipment</td>
                        <td style={{ textAlign: "center" }}>4</td>
                        <td style={{ textAlign: "right" }}>{fmt(sopl.otherOperatingGainLoss)}</td>
                      </tr>
                    )}
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Operating Profit / (Loss) [EBIT]</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sopl.operatingProfitEBIT)}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ paddingLeft: 28 }}>Finance costs (Interest on borrowings &amp; bank charges)</td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>{fmt(-sopl.financeCosts)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Profit / (Loss) Before Taxation [PBT]</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(sopl.profitBeforeTax)}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Income Tax Expense — Nigerian Finance Act ({sopl.taxBreakdown.companySizeTier})
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>
                        Company Income Tax (CIT @ {sopl.taxBreakdown.citRate}%)
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          10
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(-sopl.taxBreakdown.citAmount)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>
                        Tertiary Education Tax (TET @ {sopl.taxBreakdown.tetRate}% of assessable profit)
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button className="badge-accent" style={{ border: "none", cursor: "pointer" }} onClick={jumpToNote}>
                          10
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>{fmt(-sopl.taxBreakdown.tetAmount)}</td>
                    </tr>
                    {sopl.taxBreakdown.policeLevyAmount > 0 && (
                      <tr>
                        <td style={{ paddingLeft: 28 }}>Nigeria Police Trust Fund Levy (0.005%)</td>
                        <td style={{ textAlign: "center" }}>10</td>
                        <td style={{ textAlign: "right" }}>{fmt(-sopl.taxBreakdown.policeLevyAmount)}</td>
                      </tr>
                    )}
                    {sopl.taxBreakdown.deferredTaxExpense !== 0 && (
                      <tr>
                        <td style={{ paddingLeft: 28 }}>Deferred tax charge / (credit) (IAS 12)</td>
                        <td style={{ textAlign: "center" }}>10</td>
                        <td style={{ textAlign: "right" }}>{fmt(-sopl.taxBreakdown.deferredTaxExpense)}</td>
                      </tr>
                    )}

                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Profit / (Loss) for the Period [PAT]</td>
                      <td></td>
                      <td
                        style={{
                          textAlign: "right",
                          borderTop: "1px solid var(--color-border-dark)",
                          color: sopl.profitForThePeriod >= 0 ? "var(--color-success)" : "var(--color-error)",
                        }}
                      >
                        {fmt(sopl.profitForThePeriod)}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={3} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Other Comprehensive Income (Items not reclassified to profit or loss)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Revaluation surplus on property, plant and equipment (IAS 16)</td>
                      <td style={{ textAlign: "center" }}>4</td>
                      <td style={{ textAlign: "right" }}>{fmt(sopl.otherComprehensiveIncomeReval)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface-warm)", fontSize: 15 }}>
                      <td>TOTAL COMPREHENSIVE INCOME FOR THE PERIOD</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(sopl.totalComprehensiveIncome)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: STATEMENT OF CHANGES IN EQUITY (IAS 1.106 / CAMA 2020)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "SOCE" && soce && (
            <div className="card">
              <div
                className="card-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    STATEMENT OF CHANGES IN EQUITY
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                    {meta.periodStart ? `For the period ${meta.periodStart} to ${meta.periodEnd}` : `Up to ${meta.periodEnd}`} •
                    IAS 1.106 &amp; CAMA 2020 Capital Maintenance Compliance
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn-outline btn-sm" onClick={() => openNewEntry("SHARE_CAPITAL")}>
                    <Plus size={13} /> Equity Entry
                  </button>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => exportFinancialStatementsCSV(statements, "SOCE")}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    className="btn-accent btn-sm"
                    onClick={() => exportFinancialStatementsPDF(statements, "SOCE")}
                  >
                    <Download size={13} /> Print / PDF
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ borderBottom: "1px solid var(--color-border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span className={checks?.camaMinimumShareCapitalMet ? "badge-success" : "badge-warning"}>
                  {checks?.camaMinimumShareCapitalMet
                    ? "CAMA 2020 s.27: Minimum Share Capital (≥ ₦100,000) Met"
                    : "CAMA 2020 s.27: Private LTD Minimum Issued Share Capital is ₦100,000"}
                </span>
                <span className={checks?.camaDistributableProfitCompliant ? "badge-success" : "badge-error"}>
                  {checks?.camaDistributableProfitCompliant
                    ? "CAMA 2020 s.426: Dividend / Distributable Reserves Compliant"
                    : "CAMA 2020 s.426 Warning: Dividends exceed distributable retained profits"}
                </span>
              </div>

              <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                <table className="table font-tabular">
                  <thead>
                    <tr>
                      <th>Movements in Owners&apos; Equity</th>
                      <th style={{ textAlign: "right" }}>Issued Share Capital (₦)</th>
                      <th style={{ textAlign: "right" }}>Share Premium (₦)</th>
                      <th style={{ textAlign: "right" }}>Revaluation Reserve (₦)</th>
                      <th style={{ textAlign: "right" }}>General / Owner Reserve (₦)</th>
                      <th style={{ textAlign: "right" }}>Retained Earnings (₦)</th>
                      <th style={{ textAlign: "right" }}>Total Equity (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Balance at Beginning of Period</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.shareCapital)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.sharePremium)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.revaluationReserve)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.generalReserve)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.retainedEarnings)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.opening.total)}</td>
                    </tr>

                    <tr>
                      <td colSpan={7} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Comprehensive Income for the Period
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 24 }}>Profit / (Loss) for the period (PAT)</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(soce.profitForPeriod)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(soce.profitForPeriod)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 24 }}>Other comprehensive income (PPE Revaluation surplus)</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(soce.otherComprehensiveIncome)}</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(soce.otherComprehensiveIncome)}</td>
                    </tr>
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Total Comprehensive Income for the Period</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.otherComprehensiveIncome)}</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.profitForPeriod)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.totalComprehensiveIncome)}</td>
                    </tr>

                    <tr>
                      <td colSpan={7} style={{ fontWeight: 700, color: "var(--color-text-secondary)", paddingTop: 12 }}>
                        Transactions with Owners in their Capacity as Owners
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 24 }}>Issue of ordinary shares &amp; share premium</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.issueOfShares)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.sharePremiumMovement)}</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.issueOfShares + soce.sharePremiumMovement)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 24 }}>Owner capital injections &amp; prior retained earnings brought in</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.capitalAndReservesMovement)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(soce.openingRetainedEarningsAdjustment)}</td>
                      <td style={{ textAlign: "right" }}>
                        {fmt(soce.capitalAndReservesMovement + soce.openingRetainedEarningsAdjustment)}
                      </td>
                    </tr>
                    {soce.revaluationTransferToRE !== 0 && (
                      <tr>
                        <td style={{ paddingLeft: 24 }}>Transfer of revaluation surplus on asset disposal (IAS 16.41)</td>
                        <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                        <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                        <td style={{ textAlign: "right" }}>{fmt(-soce.revaluationTransferToRE)}</td>
                        <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                        <td style={{ textAlign: "right" }}>{fmt(soce.revaluationTransferToRE)}</td>
                        <td style={{ textAlign: "right" }}>{fmt(0)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ paddingLeft: 24 }}>Dividends declared &amp; paid / Owner drawings</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-text-muted)" }}>—</td>
                      <td style={{ textAlign: "right", color: "var(--color-error)" }}>{fmt(soce.dividendsAndDrawings)}</td>
                      <td style={{ textAlign: "right", color: "var(--color-error)" }}>{fmt(soce.dividendsAndDrawings)}</td>
                    </tr>

                    <tr style={{ fontWeight: 800, background: "var(--color-surface-warm)", fontSize: 14.5 }}>
                      <td>Balance as at {meta.periodEnd}</td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.shareCapital)}
                      </td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.sharePremium)}
                      </td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.revaluationReserve)}
                      </td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.generalReserve)}
                      </td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.retainedEarnings)}
                      </td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(soce.closing.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: STATEMENT OF CASH FLOWS (IAS 7 — INDIRECT & DIRECT)
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "SOCF" && socf && (
            <div className="card">
              <div
                className="card-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text-primary)", margin: 0 }}>
                    STATEMENT OF CASH FLOWS ({cashFlowMethod === "INDIRECT" ? "INDIRECT METHOD" : "DIRECT METHOD"})
                  </h2>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                    {meta.periodStart ? `For the period ${meta.periodStart} to ${meta.periodEnd}` : `Up to ${meta.periodEnd}`} •
                    Prepared in accordance with IAS 7 (Operating, Investing &amp; Financing Activities)
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setCashFlowMethod("INDIRECT")}
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: cashFlowMethod === "INDIRECT" ? "var(--color-brand)" : "transparent",
                        color: cashFlowMethod === "INDIRECT" ? "#fff" : "var(--color-text-secondary)",
                      }}
                    >
                      Indirect Method (IAS 7.18b)
                    </button>
                    <button
                      onClick={() => setCashFlowMethod("DIRECT")}
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: cashFlowMethod === "DIRECT" ? "var(--color-brand)" : "transparent",
                        color: cashFlowMethod === "DIRECT" ? "#fff" : "var(--color-text-secondary)",
                      }}
                    >
                      Direct Method (IAS 7.18a)
                    </button>
                  </div>

                  <button
                    className="btn-outline btn-sm"
                    onClick={() => exportFinancialStatementsCSV(statements, "SOCF")}
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    className="btn-accent btn-sm"
                    onClick={() => exportFinancialStatementsPDF(statements, "SOCF", cashFlowMethod)}
                  >
                    <Download size={13} /> Print / PDF
                  </button>
                </div>
              </div>

              <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                <table className="table font-tabular">
                  <thead>
                    <tr>
                      <th>Cash Flow Activities</th>
                      <th style={{ width: 70, textAlign: "center" }}>Note</th>
                      <th style={{ width: 220, textAlign: "right" }}>Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "var(--color-surface-warm)" }}>
                      <td colSpan={3} style={{ fontWeight: 800, color: "var(--color-brand)" }}>
                        CASH FLOWS FROM OPERATING ACTIVITIES
                      </td>
                    </tr>

                    {cashFlowMethod === "INDIRECT" ? (
                      <>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Profit / (Loss) before taxation</td>
                          <td></td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(socf.indirect.profitBeforeTax)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", paddingLeft: 18 }}>
                            Adjustments for non-cash items:
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Depreciation and amortisation of non-current assets</td>
                          <td style={{ textAlign: "center" }}>4</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.depreciationAndAmortisation)}</td>
                        </tr>
                        {socf.indirect.otherNonCashAdjustments !== 0 && (
                          <tr>
                            <td style={{ paddingLeft: 28 }}>
                              Non-cash disposal (gain)/loss &amp; deferred grant amortisation
                            </td>
                            <td style={{ textAlign: "center" }}>4, 9</td>
                            <td style={{ textAlign: "right" }}>{fmt(socf.indirect.otherNonCashAdjustments)}</td>
                          </tr>
                        )}
                        <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                          <td>Operating cash flows before working capital changes</td>
                          <td></td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.operatingCashBeforeWorkingCapital)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", paddingLeft: 18 }}>
                            Changes in working capital:
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>(Increase) / Decrease in inventories (Raw materials, WIP &amp; Finished)</td>
                          <td style={{ textAlign: "center" }}>5</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.changeInInventories)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>(Increase) / Decrease in trade and other receivables</td>
                          <td style={{ textAlign: "center" }}>6</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.changeInReceivables)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>(Increase) / Decrease in prepayments</td>
                          <td style={{ textAlign: "center" }}>6</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.changeInPrepayments)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Increase / (Decrease) in trade payables, customer deposits &amp; accruals</td>
                          <td style={{ textAlign: "center" }}>9</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.changeInPayablesAndAccruals)}</td>
                        </tr>
                        <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                          <td>Cash generated from / (used in) operations</td>
                          <td></td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.cashGeneratedFromOperations)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Income taxes paid to FIRS (CIT &amp; Tertiary Education Tax)</td>
                          <td style={{ textAlign: "center" }}>10</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.indirect.incomeTaxesPaid)}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Cash receipts from customers</td>
                          <td style={{ textAlign: "center" }}>3, 6</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.direct.cashReceiptsFromCustomers)}</td>
                        </tr>
                        {socf.direct.cashReceiptsFromGrants !== 0 && (
                          <tr>
                            <td style={{ paddingLeft: 28 }}>Cash receipts from government / NGO income grants (IAS 20)</td>
                            <td style={{ textAlign: "center" }}>8</td>
                            <td style={{ textAlign: "right" }}>{fmt(socf.direct.cashReceiptsFromGrants)}</td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Cash paid to suppliers, raw materials &amp; production</td>
                          <td style={{ textAlign: "center" }}>5, 9</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.direct.cashPaidToSuppliersAndProduction)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Cash paid for operating expenses, prepayments &amp; finance costs</td>
                          <td></td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.direct.cashPaidForOperatingAndFinance)}</td>
                        </tr>
                        <tr>
                          <td style={{ paddingLeft: 28 }}>Income taxes paid to FIRS (CIT &amp; Tertiary Education Tax)</td>
                          <td style={{ textAlign: "center" }}>10</td>
                          <td style={{ textAlign: "right" }}>{fmt(socf.direct.incomeTaxesPaid)}</td>
                        </tr>
                      </>
                    )}

                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Net Cash Generated from / (Used in) Operating Activities</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(socf.indirect.netCashFromOperatingActivities)}
                      </td>
                    </tr>

                    {/* INVESTING ACTIVITIES */}
                    <tr style={{ background: "var(--color-surface-warm)" }}>
                      <td colSpan={3} style={{ fontWeight: 800, color: "var(--color-brand)", paddingTop: 14 }}>
                        CASH FLOWS FROM INVESTING ACTIVITIES
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Acquisition of property, plant and equipment (Cash CapEx)</td>
                      <td style={{ textAlign: "center" }}>4</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.investing.purchaseOfPPE)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Acquisition of intangible assets</td>
                      <td style={{ textAlign: "center" }}>4</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.investing.purchaseOfIntangibles)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Proceeds from disposal of property, plant and equipment</td>
                      <td style={{ textAlign: "center" }}>4</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.investing.proceedsFromDisposalOfPPE)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Net Cash Used in Investing Activities</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(socf.investing.netCashFromInvestingActivities)}
                      </td>
                    </tr>

                    {/* FINANCING ACTIVITIES */}
                    <tr style={{ background: "var(--color-surface-warm)" }}>
                      <td colSpan={3} style={{ fontWeight: 800, color: "var(--color-brand)", paddingTop: 14 }}>
                        CASH FLOWS FROM FINANCING ACTIVITIES
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Proceeds from issue of share capital &amp; owner equity injections</td>
                      <td style={{ textAlign: "center" }}>8</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.financing.proceedsFromShareIssue)}</td>
                    </tr>
                    {socf.financing.capitalGrantsReceived !== 0 && (
                      <tr>
                        <td style={{ paddingLeft: 28 }}>Capital &amp; asset-related grants received (IAS 20)</td>
                        <td style={{ textAlign: "center" }}>9</td>
                        <td style={{ textAlign: "right" }}>{fmt(socf.financing.capitalGrantsReceived)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Proceeds from bank, BOI &amp; director borrowings</td>
                      <td style={{ textAlign: "center" }}>9</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.financing.borrowingsReceived)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Repayment of bank &amp; short-term borrowings</td>
                      <td style={{ textAlign: "center" }}>9</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.financing.borrowingsRepaid)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 28 }}>Dividends &amp; owner drawings paid</td>
                      <td style={{ textAlign: "center" }}>8</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.financing.dividendsPaid)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                      <td>Net Cash Generated from / (Used in) Financing Activities</td>
                      <td></td>
                      <td style={{ textAlign: "right", borderTop: "1px solid var(--color-border-dark)" }}>
                        {fmt(socf.financing.netCashFromFinancingActivities)}
                      </td>
                    </tr>

                    {/* CASH RECONCILIATION */}
                    <tr style={{ fontWeight: 700, background: "var(--color-surface)" }}>
                      <td>Net Increase / (Decrease) in Cash and Cash Equivalents</td>
                      <td></td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.netIncreaseInCash)}</td>
                    </tr>
                    <tr>
                      <td>Cash and cash equivalents at beginning of period</td>
                      <td style={{ textAlign: "center" }}>7</td>
                      <td style={{ textAlign: "right" }}>{fmt(socf.openingCashEquivalents)}</td>
                    </tr>
                    <tr style={{ fontWeight: 800, background: "var(--color-surface-warm)", fontSize: 15 }}>
                      <td>CASH AND CASH EQUIVALENTS AT END OF PERIOD (IAS 7.45)</td>
                      <td style={{ textAlign: "center" }}>7</td>
                      <td style={{ textAlign: "right", borderBottom: "3px double var(--color-brand)" }}>
                        {fmt(socf.closingCashEquivalents)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* IAS 7.45 Cash & Bank Overdraft Reconciliation Footer */}
              <div
                className="card-body"
                style={{
                  borderTop: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 12.5,
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <strong>IAS 7.45 Reconciliation to Statement of Financial Position:</strong> Cash &amp; Bank Balances (
                  {fmt(socf.reconciliation.cashAndBankBalances)}) less Bank Overdrafts (
                  {fmt(Math.abs(socf.reconciliation.bankOverdrafts))}) ={" "}
                  <strong>{fmt(socf.reconciliation.netCashAndCashEquivalents)}</strong>
                </div>
                <span className="badge-success">
                  <CheckCircle2 size={12} /> Reconciled to Note 7
                </span>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 5: NOTES TO THE FINANCIAL STATEMENTS & BI RATIOS
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "NOTES" && statements && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Financial Ratios Grid */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                    Financial Health, Liquidity &amp; Profitability Ratios
                  </h3>
                </div>
                <div
                  className="card-body"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Current Ratio
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-brand)" }}>{ratios.currentRatio}x</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>Benchmark: ≥ 1.5x</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Quick (Acid-Test) Ratio
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-brand)" }}>{ratios.quickRatio}x</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>Excludes inventories</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Net Working Capital
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)" }}>
                      {fmt(ratios.workingCapital)}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>Current Assets − Current Liab.</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Debt-to-Equity
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{ratios.debtToEquityRatio}x</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>Total Liabilities / Equity</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Return on Equity (ROE)
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-success)" }}>{ratios.returnOnEquity}%</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>PAT / Shareholders&apos; Equity</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      Return on Assets (ROA)
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-success)" }}>{ratios.returnOnAssets}%</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>PAT / Total Assets</div>
                  </div>
                </div>
              </div>

              {/* Notes 1 & 2: Basis of Preparation */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                    Notes 1 &amp; 2 — Corporate Information &amp; Summary of Significant Accounting Policies
                  </h3>
                </div>
                <div className="card-body" style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
                  <p style={{ margin: "0 0 10px 0" }}>
                    <strong>Note 1 (Reporting Entity):</strong> <strong>{meta.companyLegalName}</strong> ({meta.rcNumber},
                    TIN: {meta.tinNumber}) is incorporated in Nigeria under the Companies and Allied Matters Act (CAMA)
                    2020 and engages in footwear manufacturing, wholesale, and retail distribution.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Note 2 (Basis of Preparation &amp; FRCN Compliance):</strong> These financial statements are
                    prepared on the historical cost basis (modified for PPE revaluation where applicable) in accordance
                    with International Financial Reporting Standards (IFRS) as adopted by the Financial Reporting Council
                    of Nigeria (FRCN), IAS 2 (Inventories valued at lower of cost and net realisable value), IAS 16
                    (Property, Plant &amp; Equipment), IAS 7 (Cash Flows), and CAMA 2020. Functional and presentation
                    currency is the Nigerian Naira (₦).
                  </p>
                </div>
              </div>

              {/* Note 3: Revenue Disaggregation (IFRS 15.114) */}
              {sopl?.revenueByChannel && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                      Note 3 — Disaggregation of Revenue from Contracts with Customers (IFRS 15.114)
                    </h3>
                  </div>
                  <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                    <table className="table font-tabular">
                      <thead>
                        <tr>
                          <th>Sales Channel</th>
                          <th style={{ textAlign: "right" }}>Transactions</th>
                          <th style={{ textAlign: "right" }}>Units Sold</th>
                          <th style={{ textAlign: "right" }}>Gross Revenue (₦)</th>
                          <th style={{ textAlign: "right" }}>Trade Discounts (₦)</th>
                          <th style={{ textAlign: "right" }}>Net Revenue (₦)</th>
                          <th style={{ textAlign: "right" }}>Direct COGS (₦)</th>
                          <th style={{ textAlign: "right" }}>Gross Profit (₦)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(["Retail", "Wholesale"] as const).map((channel) => {
                          const row = sopl.revenueByChannel[channel] || {
                            ordersCount: 0,
                            units: 0,
                            grossRevenue: 0,
                            discounts: 0,
                            netRevenue: 0,
                            cogs: 0,
                            grossProfit: 0,
                          };
                          return (
                            <tr key={channel}>
                              <td style={{ fontWeight: 700 }}>{channel} Sales</td>
                              <td style={{ textAlign: "right" }}>{row.ordersCount}</td>
                              <td style={{ textAlign: "right" }}>{row.units}</td>
                              <td style={{ textAlign: "right" }}>{fmt(row.grossRevenue)}</td>
                              <td style={{ textAlign: "right", color: "var(--color-error)" }}>{fmt(-row.discounts)}</td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(row.netRevenue)}</td>
                              <td style={{ textAlign: "right" }}>{fmt(row.cogs)}</td>
                              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--color-success)" }}>
                                {fmt(row.grossProfit)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ fontWeight: 800, background: "var(--color-surface)" }}>
                          <td>Total Revenue</td>
                          <td style={{ textAlign: "right" }}>
                            {(sopl.revenueByChannel.Retail?.ordersCount || 0) +
                              (sopl.revenueByChannel.Wholesale?.ordersCount || 0)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {(sopl.revenueByChannel.Retail?.units || 0) + (sopl.revenueByChannel.Wholesale?.units || 0)}
                          </td>
                          <td style={{ textAlign: "right" }}>{fmt(sopl.grossRevenue)}</td>
                          <td style={{ textAlign: "right", color: "var(--color-error)" }}>{fmt(-sopl.salesDiscounts)}</td>
                          <td style={{ textAlign: "right" }}>{fmt(sopl.revenue)}</td>
                          <td style={{ textAlign: "right" }}>{fmt(sopl.cogsFinishedGoods)}</td>
                          <td style={{ textAlign: "right", color: "var(--color-success)" }}>
                            {fmt(sopl.revenue - sopl.cogsFinishedGoods)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Note 4: PPE Schedule */}
              <div className="card">
                <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                    Note 4 — Property, Plant &amp; Equipment and Intangible Assets Schedule (IAS 16 / IAS 38)
                  </h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/fixed-assets" className="btn-outline btn-sm">
                      <Building2 size={13} /> Manage Purchases &amp; Disposals
                    </Link>
                    <button className="btn-outline btn-sm" onClick={openNewAsset}>
                      <Plus size={13} /> Add Asset
                    </button>
                  </div>
                </div>
                <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                  <table className="table font-tabular">
                    <thead>
                      <tr>
                        <th>Asset Description</th>
                        <th>Category</th>
                        <th>Method / Life</th>
                        <th style={{ textAlign: "right" }}>Cost (₦)</th>
                        <th style={{ textAlign: "right" }}>Period Dep. (₦)</th>
                        <th style={{ textAlign: "right" }}>Accum. Dep. (₦)</th>
                        <th style={{ textAlign: "right" }}>Net Book Value (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statements.notes.ppeSchedule.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 28, color: "var(--color-text-muted)" }}>
                            No non-current assets recorded yet. Click &ldquo;Add Asset&rdquo; to register machinery,
                            generators, vehicles, or buildings.
                          </td>
                        </tr>
                      ) : (
                        statements.notes.ppeSchedule.map((a: any) => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 600 }}>
                              {a.name}{" "}
                              {a.disposed && (
                                <span className="badge-error">
                                  Disposed (Gain/Loss: {fmt(a.disposalGainLoss)})
                                </span>
                              )}
                            </td>
                            <td>{a.category}</td>
                            <td>
                              {a.method} ({a.usefulLifeYears} yrs)
                            </td>
                            <td style={{ textAlign: "right" }}>{fmt(a.originalCost)}</td>
                            <td style={{ textAlign: "right" }}>{fmt(a.periodDepreciation)}</td>
                            <td style={{ textAlign: "right" }}>{fmt(a.carryingAccumulatedDepreciation ?? a.accumulatedDepreciation)}</td>
                            <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(a.netBookValue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note 5 & Note 10 Side-by-Side */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Note 5 — Inventories Breakdown (IAS 2)</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Raw Materials (Leather, Soles, Adhesives)</span>
                      <strong className="font-tabular">{fmt(sofp.currentAssets.inventoriesRawMaterials)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Work-in-Progress (Active Production Runs)</span>
                      <strong className="font-tabular">{fmt(sofp.currentAssets.inventoriesWIP)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Finished Goods (Active Product Variants at Cost)</span>
                      <strong className="font-tabular">{fmt(sofp.currentAssets.inventoriesFinishedGoods)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 800 }}>
                      <span>Total Carrying Amount of Inventories</span>
                      <span className="font-tabular" style={{ color: "var(--color-brand)" }}>
                        {fmt(sofp.currentAssets.totalInventories)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
                      Note 10 — Nigerian Taxation Computation (FIRS / CITA)
                    </h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Finance Act Classification</span>
                      <span className="badge-accent">{sopl.taxBreakdown.companySizeTier}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Add Back: Disallowable Accounting Depreciation</span>
                      <strong className="font-tabular">{fmt(sopl.taxBreakdown.depreciationAddBack)}</strong>
                    </div>
                    {sopl.taxBreakdown.disposalGainLossAdjustment !== 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                        <span>Exclude: Accounting Disposal (Gain)/Loss</span>
                        <strong className="font-tabular">{fmt(sopl.taxBreakdown.disposalGainLossAdjustment)}</strong>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Assessable Profit (TET Base)</span>
                      <strong className="font-tabular">{fmt(sopl.taxBreakdown.assessableProfit)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Less: FIRS CITA Capital Allowances &amp; Balancing Adj.</span>
                      <strong className="font-tabular">
                        ({fmt((sopl.taxBreakdown.capitalAllowanceDeduction || 0) + (sopl.taxBreakdown.balancingAdjustment || 0))})
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Taxable Profit (CIT Base)</span>
                      <strong className="font-tabular">{fmt(sopl.taxBreakdown.taxableProfit)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Company Income Tax ({sopl.taxBreakdown.citRate}%)</span>
                      <strong className="font-tabular">{fmt(sopl.taxBreakdown.citAmount)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <span>Tertiary Education Tax ({sopl.taxBreakdown.tetRate}%)</span>
                      <strong className="font-tabular">{fmt(sopl.taxBreakdown.tetAmount)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 800 }}>
                      <span>Total Tax Provision (Effective: {sopl.taxBreakdown.effectiveTaxRate}%)</span>
                      <span className="font-tabular" style={{ color: "var(--color-warning)" }}>
                        {fmt(sopl.taxBreakdown.totalTaxExpense)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 6: LEDGER, FIXED ASSETS (PPE) & NIGERIAN TAX SETTINGS
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "LEDGER" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* 1. Equity, Liabilities & Working Capital Ledger */}
              <div className="card">
                <div
                  className="card-header"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                      Equity, Borrowings, Working Capital &amp; Tax Ledger
                    </h3>
                    <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                      Record Share Capital, Dividends, Bank/BOI Loans, Supplier Trade Payables, Prepaid Rent, WHT Credits &amp; FIRS Tax Payments
                    </p>
                  </div>
                  <button className="btn-accent btn-sm" onClick={() => openNewEntry("SHARE_CAPITAL")}>
                    <Plus size={14} /> Add Ledger Entry
                  </button>
                </div>
                <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Title / Particulars</th>
                        <th>Classification</th>
                        <th>Cash Flow</th>
                        <th style={{ textAlign: "right" }}>Amount (₦)</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "var(--color-text-muted)" }}>
                            No equity, loan, or working capital entries yet. Click &ldquo;Add Ledger Entry&rdquo; to record
                            Share Capital, Loans, Payables, or Prepayments.
                          </td>
                        </tr>
                      ) : (
                        entries.map((entry) => {
                          const def = FINANCIAL_ENTRY_TYPES.find((t) => t.code === entry.entryType);
                          return (
                            <tr key={entry.id}>
                              <td style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>{formatDate(entry.date)}</td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{entry.title}</div>
                                {entry.notes && (
                                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{entry.notes}</div>
                                )}
                              </td>
                              <td>
                                <span className="badge-muted">{def?.label || entry.entryType}</span>
                              </td>
                              <td>
                                <span className="badge-accent">{def?.cashFlowCategory || "Financing"}</span>
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700 }} className="font-tabular">
                                {fmt(entry.amount)}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: 4 }}>
                                  <button className="btn-ghost btn-sm" onClick={() => openEditEntry(entry)}>
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="btn-ghost btn-sm"
                                    style={{ color: "var(--color-error)" }}
                                    onClick={() => handleDeleteEntry(entry.id)}
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

              {/* 2. Fixed Assets (PPE & Intangibles) Register */}
              <div className="card">
                <div
                  className="card-header"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                      Non-Current Assets Register (IAS 16 PPE &amp; IAS 38 Intangibles)
                    </h3>
                    <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                      Automatically computes depreciation in Profit or Loss, Carrying Amount on Financial Position, and CapEx in Cash Flows
                    </p>
                  </div>
                  <button className="btn-accent btn-sm" onClick={openNewAsset}>
                    <Plus size={14} /> Register Fixed Asset
                  </button>
                </div>
                <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Acquired</th>
                        <th>Asset Name</th>
                        <th>Category</th>
                        <th>Depreciation</th>
                        <th>Funding</th>
                        <th style={{ textAlign: "right" }}>Acquisition Cost (₦)</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fixedAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: 36, color: "var(--color-text-muted)" }}>
                            No fixed assets registered yet. Add sewing machines, generators, vehicles, furniture, or
                            factory buildings.
                          </td>
                        </tr>
                      ) : (
                        fixedAssets.map((asset) => (
                          <tr key={asset.id}>
                            <td style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                              {formatDate(asset.acquisitionDate)}
                            </td>
                            <td style={{ fontWeight: 600 }}>{asset.name}</td>
                            <td>
                              <span className="badge-muted">{asset.category}</span>
                            </td>
                            <td style={{ fontSize: 12.5 }}>
                              {asset.depreciationMethod} ({asset.usefulLifeYears} yrs)
                            </td>
                            <td>
                              <span className={asset.paymentStatus === "Paid" ? "badge-success" : "badge-warning"}>
                                {asset.paymentStatus || "Paid"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700 }} className="font-tabular">
                              {fmt(asset.cost)}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: 4 }}>
                                <button className="btn-ghost btn-sm" onClick={() => openEditAsset(asset)}>
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="btn-ghost btn-sm"
                                  style={{ color: "var(--color-error)" }}
                                  onClick={() => handleDeleteAsset(asset.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Nigerian Statutory (CAMA 2020 / FIRS) Settings */}
              {settings && (
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <Building2 size={17} style={{ color: "var(--color-accent)" }} /> Nigerian Statutory &amp; FIRS Tax
                      Configuration (CAMA 2020 &amp; Finance Act)
                    </h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {settingsMsg && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 8,
                            background: "var(--color-success-bg)",
                            color: "var(--color-success)",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {settingsMsg}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                        <div>
                          <label className="label">Registered Corporate Name (CAC)</label>
                          <input name="companyLegalName" className="input" defaultValue={settings.companyLegalName} required />
                        </div>
                        <div>
                          <label className="label">CAC Registration No. (RC / BN)</label>
                          <input name="rcNumber" className="input" defaultValue={settings.rcNumber} placeholder="RC-1849201" />
                        </div>
                        <div>
                          <label className="label">FIRS Tax Identification No. (TIN)</label>
                          <input name="tinNumber" className="input" defaultValue={settings.tinNumber} placeholder="20491827-0001" />
                        </div>
                        <div>
                          <label className="label">Company Income Tax (CIT) Regime</label>
                          <select name="taxRegime" className="select" defaultValue={settings.taxRegime}>
                            <option value="AUTO">Auto (Finance Act Turnover Tiers)</option>
                            <option value="SMALL_0">Small Company ≤ ₦25M (0% CIT)</option>
                            <option value="MEDIUM_20">Medium Company ₦25M–₦100M (20% CIT)</option>
                            <option value="LARGE_30">Large Company &gt; ₦100M (30% CIT)</option>
                            <option value="EXEMPT">Pioneer / Tax Exempt (0%)</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Tertiary Education Tax (3% TET)</label>
                          <select name="enableTET" className="select" defaultValue={String(settings.enableTET)}>
                            <option value="1">Enabled (3% for Medium/Large Companies)</option>
                            <option value="0">Disabled / Exempt</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Police Trust Fund Levy (0.005%)</label>
                          <select name="enablePoliceLevy" className="select" defaultValue={String(settings.enablePoliceLevy)}>
                            <option value="0">Disabled</option>
                            <option value="1">Enabled (0.005% of Net Profit)</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Prepared By (CFO / Accountant)</label>
                          <input name="preparedBy" className="input" defaultValue={settings.preparedBy} />
                        </div>
                        <div>
                          <label className="label">Approved By (Director — CAMA s.386)</label>
                          <input name="approvedBy" className="input" defaultValue={settings.approvedBy} />
                        </div>
                      </div>
                      <div>
                        <button type="submit" className="btn-accent" disabled={isSaving}>
                          <ShieldCheck size={16} /> {isSaving ? "Saving..." : "Save Statutory Settings"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 1: RECORD / EDIT FINANCIAL LEDGER ENTRY
         ══════════════════════════════════════════════════════════════════ */}
      {showEntryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="card" style={{ width: 520, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>
                {editingEntry ? "Edit Financial Ledger Entry" : "Record Equity, Liability or Working Capital"}
              </h3>
              <button className="btn-ghost" onClick={() => setShowEntryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Accounting Classification (IFRS / CAMA 2020)</label>
                <select
                  name="entryType"
                  className="select"
                  value={selectedEntryType}
                  onChange={(e) => setSelectedEntryType(e.target.value)}
                >
                  {FINANCIAL_ENTRY_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>
                      [{t.section.replace(/_/g, " ")}] {t.label}
                    </option>
                  ))}
                </select>
                {selectedEntryMeta && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: "var(--color-surface-warm)",
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <strong>{selectedEntryMeta.standardRef} ({selectedEntryMeta.cashFlowCategory} Cash Flow):</strong>{" "}
                    {selectedEntryMeta.hint}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Particulars / Description</label>
                <input
                  name="title"
                  className="input"
                  defaultValue={editingEntry?.title || ""}
                  placeholder="e.g., Allotment of 1,000,000 Ordinary Shares of ₦1.00 each"
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
                    defaultValue={editingEntry?.amount || ""}
                    placeholder="1000000"
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
                <label className="label">Reference / Voucher No. (Optional)</label>
                <input
                  name="reference"
                  className="input"
                  defaultValue={editingEntry?.reference || ""}
                  placeholder="e.g., CAC-SH01 / BOI-LN-2026"
                />
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <input
                  name="notes"
                  className="input"
                  defaultValue={editingEntry?.notes || ""}
                  placeholder="Supporting audit note"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEntryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 2: REGISTER / EDIT FIXED ASSET (IAS 16 PPE / IAS 38)
         ══════════════════════════════════════════════════════════════════ */}
      {showAssetModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: 560,
              maxWidth: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
              background: "var(--color-surface-card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>
                {editingAsset ? "Edit Non-Current Asset (IAS 16)" : "Register Fixed Asset (PPE / Intangible)"}
              </h3>
              <button className="btn-ghost" onClick={() => setShowAssetModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="label">Asset Name / Description</label>
                <input
                  name="name"
                  className="input"
                  defaultValue={editingAsset?.name || ""}
                  placeholder="e.g., Industrial Leather Stitching Machine / 20kVA Generator"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Asset Class (IAS 16 / IFRS 16 / IAS 38)</label>
                  <select name="category" className="select" defaultValue={editingAsset?.category || "Plant & Machinery"}>
                    {FIXED_ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Acquisition Date</label>
                  <input
                    name="acquisitionDate"
                    type="date"
                    className="input"
                    defaultValue={
                      editingAsset?.acquisitionDate
                        ? new Date(editingAsset.acquisitionDate).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Acquisition Cost (₦)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    min="1"
                    className="input"
                    defaultValue={editingAsset?.cost || ""}
                    placeholder="850000"
                    required
                  />
                </div>
                <div>
                  <label className="label">Residual / Scrap Value (₦)</label>
                  <input
                    name="residualValue"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    defaultValue={editingAsset?.residualValue ?? 0}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Useful Life (Years)</label>
                  <input
                    name="usefulLifeYears"
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="input"
                    defaultValue={editingAsset?.usefulLifeYears ?? 5}
                    required
                  />
                </div>
                <div>
                  <label className="label">Depreciation Method</label>
                  <select
                    name="depreciationMethod"
                    className="select"
                    defaultValue={editingAsset?.depreciationMethod || "Straight-Line"}
                  >
                    <option value="Straight-Line">Straight-Line</option>
                    <option value="Reducing Balance">Reducing Balance</option>
                  </select>
                </div>
                <div>
                  <label className="label">Purchase Funding Account</label>
                  <select name="paymentStatus" className="select" defaultValue={editingAsset?.paymentStatus || "Paid"}>
                    <option value="Paid">Cash / Bank Transfer (CapEx)</option>
                    <option value="Credit/Loan">Long-Term Asset Loan / Hire Purchase</option>
                    <option value="Vendor Credit">Vendor Credit (Current Payable)</option>
                    <option value="Owner Equity">Owner Capital in Kind (Equity)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Revaluation Surplus (₦)</label>
                  <input
                    name="revaluationSurplus"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    defaultValue={editingAsset?.revaluationSurplus ?? 0}
                  />
                </div>
                <div>
                  <label className="label">Disposal Date (If Disposed/Sold)</label>
                  <input
                    name="disposalDate"
                    type="date"
                    className="input"
                    defaultValue={
                      editingAsset?.disposalDate ? new Date(editingAsset.disposalDate).toISOString().split("T")[0] : ""
                    }
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Disposal Proceeds (₦)</label>
                  <input
                    name="disposalProceeds"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    defaultValue={editingAsset?.disposalProceeds ?? 0}
                  />
                </div>
                <div>
                  <label className="label">Disposal Settlement</label>
                  <select
                    name="disposalPaymentStatus"
                    className="select"
                    defaultValue={editingAsset?.disposalPaymentStatus || "Cash"}
                  >
                    <option value="Cash">Cash / Bank Received</option>
                    <option value="Receivable">Sold on Credit (Receivable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Serial No. / Location Notes</label>
                <input
                  name="notes"
                  className="input"
                  defaultValue={editingAsset?.notes || ""}
                  placeholder="Factory Floor Line 1"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowAssetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
