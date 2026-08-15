"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(61,31,14,0.1)",
      }}
    >
      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>
        {label} 2026
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
            {p.name}:
          </span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>
            ₦{p.value.toLocaleString("en-NG")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart({ data }: { data: any[] }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Revenue & Profit Trend
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Monthly overview — Feb to Aug 2026
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#B8860B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#B8860B" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2D6A4F" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                {value}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#B8860B"
            strokeWidth={2.5}
            fill="url(#gradRevenue)"
            dot={{ fill: "#B8860B", r: 4 }}
            activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#2D6A4F"
            strokeWidth={2.5}
            fill="url(#gradProfit)"
            dot={{ fill: "#2D6A4F", r: 4 }}
            activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
