"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { getInventoryMovementsAction } from "@/lib/actions/inventory";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InventoryMovementsPage() {
  const [inventoryMovements, setInventoryMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    const res = await getInventoryMovementsAction();
    if (res.success) setInventoryMovements(res.movements);
  };

  const filtered = inventoryMovements.filter((m) => {
    const matchSearch = m.productName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/inventory" className="btn-ghost btn-sm" title="Back to Inventory">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="page-title">Inventory Movements</h1>
          <p className="page-subtitle">Track all stock additions, deductions, and adjustments</p>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} />
          <input className="input" placeholder="Search product or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Stock Added">Stock Added</option>
          <option value="Sale">Sale</option>
          <option value="Production">Production</option>
          <option value="Adjustment">Adjustment</option>
          <option value="Damaged">Damaged</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Qty Change</th>
              <th>Type</th>
              <th>Reference/Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>No movements found.</td></tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td><span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--color-text-secondary)" }}>{m.id}</span></td>
                  <td>
                     <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{m.productName}</div>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{m.size} {m.color}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: m.quantity > 0 ? "var(--color-success)" : "var(--color-error)" }}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.type === "Sale" ? "badge-muted" : m.type === "Stock Added" || m.type === "Production" || m.type === "Returned" ? "badge-success" : "badge-warning"}`}>
                      {m.type}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px" }}>
                    {m.reference && <span style={{ color: "var(--color-accent)", marginRight: 8 }}>{m.reference}</span>}
                    <span style={{ color: "var(--color-text-muted)" }}>{m.note}</span>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "12px" }}>{formatDate(m.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
