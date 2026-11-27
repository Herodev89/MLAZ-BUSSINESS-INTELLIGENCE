"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Store, Boxes } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { getProductsAction } from "@/lib/actions/products";
import { getCustomersAction } from "@/lib/actions/customers";
import { createSaleAction } from "@/lib/actions/sales";
import { useRouter } from "next/navigation";

export default function RecordSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([getProductsAction(), getCustomersAction()]);
      if (pRes.success) {
        const prods = pRes.products as any[];
        const flat = prods
          .filter((p) => p.status !== "Inactive")
          .flatMap((p) =>
            (p.variants || []).map((v: any) => ({
              ...v,
              productName: p.name,
              wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
              displayName: `${p.name} - ${v.size} ${v.color}`.trim(),
            }))
          );
        setProducts(flat);
      }
      if (cRes.success && cRes.customers) setCustomers(cRes.customers);
    }
    load();
  }, []);

  const [form, setForm] = useState({
    saleType: "Retail" as "Retail" | "Wholesale",
    variantId: "",
    customerId: "",
    quantity: 1,
    sellingPrice: 0,
    discount: 0,
    applyVat: false,
    paymentStatus: "Paid" as "Paid" | "Partial" | "Credit",
    amountPaid: 0,
    dueDate: "",
    paymentMethod: "Cash",
    status: "Confirmed",
    notes: "",
  });

  const variant = products.find((p) => p.id === form.variantId);
  const customer = customers.find((c) => c.id === form.customerId);

  const grossSubtotal = Math.max(0, form.quantity * form.sellingPrice);
  const netRevenue = Math.max(0, grossSubtotal - (Number(form.discount) || 0));
  const vatAmount = form.applyVat ? Math.round(netRevenue * 0.075 * 100) / 100 : 0;
  const totalInvoice = Math.round((netRevenue + vatAmount) * 100) / 100;
  const effectivePaid =
    form.paymentStatus === "Paid"
      ? totalInvoice
      : form.paymentStatus === "Credit"
      ? 0
      : Math.min(totalInvoice, Math.max(0, Number(form.amountPaid) || 0));
  const balanceDue = Math.max(0, Math.round((totalInvoice - effectivePaid) * 100) / 100);

  const unitCost = variant ? Number(variant.costPrice) || 0 : 0;
  const estimatedCost = unitCost * form.quantity;
  const estimatedProfit = netRevenue - estimatedCost;

  const handleChannelSwitch = (channel: "Retail" | "Wholesale") => {
    const unitPrice = variant
      ? channel === "Wholesale" && Number(variant.wholesalePrice) > 0
        ? Number(variant.wholesalePrice)
        : Number(variant.price) || 0
      : form.sellingPrice;
    const nextQty =
      channel === "Wholesale" && variant
        ? Math.max(form.quantity, Number(variant.wholesaleMinQty ?? 6))
        : form.quantity;

    setForm((prev) => ({
      ...prev,
      saleType: channel,
      sellingPrice: unitPrice,
      quantity: nextQty,
      paymentMethod: channel === "Wholesale" ? "Transfer" : prev.paymentMethod,
    }));
  };

  const handleConfirm = async () => {
    if (!variant) {
      alert("Please select a product variant.");
      return;
    }
    setIsSubmitting(true);
    const saleData = new FormData();
    saleData.append("saleType", form.saleType);
    saleData.append("product", variant.productName || "");
    saleData.append("variantId", form.variantId);
    saleData.append("size", variant.size || "");
    saleData.append("color", variant.color || "");
    saleData.append("customer", customer?.name || "Walk-in Customer");
    saleData.append("qty", form.quantity.toString());
    saleData.append("amount", grossSubtotal.toString());
    saleData.append("discount", (Number(form.discount) || 0).toString());
    saleData.append("vatAmount", vatAmount.toString());
    saleData.append("paymentStatus", form.paymentStatus);
    saleData.append("amountPaid", effectivePaid.toString());
    if (form.dueDate) saleData.append("dueDate", form.dueDate);
    saleData.append("paymentMethod", form.paymentMethod);
    saleData.append("status", form.status);
    if (form.notes) saleData.append("notes", form.notes);

    const res = await createSaleAction(saleData);
    if (res.success) {
      setSuccessData({
        id: res.saleId,
        saleType: form.saleType,
        product: variant.displayName,
        customer: customer?.name || "Walk-in Customer",
        qty: form.quantity,
        gross: grossSubtotal,
        discount: Number(form.discount) || 0,
        vatAmount,
        amount: totalInvoice,
        amountPaid: effectivePaid,
        balanceDue,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        date: new Date().toISOString(),
      });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handlePrintReceipt = () => {
    if (!successData) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${successData.saleType} Receipt - ${successData.id}</title>
          <style>
            body { font-family: monospace; padding: 40px; max-width: 420px; margin: 0 auto; color: #000; }
            h2 { text-align: center; margin-bottom: 5px; }
            .subtitle { text-align: center; font-size: 12px; margin-bottom: 16px; color: #555; }
            .divider { border-top: 1px dashed #000; margin: 14px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 7px; font-size: 13px; }
            .total { font-weight: bold; font-size: 17px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>MLAZ LIMITED</h2>
          <div class="subtitle">${successData.saleType.toUpperCase()} INVOICE / RECEIPT</div>
          <div class="row"><span>Receipt No:</span> <span>${successData.id || "N/A"}</span></div>
          <div class="row"><span>Date:</span> <span>${new Date(successData.date).toLocaleString()}</span></div>
          <div class="row"><span>Channel:</span> <span>${successData.saleType}</span></div>
          <div class="divider"></div>
          <div class="row"><span>Customer:</span> <span>${successData.customer}</span></div>
          <div class="row"><span>Product:</span> <span>${successData.product}</span></div>
          <div class="row"><span>Quantity:</span> <span>${successData.qty}</span></div>
          <div class="row"><span>Unit Price:</span> <span>${formatNaira(successData.gross / successData.qty)}</span></div>
          ${successData.discount > 0 ? `<div class="row"><span>Trade Discount:</span> <span>-${formatNaira(successData.discount)}</span></div>` : ""}
          ${successData.vatAmount > 0 ? `<div class="row"><span>Output VAT (7.5%):</span> <span>${formatNaira(successData.vatAmount)}</span></div>` : ""}
          <div class="divider"></div>
          <div class="row total"><span>TOTAL INVOICE:</span> <span>${formatNaira(successData.amount)}</span></div>
          <div class="row"><span>Amount Paid:</span> <span>${formatNaira(successData.amountPaid)}</span></div>
          ${successData.balanceDue > 0 ? `<div class="row"><span>Balance Due (Receivable):</span> <span>${formatNaira(successData.balanceDue)}</span></div>` : ""}
          <div class="row"><span>Method:</span> <span>${successData.paymentMethod} (${successData.paymentStatus})</span></div>
          <div class="divider"></div>
          <div style="text-align: center; margin-top: 26px; font-size: 12px;">Thank you for your business!</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  if (successData) {
    return (
      <div style={{ animation: "fade-in 0.3s ease-out", maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
        <CheckCircle2 size={64} style={{ color: "var(--color-success)", margin: "0 auto 20px" }} />
        <h1 className="page-title" style={{ marginBottom: 10 }}>
          {successData.saleType} Sale Recorded!
        </h1>
        <p className="page-subtitle" style={{ marginBottom: 30 }}>
          Transaction saved with IFRS 15 revenue recognition &amp; inventory update.
        </p>

        <div className="card" style={{ padding: 24, textAlign: "left", marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Channel</span>
            <span className={successData.saleType === "Wholesale" ? "badge-accent" : "badge-muted"}>{successData.saleType}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Product</span>
            <span style={{ fontWeight: 600 }}>{successData.product}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Customer</span>
            <span style={{ fontWeight: 600 }}>{successData.customer}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Total Invoice</span>
            <span style={{ fontWeight: 700, color: "var(--color-accent)", fontSize: 18 }}>{formatNaira(successData.amount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Amount Paid</span>
            <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(successData.amountPaid)}</span>
          </div>
          {successData.balanceDue > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-text-secondary)" }}>Trade Receivable Balance</span>
              <span style={{ fontWeight: 700, color: "var(--color-warning)" }}>{formatNaira(successData.balanceDue)}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button className="btn-outline" onClick={() => router.push("/sales")}>
            <ArrowLeft size={16} /> Back to Sales
          </button>
          <button className="btn-accent" onClick={handlePrintReceipt}>
            Print {successData.saleType} Receipt
          </button>
          <button
            className="btn-outline"
            onClick={() => {
              setSuccessData(null);
              setForm({ ...form, variantId: "", quantity: 1, discount: 0, amountPaid: 0 });
            }}
          >
            Record Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/sales" className="btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Record Sale (Retail &amp; Wholesale)</h1>
          <p className="page-subtitle">Process a Retail or Wholesale transaction under IFRS 15 &amp; IAS 2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sales Channel Toggle */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Sales Channel (IFRS 15.114 Disaggregation)</div>
            </div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => handleChannelSwitch("Retail")}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: form.saleType === "Retail" ? "2px solid var(--color-brand)" : "1px solid var(--color-border)",
                  background: form.saleType === "Retail" ? "var(--color-surface-warm)" : "var(--color-surface-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Store size={20} style={{ color: "var(--color-brand)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Retail Sale</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Standard unit retail price</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChannelSwitch("Wholesale")}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: form.saleType === "Wholesale" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  background: form.saleType === "Wholesale" ? "var(--color-surface-warm)" : "var(--color-surface-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Boxes size={20} style={{ color: "var(--color-accent)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Wholesale Sale</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Bulk pricing, MOQ &amp; credit terms</div>
                </div>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Product &amp; Pricing</div>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Product Variant *</label>
                <select
                  className="select"
                  value={form.variantId}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    const unitPrice = p
                      ? form.saleType === "Wholesale" && Number(p.wholesalePrice) > 0
                        ? Number(p.wholesalePrice)
                        : Number(p.price) || 0
                      : 0;
                    const minQty = p && form.saleType === "Wholesale" ? Math.max(1, Number(p.wholesaleMinQty ?? 6)) : 1;
                    setForm({
                      ...form,
                      variantId: e.target.value,
                      sellingPrice: unitPrice,
                      quantity: minQty,
                    });
                  }}
                >
                  <option value="">Select product variant...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} — Retail: {formatNaira(p.price)}
                      {Number(p.wholesalePrice) > 0 ? ` | Wholesale: ${formatNaira(p.wholesalePrice)}` : ""} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
                {variant && form.saleType === "Wholesale" && (
                  <div style={{ fontSize: 12, color: "var(--color-accent)", marginTop: 6 }}>
                    Wholesale MOQ: {variant.wholesaleMinQty ?? 6} pairs •{" "}
                    {Number(variant.wholesalePrice) > 0
                      ? `Wholesale Rate: ${formatNaira(variant.wholesalePrice)}/unit`
                      : "Wholesale price not set yet — using retail rate (editable below)"}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Quantity *</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </div>
                <div>
                  <label className="label">{form.saleType} Unit Price (₦) *</label>
                  <input
                    type="number"
                    className="input"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="label">Trade Discount (₦)</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.applyVat}
                  onChange={(e) => setForm({ ...form, applyVat: e.target.checked })}
                />
                <span>
                  Charge 7.5% FIRS Output VAT (recognised separately under <strong>Statutory Payables</strong>, excluded from Revenue per IFRS 15.47)
                </span>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Customer, Payment Terms &amp; Receivables (IFRS 9)</div>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Customer</label>
                <select className="select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type || "Retail"} {c.phone ? `• ${c.phone}` : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Settlement Terms *</label>
                  <select
                    className="select"
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
                  >
                    <option value="Paid">Full Payment (Paid)</option>
                    <option value="Partial">Partial Deposit</option>
                    <option value="Credit">On Credit (Trade Receivable)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method *</label>
                  <select className="select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="POS">POS / Card</option>
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Status *</label>
                  <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Confirmed">Confirmed (Control Transferred)</option>
                    <option value="Pending">Pending Dispatch</option>
                  </select>
                </div>
              </div>

              {form.paymentStatus === "Partial" && (
                <div>
                  <label className="label">Amount Paid Now (₦)</label>
                  <input
                    type="number"
                    min={0}
                    max={totalInvoice}
                    className="input"
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) || 0 })}
                  />
                </div>
              )}

              {(form.paymentStatus === "Partial" || form.paymentStatus === "Credit") && (
                <div>
                  <label className="label">Credit Due Date (Trade Receivable Terms)</label>
                  <input
                    type="date"
                    className="input"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="label">Notes / Invoice Reference</label>
                <input
                  className="input"
                  placeholder="Optional invoice notes, PO number, or wholesale terms..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="card">
          <div className="card-header">
            <div style={{ fontWeight: 700, fontSize: "14px" }}>Sale Summary ({form.saleType})</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {variant ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Product</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>
                    {variant.productName}
                    <br />
                    <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {variant.size} {variant.color} (Stock: {variant.stock})
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Customer</span>
                  <span style={{ fontWeight: 600 }}>{customer ? customer.name : "Walk-in"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Gross ({form.quantity} pcs)</span>
                  <span style={{ fontWeight: 600 }}>{formatNaira(grossSubtotal)}</span>
                </div>
                {form.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Trade Discount</span>
                    <span style={{ color: "var(--color-error)" }}>-{formatNaira(form.discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Net Revenue (IFRS 15)</span>
                  <span style={{ fontWeight: 700 }}>{formatNaira(netRevenue)}</span>
                </div>
                {vatAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Output VAT (7.5%)</span>
                    <span>{formatNaira(vatAmount)}</span>
                  </div>
                )}

                <div style={{ borderTop: "1px dashed var(--color-border)", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>Total Invoice</span>
                  <span style={{ fontWeight: 800, fontSize: "18px", color: "var(--color-accent)" }}>{formatNaira(totalInvoice)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Cash Collected</span>
                  <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(effectivePaid)}</span>
                </div>
                {balanceDue > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Trade Receivable</span>
                    <span style={{ fontWeight: 700, color: "var(--color-warning)" }}>{formatNaira(balanceDue)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    Gross Profit {unitCost === 0 ? "(COGS not set)" : ""}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(estimatedProfit)}</span>
                </div>

                <button className="btn-accent" onClick={handleConfirm} style={{ padding: "12px", justifyContent: "center", marginTop: 12 }} disabled={isSubmitting}>
                  <CheckCircle2 size={16} /> {isSubmitting ? "Processing..." : `Confirm ${form.saleType} Sale`}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px 0", fontSize: "13px" }}>
                Select a product variant to calculate Retail or Wholesale pricing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
