"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, X, Upload } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { getProductsAction, deleteProductAction } from "@/lib/actions/products";

export default function ProductsPage() {
  const [productList, setProductList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success) setProductList(res.products);
  };

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; sku: string; category: string; basePrice: number; imageUrl: string; variants: any[] }>({
    name: "", sku: "", category: "Shea Butter", basePrice: 0, imageUrl: "", variants: []
  });

  const filtered = productList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalStock = (productId: string) => {
    const p = productList.find((x) => x.id === productId);
    return p?.stock ?? 0;
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProductAction(id);
      if (res.success) loadProducts();
    }
  };

  const handleOpenEdit = (p: any) => {
    setSelectedProduct(p);
    setEditForm({
      name: p.name,
      sku: p.id.slice(0, 8),
      category: "Shea Butter",
      basePrice: p.price,
      imageUrl: "",
      variants: p.variants || [],
    });
    setModalType("edit");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update logic here, for now just close modal as we focus on Phase 1 core logic
    setModalType(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setEditForm({ ...editForm, imageUrl: url });
    }
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updated = [...editForm.variants];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, variants: updated });
  };

  const handleAddVariant = () => {
    setEditForm({
      ...editForm,
      variants: [
        ...editForm.variants,
        { id: `new-${Date.now()}`, size: "", color: "", price: editForm.basePrice, stock: 0, sku: "" }
      ]
    });
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{productList.length} products in catalogue</p>
        </div>
        <Link href="/products/new" className="btn-accent" id="add-product-btn">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Products",   value: productList.length, color: "var(--color-accent)" },
          { label: "Total Stock",      value: productList.reduce((s, p) => s + p.stock, 0), color: "var(--color-brand)" },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input
            id="product-search"
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: "36px" }}
          />
        </div>
        <select
          id="category-filter"
          className="select"
          style={{ width: "auto", height: "36px" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Shea Butter">Shea Butter</option>
        </select>
        <select
          id="status-filter"
          className="select"
          style={{ width: "auto", height: "36px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Total Stock</th>
              <th>Variants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No products found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--color-surface-warm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.name.charAt(0)}
                      </div>
                      <div>
                        <div>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "monospace" }}>{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-muted">Category</span></td>
                  <td style={{ fontWeight: 700 }}>{formatNaira(p.price)}</td>
                  <td style={{ fontWeight: 600 }}>{p.stock} units</td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{p.variants?.length || 0} variant(s)</td>
                  <td><span className="badge-success">Active</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={() => { setSelectedProduct(p); setModalType("view"); }} title="View"><Eye size={14} /></button>
                      <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(p)} title="Edit"><Edit size={14} /></button>
                      <button className="btn-ghost btn-sm text-error" onClick={() => handleDeleteProduct(p.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalType && selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: 550, maxHeight: "90vh", overflowY: "auto", padding: 24, background: "var(--color-surface-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{modalType === "view" ? "Product Details" : "Edit Product & Variants"}</h3>
              <button className="btn-ghost" onClick={() => setModalType(null)}><X size={18} /></button>
            </div>

            {modalType === "view" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: "var(--color-surface-warm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : selectedProduct.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: 18 }}>{selectedProduct.name}</h4>
                    <div style={{ color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedProduct.sku}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Category: {selectedProduct.category}</div>
                  </div>
                </div>
                <hr style={{ borderColor: "var(--color-border)" }} />
                <div><strong>Variants & Stock Levels:</strong></div>
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr><th>Size</th><th>Color</th><th>SKU</th><th>Price</th><th>Stock</th></tr>
                  </thead>
                  <tbody>
                    {(selectedProduct as any).variants?.map((v: any) => (
                      <tr key={v.id}>
                        <td>{v.size}</td>
                        <td>{v.color}</td>
                        <td>{v.sku}</td>
                        <td>{formatNaira(v.price)}</td>
                        <td>{v.stock} pcs</td>
                      </tr>
                    ))}
                    {!(selectedProduct as any).variants?.length && (
                       <tr><td colSpan={5} style={{ textAlign: "center" }}>No variants available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Product Name</label>
                  <input className="input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">SKU</label>
                    <input className="input" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Base Price (₦)</label>
                    <input className="input" type="number" value={editForm.basePrice} onChange={e => setEditForm({ ...editForm, basePrice: parseFloat(e.target.value) || 0 })} required />
                  </div>
                </div>
                <div>
                  <label className="label">Product Image</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />}
                    <label className="btn-outline btn-sm" style={{ cursor: "pointer" }}>
                      <Upload size={14} /> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label">Edit Size Variants & Prices</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4, paddingLeft: 2 }}>
                    <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>Size</div>
                    <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>Color</div>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>Price (₦)</div>
                    <div style={{ width: 80, fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>Stock</div>
                  </div>
                  {editForm.variants.map((v, idx) => (
                    <div key={v.id || idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <input className="input" style={{ width: 80 }} value={v.size} onChange={e => handleUpdateVariant(idx, "size", e.target.value)} placeholder="Size" />
                      <input className="input" style={{ width: 80 }} value={v.color} onChange={e => handleUpdateVariant(idx, "color", e.target.value)} placeholder="Color" />
                      <input className="input" style={{ flex: 1 }} type="number" value={v.price} onChange={e => handleUpdateVariant(idx, "price", parseFloat(e.target.value) || 0)} placeholder="Price" />
                      <input className="input" style={{ width: 80 }} type="number" value={v.stock} onChange={e => handleUpdateVariant(idx, "stock", parseInt(e.target.value) || 0)} placeholder="Stock" />
                    </div>
                  ))}
                  <button type="button" className="btn-outline btn-sm" onClick={handleAddVariant} style={{ marginTop: 8 }}>
                    <Plus size={14} /> Add Variant
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-outline" onClick={() => setModalType(null)}>Cancel</button>
                  <button type="submit" className="btn-accent">Save Variant Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
