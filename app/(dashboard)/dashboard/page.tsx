import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Package,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import {
  SalesByProductChart,
  SalesByPaymentChart,
  SalesByCategoryChart,
  SalesBySizeChart,
  SalesByColorChart,
} from "@/components/dashboard/SalesCharts";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getDashboardStatsAction } from "@/lib/actions/dashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const res = await getDashboardStatsAction();
  const stats = res.success ? res.stats : {
    totalRevenue: 0,
    totalProfit: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    totalSales: 0,
    pairsSold: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    totalExpenses: 0,
    totalRawMaterialsCost: 0,
    cogs: 0,
  };
  const charts = res.success ? res.charts : {
    revenueTrend: [],
    salesByProduct: [],
    salesByPayment: [],
    salesByCategory: [],
    salesBySize: [],
    salesByColor: [],
  };

  const { totalExpenses = 0, totalRawMaterialsCost = 0 } = stats;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{today} — Business overview at a glance</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/sales/new" className="btn-accent btn-sm" id="quick-add-sale-btn">
              + Record Sale
            </Link>
            <Link href="/reports" className="btn-outline btn-sm" id="quick-reports-btn">
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {stats.lowStockCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--color-warning-bg)",
            border: "1px solid rgba(199,123,0,0.25)",
            marginBottom: 24,
          }}
          id="low-stock-banner"
        >
          <AlertTriangle size={16} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
          <span style={{ fontSize: "13px", color: "var(--color-warning)", fontWeight: 600 }}>
            {stats.lowStockCount} products are running low on stock.
          </span>
          <Link
            href="/inventory/stock"
            style={{ fontSize: "13px", color: "var(--color-warning)", marginLeft: "auto", fontWeight: 700, textDecoration: "underline" }}
          >
            View →
          </Link>
        </div>
      )}

      {/* ── KPI Cards Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
        id="kpi-grid"
      >
        <Link href="/sales" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-revenue"
            title="Total Revenue"
            value={stats.totalRevenue}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={DollarSign}
            accentColor="var(--color-accent)"
          />
        </Link>
        <Link href="/reports" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-cogs"
            title="Cost of Goods (COGS)"
            value={stats.cogs || 0}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={Activity}
            accentColor="var(--color-warning)"
          />
        </Link>
        <Link href="/reports" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-profit"
            title="Net Profit"
            value={stats.totalProfit}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={TrendingUp}
            accentColor="var(--color-success)"
          />
        </Link>
        <Link href="/expenses" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-expenses"
            title="Total Expenses"
            value={totalExpenses}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={DollarSign}
            accentColor="var(--color-error)"
          />
        </Link>
        <Link href="/raw-materials" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-raw-materials"
            title="Raw Materials"
            value={totalRawMaterialsCost}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={Package}
            accentColor="#9C5A35"
          />
        </Link>
        <Link href="/sales" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-sales"
            title="Total Sales"
            value={stats.totalSales}
            change={0}
            changePeriod={"vs last month"}
            icon={ShoppingBag}
            accentColor="#1E5F8A"
          />
        </Link>
        <Link href="/inventory" style={{ textDecoration: 'none' }}>
          <KPICard
            id="kpi-inventory-value"
            title="Inventory Value"
            value={stats.inventoryValue}
            isCurrency
            compact
            change={0}
            changePeriod={"vs last month"}
            icon={BarChart3}
            accentColor="var(--color-accent)"
          />
        </Link>
      </div>

      {/* ── Revenue Chart ── */}
      <div style={{ marginBottom: 20 }}>
        <RevenueChart data={charts?.revenueTrend || []} />
      </div>

      {/* ── Sales Charts Row 1 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
        id="sales-charts-grid"
      >
        <SalesByProductChart data={charts?.salesByProduct || []} />
        <SalesByCategoryChart data={charts?.salesByCategory || []} />
      </div>

      {/* ── Sales Charts Row 2 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <SalesBySizeChart data={charts?.salesBySize || []} />
        <SalesByColorChart data={charts?.salesByColor || []} />
      </div>

      {/* ── Payment Method ── */}
      <div style={{ marginBottom: 20, maxWidth: 600 }}>
        <SalesByPaymentChart data={charts?.salesByPayment || []} />
      </div>

      {/* ── Recent Sales Table ── */}
      <RecentSalesTable />
    </div>
  );
}
