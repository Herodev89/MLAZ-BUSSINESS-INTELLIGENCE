"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, X } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { getRawMaterialsAction, createRawMaterialAction } from "@/lib/actions/production";

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [selectedMat, setSelectedMat] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const res = await getRawMaterialsAction();
    if (res.success) setMaterials(res.materials);
  };

  const filtered = materials.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalType("add");
  };

  const handleOpenEdit = (mat: any) => {
    setSelectedMat(mat);
    setModalType("edit");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createRawMaterialAction(formData);

    if (res.success) {
      setModalType(null);
      loadMaterials();
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <p className="page-subtitle">Manage materials for production</p>
        </div>
        <button className="btn-accent" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Material
        </button>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search materials or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Cost per Unit</th>
              <th>Supplier</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No materials found.</td></tr>
            ) : (
              filtered.map((mat) => (
                <tr key={mat.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{mat.name}</td>
                  <td style={{ fontWeight: 700 }}>{mat.quantity} {mat.unit}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{mat.reorderLevel} {mat.unit}</td>
                  <td style={{ fontWeight: 600 }}>{formatNaira(mat.costPerUnit)}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{mat.supplier}</td>
                  <td>
                    <span className={`badge ${mat.status === "In Stock" ? "badge-success" : mat.status === "Low Stock" ? "badge-warning" : "badge-error"}`}>
                      {mat.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(mat)} title="Edit"><Edit size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalType && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 450, padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{modalType === "add" ? "Add Raw Material" : "Edit Raw Material"}</h3>
              <button className="btn-ghost" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label">Material Name</label>
                <input name="name" className="input" defaultValue={modalType === "edit" ? selectedMat?.name : ""} placeholder="Shea Butter Raw" required />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Stock Quantity</label>
                  <input name="quantity" className="input" type="number" defaultValue={modalType === "edit" ? selectedMat?.quantity : ""} placeholder="100" required />
                </div>
                <div style={{ width: 100 }}>
                  <label className="label">Unit</label>
                  <input name="unit" className="input" defaultValue={modalType === "edit" ? selectedMat?.unit : "kg"} placeholder="kg" required />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Reorder Level</label>
                  <input name="reorderLevel" className="input" type="number" defaultValue={modalType === "edit" ? selectedMat?.reorderLevel : ""} placeholder="15" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Cost per Unit (₦)</label>
                  <input name="costPerUnit" className="input" type="number" defaultValue={modalType === "edit" ? selectedMat?.costPerUnit : ""} placeholder="1200" required />
                </div>
              </div>
              <div>
                <label className="label">Supplier Name</label>
                <input name="supplier" className="input" defaultValue={modalType === "edit" ? selectedMat?.supplier : ""} placeholder="Abuja Organics Ltd" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button type="button" className="btn-outline" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn-accent" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Material"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
