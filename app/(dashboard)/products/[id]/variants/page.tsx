"use client";

import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { products } from "@/lib/mock-data/products";
import { notFound } from "next/navigation";
import { useState } from "react";

export default function ManageVariantsPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();

  const [variants, setVariants] = useState([...product.variants]);

  const addVariant = () => {
    setVariants([...variants, { id: `V-NEW-${Date.now()}`, color: "", size: "", stock: 0, reorderLevel: product.reorderLevel }]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/products/${product.id}`} className="btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Manage Variants</h1>
            <p className="page-subtitle">{product.name} ({product.sku})</p>
          </div>
        </div>
        <button className="btn-accent" onClick={addVariant}>
          <Plus size={16} /> Add Variant
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Size (EU)</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id}>
                  <td><input className="input" defaultValue={v.color} placeholder="e.g. Black" /></td>
                  <td><input className="input" defaultValue={v.size} placeholder="e.g. EU 42" /></td>
                  <td><input type="number" className="input" defaultValue={v.stock} /></td>
                  <td><input type="number" className="input" defaultValue={v.reorderLevel} /></td>
                  <td>
                    <button className="btn-ghost" style={{ color: "var(--color-error)", padding: 8 }} onClick={() => removeVariant(v.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    No variants added. Click "Add Variant" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
        <Link href={`/products/${product.id}`} className="btn-outline">Cancel</Link>
        <button className="btn-brand" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "var(--color-brand)", color: "white" }}>
          <Save size={16} /> Save Variants
        </button>
      </div>
    </div>
  );
}
