"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function getCustomersAction() {
  try {
    const rawCustomers = await db.prepare('SELECT * FROM Customer ORDER BY name ASC').all() as any[];
    return { success: true, customers: rawCustomers.map(c => ({ ...c })) };
  } catch (error) {
    return { error: "Failed to fetch customers" };
  }
}

export async function createCustomerAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const type = formData.get("type")?.toString() || "Retail";

  if (!name) return { error: "Name is required" };

  try {
    await db.prepare('INSERT INTO Customer (id, name, email, phone, type) VALUES (?, ?, ?, ?, ?)')
      .run(randomUUID(), name, email, phone, type);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create customer" };
  }
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const name = formData.get("name")?.toString();
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const type = formData.get("type")?.toString() || "Retail";

  if (!name) return { error: "Name is required" };

  try {
    await db.prepare('UPDATE Customer SET name = ?, email = ?, phone = ?, type = ? WHERE id = ?')
      .run(name, email, phone, type, id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update customer" };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await db.prepare('DELETE FROM Customer WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete customer" };
  }
}

export async function getCustomerHistoryAction(customerName: string, customerId?: string) {
  try {
    const sales = await db.prepare('SELECT * FROM Sale WHERE customerName = ? ORDER BY createdAt DESC').all(customerName) as any[];
    // Fallback to customerId for orders if needed, but schema uses customerId. Wait, Order uses customerId. Sale uses customerName.
    // We should fetch orders by customerId if provided, else attempt by name via join.
    let orders = [];
    if (customerId) {
      orders = await db.prepare('SELECT * FROM "Order" WHERE customerId = ? ORDER BY createdAt DESC').all(customerId) as any[];
    } else {
      orders = await db.prepare('SELECT o.* FROM "Order" o JOIN Customer c ON o.customerId = c.id WHERE c.name = ? ORDER BY o.createdAt DESC').all(customerName) as any[];
    }
    
    return { 
      success: true, 
      sales: sales.map(s => ({...s})),
      orders: orders.map(o => ({...o}))
    };
  } catch (error) {
    return { error: "Failed to fetch customer history" };
  }
}
