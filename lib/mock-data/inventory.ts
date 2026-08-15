// Mock inventory movements data

export type MovementType = "Stock Added" | "Sale" | "Production" | "Adjustment" | "Damaged" | "Returned";

export interface InventoryMovement {
  id: string;
  product: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;   // positive = added, negative = removed
  type: MovementType;
  reference?: string; // e.g. sale ID or production batch
  note?: string;
  date: string;
}

export const inventoryMovements: InventoryMovement[] = [
  { id: "IM-001", product: "Classic Pams",     sku: "MLZ-CP-001", color: "Black",  size: "EU 41", quantity: -2,  type: "Sale",       reference: "SL-001", date: "2026-08-12" },
  { id: "IM-002", product: "Leather Sandals",  sku: "MLZ-LS-002", color: "Brown",  size: "EU 39", quantity: -1,  type: "Sale",       reference: "SL-002", date: "2026-08-12" },
  { id: "IM-003", product: "Canvas Sneakers",  sku: "MLZ-CN-004", color: "White",  size: "EU 42", quantity: -3,  type: "Sale",       reference: "SL-003", date: "2026-08-11" },
  { id: "IM-004", product: "Comfort Slippers", sku: "MLZ-CS-003", color: "Black",  size: "EU 40", quantity: -2,  type: "Sale",       reference: "SL-004", date: "2026-08-11" },
  { id: "IM-005", product: "Classic Pams",     sku: "MLZ-CP-001", color: "Black",  size: "EU 40", quantity: +20, type: "Production", reference: "PRD-001", date: "2026-08-10" },
  { id: "IM-006", product: "Oxford Shoes",     sku: "MLZ-OX-005", color: "Brown",  size: "EU 43", quantity: -1,  type: "Sale",       reference: "SL-005", date: "2026-08-10" },
  { id: "IM-007", product: "Sport Sandals",    sku: "MLZ-SS-006", color: "Tan",    size: "EU 38", quantity: -4,  type: "Sale",       reference: "SL-006", date: "2026-08-10" },
  { id: "IM-008", product: "Leather Sandals",  sku: "MLZ-LS-002", color: "Tan",    size: "EU 38", quantity: +15, type: "Stock Added", note: "New stock from supplier", date: "2026-08-09" },
  { id: "IM-009", product: "Classic Pams",     sku: "MLZ-CP-001", color: "Black",  size: "EU 41", quantity: -1,  type: "Damaged",    note: "Stitching defect found", date: "2026-08-08" },
  { id: "IM-010", product: "Canvas Sneakers",  sku: "MLZ-CN-004", color: "White",  size: "EU 40", quantity: +1,  type: "Returned",   reference: "SL-003", note: "Wrong size returned by customer", date: "2026-08-08" },
  { id: "IM-011", product: "Oxford Shoes",     sku: "MLZ-OX-005", color: "Black",  size: "EU 42", quantity: +10, type: "Stock Added", note: "Supplier restock — Batch B", date: "2026-08-07" },
  { id: "IM-012", product: "Comfort Slippers", sku: "MLZ-CS-003", color: "Brown",  size: "EU 39", quantity: +2,  type: "Adjustment", note: "Stock count correction", date: "2026-08-06" },
];
