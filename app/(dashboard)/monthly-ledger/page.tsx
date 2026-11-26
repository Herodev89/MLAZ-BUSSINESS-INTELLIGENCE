"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Download, Printer, RefreshCw, Factory, ShoppingCart, Layers, CalendarRange } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { getSalesAction } from "@/lib/actions/sales";
import { getProductionRunsAction } from "@/lib/actions/production";
import { getProductsAction } from "@/lib/actions/products";
import {
  FOOTWEAR_LEDGER_CATEGORIES,
  buildMonthlyFootwearLedger,
  LedgerCell,
} from "@/lib/footwear-ledger";

type GroupFilter = "ALL" | "MALE" | "FEMALE";
type FocusMode = "PRODUCTION" | "SALES" | "COMPLETE";
type DimensionMode = "CATEGORY" | "STYLE";

export default function MonthlyLedgerPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [dimensionMode, setDimensionMode] = useState<DimensionMode>("CATEGORY");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("ALL");
  const [focusMode, setFocusMode] = useState<FocusMode>("COMPLETE");
  const [includeInProgress, setIncludeInProgress] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [sRes, rRes, pRes] = await Promise.all([
      getSalesAction(),
      getProductionRunsAction(),
      getProductsAction(),
    ]);
    if (sRes.success && sRes.sales) setSales(sRes.sales);
    if (rRes.success && rRes.runs) setRuns(rRes.runs);
    if (pRes.success && pRes.products) setProducts(pRes.products);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const availableYears = useMemo(() => {
    const yrs = new Set<number>([2026, new Date().getFullYear()]);
    for (const s of sales) {
      if (s.createdAt) {
        const y = new Date(s.createdAt).getUTCFullYear();
        if (!isNaN(y) && y > 2000 && y < 2100) yrs.add(y);
      }
    }
    for (const r of runs) {
      const d = r.productionDate || r.createdAt;
      if (d) {
        const y = new Date(d).getUTCFullYear();
        if (!isNaN(y) && y > 2000 && y < 2100) yrs.add(y);
      }
    }
    return Array.from(yrs).sort((a, b) => b - a);
  }, [sales, runs]);

  const ledger = useMemo(
    () =>
      buildMonthlyFootwearLedger({
        year: selectedYear,
        sales,
        productionRuns: runs,
        products,
        includeInProgressProduction: includeInProgress,
      }),
    [selectedYear, sales, runs, products, includeInProgress]
  );

  // Determine columns based on Category vs Style & Male/Female filter
  const visibleColumns = useMemo(() => {
    if (dimensionMode === "CATEGORY") {
      return FOOTWEAR_LEDGER_CATEGORIES.filter((c) => {
        if (groupFilter === "MALE") return c.group === "Male Footwear";
        if (groupFilter === "FEMALE") return c.group === "Female Footwear";
        return true;
      }).map((c) => ({
        id: c.id,
        label: c.label,
        sublabel: c.group,
      }));
    }
    return ledger.styles
      .filter((s) => {
        if (groupFilter === "MALE") return s.group === "Male Footwear";
        if (groupFilter === "FEMALE") return s.group === "Female Footwear";
        return true;
      })
      .map((s) => ({
        id: s.id,
        label: s.label,
        sublabel: s.category,
      }));
  }, [dimensionMode, groupFilter, ledger.styles]);

  const getCell = (monthIdx: number, colId: string): LedgerCell => {
    if (dimensionMode === "CATEGORY") {
      return (ledger.byCategory[monthIdx] as Record<string, LedgerCell>)[colId] || { produced: 0, sold: 0, revenue: 0, net: 0 };
    }
    return ledger.byStyle[monthIdx]?.[colId] || { produced: 0, sold: 0, revenue: 0, net: 0 };
  };

  const getColumnTotal = (colId: string): LedgerCell => {
    if (dimensionMode === "CATEGORY") {
      return (ledger.categoryTotals as Record<string, LedgerCell>)[colId] || { produced: 0, sold: 0, revenue: 0, net: 0 };
    }
    return ledger.styleTotals[colId] || { produced: 0, sold: 0, revenue: 0, net: 0 };
  };

  const getRowSummary = (monthIdx: number): LedgerCell => {
    return visibleColumns.reduce(
      (acc, col) => {
        const cell = getCell(monthIdx, col.id);
        return {
          produced: acc.produced + cell.produced,
          sold: acc.sold + cell.sold,
          revenue: acc.revenue + cell.revenue,
          net: acc.net + cell.net,
        };
      },
      { produced: 0, sold: 0, revenue: 0, net: 0 }
    );
  };

  const filteredGrandTotal = useMemo(() => {
    return visibleColumns.reduce(
      (acc, col) => {
        const t = getColumnTotal(col.id);
        return {
          produced: acc.produced + t.produced,
          sold: acc.sold + t.sold,
          revenue: acc.revenue + t.revenue,
          net: acc.net + t.net,
        };
      },
      { produced: 0, sold: 0, revenue: 0, net: 0 }
    );
  }, [visibleColumns, ledger]);

  const topCategory = useMemo(() => {
    const entries = FOOTWEAR_LEDGER_CATEGORIES.map((c) => ({
      name: c.label,
      ...ledger.categoryTotals[c.id],
    }));
    entries.sort((a, b) => b.sold + b.produced - (a.sold + a.produced));
    return entries[0];
  }, [ledger]);

  const topStyle = useMemo(() => {
    return ledger.styles[0] || null;
  }, [ledger.styles]);

  const handleExportCSV = () => {
    const headers = [
      "Month",
      ...visibleColumns.flatMap((col) =>
        focusMode === "PRODUCTION"
          ? [`${col.label} (Produced)`]
          : focusMode === "SALES"
          ? [`${col.label} (Sold)`]
          : [`${col.label} (Produced)`, `${col.label} (Sold)`, `${col.label} (Net)`]
      ),
      ...(focusMode === "PRODUCTION"
        ? ["Total Produced"]
        : focusMode === "SALES"
        ? ["Total Sold", "Total Revenue (NGN)"]
        : ["Total Produced", "Total Sold", "Total Net", "Total Revenue (NGN)"]),
    ];

    const csvRows = [headers.join(",")];

    ledger.months.forEach((mName, mIdx) => {
      const rowTotal = getRowSummary(mIdx);
      const cols = visibleColumns.flatMap((col) => {
        const cell = getCell(mIdx, col.id);
        if (focusMode === "PRODUCTION") return [cell.produced];
        if (focusMode === "SALES") return [cell.sold];
        return [cell.produced, cell.sold, cell.net];
      });
      const tail =
        focusMode === "PRODUCTION"
          ? [rowTotal.produced]
          : focusMode === "SALES"
          ? [rowTotal.sold, rowTotal.revenue]
          : [rowTotal.produced, rowTotal.sold, rowTotal.net, rowTotal.revenue];
      csvRows.push([`"${mName}"`, ...cols, ...tail].join(","));
    });

    const totalCols = visibleColumns.flatMap((col) => {
      const tot = getColumnTotal(col.id);
      if (focusMode === "PRODUCTION") return [tot.produced];
      if (focusMode === "SALES") return [tot.sold];
      return [tot.produced, tot.sold, tot.net];
    });
    const totalTail =
      focusMode === "PRODUCTION"
        ? [filteredGrandTotal.produced]
        : focusMode === "SALES"
        ? [filteredGrandTotal.sold, filteredGrandTotal.revenue]
        : [filteredGrandTotal.produced, filteredGrandTotal.sold, filteredGrandTotal.net, filteredGrandTotal.revenue];
    csvRows.push([`"Annual Total (${selectedYear})"`, ...totalCols, ...totalTail].join(","));

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MLAZ_${selectedYear}_Monthly_Ledger_${dimensionMode}_${focusMode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const focusTag =
    focusMode === "PRODUCTION" ? "Produced" : focusMode === "SALES" ? "Sold" : "Prod / Sold";

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarRange size={24} style={{ color: "var(--color-accent)" }} />
            Production &amp; Sales Monthly Ledger
          </h1>
          <p className="page-subtitle">
            Monthly breakdown of shoes produced and sold per footwear category &amp; style across all 12 months
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="select"
            style={{ width: "auto" }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          <button className="btn-outline btn-sm" onClick={loadAll} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-outline btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-accent btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Ledger
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
            <Factory size={14} /> Total Produced ({selectedYear})
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }} className="font-tabular">
            {filteredGrandTotal.produced.toLocaleString()} pairs
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            <Link href="/production" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
              + Record production batch
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
            <ShoppingCart size={14} /> Total Sold ({selectedYear})
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }} className="font-tabular">
            {filteredGrandTotal.sold.toLocaleString()} pairs
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-success)", fontWeight: 600 }}>
            Revenue: {formatNaira(filteredGrandTotal.revenue)}
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>
            <Layers size={14} /> Net Produced vs Sold ({selectedYear})
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: filteredGrandTotal.net >= 0 ? "var(--color-success)" : "var(--color-warning)",
              marginTop: 4,
            }}
            className="font-tabular"
          >
            {filteredGrandTotal.net >= 0 ? `+${filteredGrandTotal.net.toLocaleString()}` : filteredGrandTotal.net.toLocaleString()} pairs
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
            {filteredGrandTotal.net >= 0 ? "Net stock build in period" : "Sold from prior stock"}
          </div>
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600 }}>Top Category &amp; Style ({selectedYear})</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 4 }}>
            {topCategory ? `${topCategory.name} (${topCategory.sold} sold / ${topCategory.produced} prod)` : "—"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Top Style: {topStyle ? `${topStyle.label} (${topStyle.totalSold} sold)` : "—"}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DARK MONTHLY LEDGER CARD (MATCHING REFERENCE FORMAT + ENHANCED)
         ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "#0d1526",
          color: "#f1f5f9",
          borderRadius: 14,
          padding: 22,
          border: "1px solid #1e293b",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "Georgia, serif",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4a656", display: "inline-block" }} />
              {selectedYear} Monthly Ledger
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0 0" }}>
              {dimensionMode === "CATEGORY"
                ? `Breakdown across all ${visibleColumns.length} footwear categories across the 12 calendar months.`
                : `Breakdown across all ${visibleColumns.length} footwear styles across the 12 calendar months.`}
            </p>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: "#cbd5e1",
              cursor: "pointer",
              background: "#09101d",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #1e293b",
            }}
          >
            <input
              type="checkbox"
              checked={includeInProgress}
              onChange={(e) => setIncludeInProgress(e.target.checked)}
            />
            Include In-Progress Production Runs
          </label>
        </div>

        {/* Filter Pills Bar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
          {/* Dimension Switch: By 10 Categories vs By Shoe Style */}
          <div
            style={{
              display: "inline-flex",
              background: "#070c17",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setDimensionMode("CATEGORY")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: dimensionMode === "CATEGORY" ? "#d4a656" : "transparent",
                color: dimensionMode === "CATEGORY" ? "#0d1526" : "#cbd5e1",
              }}
            >
              10 Categories
            </button>
            <button
              type="button"
              onClick={() => setDimensionMode("STYLE")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: dimensionMode === "STYLE" ? "#d4a656" : "transparent",
                color: dimensionMode === "STYLE" ? "#0d1526" : "#cbd5e1",
              }}
            >
              By Shoe Style ({ledger.styles.length})
            </button>
          </div>

          {/* Category Gender Group Filter */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#070c17",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: "4px 6px",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", padding: "0 8px" }}>
              CATEGORY FILTER:
            </span>
            {[
              { id: "ALL", label: dimensionMode === "CATEGORY" ? "All 10 Categories" : "All Styles" },
              { id: "MALE", label: dimensionMode === "CATEGORY" ? "Male Footwear (5)" : "Male Footwear" },
              { id: "FEMALE", label: dimensionMode === "CATEGORY" ? "Female Footwear (5)" : "Female Footwear" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setGroupFilter(btn.id as GroupFilter)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: groupFilter === btn.id ? "#d4a656" : "transparent",
                  color: groupFilter === btn.id ? "#0d1526" : "#cbd5e1",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Focus Mode Filter */}
          <div
            style={{
              display: "inline-flex",
              background: "#070c17",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 4,
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[
              { id: "PRODUCTION", label: "Production Focus" },
              { id: "SALES", label: "Sales Focus" },
              { id: "COMPLETE", label: "Complete View" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFocusMode(btn.id as FocusMode)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: focusMode === btn.id ? "#d4a656" : "transparent",
                  color: focusMode === btn.id ? "#0d1526" : "#cbd5e1",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #1e293b", margin: "0 0 14px 0" }} />

        {/* Matrix Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            className="font-tabular"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              minWidth: Math.max(760, visibleColumns.length * 145 + 240),
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b", background: "#09101d" }}>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    background: "#09101d",
                    textAlign: "left",
                    padding: "12px 14px",
                    color: "#e2e8f0",
                    fontWeight: 700,
                    fontFamily: "Georgia, serif",
                    minWidth: 120,
                    borderRight: "1px solid #1e293b",
                  }}
                >
                  Month
                </th>
                {visibleColumns.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      textAlign: "right",
                      padding: "12px 14px",
                      color: "#d4a656",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>
                      {col.label} ({focusTag})
                    </div>
                    {dimensionMode === "STYLE" && (
                      <div style={{ fontSize: 10.5, fontWeight: 500, color: "#64748b" }}>{col.sublabel}</div>
                    )}
                  </th>
                ))}
                <th
                  style={{
                    position: "sticky",
                    right: 0,
                    zIndex: 2,
                    background: "#09101d",
                    textAlign: "right",
                    padding: "12px 14px",
                    color: "#38bdf8",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    borderLeft: "1px solid #1e293b",
                  }}
                >
                  Month Total
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.months.map((mName, mIdx) => {
                const rowSum = getRowSummary(mIdx);
                const rowBg = mIdx % 2 === 1 ? "#111b2e" : "#0d1526";
                return (
                  <tr key={mName} style={{ borderBottom: "1px solid #182338", background: rowBg }}>
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        background: rowBg,
                        padding: "12px 14px",
                        fontWeight: 700,
                        color: "#f8fafc",
                        borderRight: "1px solid #1e293b",
                      }}
                    >
                      {mName}
                    </td>
                    {visibleColumns.map((col) => {
                      const cell = getCell(mIdx, col.id);
                      if (focusMode === "PRODUCTION") {
                        return (
                          <td
                            key={col.id}
                            style={{
                              textAlign: "right",
                              padding: "12px 14px",
                              fontWeight: cell.produced > 0 ? 700 : 400,
                              color: cell.produced > 0 ? "#4ade80" : "#64748b",
                            }}
                          >
                            {cell.produced}
                          </td>
                        );
                      }
                      if (focusMode === "SALES") {
                        return (
                          <td
                            key={col.id}
                            style={{
                              textAlign: "right",
                              padding: "12px 14px",
                              fontWeight: cell.sold > 0 ? 700 : 400,
                              color: cell.sold > 0 ? "#fbbf24" : "#64748b",
                            }}
                            title={cell.revenue > 0 ? `Revenue: ${formatNaira(cell.revenue)}` : undefined}
                          >
                            {cell.sold}
                          </td>
                        );
                      }
                      // COMPLETE VIEW: Produced / Sold / Net
                      const hasActivity = cell.produced > 0 || cell.sold > 0;
                      return (
                        <td
                          key={col.id}
                          style={{
                            textAlign: "right",
                            padding: "10px 14px",
                            color: hasActivity ? "#f8fafc" : "#64748b",
                          }}
                        >
                          {hasActivity ? (
                            <div style={{ lineHeight: 1.35 }}>
                              <div>
                                <span style={{ color: "#4ade80", fontWeight: 700 }}>{cell.produced}</span>
                                <span style={{ color: "#64748b", margin: "0 4px" }}>/</span>
                                <span style={{ color: "#fbbf24", fontWeight: 700 }}>{cell.sold}</span>
                              </div>
                              <div
                                style={{
                                  fontSize: 10.5,
                                  color: cell.net >= 0 ? "#38bdf8" : "#f87171",
                                }}
                              >
                                Net {cell.net >= 0 ? `+${cell.net}` : cell.net}
                              </div>
                            </div>
                          ) : (
                            <span>0 / 0</span>
                          )}
                        </td>
                      );
                    })}
                    <td
                      style={{
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        background: rowBg,
                        textAlign: "right",
                        padding: "12px 14px",
                        fontWeight: 800,
                        borderLeft: "1px solid #1e293b",
                        color: "#e2e8f0",
                      }}
                    >
                      {focusMode === "PRODUCTION" ? (
                        <span style={{ color: rowSum.produced > 0 ? "#4ade80" : "#64748b" }}>{rowSum.produced}</span>
                      ) : focusMode === "SALES" ? (
                        <div>
                          <span style={{ color: rowSum.sold > 0 ? "#fbbf24" : "#64748b" }}>{rowSum.sold}</span>
                          {rowSum.revenue > 0 && (
                            <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500 }}>{formatNaira(rowSum.revenue)}</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span style={{ color: "#4ade80" }}>{rowSum.produced}</span>
                          <span style={{ color: "#64748b", margin: "0 4px" }}>/</span>
                          <span style={{ color: "#fbbf24" }}>{rowSum.sold}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#09101d", borderTop: "2px solid #d4a656" }}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    background: "#09101d",
                    padding: "13px 14px",
                    fontWeight: 800,
                    color: "#d4a656",
                    borderRight: "1px solid #1e293b",
                  }}
                >
                  Annual Total ({selectedYear})
                </td>
                {visibleColumns.map((col) => {
                  const tot = getColumnTotal(col.id);
                  return (
                    <td
                      key={col.id}
                      style={{
                        textAlign: "right",
                        padding: "13px 14px",
                        fontWeight: 800,
                        color: "#ffffff",
                      }}
                    >
                      {focusMode === "PRODUCTION" ? (
                        <span style={{ color: tot.produced > 0 ? "#4ade80" : "#64748b" }}>{tot.produced}</span>
                      ) : focusMode === "SALES" ? (
                        <div>
                          <span style={{ color: tot.sold > 0 ? "#fbbf24" : "#64748b" }}>{tot.sold}</span>
                          {tot.revenue > 0 && (
                            <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 500 }}>{formatNaira(tot.revenue)}</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span style={{ color: "#4ade80" }}>{tot.produced}</span>
                          <span style={{ color: "#64748b", margin: "0 4px" }}>/</span>
                          <span style={{ color: "#fbbf24" }}>{tot.sold}</span>
                          <div style={{ fontSize: 10.5, color: tot.net >= 0 ? "#38bdf8" : "#f87171" }}>
                            Net {tot.net >= 0 ? `+${tot.net}` : tot.net}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td
                  style={{
                    position: "sticky",
                    right: 0,
                    zIndex: 2,
                    background: "#09101d",
                    textAlign: "right",
                    padding: "13px 14px",
                    fontWeight: 900,
                    color: "#38bdf8",
                    borderLeft: "1px solid #1e293b",
                  }}
                >
                  {focusMode === "PRODUCTION" ? (
                    filteredGrandTotal.produced
                  ) : focusMode === "SALES" ? (
                    <div>
                      <div>{filteredGrandTotal.sold} pairs</div>
                      <div style={{ fontSize: 11, color: "#d4a656" }}>{formatNaira(filteredGrandTotal.revenue)}</div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: "#4ade80" }}>{filteredGrandTotal.produced}</span>
                      <span style={{ color: "#64748b", margin: "0 4px" }}>/</span>
                      <span style={{ color: "#fbbf24" }}>{filteredGrandTotal.sold}</span>
                      <div style={{ fontSize: 10.5, color: "#38bdf8" }}>
                        Net {filteredGrandTotal.net >= 0 ? `+${filteredGrandTotal.net}` : filteredGrandTotal.net}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Style-Level Annual Summary Table */}
      <div className="card">
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>
              {selectedYear} Summary by Footwear Style &amp; Category Mapping
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "2px 0 0 0" }}>
              Shows every individual shoe style, which of the 10 categories it maps to, total pairs produced, total sold, and sales revenue
            </p>
          </div>
          <button className="btn-outline btn-sm" onClick={() => setDimensionMode("STYLE")}>
            View Full Monthly Style Matrix
          </button>
        </div>
        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="table font-tabular">
            <thead>
              <tr>
                <th>Shoe Style / Product</th>
                <th>Assigned Ledger Category</th>
                <th>Group</th>
                <th style={{ textAlign: "right" }}>Pairs Produced ({selectedYear})</th>
                <th style={{ textAlign: "right" }}>Pairs Sold ({selectedYear})</th>
                <th style={{ textAlign: "right" }}>Net Variance</th>
                <th style={{ textAlign: "right" }}>Sales Revenue ({selectedYear})</th>
              </tr>
            </thead>
            <tbody>
              {ledger.styles.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--color-text-muted)" }}>
                    No footwear styles or transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledger.styles.map((s) => {
                  const net = s.totalProduced - s.totalSold;
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.label}</td>
                      <td>
                        <span className="badge-accent">{s.category}</span>
                      </td>
                      <td>
                        <span className="badge-muted">{s.group}</span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: s.totalProduced > 0 ? "var(--color-success)" : "var(--color-text-muted)" }}>
                        {s.totalProduced.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: s.totalSold > 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                        {s.totalSold.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: net >= 0 ? "var(--color-brand)" : "var(--color-warning)" }}>
                        {net >= 0 ? `+${net}` : net}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{formatNaira(s.totalRevenue)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
