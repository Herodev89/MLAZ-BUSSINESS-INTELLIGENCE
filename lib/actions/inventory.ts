"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";

export async function getInventoryMovementsAction() {
  try {
    const rawMovements = await db.prepare('SELECT * FROM InventoryMovement ORDER BY date DESC').all() as any[];
    return { success: true, movements: rawMovements.map(m => ({ ...m })) };
  } catch (error) {
    return { error: "Failed to fetch movements" };
  }
}

export async function recordInventoryMovementAction(formData: FormData) {
  const productName = formData.get("product")?.toString();
  const variantId = formData.get("variantId")?.toString();
  const size = formData.get("size")?.toString();
  const color = formData.get("color")?.toString();
  const quantity = parseInt(formData.get("qty")?.toString() || "0", 10);
  const type = formData.get("type")?.toString();
  const reference = formData.get("reference")?.toString() || "";
  const note = formData.get("note")?.toString() || "";

  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) return { error: "Forbidden: Access denied" };

  if (!productName || !type || quantity === 0 || !variantId) {
    return { error: "Product variant, type, and valid quantity are required" };
  }

  try {
    const movId = `IM-${randomUUID().slice(0, 8).toUpperCase()}`;
    
    await db.prepare(`
      INSERT INTO InventoryMovement (id, productName, variantId, size, color, quantity, type, reference, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(movId, productName, variantId, size, color, quantity, type, reference, note);

    // Update the variant stock directly
    await db.prepare('UPDATE ProductVariant SET stock = stock + ? WHERE id = ?').run(quantity, variantId);

    return { success: true, movementId: movId };
  } catch (error) {
    return { error: "Failed to record movement" };
  }
}

export async function getInventoryStatsAction() {
  try {
    const products = await db.prepare("SELECT * FROM Product WHERE status != 'Inactive'").all() as any[];
    const variants = await db.prepare("SELECT v.* FROM ProductVariant v JOIN Product p ON v.productId = p.id WHERE p.status != 'Inactive'").all() as any[];
    
    const totalProducts = products.length;
    let totalPairs = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const rawMaterialsRow: any = await db.prepare("SELECT SUM(quantity * costPerUnit) as total FROM RawMaterial").get();
    const totalRawMaterialsCost = rawMaterialsRow?.total || 0;

    variants.forEach(v => {
      totalPairs += v.stock;
      inventoryValue += (v.stock * v.price);
      if (v.stock === 0) outOfStockCount++;
      else if (v.stock <= 10) lowStockCount++;
    });

    inventoryValue += totalRawMaterialsCost;

    return { 
      success: true, 
      stats: { totalProducts, totalPairs, inventoryValue, lowStockCount, outOfStockCount }
    };
  } catch (error) {
    return { error: "Failed to fetch stats" };
  }
}
