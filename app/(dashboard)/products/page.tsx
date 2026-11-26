"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  DollarSign,
  PackageCheck,
  Save,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import {
  getProductsAction,
  deleteProductAction,
  updateProductAction,
  registerActiveProductsAction,
  bulkUpdateProductCostsAction,
} from "@/lib/actions/products";
import { PRODUCT_CATEGORIES, ACTIVE_PRODUCTS_CATALOG } from "@/lib/active-products-catalog";
import type { BulkProductCostInput } from "@/lib/active-products-catalog";

export default function ProductsPage() {
  const [productList, setProductList] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [registeringCatalog, setRegisteringCatalog] = useState(false);

  // Single-product View/Edit Modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    sku: string;
    category: string;
    brand: string;
    material: string;
    description: string;
    reorderLevel: number;
    wholesaleMinQty: number;
    basePrice: number;
    baseWholesalePrice: number;
    imageUrl: string;
    status: string;
    variants: any[];
  }>({
    name: "",
    sku: "",
    category: "Men",
    brand: "MLAZ",
    material: "",
    description: "",
    reorderLevel: 5,
    wholesaleMinQty: 6,
    basePrice: 0,
    baseWholesalePrice: 0,
    imageUrl: "",
    status: "Active",
    variants: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // Admin Bulk Cost of Sales & Product Info Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItems, setBulkItems] = useState<(BulkProductCostInput & { name: string; stock: number })[]>([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.role) setUserRole(d.user.role);
      })
      .catch(console.error);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const res = await getProductsAction();
    if (res.success) setProductList(res.products || []);
    setLoading(false);
  };

  const isAdmin = userRole === "ADMIN";
  const canManageProducts = userRole === "ADMIN" || userRole === "STORE_MANAGER";

  const missingCatalogCount = useMemo(() => {
    const existing = new Set(productList.map((p) => String(p.name).trim().toLowerCase()));
    return ACTIVE_PRODUCTS_CATALOG.filter((item) => !existing.has(item.name.trim().toLowerCase())).length;
  }, [productList]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>([...PRODUCT_CATEGORIES]);
    productList.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [productList]);

  const filtered = productList.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
    const matchCategory = categoryFilter === "All" || (p.category || "Footwear") === categoryFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleRegisterActiveCatalog = async () => {
    setRegisteringCatalog(true);
    const res = await registerActiveProductsAction();
    setRegisteringCatalog(false);
    if (res.success) {
      await loadProducts();
      alert(`Registered ${res.added} active product(s) (${res.existing} already present).`);
    } else {
      alert(res.error || "Failed to register active products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProductAction(id);
      if (res.success) loadProducts();
      else alert(res.error || "Failed to delete product");
    }
  };

  const handleOpenEdit = (p: any) => {
    setSelectedProduct(p);
    setEditForm({
      name: p.name,
      sku: p.sku || p.id.slice(0, 8).toUpperCase(),
      category: p.category || "Men",
      brand: p.brand || "MLAZ",
      material: p.material || "",
      description: p.description || "",
      reorderLevel: Number(p.reorderLevel ?? 5),
      wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
      basePrice: p.price || 0,
      baseWholesalePrice: p.wholesalePrice || 0,
      imageUrl: "",
      status: p.status || "Active",
      variants: (p.variants || []).map((v: any) => ({ ...v })),
    });
    setModalType("edit");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("sku", editForm.sku);
    formData.append("category", editForm.category);
    formData.append("brand", editForm.brand);
    formData.append("material", editForm.material);
    formData.append("description", editForm.description);
    formData.append("reorderLevel", String(editForm.reorderLevel));
    formData.append("wholesaleMinQty", String(editForm.wholesaleMinQty));
    formData.append("status", editForm.status);
    formData.append("variants", JSON.stringify(editForm.variants));

    const res = await updateProductAction(selectedProduct.id, formData);
    if (res.success) {
      setModalType(null);
      loadProducts();
    } else {
      alert(res.error || "Failed to update product");
    }
    setIsSaving(false);
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

  const handleRemoveVariant = (index: number) => {
    const updated = editForm.variants.filter((_, i) => i !== index);
    setEditForm({ ...editForm, variants: updated });
  };

  const handleOpenBulkModal = () => {
    const rows = productList
      .filter((p) => p.status !== "Inactive")
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock || 0,
        sku: p.sku || "",
        category: p.category || "Men",
        brand: p.brand || "MLAZ",
        material: p.material || "",
        reorderLevel: Number(p.reorderLevel ?? 5),
        wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
        description: p.description || "",
        status: p.status || "Active",
        price: Number(p.price) || 0,
        wholesalePrice: Number(p.wholesalePrice) || 0,
        costPrice: Number(p.costPrice) || 0,
      }));
    setBulkItems(rows);
    setShowBulkModal(true);
  };

  const updateBulkItem = (index: number, field: keyof BulkProductCostInput, value: any) => {
    const next = [...bulkItems];
    next[index] = { ...next[index], [field]: value };
    setBulkItems(next);
  };

  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBulk(true);
    const payload: BulkProductCostInput[] = bulkItems.map((item) => ({
      id: item.id,
      costPrice: Number(item.costPrice) || 0,
      price: Number(item.price) || 0,
      wholesalePrice: Number(item.wholesalePrice) || 0,
      wholesaleMinQty: Math.max(1, Number(item.wholesaleMinQty) || 6),
      category: item.category,
      sku: item.sku,
      brand: item.brand,
      material: item.material,
      reorderLevel: Number(item.reorderLevel) || 5,
      description: item.description,
      status: item.status,
    }));
    const res = await bulkUpdateProductCostsAction(payload);
    setIsSavingBulk(false);
    if (res.success) {
      setShowBulkModal(false);
      loadProducts();
    } else {
      alert(res.error || "Failed to save cost of sales");
    }
  };

  const activeProducts = productList.filter((p) => p.status !== "Inactive");
  const uncostedActiveCount = activeProducts.filter((p) => !p.costPrice || p.costPrice <= 0).length;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {productList.length} products in catalogue ({activeProducts.length} active)
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isAdmin && missingCatalogCount > 0 && (
            <button
              className="btn-outline"
              onClick={handleRegisterActiveCatalog}
              disabled={registeringCatalog}
              title="Register all missing active MLAZ products with their respective selling prices"
            >
              <PackageCheck size={16} />
              {registeringCatalog ? "Registering..." : `Register Active Catalog (${missingCatalogCount})`}
            </button>
          )}
          {isAdmin && activeProducts.length > 0 && (
            <button className="btn-outline" onClick={handleOpenBulkModal}>
              <DollarSign size={16} /> Cost of Sales &amp; Product Info
            </button>
          )}
          {canManageProducts && (
            <Link href="/products/new" className="btn-accent" id="add-product-btn">
              <Plus size={16} /> Add Product
            </Link>
          )}
        </div>
      </div>

      {/* ── Admin Prompt Banner when Active Products Need Cost of Sales or Registration ── */}
      {isAdmin && missingCatalogCount > 0 && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            background: "var(--color-surface-warm)",
            border: "1px solid var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13 }}>
            <strong>MLAZ Active Product Catalog:</strong> {missingCatalogCount} active product(s) from your catalog are
            not yet registered in this database. Click to register them with their respective selling prices.
          </div>
          <button className="btn-accent btn-sm" onClick={handleRegisterActiveCatalog} disabled={registeringCatalog}>
            <PackageCheck size={14} /> {registeringCatalog ? "Registering..." : `Register ${missingCatalogCount} Active Products`}
          </button>
        </div>
      )}

      {isAdmin && missingCatalogCount === 0 && uncostedActiveCount > 0 && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            background: "var(--color-warning-bg)",
            border: "1px solid rgba(199,123,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13 }}>
            <strong>Admin Cost of Sales Setup:</strong> {uncostedActiveCount} active product(s) do not have a Cost of
            Sales (COGS) entered yet. Enter their respective Cost of Sales &amp; details for accurate profit and IAS 2
            inventory valuation.
          </div>
          <button className="btn-accent btn-sm" onClick={handleOpenBulkModal}>
            <DollarSign size={14} /> Enter Cost of Sales
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total System Products", value: productList.length, color: "var(--color-text-secondary)" },
          { label: "Total Active Products", value: activeProducts.length, color: "var(--color-accent)" },
          {
            label: "Total Active Stock",
            value: activeProducts.reduce((s: number, p: any) => s + (p.stock || 0), 0),
            color: "var(--color-brand)",
          },
          {
            label: "Active Retail Stock Value",
            value: formatNaira(activeProducts.reduce((s: number, p: any) => s + (p.stock || 0) * (p.price || 0), 0)),
            color: "var(--color-success)",
          },
          ...(isAdmin
            ? [
                {
                  label: "Active Inventory at Cost (IAS 2)",
                  value: formatNaira(activeProducts.reduce((s: number, p: any) => s + (p.stock || 0) * (p.costPrice || 0), 0)),
                  color: "var(--color-warning)",
                },
              ]
            : []),
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div
        className="card"
        style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}
      >
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
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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
              <th>Retail Price</th>
              <th>Wholesale Price</th>
              {isAdmin && <th>Cost of Sales (COGS)</th>}
              {isAdmin && <th>Margin</th>}
              <th>Total Stock</th>
              <th>Variants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 10 : 8} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 10 : 8} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const marginPct = p.price > 0 && p.costPrice > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : null;
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "var(--color-surface-warm)",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            p.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div>{p.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                            {p.sku}
                            {p.material ? ` • ${p.material}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-muted">{p.category || "Footwear"}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatNaira(p.price)}</td>
                    <td style={{ fontWeight: 600, color: p.wholesalePrice > 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                      {p.wholesalePrice > 0 ? (
                        <div>
                          <div>{formatNaira(p.wholesalePrice)}</div>
                          <div style={{ fontSize: 10.5, color: "var(--color-text-muted)" }}>MOQ: {p.wholesaleMinQty ?? 6} pcs</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12 }}>Not Set</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={{ fontWeight: 600, color: p.costPrice > 0 ? "var(--color-text-primary)" : "var(--color-warning)" }}>
                        {p.costPrice > 0 ? formatNaira(p.costPrice) : "Not Set"}
                      </td>
                    )}
                    {isAdmin && (
                      <td>
                        {marginPct !== null ? (
                          <span className={marginPct >= 20 ? "badge-success" : "badge-warning"}>{marginPct}%</span>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    )}
                    <td style={{ fontWeight: 600 }}>{p.stock} units</td>
                    <td style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{p.variants?.length || 0} variant(s)</td>
                    <td>
                      {p.status === "Inactive" ? (
                        <span className="badge-error">Inactive</span>
                      ) : (
                        <span className="badge-success">Active</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => {
                            setSelectedProduct(p);
                            setModalType("view");
                          }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {canManageProducts && (
                          <button className="btn-ghost btn-sm" onClick={() => handleOpenEdit(p)} title="Edit Product & Cost">
                            <Edit size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            className="btn-ghost btn-sm text-error"
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 1: SINGLE PRODUCT VIEW / EDIT
         ══════════════════════════════════════════════════════════════════ */}
      {modalType && selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{ width: 640, maxWidth: "100%", maxHeight: "92vh", overflowY: "auto", padding: 24, background: "var(--color-surface-card)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>
                {modalType === "view" ? "Product Details" : "Edit Product, Cost of Sales & Variants"}
              </h3>
              <button className="btn-ghost" onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>

            {modalType === "view" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      background: "var(--color-surface-warm)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      fontWeight: 800,
                    }}
                  >
                    {selectedProduct.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      selectedProduct.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{selectedProduct.name}</h4>
                    <div style={{ color: "var(--color-accent)", fontFamily: "monospace", fontSize: 13 }}>
                      SKU: {selectedProduct.sku} • Brand: {selectedProduct.brand || "MLAZ"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                      Category: {selectedProduct.category} • Material: {selectedProduct.material || "Standard"} • Reorder
                      Level: {selectedProduct.reorderLevel ?? 5}
                    </div>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)", background: "var(--color-surface-warm)", padding: 10, borderRadius: 8 }}>
                    {selectedProduct.description}
                  </div>
                )}
                <hr style={{ borderColor: "var(--color-border)" }} />
                <div>
                  <strong>Variants &amp; Pricing:</strong>
                </div>
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Color</th>
                      <th>SKU</th>
                      {isAdmin && <th>Cost of Sales</th>}
                      <th>Retail Price</th>
                      <th>Wholesale Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProduct.variants?.map((v: any) => (
                      <tr key={v.id}>
                        <td>{v.size}</td>
                        <td>{v.color}</td>
                        <td>{v.sku}</td>
                        {isAdmin && <td>{formatNaira(v.costPrice)}</td>}
                        <td>{formatNaira(v.price)}</td>
                        <td>{v.wholesalePrice > 0 ? formatNaira(v.wholesalePrice) : "—"}</td>
                        <td>{v.stock} pcs</td>
                      </tr>
                    ))}
                    {!selectedProduct.variants?.length && (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: "center" }}>
                          No variants available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Product Name</label>
                    <input
                      className="input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">SKU / Product Code</label>
                    <input
                      className="input"
                      value={editForm.sku}
                      onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Category</label>
                    <select
                      className="select"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Brand</label>
                    <input
                      className="input"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Material</label>
                    <input
                      className="input"
                      value={editForm.material}
                      onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                      placeholder="e.g. Leather / Nora Sole"
                    />
                  </div>
                  <div>
                    <label className="label">Reorder Level</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={editForm.reorderLevel}
                      onChange={(e) => setEditForm({ ...editForm, reorderLevel: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="label">Wholesale Min Qty (MOQ)</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={editForm.wholesaleMinQty}
                      onChange={(e) => setEditForm({ ...editForm, wholesaleMinQty: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description / Production Notes</label>
                  <input
                    className="input"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Product specifications, sole type, packaging notes..."
                  />
                </div>

                <div>
                  <label className="label">Product Image</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {editForm.imageUrl && (
                      <img src={editForm.imageUrl} alt="preview" style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />
                    )}
                    <label className="btn-outline btn-sm" style={{ cursor: "pointer" }}>
                      <Upload size={14} /> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label">
                    Variants, Retail/Wholesale Pricing, COGS &amp; Stock {!isAdmin && "(Cost of Sales restricted to Admin)"}
                  </label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                    <div style={{ width: 65, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>Size</div>
                    <div style={{ width: 70, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>Color</div>
                    {isAdmin && (
                      <div style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
                        COGS (₦)
                      </div>
                    )}
                    <div style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
                      Retail (₦)
                    </div>
                    <div style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
                      Wholesale (₦)
                    </div>
                    <div style={{ width: 60, fontSize: 11.5, fontWeight: 600, color: "var(--color-text-muted)" }}>Stock</div>
                    <div style={{ width: 32 }}></div>
                  </div>
                  {editForm.variants.map((v, idx) => (
                    <div key={v.id || idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                      <input
                        className="input"
                        style={{ width: 65, padding: "6px 8px" }}
                        value={v.size}
                        onChange={(e) => handleUpdateVariant(idx, "size", e.target.value)}
                        placeholder="Size"
                      />
                      <input
                        className="input"
                        style={{ width: 70, padding: "6px 8px" }}
                        value={v.color}
                        onChange={(e) => handleUpdateVariant(idx, "color", e.target.value)}
                        placeholder="Color"
                      />
                      {isAdmin && (
                        <input
                          className="input"
                          style={{ flex: 1, padding: "6px 8px" }}
                          type="number"
                          min="0"
                          step="0.01"
                          value={v.costPrice ?? ""}
                          onChange={(e) => handleUpdateVariant(idx, "costPrice", parseFloat(e.target.value) || 0)}
                          placeholder="COGS"
                        />
                      )}
                      <input
                        className="input"
                        style={{ flex: 1, padding: "6px 8px" }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, "price", parseFloat(e.target.value) || 0)}
                        placeholder="Retail"
                        disabled={!isAdmin}
                      />
                      <input
                        className="input"
                        style={{ flex: 1, padding: "6px 8px" }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.wholesalePrice ?? ""}
                        onChange={(e) => handleUpdateVariant(idx, "wholesalePrice", parseFloat(e.target.value) || 0)}
                        placeholder="Wholesale"
                        disabled={!isAdmin}
                      />
                      <input
                        className="input"
                        style={{ width: 60, padding: "6px 8px" }}
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(idx, "stock", parseInt(e.target.value, 10) || 0)}
                        placeholder="Stock"
                      />
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        style={{ color: "var(--color-error)", padding: 6 }}
                        onClick={() => handleRemoveVariant(idx)}
                        title="Remove variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() =>
                      setEditForm({
                        ...editForm,
                        variants: [
                          ...editForm.variants,
                          {
                            id: `new-${Date.now()}`,
                            size: "Standard",
                            color: "Default",
                            price: editForm.basePrice,
                            wholesalePrice: editForm.baseWholesalePrice,
                            costPrice: 0,
                            stock: 0,
                            sku: editForm.sku,
                          },
                        ],
                      })
                    }
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    <Plus size={14} /> Add Variant
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-outline" onClick={() => setModalType(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-accent" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 2: ADMIN BULK COST OF SALES & PRODUCT INFORMATION EDITOR
         ══════════════════════════════════════════════════════════════════ */}
      {showBulkModal && isAdmin && (
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
              width: 1100,
              maxWidth: "100%",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              background: "var(--color-surface-card)",
            }}
          >
            <div
              className="card-header"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
            >
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>
                  Admin: Cost of Sales (COGS) &amp; Product Information Editor
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", margin: "2px 0 0 0" }}>
                  Enter the unit Cost of Sales (COGS), Selling Price, Category, Material, SKU &amp; Reorder Level for all
                  active products
                </p>
              </div>
              <button className="btn-ghost" onClick={() => setShowBulkModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
              <div style={{ overflowY: "auto", overflowX: "auto", flex: 1 }}>
                <table className="table font-tabular" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: 195 }}>Active Product</th>
                      <th style={{ minWidth: 105 }}>SKU</th>
                      <th style={{ minWidth: 115 }}>Category</th>
                      <th style={{ minWidth: 125 }}>Material / Sole</th>
                      <th style={{ width: 75 }}>Reorder</th>
                      <th style={{ width: 75 }}>W. MOQ</th>
                      <th style={{ minWidth: 115 }}>Retail (₦)</th>
                      <th style={{ minWidth: 115 }}>Wholesale (₦)</th>
                      <th style={{ minWidth: 120 }}>Cost of Sales (₦)</th>
                      <th style={{ width: 95, textAlign: "right" }}>Profit / Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkItems.map((item, idx) => {
                      const unitProfit = (Number(item.price) || 0) - (Number(item.costPrice) || 0);
                      const margin =
                        item.price > 0 && item.costPrice > 0 ? Math.round((unitProfit / item.price) * 100) : null;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Stock: {item.stock} units</div>
                          </td>
                          <td>
                            <input
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12 }}
                              value={item.sku}
                              onChange={(e) => updateBulkItem(idx, "sku", e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="select"
                              style={{ padding: "5px 24px 5px 8px", fontSize: 12 }}
                              value={item.category}
                              onChange={(e) => updateBulkItem(idx, "category", e.target.value)}
                            >
                              {availableCategories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12 }}
                              value={item.material}
                              onChange={(e) => updateBulkItem(idx, "material", e.target.value)}
                              placeholder="Leather / Sole"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12 }}
                              value={item.reorderLevel}
                              onChange={(e) => updateBulkItem(idx, "reorderLevel", parseInt(e.target.value, 10) || 0)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12 }}
                              value={item.wholesaleMinQty}
                              onChange={(e) => updateBulkItem(idx, "wholesaleMinQty", Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12, fontWeight: 600 }}
                              value={item.price}
                              onChange={(e) => updateBulkItem(idx, "price", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input"
                              style={{ padding: "5px 8px", fontSize: 12, fontWeight: 600 }}
                              value={item.wholesalePrice || ""}
                              placeholder="Wholesale"
                              onChange={(e) => updateBulkItem(idx, "wholesalePrice", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="input"
                              style={{
                                padding: "5px 8px",
                                fontSize: 12,
                                fontWeight: 700,
                                borderColor: item.costPrice > 0 ? "var(--color-border)" : "var(--color-warning)",
                              }}
                              value={item.costPrice || ""}
                              placeholder="Enter COGS"
                              onChange={(e) => updateBulkItem(idx, "costPrice", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {item.costPrice > 0 ? (
                              <div>
                                <div style={{ fontWeight: 700, color: unitProfit >= 0 ? "var(--color-success)" : "var(--color-error)" }}>
                                  {formatNaira(unitProfit)}
                                </div>
                                {margin !== null && (
                                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{margin}%</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "var(--color-text-muted)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                className="card-footer"
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button type="button" className="btn-outline" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent" disabled={isSavingBulk}>
                  <Save size={15} /> {isSavingBulk ? "Saving..." : "Save All Cost of Sales & Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
