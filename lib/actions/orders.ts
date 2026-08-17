"use server";

import db from "@/lib/db";

export async function getOrdersAction() {
  try {
    const orders = await db.prepare('SELECT * FROM "Order" ORDER BY createdAt DESC').all() as any[];
    
    // We mock the items since we didn't create an OrderItem table to keep it simple for now,
    // or we can fetch the actual customer name. The schema has customerId, not customerName.
    // Let's join with Customer to get the name.
    
    const ordersWithDetails = await db.prepare(`
      SELECT o.id, c.name as customer, c.phone, o.amount as totalAmount, o.paymentMethod, o.status as orderStatus, o.createdAt as date
      FROM "Order" o
      LEFT JOIN Customer c ON o.customerId = c.id
      ORDER BY o.createdAt DESC
    `).all() as any[];

    // Format them for the UI
    const formattedOrders = ordersWithDetails.map(o => ({
      ...o,
      items: [{ productName: "Order Items", variantName: "Standard", quantity: 1, unitPrice: o.totalAmount }],
      paymentStatus: "Paid" // Mocking this since we didn't add it to DB schema explicitly
    }));

    return { success: true, orders: formattedOrders };
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
    finalCustId = require("crypto").randomUUID();
    await db.prepare('INSERT INTO Customer (id, name, type) VALUES (?, ?, ?)').run(finalCustId, customerName, 'Retail');
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await db.prepare(`
      INSERT INTO "Order" (id, customerId, amount, paymentMethod, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(orderId, finalCustId, amount, paymentMethod, status);
    
    return { success: true, orderId };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create order" };
  }
}

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const status = formData.get("status")?.toString() || "Pending";
  
  try {
    await db.prepare('UPDATE "Order" SET status = ? WHERE id = ?').run(status, id);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update order status" };
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
