"use client";

import { useState, useEffect } from "react";
import { getProductsAction } from "@/lib/actions/products";
import { getStockStatus } from "@/lib/utils";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StockTablePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await getProductsAction();
    if (res.success && res.products) {
      const flat = res.products.flatMap((p: any) => 
        (p.variants || []).map((v: any) => ({
          ...v,
          productName: p.name,
          statusObj: getStockStatus(v.stock, v.reorderLevel || 10)
        }))
      );
      setProducts(flat);
    }
  };

  const filtered = products.filter((v) => {
    const matchSearch = v.productName.toLowerCase().includes(search.toLowerCase()) || 
                        (v.sku && v.sku.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All" || v.statusObj.label === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/inventory" className="btn-ghost btn-sm" title="Back to Inventory">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Stock Table</h1>
          <p className="page-subtitle">View detailed stock levels across all variants</p>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search by product name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Color</th>
              <th>Size</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No stock found.</td></tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{v.productName}</td>
                  <td>{v.color || "Standard"}</td>
                  <td>{v.size || "Standard"}</td>
                  <td style={{ fontWeight: 700 }}>{v.stock}</td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{v.reorderLevel || 10}</td>
                  <td><span className={v.statusObj.badgeClass}>{v.statusObj.label}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
