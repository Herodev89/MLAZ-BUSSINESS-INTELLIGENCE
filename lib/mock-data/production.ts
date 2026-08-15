// Mock production and raw materials data

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  reorderLevel: number;
  supplier: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface ProductionRun {
  id: string;
  product: string;
  sku: string;
  color: string;
  size: string;
  qtyProduced: number;
  productionDate: string;
  labourCost: number;
  materialCost: number;
  otherCosts: number;
  totalCost: number;
  status: "In Progress" | "Completed";
  notes?: string;
}

export const rawMaterials: RawMaterial[] = [
  { id: "RM-001", name: "Genuine Leather (Black)",  unit: "sq ft",   quantity: 120, costPerUnit: 450,   reorderLevel: 30,  supplier: "Lagos Leather Hub",       status: "In Stock" },
  { id: "RM-002", name: "Genuine Leather (Brown)",  unit: "sq ft",   quantity: 95,  costPerUnit: 450,   reorderLevel: 30,  supplier: "Lagos Leather Hub",       status: "In Stock" },
  { id: "RM-003", name: "Rubber Sole (Flat)",       unit: "pairs",   quantity: 80,  costPerUnit: 600,   reorderLevel: 20,  supplier: "Aba Rubber Works",        status: "In Stock" },
  { id: "RM-004", name: "Rubber Sole (Platform)",   unit: "pairs",   quantity: 18,  costPerUnit: 850,   reorderLevel: 20,  supplier: "Aba Rubber Works",        status: "Low Stock" },
  { id: "RM-005", name: "Contact Cement (Gum)",     unit: "litres",  quantity: 12,  costPerUnit: 1_200, reorderLevel: 5,   supplier: "Chemical Depot Lagos",    status: "In Stock" },
  { id: "RM-006", name: "Waxed Thread",             unit: "spools",  quantity: 45,  costPerUnit: 350,   reorderLevel: 10,  supplier: "Textile Market Onitsha",  status: "In Stock" },
  { id: "RM-007", name: "Metal Buckles",            unit: "pieces",  quantity: 200, costPerUnit: 80,    reorderLevel: 50,  supplier: "Accessories Market Lagos",status: "In Stock" },
  { id: "RM-008", name: "Insole Foam",              unit: "pairs",   quantity: 60,  costPerUnit: 200,   reorderLevel: 20,  supplier: "Foam Factory Aba",        status: "In Stock" },
  { id: "RM-009", name: "Packaging Box",            unit: "pieces",  quantity: 8,   costPerUnit: 300,   reorderLevel: 20,  supplier: "Print Plus Lagos",        status: "Low Stock" },
  { id: "RM-010", name: "Shoelaces",               unit: "pairs",   quantity: 0,   costPerUnit: 120,   reorderLevel: 30,  supplier: "Accessories Market Lagos",status: "Out of Stock" },
  { id: "RM-011", name: "EVA Foam Sheet",          unit: "sheets",  quantity: 35,  costPerUnit: 800,   reorderLevel: 10,  supplier: "Foam Factory Aba",        status: "In Stock" },
  { id: "RM-012", name: "Lining Fabric",           unit: "metres",  quantity: 22,  costPerUnit: 550,   reorderLevel: 8,   supplier: "Textile Market Onitsha",  status: "In Stock" },
];

export const productionRuns: ProductionRun[] = [
  {
    id: "PRD-001",
    product: "Classic Pams",
    sku: "MLZ-CP-001",
    color: "Black",
    size: "EU 40",
    qtyProduced: 20,
    productionDate: "2026-08-10",
    labourCost: 20_000,
    materialCost: 56_000,
    otherCosts: 4_000,
    totalCost: 80_000,
    status: "Completed",
    notes: "Normal production batch, no defects.",
  },
  {
    id: "PRD-002",
    product: "Classic Pams",
    sku: "MLZ-CP-001",
    color: "Brown",
    size: "EU 42",
    qtyProduced: 15,
    productionDate: "2026-08-08",
    labourCost: 15_000,
    materialCost: 42_000,
    otherCosts: 3_000,
    totalCost: 60_000,
    status: "Completed",
    notes: "1 pair rejected during quality check.",
  },
  {
    id: "PRD-003",
    product: "Oxford Shoes",
    sku: "MLZ-OX-005",
    color: "Black",
    size: "EU 42",
    qtyProduced: 10,
    productionDate: "2026-08-07",
    labourCost: 18_000,
    materialCost: 98_000,
    otherCosts: 4_000,
    totalCost: 120_000,
    status: "Completed",
  },
  {
    id: "PRD-004",
    product: "Leather Sandals",
    sku: "MLZ-LS-002",
    color: "Tan",
    size: "EU 38",
    qtyProduced: 25,
    productionDate: "2026-08-12",
    labourCost: 22_000,
    materialCost: 78_000,
    otherCosts: 5_000,
    totalCost: 105_000,
    status: "In Progress",
    notes: "Expected completion today.",
  },
];

export const expenseCategories = [
  "Transport", "Electricity", "Labour", "Materials", "Rent", "Marketing", "Maintenance", "Other"
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: string;
}

export const expenses: Expense[] = [
  { id: "EXP-001", name: "Workshop Rent",         category: "Rent",          amount: 150_000, description: "August monthly rent for production workshop", date: "2026-08-01" },
  { id: "EXP-002", name: "NEPA / PHCN Bill",      category: "Electricity",   amount: 28_000,  description: "July electricity bill",                        date: "2026-08-03" },
  { id: "EXP-003", name: "Artisan Labour - Batch", category: "Labour",        amount: 55_000,  description: "Payment to 3 craftsmen for August production",  date: "2026-08-05" },
  { id: "EXP-004", name: "Lagos - Aba Transport",  category: "Transport",     amount: 12_000,  description: "Round trip to pick up leather from Aba",        date: "2026-08-06" },
  { id: "EXP-005", name: "Facebook Ad Campaign",   category: "Marketing",     amount: 25_000,  description: "August product promotion campaign",             date: "2026-08-07" },
  { id: "EXP-006", name: "Machine Maintenance",    category: "Maintenance",   amount: 8_500,   description: "Stitching machine service and oiling",          date: "2026-08-08" },
  { id: "EXP-007", name: "Raw Materials Purchase", category: "Materials",     amount: 120_000, description: "Leather, soles, and gum restock",               date: "2026-08-09" },
  { id: "EXP-008", name: "Staff Transport",        category: "Transport",     amount: 6_000,   description: "Weekly staff transport allowance",              date: "2026-08-10" },
  { id: "EXP-009", name: "Showroom Printing",      category: "Marketing",     amount: 15_000,  description: "Banners and price tags for showroom",           date: "2026-08-11" },
  { id: "EXP-010", name: "Generator Fuel",         category: "Electricity",   amount: 18_000,  description: "Diesel for August production days",             date: "2026-08-12" },
];
