"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, X, CheckCircle, Printer, Trash2, Edit, Banknote, Store, Boxes } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { Receipt } from "@/components/pos/Receipt";
import {
  getSalesAction,
  createSaleAction,
  confirmSaleAction,
  deleteSaleAction,
  updateSaleAction,
  recordSalePaymentAction,
} from "@/lib/actions/sales";
import { getProductsAction } from "@/lib/actions/products";
import { getCustomersAction } from "@/lib/actions/customers";

const PAYMENT_BADGE: Record<string, string> = {
  Cash: "badge-success",
  Transfer: "badge-accent",
  POS: "badge-muted",
};

export default function SalesPage() {
  const [salesList, setSalesList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"All" | "Retail" | "Wholesale">("All");
  const [paymentFilter, setPaymentFilter] = useState<"All" | "Paid" | "Partial" | "Credit">("All");
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountInput, setPaymentAmountInput] = useState(0);
  const [paymentMethodInput, setPaymentMethodInput] = useState("Transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Record Sale form state
  const [saleForm, setSaleForm] = useState({
    saleType: "Retail" as "Retail" | "Wholesale",
    customer: "Walk-in Customer",
    productId: "",
    productName: "",
    variantId: "",
    size: "",
    color: "",
    qty: 1,
    unitPrice: 0,
    discount: 0,
    applyVat: false,
    paymentStatus: "Paid" as "Paid" | "Partial" | "Credit",
    amountPaid: 0,
    dueDate: "",
    status: "Confirmed",
    paymentMethod: "Transfer",
    date: "",
    notes: "",
  });

  const flatVariants = products
    .filter((p) => p.status !== "Inactive")
    .flatMap((p) =>
      (p.variants || []).map((v: any) => ({
        ...v,
        productName: p.name,
        wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
        displayName: `${p.name} - ${v.size} ${v.color}`.trim(),
      }))
    );

  useEffect(() => {
    loadSales();
    loadCustomers();
    loadProducts();
  }, []);

  const loadSales = async () => {
    const res = await getSalesAction();
    if (res.success) setSalesList(res.sales);
  };

  const loadCustomers = async () => {
    const res = await getCustomersAction();
    if (res.success && res.customers) setCustomers(res.customers);
  };

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const prods = res.products as any[];
      setProducts(prods);

      const flat = prods
        .filter((p) => p.status !== "Inactive")
        .flatMap((p) =>
          (p.variants || []).map((v: any) => ({
            ...v,
            productName: p.name,
            wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
          }))
        );

      if (flat.length > 0) {
        setSaleForm((prev) => ({
          ...prev,
          productId: flat[0].productId,
          productName: flat[0].productName,
          variantId: flat[0].id,
          size: flat[0].size,
          color: flat[0].color,
          unitPrice: flat[0].price || 0,
        }));
      }
    }
  };

  const filtered = salesList.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.productName?.toLowerCase() || "").includes(q) ||
      (s.customerName?.toLowerCase() || "").includes(q) ||
      (s.id?.toLowerCase() || "").includes(q);
    const matchChannel = channelFilter === "All" || (s.saleType || "Retail") === channelFilter;
    const matchPay = paymentFilter === "All" || (s.paymentStatus || "Paid") === paymentFilter;
    return matchSearch && matchChannel && matchPay;
  });

  // Form calculations
  const grossSubtotal = Math.max(0, (Number(saleForm.qty) || 1) * (Number(saleForm.unitPrice) || 0));
  const netRevenue = Math.max(0, grossSubtotal - (Number(saleForm.discount) || 0));
  const vatAmount = saleForm.applyVat ? Math.round(netRevenue * 0.075 * 100) / 100 : 0;
  const totalInvoice = Math.round((netRevenue + vatAmount) * 100) / 100;
  const resolvedPaidInput =
    saleForm.paymentStatus === "Paid"
      ? totalInvoice
      : saleForm.paymentStatus === "Credit"
      ? 0
      : Math.min(totalInvoice, Math.max(0, Number(saleForm.amountPaid) || 0));

  const selectedVariantObj = flatVariants.find((v) => v.id === saleForm.variantId);

  const handleChannelChange = (channel: "Retail" | "Wholesale") => {
    const unitPrice = selectedVariantObj
      ? channel === "Wholesale" && Number(selectedVariantObj.wholesalePrice) > 0
        ? Number(selectedVariantObj.wholesalePrice)
        : Number(selectedVariantObj.price) || 0
      : saleForm.unitPrice;
    const nextQty =
      channel === "Wholesale" && selectedVariantObj
        ? Math.max(saleForm.qty, Number(selectedVariantObj.wholesaleMinQty ?? 6))
        : saleForm.qty;

    setSaleForm((prev) => ({
      ...prev,
      saleType: channel,
      unitPrice,
      qty: nextQty,
      paymentMethod: channel === "Wholesale" ? "Transfer" : prev.paymentMethod,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVariantId = e.target.value;
    const variant = flatVariants.find((v) => v.id === selectedVariantId);
    if (variant) {
      const unitPrice =
        saleForm.saleType === "Wholesale" && Number(variant.wholesalePrice) > 0
          ? Number(variant.wholesalePrice)
          : Number(variant.price) || 0;
      const nextQty =
        saleForm.saleType === "Wholesale" ? Math.max(1, Number(variant.wholesaleMinQty ?? 6)) : 1;
      setSaleForm((prev) => ({
        ...prev,
        productId: variant.productId,
        productName: variant.productName,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        unitPrice,
        qty: nextQty,
      }));
    }
  };

  const handleRecordSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("saleType", saleForm.saleType);
    formData.append("customer", saleForm.customer);
    formData.append("product", saleForm.productName);
    formData.append("variantId", saleForm.variantId);
    formData.append("size", saleForm.size);
    formData.append("color", saleForm.color);
    formData.append("qty", String(saleForm.qty));
    formData.append("amount", String(grossSubtotal));
    formData.append("discount", String(Number(saleForm.discount) || 0));
    formData.append("vatAmount", String(vatAmount));
    formData.append("paymentStatus", saleForm.paymentStatus);
    formData.append("amountPaid", String(resolvedPaidInput));
    if (saleForm.dueDate) formData.append("dueDate", saleForm.dueDate);
    formData.append("status", saleForm.status);
    formData.append("paymentMethod", saleForm.paymentMethod);
    if (saleForm.date) formData.append("date", saleForm.date);
    if (saleForm.notes) formData.append("notes", saleForm.notes);

    const res = await createSaleAction(formData);
    if (res.success) {
      setShowRecordModal(false);
      loadSales();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleOpenEdit = (sale: any) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSale) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSaleAction(selectedSale.id, formData);
    if (res.success) {
      setShowEditModal(false);
      loadSales();
    } else {
      alert(res.error || "Failed to update sale");
    }
    setIsSubmitting(false);
  };

  const handleOpenCollectPayment = (sale: any) => {
    setSelectedSale(sale);
    setPaymentAmountInput(Number(sale.balanceDue) || 0);
    setPaymentMethodInput(sale.paymentMethod || "Transfer");
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    setIsSubmitting(true);
    const res = await recordSalePaymentAction(selectedSale.id, paymentAmountInput, paymentMethodInput);
    setIsSubmitting(false);
    if (res.success) {
      setShowPaymentModal(false);
      setSelectedSale(null);
      loadSales();
    } else {
      alert(res.error || "Failed to record payment");
    }
  };

  const handleConfirmSale = async (saleId: string) => {
    const res = await confirmSaleAction(saleId);
    if (res.success) {
      loadSales();
      if (selectedSale && selectedSale.id === saleId) {
        setSelectedSale({ ...selectedSale, status: "Confirmed" });
      }
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm("Are you sure you want to delete this sale? This cannot be undone.")) return;
    const res = await deleteSaleAction(saleId);
    if (res.success) {
      setSalesList((prev) => prev.filter((s) => s.id !== saleId));
      if (selectedSale?.id === saleId) setSelectedSale(null);
    } else {
      alert(res.error || "Failed to delete sale");
    }
  };

  const retailSalesTotal = salesList
    .filter((s) => (s.saleType || "Retail") === "Retail")
    .reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
  const wholesaleSalesTotal = salesList
    .filter((s) => s.saleType === "Wholesale")
    .reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
  const tradeReceivablesTotal = salesList.reduce((sum: number, s: any) => sum + (Number(s.balanceDue) || 0), 0);
  const collectedTotal = salesList.reduce((sum: number, s: any) => sum + (Number(s.amountPaid) || 0), 0);

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Sales (Retail &amp; Wholesale)</h1>
          <p className="page-subtitle">IFRS 15 channel revenue recognition, 7.5% VAT &amp; Trade Receivables tracking</p>
        </div>
        <button className="btn-accent" onClick={() => setShowRecordModal(true)}>
          <Plus size={16} /> Record Sale
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Retail Net Revenue</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }}>{formatNaira(retailSalesTotal)}</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Wholesale Net Revenue</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }}>{formatNaira(wholesaleSalesTotal)}</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Cash Collected (Incl. VAT)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-success)", marginTop: 4 }}>{formatNaira(collectedTotal)}</div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Trade Receivables (IFRS 9)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: tradeReceivablesTotal > 0 ? "var(--color-warning)" : "var(--color-text-secondary)", marginTop: 4 }}>
            {formatNaira(tradeReceivablesTotal)}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by transaction ID, customer, or product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: "auto" }} value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as any)}>
          <option value="All">All Channels</option>
          <option value="Retail">Retail Only</option>
          <option value="Wholesale">Wholesale Only</option>
        </select>
        <select className="select" style={{ width: "auto" }} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as any)}>
          <option value="All">All Payment Status</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Credit">Credit (Receivable)</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Channel</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Invoice (Net/VAT)</th>
              <th>Paid / Balance</th>
              <th>Profit</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No sales found.
                </td>
              </tr>
            ) : (
              filtered.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>{sale.id}</span>
                  </td>
                  <td>
                    <span className={sale.saleType === "Wholesale" ? "badge-accent" : "badge-muted"}>
                      {sale.saleType || "Retail"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{sale.productName}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                      {sale.size} {sale.color}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{sale.quantity}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(sale.totalInvoice ?? sale.amount)}</div>
                    {sale.vatAmount > 0 && (
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Incl. VAT {formatNaira(sale.vatAmount)}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-success)" }}>
                      Paid: {formatNaira(sale.amountPaid)}
                    </div>
                    {sale.balanceDue > 0 && (
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-warning)" }}>
                        Due: {formatNaira(sale.balanceDue)}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(sale.profit)}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{sale.customerName}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                      <span className={PAYMENT_BADGE[sale.paymentMethod] ?? "badge-muted"}>{sale.paymentMethod}</span>
                      <span
                        className={`badge ${
                          sale.paymentStatus === "Paid"
                            ? "badge-success"
                            : sale.paymentStatus === "Partial"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {sale.paymentStatus || "Paid"}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(sale.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {sale.balanceDue > 0 && (
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => handleOpenCollectPayment(sale)}
                          title="Collect Receivable Balance"
                          style={{ color: "var(--color-success)" }}
                        >
                          <Banknote size={14} />
                        </button>
                      )}
                      <button className="btn-ghost btn-sm" onClick={() => setSelectedSale(sale)} title="View">
                        <Eye size={14} />
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(sale)} title="Edit Sale">
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => handleDeleteSale(sale.id)}
                        title="Delete Sale"
                        style={{ color: "var(--color-error)" }}
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

      {/* View Sale Modal */}
      {selectedSale && !showEditModal && !showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 480, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>
                  {selectedSale.saleType || "Retail"} Sale Details
                </h3>
                <span style={{ fontSize: 13, color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedSale.id}</span>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedSale(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              <div><strong>Channel:</strong> <span className={selectedSale.saleType === "Wholesale" ? "badge-accent" : "badge-muted"}>{selectedSale.saleType || "Retail"}</span></div>
              <div><strong>Customer:</strong> {selectedSale.customerName}</div>
              <div><strong>Product:</strong> {selectedSale.productName} ({selectedSale.size} {selectedSale.color})</div>
              <div><strong>Quantity:</strong> {selectedSale.quantity} pcs</div>
              <div><strong>Net Revenue (IFRS 15):</strong> {formatNaira(selectedSale.amount)}</div>
              {selectedSale.discount > 0 && <div><strong>Trade Discount:</strong> {formatNaira(selectedSale.discount)}</div>}
              {selectedSale.vatAmount > 0 && <div><strong>Output VAT (7.5% FIRS):</strong> {formatNaira(selectedSale.vatAmount)}</div>}
              <div><strong>Total Invoice:</strong> <strong>{formatNaira(selectedSale.totalInvoice ?? selectedSale.amount)}</strong></div>
              <div><strong>Amount Paid:</strong> <span style={{ color: "var(--color-success)", fontWeight: 700 }}>{formatNaira(selectedSale.amountPaid)}</span></div>
              {selectedSale.balanceDue > 0 && (
                <div><strong>Balance Due (Trade Receivable):</strong> <span style={{ color: "var(--color-warning)", fontWeight: 700 }}>{formatNaira(selectedSale.balanceDue)}</span></div>
              )}
              {selectedSale.dueDate && <div><strong>Due Date:</strong> {formatDate(selectedSale.dueDate)}</div>}
              <div><strong>Payment Method:</strong> {selectedSale.paymentMethod} ({selectedSale.paymentStatus || "Paid"})</div>
              {selectedSale.notes && <div><strong>Notes:</strong> {selectedSale.notes}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
              <button
                className="btn-accent"
                style={{ backgroundColor: "var(--color-primary, #4F46E5)", color: "white" }}
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Receipt
              </button>
              {selectedSale.balanceDue > 0 && (
                <button className="btn-accent" onClick={() => setShowPaymentModal(true)}>
                  <Banknote size={16} /> Collect Balance
                </button>
              )}
              {selectedSale.status !== "Confirmed" && (
                <button className="btn-accent" onClick={() => handleConfirmSale(selectedSale.id)}>
                  <CheckCircle size={16} /> Confirm Sale
                </button>
              )}
              <button className="btn-outline" onClick={() => setSelectedSale(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment / Settle Trade Receivable Modal */}
      {showPaymentModal && selectedSale && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 420, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Collect Receivable Payment</h3>
              <button className="btn-ghost" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 14 }}>
              Customer: <strong>{selectedSale.customerName}</strong> • Remaining Balance:{" "}
              <strong style={{ color: "var(--color-warning)" }}>{formatNaira(selectedSale.balanceDue)}</strong>
            </p>
            <form onSubmit={handleSavePayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Payment Received Now (₦)</label>
                <input
                  type="number"
                  min="0.01"
                  max={selectedSale.balanceDue}
                  step="0.01"
                  className="input"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select className="select" value={paymentMethodInput} onChange={(e) => setPaymentMethodInput(e.target.value)}>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS">POS</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Cash Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record New Sale Modal (Retail & Wholesale) */}
      {showRecordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 560, maxWidth: "100%", maxHeight: "92vh", overflowY: "auto", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Record Sale (Retail / Wholesale)</h3>
              <button className="btn-ghost" onClick={() => setShowRecordModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordSale} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {/* Channel Toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handleChannelChange("Retail")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: saleForm.saleType === "Retail" ? "2px solid var(--color-brand)" : "1px solid var(--color-border)",
                    background: saleForm.saleType === "Retail" ? "var(--color-surface-warm)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <Store size={16} /> Retail Sale
                </button>
                <button
                  type="button"
                  onClick={() => handleChannelChange("Wholesale")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: saleForm.saleType === "Wholesale" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                    background: saleForm.saleType === "Wholesale" ? "var(--color-surface-warm)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <Boxes size={16} /> Wholesale Sale
                </button>
              </div>

              <div>
                <label className="label">Customer Name</label>
                <input
                  name="customer"
                  list="customers-list"
                  className="input"
                  placeholder="Walk-in or Wholesale Buyer Name"
                  value={saleForm.customer}
                  onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
                  required
                />
                <datalist id="customers-list">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="label">Product &amp; Variant</label>
                <select name="product" className="select" value={saleForm.variantId} onChange={handleProductChange} required>
                  {flatVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.displayName} — Retail: {formatNaira(v.price)}
                      {Number(v.wholesalePrice) > 0 ? ` | Wholesale: ${formatNaira(v.wholesalePrice)}` : ""} ({v.stock} left)
                    </option>
                  ))}
                </select>
                {selectedVariantObj && saleForm.saleType === "Wholesale" && (
                  <div style={{ fontSize: 11.5, color: "var(--color-accent)", marginTop: 4 }}>
                    Wholesale MOQ: {selectedVariantObj.wholesaleMinQty ?? 6} pairs
                    {Number(selectedVariantObj.wholesalePrice) <= 0 ? " • Wholesale price not set on product (using Retail price)" : ""}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    name="qty"
                    className="input"
                    type="number"
                    min="1"
                    value={saleForm.qty}
                    onChange={(e) => setSaleForm({ ...saleForm, qty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    required
                  />
                </div>
                <div>
                  <label className="label">{saleForm.saleType} Unit Price (₦)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={saleForm.unitPrice}
                    onChange={(e) => setSaleForm({ ...saleForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Trade Discount (₦)</label>
                  <input
                    name="discount"
                    className="input"
                    type="number"
                    min="0"
                    value={saleForm.discount}
                    onChange={(e) => setSaleForm({ ...saleForm, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={saleForm.applyVat}
                  onChange={(e) => setSaleForm({ ...saleForm, applyVat: e.target.checked })}
                />
                Apply 7.5% FIRS Output VAT (recognised separately as Statutory Liability)
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Settlement Terms</label>
                  <select
                    className="select"
                    value={saleForm.paymentStatus}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentStatus: e.target.value as any })}
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Partial">Partial Deposit</option>
                    <option value="Credit">On Credit (Receivable)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="select"
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                  >
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Status</label>
                  <select
                    name="status"
                    className="select"
                    value={saleForm.status}
                    onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value })}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {saleForm.paymentStatus === "Partial" && (
                <div>
                  <label className="label">Amount Paid Now (₦)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max={totalInvoice}
                    step="0.01"
                    value={saleForm.amountPaid}
                    onChange={(e) => setSaleForm({ ...saleForm, amountPaid: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Sale Date</label>
                  <input
                    name="date"
                    className="input"
                    type="date"
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  />
                </div>
                {(saleForm.paymentStatus === "Partial" || saleForm.paymentStatus === "Credit") && (
                  <div>
                    <label className="label">Credit Due Date</label>
                    <input
                      className="input"
                      type="date"
                      value={saleForm.dueDate}
                      onChange={(e) => setSaleForm({ ...saleForm, dueDate: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div style={{ background: "var(--color-surface-warm)", padding: "10px 14px", borderRadius: 8, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Net Revenue (IFRS 15):</span>
                  <strong>{formatNaira(netRevenue)}</strong>
                </div>
                {vatAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Output VAT (7.5%):</span>
                    <strong>{formatNaira(vatAmount)}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 4 }}>
                  <span>Total Invoice:</span>
                  <strong style={{ color: "var(--color-accent)" }}>{formatNaira(totalInvoice)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 2 }}>
                  <span>Paid Now: {formatNaira(resolvedPaidInput)}</span>
                  <span style={{ color: totalInvoice - resolvedPaidInput > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
                    Receivable: {formatNaira(Math.max(0, totalInvoice - resolvedPaidInput))}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : `Save ${saleForm.saleType} Sale`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sale Modal */}
      {showEditModal && selectedSale && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: 450, maxWidth: "100%", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Edit Sale Details</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Customer Name</label>
                <input name="customer" className="input" defaultValue={selectedSale.customerName} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label className="label">Channel</label>
                  <select name="saleType" className="select" defaultValue={selectedSale.saleType || "Retail"}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select name="status" className="select" defaultValue={selectedSale.status}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select name="paymentMethod" className="select" defaultValue={selectedSale.paymentMethod}>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  name="date"
                  className="input"
                  type="date"
                  defaultValue={selectedSale.createdAt ? new Date(selectedSale.createdAt).toISOString().split("T")[0] : ""}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSale && (
        <Receipt
          saleId={selectedSale.id}
          saleType={selectedSale.saleType || "Retail"}
          items={[
            {
              name: selectedSale.productName,
              quantity: selectedSale.quantity,
              price: (selectedSale.amount + (selectedSale.discount || 0)) / Math.max(1, selectedSale.quantity),
            },
          ]}
          discount={selectedSale.discount || 0}
          vatAmount={selectedSale.vatAmount || 0}
          amountPaid={selectedSale.amountPaid}
          balanceDue={selectedSale.balanceDue || 0}
          total={selectedSale.totalInvoice ?? selectedSale.amount}
          date={new Date(selectedSale.createdAt).toLocaleString()}
          salesRep={selectedSale.customerName}
        />
      )}
    </div>
  );
}
