"use server";

import db from "@/lib/db";

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

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  const expenseId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await db.prepare('INSERT INTO Expense (id, name, type, category, amount, description) VALUES (?, ?, ?, ?, ?, ?)')
      .run(expenseId, name, type, category, amount, description);
    return { success: true, expenseId };
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
  const type = formData.get("type")?.toString() || "Operating";
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";

  if (!name || !category || amount <= 0) {
    return { error: "Name, category, and valid amount are required" };
  }

  try {
    await db.prepare('UPDATE Expense SET name = ?, type = ?, category = ?, amount = ?, description = ? WHERE id = ?')
      .run(name, type, category, amount, description, id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update expense" };
  }
}
