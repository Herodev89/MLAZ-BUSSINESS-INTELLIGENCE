import db, { ensureSalesAndOrderColumns } from "@/lib/db";
import { randomUUID } from "crypto";
import { HISTORICAL_SALES_2026 } from "@/lib/historical-sales-data";

/**
 * Idempotently imports all 92 historical Jan–Nov 2026 sales from the MLAZ Monthly Sales Summary.
 * Does NOT decrement live ProductVariant stock since current physical inventory already reflects historical sales.
 */
export async function seedHistoricalSalesInDb(): Promise<{ added: number; existing: number }> {
  await ensureSalesAndOrderColumns();

  const existingSales = (await db.prepare("SELECT id FROM Sale").all()) as any[];
  const existingIds = new Set(existingSales.map((s) => String(s.id)));

  const products = (await db.prepare("SELECT id, name FROM Product").all()) as any[];
  const variants = (await db.prepare("SELECT id, productId, size, color FROM ProductVariant").all()) as any[];
  const variantByProductName = new Map<string, { id: string; size: string; color: string }>();
  for (const p of products) {
    const v = variants.find((x) => x.productId === p.id);
    if (v) {
      variantByProductName.set(String(p.name).trim().toLowerCase(), {
        id: String(v.id),
        size: String(v.size || "Standard"),
        color: String(v.color || "Default"),
      });
    }
  }

  const customers = (await db.prepare("SELECT id, name, type FROM Customer").all()) as any[];
  const customerMap = new Map<string, { id: string; type: string }>();
  for (const c of customers) {
    customerMap.set(String(c.name).trim().toLowerCase(), { id: String(c.id), type: String(c.type || "Retail") });
  }

  let added = 0;
  let existing = 0;

  for (const row of HISTORICAL_SALES_2026) {
    if (existingIds.has(row.id)) {
      existing++;
      continue;
    }

    const variant = variantByProductName.get(row.productName.trim().toLowerCase());
    const costPrice = Math.max(0, row.amount - row.profit);
    const saleType = row.qty >= 6 ? "Wholesale" : "Retail";
    const createdAt = `${row.date}T12:00:00.000Z`;

    await db
      .prepare(
        `INSERT INTO Sale (
          id, userId, saleType, customerName, productName, variantId, size, color,
          quantity, amount, discount, vatAmount, amountPaid, paymentStatus,
          costPrice, profit, paymentMethod, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        row.id,
        "historical-import",
        saleType,
        row.customerName,
        row.productName,
        variant?.id || null,
        variant?.size || "Standard",
        variant?.color || "Default",
        row.qty,
        row.amount,
        0,
        0,
        row.amount,
        "Paid",
        costPrice,
        row.profit,
        "Transfer",
        "Confirmed",
        createdAt
      );

    const custKey = row.customerName.trim().toLowerCase();
    const cust = customerMap.get(custKey);
    if (cust) {
      const nextType = saleType === "Wholesale" ? "Wholesale" : cust.type;
      await db
        .prepare("UPDATE Customer SET totalSpent = COALESCE(totalSpent, 0) + ?, type = ? WHERE id = ?")
        .run(row.amount, nextType, cust.id);
      cust.type = nextType;
    } else {
      const newCustId = randomUUID();
      await db
        .prepare("INSERT INTO Customer (id, name, totalSpent, type) VALUES (?, ?, ?, ?)")
        .run(newCustId, row.customerName, row.amount, saleType);
      customerMap.set(custKey, { id: newCustId, type: saleType });
    }

    added++;
  }

  return { added, existing };
}
