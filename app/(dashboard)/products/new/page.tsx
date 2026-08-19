"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { createProductAction } from "@/lib/actions/products";
import { useRouter } from "next/navigation";

const productCategories = ["Men", "Women", "Unisex", "Kids", "Accessories"];

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "", description: "", material: "",
    brand: "MLAZ", costPrice: "", sellingPrice: "", reorderLevel: "5", status: "Active",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    const variants = [{
      size: "Standard",
      color: "Default",
      price: parseFloat(form.sellingPrice) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      stock: 0,
      sku: form.sku
    }];
    formData.append("variants", JSON.stringify(variants));
    const res = await createProductAction(formData);
    if (res.success) {
      router.push("/products");
    } else {
      alert(res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/products" className="btn-ghost btn-sm" id="back-to-products">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">Create a new footwear product</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Main Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Basic Information</div>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="product-name">Product Name *</label>
                  <input id="product-name" className="input" placeholder="e.g. Classic Pams" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="product-sku">SKU / Product Code *</label>
                  <input id="product-sku" className="input" placeholder="e.g. MLZ-CP-001" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="product-category">Category *</label>
                  <select id="product-category" className="select" value={form.category} onChange={(e) => update("category", e.target.value)}>
                    <option value="">Select category...</option>
                    {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="product-brand">Brand</label>
                  <input id="product-brand" className="input" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="product-material">Material</label>
                <input id="product-material" className="input" placeholder="e.g. Genuine Leather" value={form.material} onChange={(e) => update("material", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  className="input"
                  placeholder="Describe the product..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Pricing</div>
            </div>
            <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="cost-price">Cost Price (₦) *</label>
                <input id="cost-price" type="number" className="input" placeholder="0" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="selling-price">Selling Price (₦) *</label>
                <input id="selling-price" type="number" className="input" placeholder="0" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="reorder-level">Reorder Level</label>
                <input id="reorder-level" type="number" className="input" value={form.reorderLevel} onChange={(e) => update("reorderLevel", e.target.value)} />
              </div>
            </div>
            {form.costPrice && form.sellingPrice && (
              <div className="card-body" style={{ paddingTop: 0 }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--color-surface-warm)",
                    display: "flex",
                    gap: 24,
                    fontSize: "13px",
                  }}
                >
                  <div>
                    Profit per unit:{" "}
                    <strong style={{ color: "var(--color-success)" }}>
                      ₦{(Number(form.sellingPrice) - Number(form.costPrice)).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Margin:{" "}
                    <strong style={{ color: "var(--color-success)" }}>
                      {Math.round(((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.sellingPrice)) * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Image Upload */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Product Image</div>
            </div>
            <div className="card-body">
              <div
                id="image-upload-zone"
                style={{
                  border: "2px dashed var(--color-border)",
                  borderRadius: "10px",
                  padding: "32px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <Upload size={24} style={{ color: "var(--color-text-muted)", margin: "0 auto 8px", display: "block" }} />
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Click to upload image</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 4 }}>PNG, JPG up to 5MB</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Status</div>
            </div>
            <div className="card-body">
              <select id="product-status" className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Save */}
          <button
            id="save-product-btn"
            className="btn-accent"
            onClick={handleSave}
            disabled={isSubmitting}
            style={{ width: "100%", justifyContent: "center", padding: "13px" }}
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Product"}
          </button>
          <Link href="/products" className="btn-outline" style={{ width: "100%", justifyContent: "center" }} id="cancel-product-btn">
            <X size={16} /> Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
