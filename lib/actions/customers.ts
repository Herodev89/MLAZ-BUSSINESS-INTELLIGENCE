"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function getCustomersAction() {
  try {
    const customers = await db.prepare('SELECT * FROM Customer ORDER BY name ASC').all();
    return { success: true, customers };
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
