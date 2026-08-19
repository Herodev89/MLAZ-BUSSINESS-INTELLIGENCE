"use server";

import db from "@/lib/db";

export async function getProfitAnalysisAction() {
  try {
    const revenueRow: any = await db.prepare("SELECT SUM(amount) as total FROM Sale WHERE status = 'Confirmed'").get();
    const cogsRow: any = await db.prepare("SELECT SUM(costPrice * quantity) as total FROM Sale WHERE status = 'Confirmed'").get();
    const opexRow: any = await db.prepare("SELECT SUM(amount) as total FROM Expense").get();

    const revenue = revenueRow?.total || 0;
    const cogs = cogsRow?.total || 0;
    const opex = opexRow?.total || 0;
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - opex;

    // Monthly Chart Data (Jan-Dec)
    const sales = await db.prepare("SELECT amount, profit, createdAt FROM Sale WHERE status = 'Confirmed'").all() as any[];
    
    const monthlyMap: Record<string, { revenue: number, profit: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const pastMonth = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const label = months[pastMonth.getMonth()];
      monthlyMap[label] = { revenue: 0, profit: 0 };
    }

    sales.forEach(sale => {
      if (!sale.createdAt) return;
      const date = new Date(sale.createdAt);
      const label = months[date.getMonth()];
      if (monthlyMap[label]) {
        monthlyMap[label].revenue += (sale.amount || 0);
        monthlyMap[label].profit += (sale.profit || 0);
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
