"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { formatNaira } from "@/lib/utils";
import KPICard from "@/components/dashboard/KPICard";
import { getProfitAnalysisAction } from "@/lib/actions/profit-analysis";

export default function ProfitAnalysisPage() {
  const [data, setData] = useState<any>(null);
  const [month, setMonth] = useState<string>("");
  
  useEffect(() => {
    async function load() {
      const res = await getProfitAnalysisAction(month || undefined);
      if (res.success) setData(res);
    }
    load();
  }, [month]);

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const revenue = data?.revenue || 0;
  const cogs = data?.cogs || 0;
  const grossProfit = data?.grossProfit || 0;
  const opex = data?.opex || 0;
  const netProfit = data?.netProfit || 0;
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Profit Analysis</h1>
          <p className="page-subtitle">Detailed financial performance for {month ? new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "All Time"}</p>
        </div>
        <div>
          <label className="label" style={{ marginBottom: 4, display: "block" }}>Filter by Month</label>
          <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <KPICard
          id="profit-revenue"
          title="Total Revenue"
          value={revenue}
          isCurrency
          compact
          icon={DollarSign}
          accentColor="var(--color-brand)"
        />
        <KPICard
          id="profit-cogs"
          title="Cost of Goods (COGS)"
          value={cogs}
          isCurrency
          compact
          icon={Activity}
          accentColor="var(--color-warning)"
        />
        <KPICard
          id="profit-gross"
          title="Gross Profit"
          value={grossProfit}
          isCurrency
          compact
          icon={TrendingUp}
          accentColor="var(--color-success)"
        />
        <KPICard
          id="profit-opex"
          title="Operating Expenses"
          value={opex}
          isCurrency
          compact
          icon={TrendingDown}
          accentColor="var(--color-error)"
        />
        <KPICard
          id="profit-net"
          title="Net Profit"
          value={netProfit}
          isCurrency
          compact
          icon={TrendingUp}
          accentColor="var(--color-accent)"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div>
          <RevenueChart data={data?.chartData || []} />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Profitability Margin</div></div>
            <div className="card-body" style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, color: "var(--color-success)", lineHeight: 1 }}>
                {netProfitMargin.toFixed(1)}%
              </div>
              <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: 8 }}>Net Profit Margin</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700, fontSize: "14px" }}>Top Performers</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Most Profitable Product</div>
                <div style={{ fontWeight: 600 }}>Classic Pams</div>
                <div style={{ fontSize: "13px", color: "var(--color-success)", fontWeight: 600 }}>{formatNaira(8000)} margin/unit</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Most Profitable Category</div>
                <div style={{ fontWeight: 600 }}>Sandals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
