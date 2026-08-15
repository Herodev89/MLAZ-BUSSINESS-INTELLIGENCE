"use client";

import { useState, useEffect } from "react";
import { Download, FileText, BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getSalesAction } from "@/lib/actions/sales";
import { getProductionRunsAction } from "@/lib/actions/production";
import { getExpensesAction } from "@/lib/actions/expenses";
import { getProductsAction } from "@/lib/actions/products";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("Monthly Sales Summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [productionRuns, setProductionRuns] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [s, pr, e, p] = await Promise.all([
        getSalesAction(),
        getProductionRunsAction(),
        getExpensesAction(),
        getProductsAction()
      ]);
      if (s.success) setRecentSales(s.sales || []);
      if (pr.success) setProductionRuns(pr.runs || []);
      if (e.success) setExpenses(e.expenses || []);
      if (p.success) setProducts(p.products || []);
    }
    load();
  }, []);

  const totalSalesRevenue = recentSales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalSalesProfit = recentSales.reduce((acc, s) => acc + (s.profit || 0), 0);
  const totalProductionCost = productionRuns.reduce((acc, r) => acc + (r.totalCost || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const inventoryValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);

  const handleGenerateReport = () => {
    setGeneratedReport({
      title: selectedReport,
      date: new Date().toLocaleDateString(),
      range: startDate && endDate ? `${startDate} to ${endDate}` : "All Time Records",
      salesCount: recentSales.length,
      revenue: totalSalesRevenue,
      profit: totalSalesProfit,
      productionCost: totalProductionCost,
      expenses: totalExpenses,
      netProfit: totalSalesProfit - totalExpenses,
      inventoryValuation,
    });
  };

  const exportCSV = (type: string) => {
    let rows: string[][] = [];
    let filename = `${type.toLowerCase().replace(/\s+/g, "_")}_report.csv`;

    if (type.includes("Sales")) {
      rows.push(["Transaction ID", "Customer", "Product", "Variant", "Quantity", "Amount", "Profit", "Payment Method", "Date"]);
      recentSales.forEach(s => rows.push([s.id, s.customerName, s.productName, "Standard", s.quantity.toString(), s.amount.toString(), s.profit?.toString() || "0", s.paymentMethod, s.createdAt]));
    } else if (type.includes("Inventory")) {
      rows.push(["Product ID", "Product Name", "Price", "Total Stock Units", "Valuation"]);
      products.forEach(p => {
        const totalStock = p.stock || 0;
        rows.push([p.id, p.name, p.price.toString(), totalStock.toString(), (p.price * totalStock).toString()]);
      });
    } else if (type.includes("Production")) {
      rows.push(["Run ID", "Product", "Variant", "Quantity Produced", "Total Cost", "Status", "Production Date"]);
      productionRuns.forEach(r => rows.push([r.id, r.productName, "Standard", r.qtyProduced.toString(), r.totalCost.toString(), r.status, r.productionDate]));
    } else {
      rows.push(["Expense Name", "Category", "Description", "Amount", "Date"]);
      expenses.forEach(e => rows.push([e.name, e.category, e.description || "", e.amount.toString(), e.date]));
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = (type: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableRows = "";
    if (type.includes("Sales")) {
      tableRows = recentSales.map(s => `<tr><td>${s.id}</td><td>${s.customerName}</td><td>${s.productName}</td><td>${s.quantity}</td><td>${formatNaira(s.amount)}</td><td>${formatNaira(s.profit || 0)}</td><td>${formatDate(s.createdAt)}</td></tr>`).join("");
    } else if (type.includes("Production")) {
      tableRows = productionRuns.map(r => `<tr><td>${r.id}</td><td>${r.productName}</td><td>${r.qtyProduced}</td><td>${formatNaira(r.totalCost)}</td><td>${r.status}</td><td>${formatDate(r.productionDate)}</td></tr>`).join("");
    } else {
      tableRows = products.map(p => {
        const stock = p.stock || 0;
        return `<tr><td>${p.id}</td><td>${p.name}</td><td>Standard</td><td>${stock} pcs</td><td>${formatNaira((p.price || 0) * stock)}</td></tr>`;
      }).join("");
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>MLAZ Business Report - ${type}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1C0D05; }
            h1 { color: #3D1F0E; margin-bottom: 4px; }
            .header-info { color: #6B5744; font-size: 14px; margin-bottom: 24px; }
            .stats-grid { display: flex; gap: 16px; margin-bottom: 24px; }
            .stat-box { border: 1px solid #E8DDD0; padding: 12px 16px; border-radius: 8px; flex: 1; }
            .stat-val { font-size: 20px; font-weight: bold; color: #B8860B; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #E8DDD0; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #F5EFE6; color: #3D1F0E; }
          </style>
        </head>
        <body>
          <h2>MLAZ Enterprise Platform</h2>
          <h1>${type}</h1>
          <div class="header-info">Generated on: ${new Date().toLocaleString()} | Period: ${startDate || "All Time"} to ${endDate || "Present"}</div>
          
          <div class="stats-grid">
            <div class="stat-box"><div>Total Revenue</div><div class="stat-val">${formatNaira(totalSalesRevenue)}</div></div>
            <div class="stat-box"><div>Gross Profit</div><div class="stat-val">${formatNaira(totalSalesProfit)}</div></div>
            <div class="stat-box"><div>Operating Expenses</div><div class="stat-val">${formatNaira(totalExpenses)}</div></div>
          </div>

          <table>
            <thead>
              <tr>${type.includes("Sales") ? "<th>ID</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Profit</th><th>Date</th>" : "<th>Code</th><th>Name</th><th>Category/Qty</th><th>Status/Qty</th><th>Total Value</th>"}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div style={{ animation: "fade-in 0.3s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Reports & Business Intelligence</h1>
        <p className="page-subtitle">Generate structured reports backed by your live operational sales & production data</p>
      </div>

      <div className="card" style={{ padding: "20px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="label">Report Type</label>
            <select className="select" style={{ width: 260 }} value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
              <option>Monthly Sales Summary</option>
              <option>Inventory Valuation</option>
              <option>Profit & Loss Statement</option>
              <option>Production Yield</option>
            </select>
          </div>
          <div>
            <label className="label">Date Range</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <button className="btn-accent" style={{ height: "36px" }} onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>
      </div>

      {/* Structured Report Preview Panel */}
      {generatedReport && (
        <div className="card" style={{ padding: "24px", marginBottom: 24, background: "var(--color-surface-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)" }}>{generatedReport.title}</h2>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Data snapshot: {generatedReport.range}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-outline btn-sm" onClick={() => exportPDF(generatedReport.title)}><Download size={14} /> Download PDF</button>
              <button className="btn-accent btn-sm" onClick={() => exportCSV(generatedReport.title)}><Download size={14} /> Export CSV</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 16, background: "var(--color-surface-warm)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Total Sales Revenue</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }}>{formatNaira(generatedReport.revenue)}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>From {generatedReport.salesCount} logged sales</div>
            </div>
            <div className="card" style={{ padding: 16, background: "var(--color-surface-warm)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Gross Profit</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-success)", marginTop: 4 }}>{formatNaira(generatedReport.profit)}</div>
            </div>
            <div className="card" style={{ padding: 16, background: "var(--color-surface-warm)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Operating Expenses</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-error)", marginTop: 4 }}>{formatNaira(generatedReport.expenses)}</div>
            </div>
            <div className="card" style={{ padding: 16, background: "var(--color-surface-warm)" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Current Inventory Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-brand)", marginTop: 4 }}>{formatNaira(generatedReport.inventoryValuation)}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Structured Live Data Summary</h3>
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Record / Product</th>
                  <th>Type / Category</th>
                  <th>Quantity / Volume</th>
                  <th>Financial Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.productName} ({s.customerName})</td>
                    <td>Sale Transaction</td>
                    <td>{s.quantity} units</td>
                    <td style={{ fontWeight: 700, color: "var(--color-accent)" }}>{formatNaira(s.amount)}</td>
                    <td><span className={`badge ${s.status === "Confirmed" ? "badge-success" : "badge-warning"}`}>{s.status}</span></td>
                  </tr>
                ))}
                {productionRuns.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.productName} (Run #{r.id})</td>
                    <td>Production Run</td>
                    <td>{r.qtyProduced} pcs batch</td>
                    <td style={{ fontWeight: 700 }}>{formatNaira(r.totalCost)}</td>
                    <td><span className="badge badge-warning">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {[
          { title: "Monthly Sales Summary", desc: "Aggregated sales data, customer breakdown, and revenue by day.", type: "Sales" },
          { title: "Inventory Valuation", desc: "Current stock snapshot with estimated cost and retail value.", type: "Inventory" },
          { title: "Profit & Loss Statement", desc: "Detailed breakdown of revenue, COGS, and operating expenses.", type: "Finance" },
          { title: "Production Yield", desc: "Analysis of raw material usage vs. finished goods produced.", type: "Production" },
        ].map((report, idx) => (
          <div key={idx} className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--color-surface-warm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={20} style={{ color: "var(--color-brand)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{report.title}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{report.desc}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-outline btn-sm" onClick={() => exportPDF(report.title)}><Download size={14} /> PDF</button>
                  <button className="btn-outline btn-sm" onClick={() => exportCSV(report.title)}><Download size={14} /> CSV</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
