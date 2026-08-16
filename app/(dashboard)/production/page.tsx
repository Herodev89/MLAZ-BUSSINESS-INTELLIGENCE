"use client";

import { useState, useEffect } from "react";
import { Plus, Search, X, Trash2, Edit } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getProductionRunsAction, createProductionRunAction, updateProductionRunAction } from "@/lib/actions/production";
import { getProductsAction } from "@/lib/actions/products";

export default function ProductionPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ variantId: "", qty: "", labour: "", material: "", other: "", status: "Completed" });
  const [products, setProducts] = useState<any[]>([]);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("In Progress");

  useEffect(() => {
    loadRuns();
    loadProducts();
  }, []);

  const loadRuns = async () => {
    const res = await getProductionRunsAction();
    if (res.success) setRuns(res.runs);
  };

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const prods = res.products as any[];
      const flat = prods.flatMap(p => 
        (p.variants || []).map((v: any) => ({
          ...v,
          productName: p.name,
          displayName: `${p.name} - ${v.size} ${v.color}`.trim()
        }))
      );
      setProducts(flat);
    }
  };

  const filtered = runs.filter(p => 
    (p.productName?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (p.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleRecordProduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const variant = products.find(p => p.id === form.variantId);
    
    const data = new FormData();
    data.append("productName", variant?.productName || "");
    data.append("variantId", form.variantId);
    data.append("size", variant?.size || "");
    data.append("color", variant?.color || "");
    data.append("qtyProduced", form.qty.toString());
    data.append("labourCost", form.labour.toString());
    data.append("materialCost", form.material.toString());
    data.append("otherCosts", form.other.toString());
    data.append("status", form.status);
    
    const res = await createProductionRunAction(data);

    if (res.success) {
      setShowRecordModal(false);
      loadRuns();
      setForm({ variantId: "", qty: "", labour: "", material: "", other: "", status: "Completed" });
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteRun = async (id: string) => {
    if (confirm("Are you sure you want to delete this production run?")) {
      alert("Delete not implemented in Phase 2");
    }
  };

  const handleOpenEdit = (run: any) => {
    setSelectedRun(run);
    setEditStatus(run.status || "In Progress");
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRun) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("status", editStatus);
    const res = await updateProductionRunAction(selectedRun.id, formData);
    if (res.success) {
      setShowEditModal(false);
      loadRuns();
    } else {
      alert(res.error || "Failed to update run");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Production</h1>
          <p className="page-subtitle">Track manufacturing runs and production costs</p>
        </div>
        <button className="btn-accent" onClick={() => setShowRecordModal(true)}>
          <Plus size={16} /> Record Production
        </button>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by Run ID or Product..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Qty Produced</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No production runs found.</td></tr>
            ) : (
              filtered.map((run) => (
                <tr key={run.id}>
                  <td><span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>{run.id}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{run.productName}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{run.size} {run.color}</td>
                  <td style={{ fontWeight: 700 }}>{run.qtyProduced}</td>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{formatNaira(run.totalCost)}</td>
                  <td>
                    <span className={`badge ${run.status === "Completed" ? "badge-success" : "badge-warning"}`}>
                      {run.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>{formatDate(run.productionDate)}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(run)} title="Edit Run">
                        <Edit size={14} />
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => handleDeleteRun(run.id)} title="Delete Run" style={{ color: "var(--color-error)" }}>
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

      {showRecordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Record Production Batch</h3>
              <button className="btn-ghost" onClick={() => setShowRecordModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordProduction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Product Variant *</label>
                <select className="input" value={form.variantId} onChange={(e) => setForm({...form, variantId: e.target.value})} required>
                  <option value="">Select product variant...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Quantity Produced *</label>
                  <input className="input" type="number" placeholder="50" value={form.qty} onChange={(e) => setForm({...form, qty: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Labour Cost (₦)</label>
                  <input className="input" type="number" placeholder="0" value={form.labour} onChange={(e) => setForm({...form, labour: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Material Cost (₦)</label>
                  <input className="input" type="number" placeholder="0" value={form.material} onChange={(e) => setForm({...form, material: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Other Costs (₦)</label>
                  <input className="input" type="number" placeholder="0" value={form.other} onChange={(e) => setForm({...form, other: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowRecordModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Record Run"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedRun && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Update Status</h3>
              <button className="btn-ghost" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Status</label>
                <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
