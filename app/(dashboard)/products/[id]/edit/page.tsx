"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/active-products-catalog";
import { getProductByIdAction, updateProductAction } from "@/lib/actions/products";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Men",
    description: "",
    material: "",
    brand: "MLAZ",
    costPrice: "",
    sellingPrice: "",
    reorderLevel: "5",
    status: "Active",
  });

  useEffect(() => {
    async function fetchProduct() {
      const res = await getProductByIdAction(params.id);
      if (res.success) {
        setProduct(res.product);
        setForm({
          name: res.product.name,
          sku: res.product.sku || "",
          category: res.product.category || "Men",
          description: res.product.description || "",
          material: res.product.material || "",
          brand: res.product.brand || "MLAZ",
          costPrice: (res.product.costPrice ?? 0).toString(),
          sellingPrice: (res.product.price ?? 0).toString(),
          reorderLevel: (res.product.reorderLevel ?? 5).toString(),
          status: res.product.status || "Active",
        });
      }
    }
    fetchProduct();
  }, [params.id]);

  if (!product) return <div>Loading...</div>;

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    const parsedCost = parseFloat(form.costPrice) || 0;
    const parsedPrice = parseFloat(form.sellingPrice) || 0;
    const updatedVariants = (product.variants || []).map((v: any) => ({
      ...v,
      costPrice: parsedCost,
      price: parsedPrice,
    }));
    formData.append("variants", JSON.stringify(updatedVariants));

    const res = await updateProductAction(product.id, formData);
    setSaving(false);
    if (res.success) {
      router.push(`/products/${product.id}`);
    } else {
      alert(res.error || "Failed to update product");
    }
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/products/${product.id}`} className="btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update {product.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Basic Information</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Product Name *</label><input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
                <div><label className="label">SKU *</label><input className="input" value={form.sku} onChange={(e) => update("sku", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select className="select" value={form.category} onChange={(e) => update("category", e.target.value)}>
                    {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => update("brand", e.target.value)} /></div>
              </div>
              <div><label className="label">Material</label><input className="input" value={form.material} onChange={(e) => update("material", e.target.value)} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Pricing &amp; Cost of Sales</div></div>
            <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">Cost of Sales (COGS) (₦) *</label><input type="number" className="input" value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} /></div>
              <div><label className="label">Selling Price (₦) *</label><input type="number" className="input" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} /></div>
              <div><label className="label">Reorder Level</label><input type="number" className="input" value={form.reorderLevel} onChange={(e) => update("reorderLevel", e.target.value)} /></div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Product Image</div></div>
            <div className="card-body">
              <div style={{ border: "2px dashed var(--color-border)", borderRadius: "10px", padding: "32px 16px", textAlign: "center", cursor: "pointer" }}>
                <Upload size={24} style={{ color: "var(--color-text-muted)", margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Change image</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Status</div></div>
            <div className="card-body">
              <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-accent" style={{ padding: "13px", justifyContent: "center" }}>
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/products/${product.id}`} className="btn-outline" style={{ padding: "13px", justifyContent: "center" }}><X size={16} /> Cancel</Link>
        </div>
      </div>
    </div>
  );
}
