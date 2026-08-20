"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function getSalesAction() {
  try {
    const rawSales = await db.prepare('SELECT * FROM Sale ORDER BY createdAt DESC').all() as any[];
    const sales = rawSales.map(r => ({ ...r }));
    return { success: true, sales };
  } catch (error) {
    return { error: "Failed to fetch sales" };
  }
}

export async function createSaleAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const customerName = formData.get("customer")?.toString();
  const productName = formData.get("product")?.toString();
  const variantId = formData.get("variantId")?.toString();
  const size = formData.get("size")?.toString() || "";
  const color = formData.get("color")?.toString() || "";
  const quantity = parseInt(formData.get("qty")?.toString() || "1", 10);
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transfer";
  const status = formData.get("status")?.toString() || "Pending";

  if (!customerName || !productName || !amount || !variantId) {
    return { error: "Missing required fields" };
  }

  // Check variant stock
  const variantRecord = await db.prepare('SELECT id, stock, costPrice FROM ProductVariant WHERE id = ?').get(variantId) as any;
  if (!variantRecord) {
    return { error: "Product variant not found" };
  }
  if (variantRecord.stock < quantity) {
    return { error: "Low stock: Not enough product available to record this sale." };
  }

  const saleId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const unitCost = variantRecord.costPrice || 0;
    const totalCostPrice = unitCost * quantity;
    const profit = amount - totalCostPrice;

    await db.prepare(`
      INSERT INTO Sale (id, userId, customerName, productName, variantId, size, color, quantity, amount, costPrice, profit, paymentMethod, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(saleId, session.id, customerName, productName, variantId, size, color, quantity, amount, totalCostPrice, profit, paymentMethod, status);
    
    // Update variant stock
    await db.prepare('UPDATE ProductVariant SET stock = stock - ? WHERE id = ?').run(quantity, variantRecord.id);

    // Also update totalSpent if customer exists
    const customer = await db.prepare('SELECT id FROM Customer WHERE name = ?').get(customerName) as any;
    if (customer) {
      await db.prepare('UPDATE Customer SET totalSpent = totalSpent + ? WHERE id = ?').run(amount, customer.id);
    }

    return { success: true, saleId };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create sale" };
  }
}

export async function confirmSaleAction(id: string) {
  try {
    await db.prepare('UPDATE Sale SET status = ? WHERE id = ?').run('Confirmed', id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to confirm sale" };
  }
}

export async function getSaleByIdAction(id: string) {
  try {
    const sale = await db.prepare('SELECT * FROM Sale WHERE id = ?').get(id);
    if (!sale) return { error: "Sale not found" };
    return { success: true, sale: { ...(sale as any) } };
  } catch (error) {
    return { error: "Failed to fetch sale" };
  }
}

export async function deleteSaleAction(id: string) {
  try {
    await db.prepare('DELETE FROM Sale WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete sale" };
  }
}
