"use server";

import db from "@/lib/db";

export async function getDashboardStatsAction() {
  try {
    const revenueRow: any = await db.prepare("SELECT SUM(amount) as total FROM Sale WHERE status = 'Confirmed'").get();
    const grossProfitRow: any = await db.prepare("SELECT SUM(profit) as total FROM Sale WHERE status = 'Confirmed'").get();
    const salesCountRow: any = await db.prepare("SELECT COUNT(*) as total FROM Sale WHERE status = 'Confirmed'").get();
    const pairsSoldRow: any = await db.prepare("SELECT SUM(quantity) as total FROM Sale WHERE status = 'Confirmed'").get();
    const inventoryValRow: any = await db.prepare('SELECT SUM(price * stock) as total FROM ProductVariant').get();
    const lowStockRow: any = await db.prepare('SELECT COUNT(*) as total FROM ProductVariant WHERE stock < 10').get();
    
    // Expenses
    const operatingExpensesRow: any = await db.prepare("SELECT SUM(amount) as total FROM Expense WHERE type = 'Operating'").get();
    const allExpensesRow: any = await db.prepare("SELECT SUM(amount) as total FROM Expense").get();
    
    // Raw Materials Value
    const rawMaterialsRow: any = await db.prepare("SELECT SUM(quantity * costPerUnit) as total FROM RawMaterial").get();

    const operatingExpenses = operatingExpensesRow?.total || 0;
    const totalExpenses = allExpensesRow?.total || 0;
    const totalRawMaterialsCost = rawMaterialsRow?.total || 0;
    
    const cogsRow: any = await db.prepare("SELECT SUM(costPrice) as total FROM Sale WHERE status = 'Confirmed'").get();
    const cogs = cogsRow?.total || 0;

    const grossProfit = grossProfitRow?.total || 0;
    const netProfit = grossProfit - totalExpenses;
    const inventoryValue = (inventoryValRow?.total || 0) + totalRawMaterialsCost;

    // Chart Data
    // 1. Revenue & Profit Trend (Monthly)
    // We group by month (YYYY-MM) and sum amount and profit.
    // For simplicity, we just pull all confirmed sales and group them in JS, or we can group in SQL.
    const sales = await db.prepare("SELECT amount, profit, quantity, productName, paymentMethod, createdAt FROM Sale WHERE status = 'Confirmed'").all() as any[];
    
    const monthlyMap: Record<string, { revenue: number, profit: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
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
    
    const revenueTrendData = Object.keys(monthlyMap).map(key => ({
      month: key,
      revenue: monthlyMap[key].revenue,
      profit: monthlyMap[key].profit
    }));

    // 2. Sales by Product
    const productSalesRows = await db.prepare(`
      SELECT productName as product, SUM(quantity) as sales
      FROM Sale
      WHERE status = 'Confirmed'
      GROUP BY productName
      ORDER BY sales DESC
      LIMIT 5
    `).all() as any[];

    // 3. Sales by Payment Method
    const paymentMethodRows = await db.prepare(`
      SELECT paymentMethod as name, COUNT(*) as value
      FROM Sale
      WHERE status = 'Confirmed'
      GROUP BY paymentMethod
    `).all() as any[];

    const paymentColors = ["#B8860B", "#D4A017", "#E5C158", "#9C5A35", "#6B3A1F"];
    const salesByPaymentData = paymentMethodRows.map((row, i) => ({
      name: row.name || "Unknown",
      value: row.value,
      color: paymentColors[i % paymentColors.length]
    }));

    // 4. Sales by Category (First word of product name as category)
    const categoryMap: any = {};
    sales.forEach(sale => {
      const cat = sale.productName ? sale.productName.split(' ')[0] : 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (sale.quantity || 1);
    });
    const salesByCategoryData = Object.keys(categoryMap).map((key, i) => ({
      name: key,
      value: categoryMap[key],
      color: paymentColors[i % paymentColors.length]
    }));

    // 5. Sales by Size (Look for measurements in product name)
    const sizeMap: any = {};
    sales.forEach(sale => {
      const match = sale.productName?.match(/(\d+(?:ml|g|kg|L|oz))/i);
      const size = match ? match[1].toLowerCase() : 'Standard';
      sizeMap[size] = (sizeMap[size] || 0) + (sale.quantity || 1);
    });
    const salesBySizeData = Object.keys(sizeMap).map(key => ({
      size: key,
      pairs: sizeMap[key]
    }));

    // 6. Sales by Color (Extract color keywords)
    const colorMap: any = {};
    const colorsList = ["Black", "White", "Brown", "Yellow", "Gold", "Pink", "Green"];
    sales.forEach(sale => {
      let color = "Natural";
      for (const c of colorsList) {
        if (sale.productName?.toLowerCase().includes(c.toLowerCase())) {
          color = c;
          break;
        }
      }
      colorMap[color] = (colorMap[color] || 0) + (sale.quantity || 1);
    });
    const hexMap: any = { "Black": "#000", "White": "#FFF", "Brown": "#8B4513", "Yellow": "#FFD700", "Gold": "#FFD700", "Natural": "#D2B48C" };
    const salesByColorData = Object.keys(colorMap).map(key => ({
      color: key,
      hex: hexMap[key] || "#CCC",
      pairs: colorMap[key]
    }));

    return {
      success: true,
      stats: {
        totalRevenue: revenueRow?.total || 0,
        totalProfit: netProfit,
        grossProfit: grossProfit,
        operatingExpenses: operatingExpenses,
        totalSales: salesCountRow?.total || 0,
        pairsSold: pairsSoldRow?.total || 0,
        inventoryValue: inventoryValue,
        lowStockCount: lowStockRow?.total || 0,
        totalExpenses: totalExpenses,
        totalRawMaterialsCost: totalRawMaterialsCost,
        cogs: cogs,
      },
      charts: {
        revenueTrend: revenueTrendData,
        salesByProduct: productSalesRows.map(r => ({ ...r })),
        salesByPayment: salesByPaymentData,
        salesByCategory: salesByCategoryData,
        salesBySize: salesBySizeData,
        salesByColor: salesByColorData
      }
    };
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return { error: "Failed to fetch dashboard stats" };
  }
}
