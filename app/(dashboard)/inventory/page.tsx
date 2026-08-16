"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, AlertTriangle, ListFilter, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getInventoryStatsAction } from "@/lib/actions/inventory";
import KPICard from "@/components/dashboard/KPICard";

export default function InventoryDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPairs: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  useEffect(() => {
    async function loadStats() {
      const res = await getInventoryStatsAction();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage and track your stock</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/inventory/adjust" className="btn-accent">
            <Plus size={16} /> Adjust Stock
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPICard
          id="inv-total-products"
          title="Total Products"
          value={stats.totalProducts}
          icon={ListFilter}
          accentColor="var(--color-brand)"
        />
        <KPICard
          id="inv-total-pairs"
          title="Total Pairs in Stock"
          value={stats.totalPairs}
          icon={BarChart3}
          accentColor="var(--color-accent)"
        />
        <KPICard
          id="inv-value"
          title="Inventory Value"
          value={stats.inventoryValue}
          isCurrency
          compact
          icon={BarChart3}
          accentColor="var(--color-success)"
        />
        <KPICard
          id="inv-low-stock"
          title="Low Stock Variants"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          accentColor="var(--color-warning)"
        />
        <KPICard
          id="inv-out-of-stock"
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={AlertTriangle}
          accentColor="var(--color-error)"
        />
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "15px" }}>Stock View</div></div>
          <div className="card-body">
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 16 }}>
              View and filter your current stock levels for all product variants.
            </p>
            <Link href="/inventory/stock" className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              View Stock Table <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><div style={{ fontWeight: 700, fontSize: "15px" }}>Movements Log</div></div>
          <div className="card-body">
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: 16 }}>
              Track all inventory changes including sales, production, and adjustments.
            </p>
            <Link href="/inventory/movements" className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              View Movements <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
