"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatNaira, formatDate } from "@/lib/utils";
import { Search, ExternalLink } from "lucide-react";
import { getSalesAction } from "@/lib/actions/sales";

const PAYMENT_BADGE: Record<string, string> = {
  Cash:     "badge-success",
  Transfer: "badge-accent",
  POS:      "badge-muted",
};

export default function RecentSalesTable() {
  const [search, setSearch] = useState("");
  const [salesList, setSalesList] = useState<any[]>([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const res = await getSalesAction();
    if (res.success) {
      // Get only the most recent 10 sales
      setSalesList(res.sales.slice(0, 10));
    }
  };

  const filtered = salesList.filter((s) =>
    (s.productName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.customerName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="card" style={{ marginTop: 24 }}>
      {/* Header */}
      <div
        className="card-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Recent Sales
          </div>
          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
            Latest {salesList.length} transactions
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div className="search-input-wrap" style={{ width: 220 }}>
            <Search size={14} />
            <input
              id="recent-sales-search"
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: "34px" }}
            />
          </div>

          <Link href="/sales" className="btn-outline btn-sm" id="view-all-sales-btn">
            View All
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Product</th>
              <th>Size / Color</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Profit</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No results found for &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)", fontFamily: "monospace" }}>
                      {sale.id}
                    </span>
                  </td>
                  <td>
                     <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {sale.productName}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      {sale.size} {sale.color}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{sale.quantity}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {formatNaira(sale.amount)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
                      {formatNaira(sale.profit || 0)}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)" }}>{sale.customerName}</td>
                  <td>
                    <span className={PAYMENT_BADGE[sale.paymentMethod] ?? "badge-muted"}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                    {formatDate(sale.createdAt)}
                  </td>
                  <td>
                    <Link
                      href={`/sales/${sale.id}`}
                      style={{ color: "var(--color-accent)", display: "inline-flex" }}
                      title="View detail"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
