// Mock dashboard data for MLAZ Business Intelligence Platform

export const dashboardKPIs = {
  totalRevenue:    { value: 4_850_000, change: +12.5, period: "vs last month" },
  totalProfit:     { value: 1_820_000, change: +8.3,  period: "vs last month" },
  totalSales:      { value: 312,       change: +5.7,  period: "vs last month" },
  pairsSold:       { value: 487,       change: +9.1,  period: "vs last month" },
  inventoryValue:  { value: 7_240_000, change: -2.1,  period: "vs last month" },
  lowStockCount:   { value: 14,        change: +3,    period: "products" },
};

export const revenueTrendData = [
  { month: "Feb", revenue: 2_800_000, profit: 980_000 },
  { month: "Mar", revenue: 3_100_000, profit: 1_140_000 },
  { month: "Apr", revenue: 2_650_000, profit: 910_000 },
  { month: "May", revenue: 3_400_000, profit: 1_250_000 },
  { month: "Jun", revenue: 3_900_000, profit: 1_430_000 },
  { month: "Jul", revenue: 4_300_000, profit: 1_640_000 },
  { month: "Aug", revenue: 4_850_000, profit: 1_820_000 },
];

export const salesByProductData = [
  { product: "Classic Pams",     sales: 128 },
  { product: "Leather Sandals",  sales: 97 },
  { product: "Comfort Slippers", sales: 76 },
  { product: "Canvas Sneakers",  sales: 62 },
  { product: "Oxford Shoes",     sales: 48 },
  { product: "Sport Sandals",    sales: 41 },
];

export const salesByCategoryData = [
  { name: "Pams",            value: 128, color: "#B8860B" },
  { name: "Sandals",         value: 138, color: "#3D1F0E" },
  { name: "Slippers",        value: 76,  color: "#9C5A35" },
  { name: "Sneakers",        value: 62,  color: "#6B3A1F" },
  { name: "Shoes",           value: 48,  color: "#D4A017" },
  { name: "Leather Footwear",value: 35,  color: "#7A5A3A" },
];

export const salesBySizeData = [
  { size: "EU 36", pairs: 28 },
  { size: "EU 37", pairs: 45 },
  { size: "EU 38", pairs: 67 },
  { size: "EU 39", pairs: 82 },
  { size: "EU 40", pairs: 94 },
  { size: "EU 41", pairs: 88 },
  { size: "EU 42", pairs: 73 },
  { size: "EU 43", pairs: 51 },
  { size: "EU 44", pairs: 33 },
  { size: "EU 45", pairs: 19 },
];

export const salesByColorData = [
  { color: "Black",       pairs: 187, hex: "#1C0D05" },
  { color: "Brown",       pairs: 142, hex: "#6B3A1F" },
  { color: "Tan",         pairs: 89,  hex: "#C4863C" },
  { color: "Cream/White", pairs: 51,  hex: "#F5EFE6" },
  { color: "Navy",        pairs: 34,  hex: "#1E3A5F" },
  { color: "Burgundy",    pairs: 28,  hex: "#800020" },
];

export const recentSales = [
  { id: "SL-001", product: "Classic Pams",     size: "EU 41", color: "Black",  qty: 2, amount: 24_000, profit: 8_000,  customer: "Emeka Obi",      paymentMethod: "Transfer", date: "2026-08-12" },
  { id: "SL-002", product: "Leather Sandals",  size: "EU 39", color: "Brown",  qty: 1, amount: 15_500, profit: 5_200,  customer: "Fatima Aliyu",   paymentMethod: "Cash",     date: "2026-08-12" },
  { id: "SL-003", product: "Canvas Sneakers",  size: "EU 42", color: "White",  qty: 3, amount: 54_000, profit: 18_000, customer: "Chidi Nwosu",    paymentMethod: "POS",      date: "2026-08-11" },
  { id: "SL-004", product: "Comfort Slippers", size: "EU 40", color: "Black",  qty: 2, amount: 14_000, profit: 4_600,  customer: "Amara Eze",      paymentMethod: "Cash",     date: "2026-08-11" },
  { id: "SL-005", product: "Oxford Shoes",     size: "EU 43", color: "Brown",  qty: 1, amount: 32_000, profit: 11_000, customer: "Biodun Adeyemi", paymentMethod: "Transfer", date: "2026-08-10" },
  { id: "SL-006", product: "Sport Sandals",    size: "EU 38", color: "Tan",    qty: 4, amount: 36_000, profit: 11_200, customer: "Ngozi Okonkwo",  paymentMethod: "POS",      date: "2026-08-10" },
  { id: "SL-007", product: "Classic Pams",     size: "EU 44", color: "Black",  qty: 1, amount: 12_000, profit: 4_000,  customer: "Tunde Bello",    paymentMethod: "Cash",     date: "2026-08-09" },
  { id: "SL-008", product: "Leather Sandals",  size: "EU 37", color: "Cream",  qty: 2, amount: 31_000, profit: 10_400, customer: "Aisha Mohammed",  paymentMethod: "Transfer", date: "2026-08-09" },
  { id: "SL-009", product: "Comfort Slippers", size: "EU 41", color: "Brown",  qty: 5, amount: 35_000, profit: 11_500, customer: "Kelechi Okafor",  paymentMethod: "Cash",     date: "2026-08-08" },
  { id: "SL-010", product: "Oxford Shoes",     size: "EU 40", color: "Black",  qty: 1, amount: 32_000, profit: 11_000, customer: "Sade Adewale",    paymentMethod: "POS",      date: "2026-08-08" },
];

export const lowStockAlerts = [
  { product: "Classic Pams", color: "Black", size: "EU 43", stock: 2, reorderLevel: 5 },
  { product: "Leather Sandals", color: "Brown", size: "EU 39", stock: 1, reorderLevel: 5 },
  { product: "Oxford Shoes", color: "Brown", size: "EU 42", stock: 3, reorderLevel: 5 },
];
