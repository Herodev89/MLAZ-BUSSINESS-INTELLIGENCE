"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { getProductsAction } from "@/lib/actions/products";
import { getCustomersAction } from "@/lib/actions/customers";
import { createSaleAction } from "@/lib/actions/pos";
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
        const flat = prods.flatMap(p => 
          (p.variants || []).map((v: any) => ({
            ...v,
            productName: p.name,
            displayName: `${p.name} - ${v.size} ${v.color}`.trim()
          }))
        );
        setProducts(flat);
      }
      if (cRes.success) setCustomers(cRes.customers);
    }
    load();
  }, []);

  const [form, setForm] = useState({
    variantId: "",
    customerId: "",
    quantity: 1,
    sellingPrice: 0,
    paymentMethod: "Cash",
    status: "Confirmed",
  });

  const variant = products.find((p) => p.id === form.variantId);
  const customer = customers.find((c) => c.id === form.customerId);

  const subtotal = form.quantity * form.sellingPrice;
  const estimatedCost = variant ? (variant.price * 0.5) * form.quantity : 0; // rough cost estimate
  const estimatedProfit = subtotal - estimatedCost;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const saleData = new FormData();
    saleData.append("product", variant?.productName || "");
    saleData.append("variantId", form.variantId);
    saleData.append("size", variant?.size || "");
    saleData.append("color", variant?.color || "");
    saleData.append("customer", customer?.name || "Walk-in Customer");
    saleData.append("qty", form.quantity.toString());
    saleData.append("amount", subtotal.toString());
    saleData.append("paymentMethod", form.paymentMethod);
    saleData.append("status", form.status);

    const res = await createSaleAction(saleData);
    if (res.success) {
      setSuccessData({
        id: res.saleId,
        product: variant?.displayName,
        customer: customer?.name || "Walk-in Customer",
        qty: form.quantity,
        amount: subtotal,
        paymentMethod: form.paymentMethod,
        date: new Date().toISOString()
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
          <title>Receipt - ${successData.id}</title>
          <style>
            body { font-family: monospace; padding: 40px; max-width: 400px; margin: 0 auto; color: #000; }
            h2 { text-align: center; margin-bottom: 5px; }
            .subtitle { text-align: center; font-size: 12px; margin-bottom: 20px; color: #555; }
            .divider { border-top: 1px dashed #000; margin: 15px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>MLAZ LIMITED</h2>
          <div class="subtitle">Guaranteed amble across the globe</div>
          <div class="row"><span>Receipt No:</span> <span>${successData.id || 'N/A'}</span></div>
          <div class="row"><span>Date:</span> <span>${new Date(successData.date).toLocaleString()}</span></div>
          <div class="divider"></div>
          <div class="row"><span>Customer:</span> <span>${successData.customer}</span></div>
          <div class="row"><span>Product:</span> <span>${successData.product}</span></div>
          <div class="row"><span>Quantity:</span> <span>${successData.qty}</span></div>
          <div class="row"><span>Price per unit:</span> <span>${formatNaira(successData.amount / successData.qty)}</span></div>
          <div class="divider"></div>
          <div class="row total"><span>TOTAL:</span> <span>${formatNaira(successData.amount)}</span></div>
          <div class="row"><span>Payment:</span> <span>${successData.paymentMethod}</span></div>
          <div class="divider"></div>
          <div style="text-align: center; margin-top: 30px; font-size: 12px;">Thank you for your business!</div>
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
        <h1 className="page-title" style={{ marginBottom: 10 }}>Sale Recorded Successfully!</h1>
        <p className="page-subtitle" style={{ marginBottom: 30 }}>The sale has been saved to the database.</p>
        
        <div className="card" style={{ padding: 24, textAlign: "left", marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Product</span>
            <span style={{ fontWeight: 600 }}>{successData.product}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Customer</span>
            <span style={{ fontWeight: 600 }}>{successData.customer}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>Total Amount</span>
            <span style={{ fontWeight: 700, color: "var(--color-accent)", fontSize: 18 }}>{formatNaira(successData.amount)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button className="btn-outline" onClick={() => router.push("/sales")}>
            <ArrowLeft size={16} /> Back to Sales
          </button>
          <button className="btn-accent" onClick={handlePrintReceipt}>
            Print Receipt
          </button>
          <button className="btn-outline" onClick={() => {
            setSuccessData(null);
            setForm({ ...form, variantId: "", quantity: 1 });
          }}>
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
          <h1 className="page-title">Record Sale</h1>
          <p className="page-subtitle">Process a new transaction</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Product Details</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Product *</label>
                <select 
                  className="select" 
                  value={form.variantId} 
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    setForm({ ...form, variantId: e.target.value, sellingPrice: p?.price || 0 });
                  }}
                >
                  <option value="">Select product variant...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.displayName} - {formatNaira(p.price)}</option>)}
                </select>
              </div>
              


              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Quantity *</label>
                  <input type="number" className="input" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Selling Price (₦) *</label>
                  <input type="number" className="input" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Customer & Payment</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Customer (Optional)</label>
                <select className="select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Payment Method *</label>
                  <select className="select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status *</label>
                  <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Sale Summary</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {variant ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Product</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{variant.productName}<br/><span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{variant.size} {variant.color}</span></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Customer</span>
                  <span style={{ fontWeight: 600 }}>{customer ? customer.name : "Walk-in"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Payment</span>
                  <span style={{ fontWeight: 600 }}>{form.paymentMethod}</span>
                </div>
                
                <div style={{ borderTop: "1px dashed var(--color-border)", margin: "8px 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Quantity</span>
                  <span style={{ fontWeight: 600 }}>{form.quantity}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Total Amount</span>
                  <span style={{ fontWeight: 800, fontSize: "18px", color: "var(--color-accent)" }}>{formatNaira(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Estimated Profit</span>
                  <span style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(estimatedProfit)}</span>
                </div>

                <button className="btn-accent" onClick={handleConfirm} style={{ padding: "12px", justifyContent: "center", marginTop: 16 }} disabled={isSubmitting}>
                  <CheckCircle2 size={16} /> {isSubmitting ? "Processing..." : "Confirm Sale"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "20px 0", fontSize: "13px" }}>
                Select a product to view summary.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
