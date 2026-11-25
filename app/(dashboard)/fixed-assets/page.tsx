"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ArrowRightLeft,
  Scale,
  TrendingUp,
  TrendingDown,
  PackageMinus,
  CheckCircle2,
  Info,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getFinancialStatementsAction,
  createFixedAssetAction,
  updateFixedAssetAction,
  disposeFixedAssetAction,
  deleteFixedAssetAction,
} from "@/lib/actions/financials";
import {
  FIXED_ASSET_CATEGORIES,
  FixedAssetRecord,
  computeAssetDepreciationAtDate,
  getNigeriaCitaAllowanceRates,
} from "@/lib/accounting-standards";
import { formatAccountingNaira } from "@/lib/financial-export";

type FilterMode = "ALL" | "ACTIVE" | "DISPOSED";

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<FixedAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL");

  // Purchase / Edit Modal
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAssetRecord | null>(null);
  const [formCategory, setFormCategory] = useState<string>("Plant & Machinery");
  const [formPaymentStatus, setFormPaymentStatus] = useState<string>("Paid");
  const [formCost, setFormCost] = useState<string>("");

  // Dedicated Dispose / Derecognise Modal
  const [disposingAsset, setDisposingAsset] = useState<FixedAssetRecord | null>(null);
  const [dispDate, setDispDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dispProceeds, setDispProceeds] = useState<string>("0");
  const [dispPaymentStatus, setDispPaymentStatus] = useState<string>("Cash");

  const [isSaving, setIsSaving] = useState(false);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const res = await getFinancialStatementsAction();
    if (res.success) {
      setAssets(res.fixedAssets || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const nowCutoff = useMemo(() => new Date(), []);

  const enrichedAssets = useMemo(() => {
    return assets.map((asset) => {
      const calc = computeAssetDepreciationAtDate(asset, nowCutoff);
      const cita = getNigeriaCitaAllowanceRates(asset.category);
      return { asset, calc, cita };
    });
  }, [assets, nowCutoff]);

  const filteredAssets = useMemo(() => {
    return enrichedAssets.filter(({ asset, calc }) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.category.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === "ACTIVE") return !calc.disposed;
      if (filterMode === "DISPOSED") return calc.disposed;
      return true;
    });
  }, [enrichedAssets, search, filterMode]);

  const summary = useMemo(() => {
    let activeCost = 0;
    let activeAccumDep = 0;
    let activeNBV = 0;
    let disposalProceeds = 0;
    let disposalGainLoss = 0;
    let citaTotal = 0;
    let activeCount = 0;
    let disposedCount = 0;

    for (const { asset, calc } of enrichedAssets) {
      citaTotal += calc.citaCumulativeAllowance;
      if (calc.disposed) {
        disposedCount++;
        disposalProceeds += calc.disposalProceeds;
        disposalGainLoss += calc.disposalGainLoss;
      } else {
        activeCount++;
        activeCost += Number(asset.cost) || 0;
        activeAccumDep += calc.accumulatedDepreciation;
        activeNBV += calc.netBookValue;
      }
    }

    return {
      activeCost,
      activeAccumDep,
      activeNBV,
      disposalProceeds,
      disposalGainLoss,
      citaTotal,
      activeCount,
      disposedCount,
    };
  }, [enrichedAssets]);

  // Live preview inside Dispose Modal
  const disposalPreview = useMemo(() => {
    if (!disposingAsset) return null;
    const previewAsset: FixedAssetRecord = {
      ...disposingAsset,
      disposalDate: dispDate || new Date().toISOString().split("T")[0],
      disposalProceeds: parseFloat(dispProceeds || "0") || 0,
      disposalPaymentStatus: dispPaymentStatus,
    };
    const calc = computeAssetDepreciationAtDate(previewAsset, new Date(previewAsset.disposalDate!));
    const origCost = Number(disposingAsset.cost) || 0;
    const reval = Number(disposingAsset.revaluationSurplus) || 0;
    const nbvAtDisposal = Math.max(0, origCost + reval - calc.accumulatedDepreciation);
    return {
      origCost,
      reval,
      accumDep: calc.accumulatedDepreciation,
      nbvAtDisposal,
      proceeds: previewAsset.disposalProceeds || 0,
      gainLoss: calc.disposalGainLoss,
      balancingAdj: calc.citaBalancingAdjustment,
    };
  }, [disposingAsset, dispDate, dispProceeds, dispPaymentStatus]);

  const openNewPurchase = () => {
    setEditingAsset(null);
    setFormCategory("Plant & Machinery");
    setFormPaymentStatus("Paid");
    setFormCost("");
    setShowAssetModal(true);
  };

  const openEditAsset = (asset: FixedAssetRecord) => {
    setEditingAsset(asset);
    setFormCategory(asset.category);
    setFormPaymentStatus(asset.paymentStatus || "Paid");
    setFormCost(String(asset.cost));
    setShowAssetModal(true);
  };

  const openDisposeModal = (asset: FixedAssetRecord) => {
    setDisposingAsset(asset);
    setDispDate(new Date().toISOString().split("T")[0]);
    setDispProceeds("0");
    setDispPaymentStatus("Cash");
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
      loadAssets();
    } else {
      alert(res.error || "Failed to save fixed asset");
    }
  };

  const handleConfirmDisposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!disposingAsset) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await disposeFixedAssetAction(disposingAsset.id, formData);
    setIsSaving(false);

    if (res.success) {
      setDisposingAsset(null);
      loadAssets();
    } else {
      alert(res.error || "Failed to dispose fixed asset");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Permanently remove this asset from the register? Use 'Dispose / Sell' if the asset was sold or scrapped.")) {
      return;
    }
    const res = await deleteFixedAssetAction(id);
    if (res.success) loadAssets();
    else alert(res.error || "Failed to delete asset");
  };

  const fmt = formatAccountingNaira;
  const formCita = getNigeriaCitaAllowanceRates(formCategory);
  const isLandCategory = formCategory.startsWith("Land (");

  const getFundingCreditAccount = (status: string) => {
    if (status === "Credit/Loan") return "Cr. Long-Term Asset Loan / Hire Purchase (Non-Current Liability)";
    if (status === "Vendor Credit") return "Cr. Vendor Payables for PPE (Current Liability)";
    if (status === "Owner Equity") return "Cr. Owner Capital Contribution Reserve (Equity)";
    return "Cr. Cash and Cash Equivalents (Investing Cash Outflow — IAS 7.16a)";
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 className="page-title">Fixed Assets &amp; Disposals (PPE)</h1>
            <span className="badge-brand">IAS 16 / IAS 38</span>
            <span className="badge-accent">Nigerian CITA Capital Allowances</span>
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            Record asset purchases, depreciation, revaluations, and disposals — automatically posted to Statement of
            Financial Position, Profit or Loss, Equity &amp; Cash Flows
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/financial-statements" className="btn-outline btn-sm">
            <Scale size={14} /> View Financial Statements
          </Link>
          <button className="btn-accent btn-sm" onClick={openNewPurchase}>
            <Plus size={15} /> Record Asset Purchase
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
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
            Active Assets Cost ({summary.activeCount})
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }} className="font-tabular">
            {fmt(summary.activeCost)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Gross carrying amount (IAS 16)
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Accumulated Depreciation
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-warning)", marginTop: 4 }} className="font-tabular">
            {fmt(summary.activeAccumDep)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Charged to Profit or Loss
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Net Book Value (NBV)
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }} className="font-tabular">
            {fmt(summary.activeNBV)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Statement of Financial Position
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Disposals ({summary.disposedCount})
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 4 }} className="font-tabular">
            {fmt(summary.disposalProceeds)}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: summary.disposalGainLoss >= 0 ? "var(--color-success)" : "var(--color-error)",
              marginTop: 2,
              fontWeight: 600,
            }}
          >
            Gain/(Loss): {fmt(summary.disposalGainLoss)}
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            FIRS CITA Allowances
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)", marginTop: 4 }} className="font-tabular">
            {fmt(summary.citaTotal)}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            2nd Schedule Tax Relief
          </div>
        </div>
      </div>

      {/* ── Accounting Standards Flow Info Strip ── */}
      <div
        className="card"
        style={{
          padding: "12px 16px",
          marginBottom: 18,
          background: "var(--color-surface-warm)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 12.5,
          color: "var(--color-text-secondary)",
        }}
      >
        <Info size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
        <div>
          <strong>Nigerian IFRS &amp; CAMA 2020 Double-Entry Automation:</strong>{" "}
          <span>Purchases post to Non-Current Assets + Cash/Borrowings/Payables/Equity (IAS 16 &amp; IAS 7).</span>{" "}
          <span>
            Disposals derecognise Cost &amp; Accumulated Depreciation, post Gain/(Loss) to Profit or Loss (IAS 16.68),
            transfer Revaluation Surplus to Retained Earnings (IAS 16.41), and compute CITA Balancing Allowance/Charge.
          </span>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
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
        <div style={{ display: "flex", gap: 6 }}>
          {(
            [
              { id: "ALL", label: `All (${assets.length})` },
              { id: "ACTIVE", label: `Active (${summary.activeCount})` },
              { id: "DISPOSED", label: `Disposed (${summary.disposedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={filterMode === tab.id ? "btn-primary btn-sm" : "btn-outline btn-sm"}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-input-wrap" style={{ minWidth: 240, flex: "0 1 320px" }}>
          <Search size={14} />
          <input
            className="input"
            placeholder="Search machinery, vehicle, land..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Asset Register Table ── */}
      <div className="card">
        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="table font-tabular">
            <thead>
              <tr>
                <th>Asset Name &amp; Class</th>
                <th>Acquired</th>
                <th>Purchase Funding</th>
                <th style={{ textAlign: "right" }}>Cost (₦)</th>
                <th style={{ textAlign: "right" }}>Accum. Dep. (₦)</th>
                <th style={{ textAlign: "right" }}>Net Book Value (₦)</th>
                <th>Status / Disposal Impact</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--color-text-muted)" }}>
                    Loading Fixed Assets register...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 44, color: "var(--color-text-muted)" }}>
                    No fixed assets found. Click <strong>&ldquo;Record Asset Purchase&rdquo;</strong> to add machinery,
                    generators, vehicles, furniture, land, or buildings.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(({ asset, calc, cita }) => (
                  <tr key={asset.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{asset.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
                        {asset.category} • {asset.category.startsWith("Land (") ? "Non-Depreciable (IAS 16.58)" : `${asset.depreciationMethod} (${asset.usefulLifeYears} yrs)`}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{cita.citaClass}</div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{formatDate(asset.acquisitionDate)}</td>
                    <td>
                      <span
                        className={
                          asset.paymentStatus === "Paid"
                            ? "badge-success"
                            : asset.paymentStatus === "Owner Equity"
                            ? "badge-brand"
                            : "badge-warning"
                        }
                      >
                        {asset.paymentStatus || "Paid"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(asset.cost)}</td>
                    <td style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>
                      {fmt(calc.accumulatedDepreciation)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--color-brand)" }}>
                      {calc.disposed ? fmt(0) : fmt(calc.netBookValue)}
                    </td>
                    <td>
                      {calc.disposed ? (
                        <div>
                          <span className="badge-error">Disposed {asset.disposalDate ? formatDate(asset.disposalDate) : ""}</span>
                          <div style={{ fontSize: 11.5, marginTop: 4 }}>
                            Proceeds: <strong>{fmt(calc.disposalProceeds)}</strong> ({asset.disposalPaymentStatus || "Cash"})
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: calc.disposalGainLoss >= 0 ? "var(--color-success)" : "var(--color-error)",
                            }}
                          >
                            {calc.disposalGainLoss >= 0 ? "Gain: " : "Loss: "}
                            {fmt(calc.disposalGainLoss)}
                          </div>
                        </div>
                      ) : (
                        <span className="badge-success">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                        {!calc.disposed && (
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => openDisposeModal(asset)}
                            title="Dispose or Sell Asset (IAS 16)"
                            style={{ color: "var(--color-warning)", borderColor: "var(--color-warning)" }}
                          >
                            <PackageMinus size={13} /> Dispose
                          </button>
                        )}
                        <button className="btn-ghost btn-sm" onClick={() => openEditAsset(asset)} title="Edit Asset">
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-ghost btn-sm"
                          style={{ color: "var(--color-error)" }}
                          onClick={() => handleDeleteAsset(asset.id)}
                          title="Delete Asset Record"
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

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 1: RECORD ASSET PURCHASE / EDIT ASSET (IAS 16)
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
              width: 600,
              maxWidth: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
              background: "var(--color-surface-card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={18} style={{ color: "var(--color-accent)" }} />
                {editingAsset ? "Edit Asset Record (IAS 16)" : "Record Fixed Asset Purchase (IAS 16 / CITA)"}
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
                  placeholder="e.g., Industrial Sole Pressing Machine / Delivery Van"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Asset Class (IAS 16 / IFRS 16 / IAS 38)</label>
                  <select
                    name="category"
                    className="select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {FIXED_ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Acquisition / Purchase Date</label>
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
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="1500000"
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
                    disabled={isLandCategory}
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
                    disabled={isLandCategory}
                  >
                    <option value="Straight-Line">Straight-Line</option>
                    <option value="Reducing Balance">Reducing Balance</option>
                  </select>
                </div>
                <div>
                  <label className="label">Purchase Funding Account</label>
                  <select
                    name="paymentStatus"
                    className="select"
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value)}
                  >
                    <option value="Paid">Cash / Bank Transfer</option>
                    <option value="Credit/Loan">Asset Loan / Hire Purchase</option>
                    <option value="Vendor Credit">Vendor Credit (Payable)</option>
                    <option value="Owner Equity">Owner Capital in Kind</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Revaluation Surplus (OCI — IAS 16.39) (₦)</label>
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
                  <label className="label">Serial No. / Location Notes</label>
                  <input
                    name="notes"
                    className="input"
                    defaultValue={editingAsset?.notes || ""}
                    placeholder="Lagos Factory Line A"
                  />
                </div>
              </div>

              {/* Keep existing disposal fields intact if editing an already-disposed asset */}
              {editingAsset?.disposalDate && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--color-surface-warm)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Disposal Date</label>
                    <input
                      name="disposalDate"
                      type="date"
                      className="input"
                      defaultValue={new Date(editingAsset.disposalDate).toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Disposal Proceeds (₦)</label>
                    <input
                      name="disposalProceeds"
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      defaultValue={editingAsset.disposalProceeds ?? 0}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 12 }}>Settlement</label>
                    <select
                      name="disposalPaymentStatus"
                      className="select"
                      defaultValue={editingAsset.disposalPaymentStatus || "Cash"}
                    >
                      <option value="Cash">Cash / Bank</option>
                      <option value="Receivable">Receivable (Credit)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Live Double-Entry & Nigerian CITA Preview */}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "var(--color-surface-warm)",
                  border: "1px solid var(--color-border)",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--color-brand)" }}>
                  Double-Entry &amp; Nigerian Tax Recognition Preview:
                </div>
                <div>
                  • <strong>Dr.</strong> {formCategory} ({fmt(parseFloat(formCost || "0") || 0)})
                </div>
                <div>
                  • <strong>{getFundingCreditAccount(formPaymentStatus)}</strong>
                </div>
                <div>
                  • <strong>FIRS CITA 2nd Schedule:</strong> {formCita.citaClass}
                  {isLandCategory ? " • Freehold Land is NOT depreciated under IAS 16.58." : ""}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="button" className="btn-outline" onClick={() => setShowAssetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingAsset ? "Update Asset" : "Record Asset Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 2: DEDICATED ASSET DISPOSAL / DERECOGNITION (IAS 16.67–71)
         ══════════════════════════════════════════════════════════════════ */}
      {disposingAsset && (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowRightLeft size={18} style={{ color: "var(--color-warning)" }} />
                Dispose / Derecognise Asset (IAS 16.67–71)
              </h3>
              <button className="btn-ghost" onClick={() => setDisposingAsset(null)}>
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "var(--color-surface-warm)",
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              <strong>{disposingAsset.name}</strong> ({disposingAsset.category}) • Acquired{" "}
              {formatDate(disposingAsset.acquisitionDate)} at <strong>{fmt(disposingAsset.cost)}</strong>
            </div>

            <form onSubmit={handleConfirmDisposal} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="label">Disposal / Sale / Write-off Date</label>
                  <input
                    name="disposalDate"
                    type="date"
                    className="input"
                    value={dispDate}
                    min={new Date(disposingAsset.acquisitionDate).toISOString().split("T")[0]}
                    onChange={(e) => setDispDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Disposal Proceeds (₦) (0 if scrapped)</label>
                  <input
                    name="disposalProceeds"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    value={dispProceeds}
                    onChange={(e) => setDispProceeds(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Proceeds Settlement Account</label>
                <select
                  name="disposalPaymentStatus"
                  className="select"
                  value={dispPaymentStatus}
                  onChange={(e) => setDispPaymentStatus(e.target.value)}
                >
                  <option value="Cash">Cash / Bank Received (Investing Cash Inflow — IAS 7.16b)</option>
                  <option value="Receivable">Sold on Credit (Other Receivables — Non-Cash until collected)</option>
                </select>
              </div>

              <div>
                <label className="label">Disposal Reason / Buyer Reference</label>
                <input name="notes" className="input" placeholder="e.g., Sold to ABC Logistics / Scrapped due to wear" />
              </div>

              {disposalPreview && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 8, color: "var(--color-brand)" }}>
                    IAS 16 Derecognition &amp; Nigerian Tax Impact Preview
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span>Original Cost Derecognised:</span>
                    <strong className="font-tabular">{fmt(disposalPreview.origCost)}</strong>
                  </div>
                  {disposalPreview.reval > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span>Revaluation Surplus (Transferred to Retained Earnings, IAS 16.41):</span>
                      <strong className="font-tabular">{fmt(disposalPreview.reval)}</strong>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span>Less: Accumulated Depreciation up to Disposal Date:</span>
                    <strong className="font-tabular">({fmt(disposalPreview.accumDep)})</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderTop: "1px solid var(--color-border)",
                      marginTop: 4,
                    }}
                  >
                    <span>Carrying Amount (Net Book Value) at Disposal:</span>
                    <strong className="font-tabular">{fmt(disposalPreview.nbvAtDisposal)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span>Disposal Proceeds ({dispPaymentStatus}):</span>
                    <strong className="font-tabular">{fmt(disposalPreview.proceeds)}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0 0 0",
                      borderTop: "1.5px solid var(--color-brand)",
                      marginTop: 4,
                      fontWeight: 800,
                      color: disposalPreview.gainLoss >= 0 ? "var(--color-success)" : "var(--color-error)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {disposalPreview.gainLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {disposalPreview.gainLoss >= 0 ? "Gain on Disposal (Profit or Loss):" : "Loss on Disposal (Profit or Loss):"}
                    </span>
                    <span className="font-tabular">{fmt(disposalPreview.gainLoss)}</span>
                  </div>
                  {disposalPreview.balancingAdj !== 0 && (
                    <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--color-text-secondary)" }}>
                      • <strong>FIRS CITA Balancing {disposalPreview.balancingAdj > 0 ? "Allowance (Tax Relief)" : "Charge (Taxable)"}:</strong>{" "}
                      {fmt(Math.abs(disposalPreview.balancingAdj))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button type="button" className="btn-outline" onClick={() => setDisposingAsset(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSaving}>
                  {isSaving ? "Recording..." : "Confirm Asset Disposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
