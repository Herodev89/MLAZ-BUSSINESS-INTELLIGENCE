"use server";

import db from "@/lib/db";

export async function getProfitAnalysisAction(monthStr?: string) {
  try {
    let revenueQuery = "SELECT amount as total, createdAt FROM Sale WHERE status = 'Confirmed'";
    let cogsQuery = "SELECT costPrice as total, createdAt FROM Sale WHERE status = 'Confirmed'";
    let opexQuery = "SELECT amount as total, date as createdAt FROM Expense";
    
    const salesData = await db.prepare(revenueQuery).all() as any[];
    const cogsData = await db.prepare(cogsQuery).all() as any[];
    const opexData = await db.prepare(opexQuery).all() as any[];

    const filterByMonth = (items: any[]) => {
      if (!monthStr) return items;
      return items.filter(i => i.createdAt && i.createdAt.startsWith(monthStr));
    };

    const revenue = filterByMonth(salesData).reduce((sum, item) => sum + (item.total || 0), 0);
    const cogs = filterByMonth(cogsData).reduce((sum, item) => sum + (item.total || 0), 0);
    const opex = filterByMonth(opexData).reduce((sum, item) => sum + (item.total || 0), 0);

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - opex;

    // Monthly Chart Data (Jan-Dec)
    const sales = await db.prepare("SELECT amount, profit, createdAt FROM Sale WHERE status = 'Confirmed'").all() as any[];
    
    const monthlyMap: Record<string, { revenue: number, profit: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const d = new Date();
    // Default to last 6 months
    for (let i = 5; i >= 0; i--) {
      const pastMonth = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const label = `${months[pastMonth.getMonth()]} '${pastMonth.getFullYear().toString().slice(-2)}`;
      monthlyMap[label] = { revenue: 0, profit: 0 };
    }

    sales.forEach(sale => {
      if (!sale.createdAt) return;
      const date = new Date(sale.createdAt);
      const label = `${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
      if (monthlyMap[label] !== undefined) {
        monthlyMap[label].revenue += (sale.amount || 0);
        monthlyMap[label].profit += (sale.profit || 0);
      } else {
        // Only collect chart data for the last 6 months to avoid huge charts
        // But if they have older data, it just won't show in the 6-month chart
      }
    });
    
    const chartData = Object.keys(monthlyMap).map(key => ({
      month: key,
      revenue: monthlyMap[key].revenue,
      profit: monthlyMap[key].profit
    }));

    return {
      success: true,
      revenue,
      cogs,
      grossProfit,
      opex,
      netProfit,
      chartData,
    };
  } catch (error) {
    console.error("PROFIT ANALYSIS ERROR:", error);
    return { error: "Failed to load profit data" };
  }
}
