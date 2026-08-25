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
  const amountStr = formData.get("amount")?.toString() || "0";
  const discountStr = formData.get("discount")?.toString() || "0";
  const amount = parseFloat(amountStr);
  const discount = parseFloat(discountStr);
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transfer";
  const status = formData.get("status")?.toString() || "Pending";
  const dateStr = formData.get("date")?.toString();
  const createdAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

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

  const saleId = `TX-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    const unitCost = variantRecord.costPrice || 0;
    const totalCostPrice = unitCost * quantity;
    const finalAmount = amount - discount;
    const profit = finalAmount - totalCostPrice;

    await db.prepare(`
      INSERT INTO Sale (id, userId, customerName, productName, variantId, size, color, quantity, amount, discount, costPrice, profit, paymentMethod, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(saleId, session.id, customerName, productName, variantId, size, color, quantity, finalAmount, discount, totalCostPrice, profit, paymentMethod, status, createdAt);
    
    // Update variant stock
    await db.prepare('UPDATE ProductVariant SET stock = stock - ? WHERE id = ?').run(quantity, variantRecord.id);

    // Update or create customer
    let customer = await db.prepare('SELECT id FROM Customer WHERE name = ?').get(customerName) as any;
    if (customer) {
      await db.prepare('UPDATE Customer SET totalSpent = totalSpent + ? WHERE id = ?').run(finalAmount, customer.id);
    } else {
      await db.prepare('INSERT INTO Customer (id, name, totalSpent, type) VALUES (?, ?, ?, ?)').run(randomUUID(), customerName, finalAmount, 'Retail');
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

export async function updateSaleAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const customerName = formData.get("customer")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString();
  const status = formData.get("status")?.toString();
  const dateStr = formData.get("date")?.toString();

  try {
    const existing = await db.prepare('SELECT * FROM Sale WHERE id = ?').get(id) as any;
    if (!existing) return { error: "Sale not found" };

    const newCustomer = customerName || existing.customerName;
    const newPayment = paymentMethod || existing.paymentMethod;
    const newStatus = status || existing.status;
    const newDate = dateStr ? new Date(dateStr).toISOString() : existing.createdAt;

    await db.prepare('UPDATE Sale SET customerName = ?, paymentMethod = ?, status = ?, createdAt = ? WHERE id = ?')
      .run(newCustomer, newPayment, newStatus, newDate, id);
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Failed to update sale: " + error.message };
  }
}