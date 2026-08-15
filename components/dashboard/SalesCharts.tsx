"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie, Legend } from "recharts";

// ── Sales by Product Bar Chart ──
export function SalesByProductChart({ data }: { data: any[] }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sales by Product
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Units sold this month
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="product"
            width={120}
            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value} units`, "Sales"]}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="sales" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={index === 0 ? "#B8860B" : index === 1 ? "#9C5A35" : "#6B3A1F"}
                opacity={1 - index * 0.08}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sales by Payment Method Donut Chart ──
const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SalesByPaymentChart({ data }: { data: any[] }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sales by Payment Method
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Distribution this month
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{value}</span>
            )}
          />
          <Tooltip
            formatter={(value, name) => [`${value} transactions`, name]}
            contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sales by Category Donut Chart ──
export function SalesByCategoryChart({ data }: { data: any[] }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sales by Category
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Distribution this month
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{value}</span>
            )}
          />
          <Tooltip
            formatter={(value, name) => [`${value} items`, name]}
            contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sales by Size Bar Chart ──
export function SalesBySizeChart({ data }: { data: any[] }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sales by Size
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Distribution of items sold by size
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="size" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${value} items`, "Sold"]}
            contentStyle={{ borderRadius: "10px", border: "1px solid var(--color-border)", fontSize: "12px" }}
          />
          <Bar dataKey="pairs" fill="#B8860B" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.pairs === Math.max(...data.map((d) => d.pairs)) ? "#D4A017" : "#B8860B"}
                opacity={0.7 + ((entry.pairs / 100) * 0.3)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sales by Color ──
export function SalesByColorChart({ data }: { data: any[] }) {
  const total = data.reduce((s, d) => s + d.pairs, 0);

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Sales by Color
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
          Most popular product colors
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((item) => {
          const pct = Math.round((item.pairs / (total || 1)) * 100);
          return (
            <div key={item.color}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "3px",
                      background: item.hex === "#F5EFE6" ? "#C4A882" : item.hex,
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{item.color}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {item.pairs} items
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--color-surface-muted)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background: "var(--color-accent)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
