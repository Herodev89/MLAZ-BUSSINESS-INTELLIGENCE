"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, X, CheckCircle, Printer, Trash2, Edit } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { Receipt } from "@/components/pos/Receipt";
import { getSalesAction, createSaleAction, confirmSaleAction, deleteSaleAction, updateSaleAction } from "@/lib/actions/sales";
import { getProductsAction } from "@/lib/actions/products";

const PAYMENT_BADGE: Record<string, string> = {
  Cash: "badge-success",
  Transfer: "badge-accent",
  POS: "badge-muted",
};

export default function SalesPage() {
  const [salesList, setSalesList] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  // State for the Record Sale form
  const [saleForm, setSaleForm] = useState({
    customer: "Walk-in Customer",
    productId: "",
    productName: "",
    variantId: "",
    size: "",
    color: "",
    qty: 1,
    amount: 0,
    status: "Pending",
    paymentMethod: "Transfer",
    date: ""
  });
  
  // Flatten variants for easy selection
  const flatVariants = products.flatMap(p => 
    (p.variants || []).map((v: any) => ({
      ...v,
      productName: p.name,
      displayName: `${p.name} - ${v.size} ${v.color}`.trim()
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
    setCustomers([{ id: '1', name: 'Walk-in Customer' }]);
  };

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const prods = res.products as any[];
      setProducts(prods);
      
      const flat = prods.flatMap(p => 
        (p.variants || []).map((v: any) => ({
          ...v,
          productName: p.name
        }))
      );
      
      if (flat.length > 0) {
        setSaleForm(prev => ({
          ...prev,
          productId: flat[0].productId,
          productName: flat[0].productName,
          variantId: flat[0].id,
          size: flat[0].size,
          color: flat[0].color,
          amount: flat[0].price * prev.qty
        }));
      }
    }
  };

  const filtered = salesList.filter(s => 
    (s.productName?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.customerName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleRecordSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Instead of FormData, we can pass the specific values including the selected productName
    const formData = new FormData();
    formData.append("customer", saleForm.customer);
    formData.append("product", saleForm.productName);
    formData.append("variantId", saleForm.variantId);
    formData.append("size", saleForm.size);
    formData.append("color", saleForm.color);
    formData.append("qty", saleForm.qty.toString());
    formData.append("amount", saleForm.amount.toString());
    formData.append("status", saleForm.status);
    formData.append("paymentMethod", saleForm.paymentMethod);
    if (saleForm.date) formData.append("date", saleForm.date);

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

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVariantId = e.target.value;
    const variant = flatVariants.find(v => v.id === selectedVariantId);
    if (variant) {
      setSaleForm(prev => ({
        ...prev,
        productId: variant.productId,
        productName: variant.productName,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        amount: variant.price * prev.qty
      }));
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    const variant = flatVariants.find(v => v.id === saleForm.variantId);
    const price = variant ? variant.price : 0;
    setSaleForm(prev => ({
      ...prev,
      qty,
      amount: price * qty
    }));
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
      setSalesList(prev => prev.filter(s => s.id !== saleId));
      if (selectedSale?.id === saleId) setSelectedSale(null);
    } else {
      alert(res.error || "Failed to delete sale");
    }
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">Manage and track your sales transactions</p>
        </div>
        <button className="btn-accent" onClick={() => setShowRecordModal(true)}>
          <Plus size={16} /> Record Sale
        </button>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by transaction ID, customer, or product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Profit</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No sales found.</td></tr>
            ) : (
              filtered.map((sale) => (
                <tr key={sale.id}>
                  <td><span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>{sale.id}</span></td>
                  <td><span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{sale.productName}</span></td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{sale.size} {sale.color}</td>
                  <td style={{ fontWeight: 600 }}>{sale.quantity}</td>
                  <td style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>{formatNaira(sale.amount)}</td>
                  <td style={{ fontWeight: 600, color: "var(--color-success)" }}>{formatNaira(sale.profit)}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{sale.customerName}</td>
                  <td><span className={PAYMENT_BADGE[sale.paymentMethod] ?? "badge-muted"}>{sale.paymentMethod}</span></td>
                  <td><span className={`badge ${sale.status === "Confirmed" ? "badge-success" : "badge-warning"}`}>{sale.status || "Pending"}</span></td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(sale.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
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

      {selectedSale && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Sale Details</h3>
                <span style={{ fontSize: 13, color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedSale.id}</span>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedSale(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><strong>Customer Name:</strong> {selectedSale.customerName}</div>
              <div><strong>Product:</strong> {selectedSale.productName}</div>
              <div><strong>Quantity:</strong> {selectedSale.quantity}</div>
              <div><strong>Amount:</strong> {formatNaira(selectedSale.amount)}</div>
              <div><strong>Payment Method:</strong> {selectedSale.paymentMethod}</div>
              <div><strong>Status:</strong> <span className={`badge ${selectedSale.status === "Confirmed" ? "badge-success" : "badge-warning"}`}>{selectedSale.status || "Pending"}</span></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button 
                className="btn-accent" 
                style={{ backgroundColor: "var(--color-primary, #4F46E5)", color: "white" }}
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Receipt
              </button>
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

      {showRecordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Record New Sale</h3>
              <button className="btn-ghost" onClick={() => setShowRecordModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordSale} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Customer Name</label>
                <input name="customer" className="input" placeholder="Walk-in Customer" value={saleForm.customer} onChange={(e) => setSaleForm({...saleForm, customer: e.target.value})} required />
              </div>
              <div>
                <label className="label">Product & Variant</label>
                <select name="product" className="select" value={saleForm.variantId} onChange={handleProductChange} required>
                  {flatVariants.map(v => (
                    <option key={v.id} value={v.id}>{v.displayName} - {formatNaira(v.price)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Quantity</label>
                  <input name="qty" className="input" type="number" min="1" value={saleForm.qty} onChange={handleQtyChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Total Amount (₦)</label>
                  <input name="amount" className="input" type="number" value={saleForm.amount} readOnly style={{ background: "var(--color-surface-muted)", cursor: "not-allowed" }} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select name="status" className="select" value={saleForm.status} onChange={(e) => setSaleForm({...saleForm, status: e.target.value})}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Payment Method</label>
                  <select name="paymentMethod" className="select" value={saleForm.paymentMethod} onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value})}>
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Date</label>
                <input name="date" className="input" type="date" value={saleForm.date} onChange={(e) => setSaleForm({...saleForm, date: e.target.value})} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowRecordModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Confirm & Save Sale"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedSale && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Edit Sale Details</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Customer Name</label>
                <input name="customer" className="input" defaultValue={selectedSale.customerName} required />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select name="status" className="select" defaultValue={selectedSale.status}>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
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
                <input name="date" className="input" type="date" defaultValue={selectedSale.createdAt ? new Date(selectedSale.createdAt).toISOString().split('T')[0] : ""} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSale && (
        <Receipt
          saleId={selectedSale.id}
          items={[{ name: selectedSale.productName, quantity: selectedSale.quantity, price: selectedSale.amount / selectedSale.quantity }]}
          total={selectedSale.amount}
          date={new Date(selectedSale.createdAt).toLocaleString()}
          salesRep={selectedSale.customerName}
        />
      )}
    </div>
  );
}
