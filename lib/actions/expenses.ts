"use server";

import db from "@/lib/db";

export async function getExpensesAction() {
  try {
    const expenses = await db.prepare('SELECT * FROM Expense ORDER BY date DESC').all();
    return { success: true, expenses };
  } catch (error) {
    return { error: "Failed to fetch expenses" };
  }
}

export async function createExpenseAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  try {
    const id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    await db.prepare('INSERT INTO Expense (id, name, category, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, category, amount, description);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await db.prepare('DELETE FROM Expense WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense" };
  }
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const name = formData.get("name")?.toString();
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  try {
    await db.prepare('UPDATE Expense SET name = ?, category = ?, amount = ?, description = ? WHERE id = ?')
      .run(name, category, amount, description, id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update expense" };
  }
}
