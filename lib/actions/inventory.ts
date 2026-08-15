"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function getInventoryMovementsAction() {
  try {
    const movements = await db.prepare('SELECT * FROM InventoryMovement ORDER BY date DESC').all();
    return { success: true, movements };
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

  if (!productName || !type || quantity === 0 || !variantId) {
    return { error: "Product variant, type, and valid quantity are required" };
  }

  try {
    const movId = `IM-${Math.floor(1000 + Math.random() * 9000)}`;
    
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
