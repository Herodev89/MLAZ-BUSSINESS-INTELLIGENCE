"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";

export default function AdjustStockPage() {
  const [form, setForm] = useState({
    product: "",
    variant: "",
    type: "Adjustment",
    quantity: "",
    note: "",
  });

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/inventory" className="btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Adjust Stock</h1>
          <p className="page-subtitle">Manually record stock additions, damages, or corrections</p>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Adjustment Details</div></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Product *</label>
              <select className="select" value={form.product} onChange={e => setForm({...form, product: e.target.value})}>
                <option value="">Select a product...</option>
                <option value="P001">Classic Pams</option>
                <option value="P002">Leather Sandals</option>
              </select>
            </div>
            
            {form.product && (
              <div>
                <label className="label">Variant (Color & Size) *</label>
                <select className="select" value={form.variant} onChange={e => setForm({...form, variant: e.target.value})}>
                  <option value="">Select variant...</option>
                  <option value="V001">Black · EU 39 (Stock: 8)</option>
                  <option value="V002">Black · EU 40 (Stock: 12)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Adjustment Type *</label>
                <select className="select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="Stock Added">Stock Added</option>
                  <option value="Adjustment">Adjustment (Correction)</option>
                  <option value="Damaged">Damaged / Defective</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity (use - for deduction) *</label>
                <input type="number" className="input" placeholder="e.g. -2 or 5" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="label">Note / Reason</label>
              <input className="input" placeholder="Optional explanation" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn-accent" style={{ padding: "10px 20px" }}><Save size={16} /> Save Adjustment</button>
              <Link href="/inventory" className="btn-outline" style={{ padding: "10px 20px" }}><X size={16} /> Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
