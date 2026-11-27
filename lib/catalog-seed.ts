import db, { ensureProductColumns } from "@/lib/db";
import { randomUUID } from "crypto";
import { ACTIVE_PRODUCTS_CATALOG } from "@/lib/active-products-catalog";

/**
 * Idempotently register all 19 Active products from the MLAZ catalog with their respective prices.
 * Lives in a plain server module (not "use server") so both server actions and API routes can call it safely.
 */
export async function seedActiveCatalogInDb(): Promise<{ added: number; existing: number }> {
  await ensureProductColumns();
  const existingRows = (await db.prepare("SELECT id, name FROM Product").all()) as any[];
  const existingNames = new Set(existingRows.map((r) => String(r.name).trim().toLowerCase()));

  let added = 0;
  let existing = 0;

  for (const item of ACTIVE_PRODUCTS_CATALOG) {
    if (existingNames.has(item.name.trim().toLowerCase())) {
      existing++;
      continue;
    }

    const productId = randomUUID();
    await db
      .prepare(
        `INSERT INTO Product (id, name, sku, category, brand, material, description, reorderLevel, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        productId,
        item.name,
        item.sku,
        item.category,
        item.brand,
        item.material,
        item.description,
        item.reorderLevel,
        item.status
      );

    for (const v of item.variants) {
      await db
        .prepare(
          "INSERT INTO ProductVariant (id, productId, size, color, price, costPrice, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(randomUUID(), productId, v.size, v.color, v.price, v.costPrice, v.stock, v.sku);
    }
    added++;
  }

  return { added, existing };
}
