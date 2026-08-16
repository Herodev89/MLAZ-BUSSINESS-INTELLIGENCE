import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Package, Layers } from "lucide-react";
import { getProductByIdAction } from "@/lib/actions/products";
import { formatNaira, getStockStatus } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const res = await getProductByIdAction(params.id);
  if (!res.success || !res.product) notFound();
  
  const product = res.product;

  const totalStock = product.variants.reduce((s: any, v: any) => s + v.stock, 0);
  const colors = Array.from(new Set(product.variants.map((v: any) => v.color))) as any[];
  const sizes  = Array.from(new Set(product.variants.map((v: any) => v.size))).sort() as any[];
  
  // Provide default values since DB schema is simpler
  const profitPerUnit = (product.price || 0) * 0.4; // rough estimate for now
  const margin = 40; 
  const costPrice = (product.price || 0) * 0.6;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/products" className="btn-ghost btn-sm" id="back-btn">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">{product.sku} · {product.category}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/products/${product.id}/variants`} className="btn-outline btn-sm" id="manage-variants-btn">
            <Layers size={15} /> Manage Variants
          </Link>
          <Link href={`/products/${product.id}/edit`} className="btn-accent btn-sm" id="edit-product-btn">
            <Edit size={15} /> Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Product Info Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Product Details</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Brand", value: product.brand || "MLAZ" },
                  { label: "Material", value: product.material || "Standard" },
                  { label: "Category", value: product.category || "General" },
                  { label: "Reorder Level", value: `${product.reorderLevel || 10} pairs per variant` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              {product.description && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{product.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Variant Grid */}
          <div className="card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>Variants — Stock by Size & Color</div>
              <span className="badge-muted">{product.variants.length} variants</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Color</th>
                    {sizes.map((s) => <th key={s} style={{ textAlign: "center" }}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {colors.map((color: any) => (
                    <tr key={color}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "3px",
                              background: color === "Black" ? "#1C0D05" : color === "Brown" ? "#6B3A1F" : color === "Tan" ? "#C4863C" : color === "Cream" || color === "White" ? "#E8DDD0" : "#888",
                              border: "1px solid var(--color-border)",
                            }}
                          />
                          {color}
                        </div>
                      </td>
                      {sizes.map((size) => {
                        const variant = product.variants.find((v) => v.color === color && v.size === size);
                        const status = variant ? getStockStatus(variant.stock, variant.reorderLevel) : null;
                        return (
                          <td key={size} style={{ textAlign: "center" }}>
                            {variant ? (
                              <span className={status!.badgeClass} style={{ minWidth: 40, justifyContent: "center" }}>
                                {variant.stock}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-border-dark)", fontSize: "12px" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pricing Card */}
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Pricing</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Cost Price", value: formatNaira(product.costPrice), color: "var(--color-text-primary)" },
                { label: "Selling Price", value: formatNaira(product.sellingPrice), color: "var(--color-accent)", size: "18px", weight: 800 },
                { label: "Profit Per Pair", value: formatNaira(profitPerUnit), color: "var(--color-success)" },
                { label: "Profit Margin", value: `${margin}%`, color: "var(--color-success)" },
              ].map(({ label, value, color, size, weight }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: weight ?? 700, color, fontSize: size ?? "14px" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Summary */}
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Stock Summary</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Total Pairs</span>
                <span style={{ fontWeight: 700, fontSize: "16px" }}>{totalStock}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Inventory Value</span>
                <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{formatNaira(totalStock * product.costPrice)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Colors</span>
                <span style={{ fontWeight: 600 }}>{colors.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Sizes Available</span>
                <span style={{ fontWeight: 600 }}>{sizes.length}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <span
                  className={
                    product.status === "Active" ? "badge-success" : product.status === "Inactive" ? "badge-muted" : "badge-error"
                  }
                >
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
