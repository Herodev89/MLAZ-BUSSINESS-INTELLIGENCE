"use server";

import db from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function getExpensesAction() {
  try {
    const rawExpenses = await db.prepare('SELECT * FROM Expense ORDER BY date DESC').all() as any[];
    return { success: true, expenses: rawExpenses.map(e => ({ ...e })) };
  } catch (error) {
    return { error: "Failed to fetch expenses" };
  }
}

export async function createExpenseAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const type = formData.get("type")?.toString() || "Operating";
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";
  const dateStr = formData.get("date")?.toString();
  const expenseDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) return { error: "Forbidden: Access denied" };

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  const expenseId = `EXP-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db.prepare('INSERT INTO Expense (id, name, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(expenseId, name, type, category, amount, description, expenseDate);
    return { success: true, expenseId };
  } catch (error) {
    return { error: "Failed to create expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) return { error: "Forbidden: Access denied" };

  try {
    await db.prepare('DELETE FROM Expense WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense" };
  }
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const name = formData.get("name")?.toString();
  const type = formData.get("type")?.toString() || "Operating";
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";
  const dateStr = formData.get("date")?.toString();
  const expenseDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  try {
    await db.prepare('UPDATE Expense SET name = ?, type = ?, category = ?, amount = ?, description = ?, date = ? WHERE id = ?')
      .run(name, type, category, amount, description, expenseDate, id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update expense" };
  }
}
