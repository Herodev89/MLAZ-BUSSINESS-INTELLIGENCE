"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function getOrdersAction() {
  try {
    const orders = await db.prepare('SELECT * FROM "Order" ORDER BY createdAt DESC').all() as any[];
    
    // We mock the items since we didn't create an OrderItem table to keep it simple for now,
    // or we can fetch the actual customer name. The schema has customerId, not customerName.
    // Let's join with Customer to get the name.
    
    const ordersWithDetails = await db.prepare(`
      SELECT o.id, c.name as customer, c.phone, o.productName, o.variantId, o.size, o.color, o.quantity, o.amount as totalAmount, o.paymentMethod, o.status as orderStatus, o.createdAt as date
      FROM "Order" o
      LEFT JOIN Customer c ON o.customerId = c.id
      ORDER BY o.createdAt DESC
    `).all() as any[];

    // Format them for the UI
    const formattedOrders = ordersWithDetails.map(o => ({
      ...o,
      paymentStatus: "Paid" // Mocking this since we didn't add it to DB schema explicitly
    }));

    return { success: true, orders: formattedOrders.map(o => ({...o})) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch orders" };
  }
}

export async function createOrderAction(formData: FormData) {
  const customerId = formData.get("customer")?.toString(); // Actually sending ID or Name? Let's assume ID if we use select, but for now the UI uses text input. Let's just create customer if they don't exist.
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transfer";
  const status = formData.get("status")?.toString() || "Pending";
  const dateStr = formData.get("date")?.toString();
  const createdAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
  const productName = formData.get("productName")?.toString();
  const variantId = formData.get("variantId")?.toString();
  const size = formData.get("size")?.toString() || "";
  const color = formData.get("color")?.toString() || "";
  const quantity = parseInt(formData.get("qty")?.toString() || "1", 10);

  if (!amount) {
    return { error: "Amount is required" };
  }

  // Handle customer (if the UI sends a string name instead of ID, we can look it up or create a dummy ID)
  // But wait, the schema expects customerId.
  // The UI currently just takes `customer` name as a text input.
  const customerName = formData.get("customer")?.toString() || "Unknown";
  
  let cust = await db.prepare('SELECT id FROM Customer WHERE name = ?').get(customerName) as any;
  let finalCustId = cust?.id;
  
  if (!finalCustId) {
    finalCustId = randomUUID();
    await db.prepare('INSERT INTO Customer (id, name, type) VALUES (?, ?, ?)').run(finalCustId, customerName, 'Retail');
  }

  const orderId = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db.prepare(`
      INSERT INTO "Order" (id, customerId, productName, variantId, size, color, quantity, amount, paymentMethod, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, finalCustId, productName, variantId, size, color, quantity, amount, paymentMethod, status, createdAt);
    
    // If initially created as confirmed, trigger sale
    if (status === "Confirmed" || status === "Delivered") {
      await processOrderToSale(orderId);
    }
    
    return { success: true, orderId };
  } catch (error: any) {
    console.error(error);
    return { error: "Failed to create order: " + error.message };
  }
}

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const status = formData.get("status")?.toString() || "Pending";
  
  try {
    const existingOrder = await db.prepare('SELECT status FROM "Order" WHERE id = ?').get(id) as any;
    await db.prepare('UPDATE "Order" SET status = ? WHERE id = ?').run(status, id);
    
    if (existingOrder && existingOrder.status !== "Confirmed" && existingOrder.status !== "Delivered") {
      if (status === "Confirmed" || status === "Delivered") {
        await processOrderToSale(id);
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Failed to update order status: " + error.message };
  }
}

export async function deleteOrderAction(id: string) {
  try {
    await db.prepare('DELETE FROM "Order" WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete order" };
  }
}

async function processOrderToSale(orderId: string) {
  const order = await db.prepare(`
    SELECT o.*, c.name as customerName 
    FROM "Order" o 
    LEFT JOIN Customer c ON o.customerId = c.id 
    WHERE o.id = ?
  `).get(orderId) as any;
  
  if (!order || !order.variantId) return;

  const variantRecord = await db.prepare('SELECT id, costPrice FROM ProductVariant WHERE id = ?').get(order.variantId) as any;
  if (!variantRecord) return;

  // Deduplication guard: Check if a sale for this order already exists
  const existingSale = await db.prepare('SELECT id FROM Sale WHERE id LIKE ? || "%"').get(`TX-${orderId}`);
  if (existingSale) return;

  const costPrice = (variantRecord.costPrice || 0) * order.quantity;
  const profit = order.amount - costPrice;
  // Prefix the saleId with TX-<orderId> so we can track it
  const saleId = `TX-${orderId}-${randomUUID().slice(0, 4).toUpperCase()}`;

  await db.prepare(`
    INSERT INTO Sale (id, userId, customerName, productName, variantId, size, color, quantity, amount, costPrice, profit, paymentMethod, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(saleId, "system", order.customerName || "Walk-in", order.productName, order.variantId, order.size, order.color, order.quantity, order.amount, costPrice, profit, order.paymentMethod, order.status);
  
  await db.prepare('UPDATE ProductVariant SET stock = stock - ? WHERE id = ?').run(order.quantity, order.variantId);
}
