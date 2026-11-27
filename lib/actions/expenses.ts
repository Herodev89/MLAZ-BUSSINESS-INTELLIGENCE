"use server";

import db, { ensureFinancialTables } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function revalidateFinancialReports() {
  revalidatePath("/expenses");
  revalidatePath("/financial-statements");
  revalidatePath("/capital-funding");
  revalidatePath("/reports");
  revalidatePath("/profit-analysis");
  revalidatePath("/dashboard");
}

export async function getExpensesAction() {
  try {
    const rawExpenses = (await db.prepare("SELECT * FROM Expense ORDER BY date DESC").all()) as any[];
    return { success: true, expenses: rawExpenses.map((e) => ({ ...e })) };
  } catch (error) {
    return { error: "Failed to fetch expenses" };
  }
}

export async function createExpenseAction(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  const type = formData.get("type")?.toString() || "Operating";
  const category = formData.get("category")?.toString() || "Other";
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";
  const dateStr = formData.get("date")?.toString();
  const expenseDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { error: "Forbidden: Access denied" };
  }

  if (!name || amount <= 0) {
    return { error: "Name and valid positive amount are required" };
  }

  // If user chose Loan Principal Repayment from Expenses UI, route straight to FinancialEntry (IAS 7 Financing / Borrowings)
  if (type === "LONG_TERM_LOAN_REPAYMENT" || type === "SHORT_TERM_LOAN_REPAYMENT") {
    try {
      await ensureFinancialTables();
      const finId = `FIN-${randomUUID().slice(0, 8).toUpperCase()}`;
      const section = type === "SHORT_TERM_LOAN_REPAYMENT" ? "CURRENT_LIABILITY" : "NON_CURRENT_LIABILITY";
      await db
        .prepare(
          `INSERT INTO FinancialEntry (id, entryType, section, title, amount, date, reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(finId, type, section, name, amount, expenseDate, "Recorded via Expenses", description);

      revalidateFinancialReports();
      return { success: true, routedToLoanLedger: true, id: finId };
    } catch (error) {
      return { error: "Failed to post loan repayment to financial ledger" };
    }
  }

  if (!category) {
    return { error: "Category is required" };
  }

  const expenseId = `EXP-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db
      .prepare("INSERT INTO Expense (id, name, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(expenseId, name, type, category, amount, description, expenseDate);
    revalidateFinancialReports();
    return { success: true, expenseId };
  } catch (error) {
    return { error: "Failed to create expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { error: "Forbidden: Access denied" };
  }

  try {
    await db.prepare("DELETE FROM Expense WHERE id = ?").run(id);
    revalidateFinancialReports();
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete expense" };
  }
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { error: "Forbidden: Access denied" };
  }

  const name = formData.get("name")?.toString()?.trim();
  const type = formData.get("type")?.toString() || "Operating";
  const category = formData.get("category")?.toString();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const description = formData.get("description")?.toString() || "";
  const dateStr = formData.get("date")?.toString();
  const expenseDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  if (!name || amount <= 0) {
    return { error: "Name and valid positive amount are required" };
  }

  if (type === "LONG_TERM_LOAN_REPAYMENT" || type === "SHORT_TERM_LOAN_REPAYMENT") {
    try {
      await ensureFinancialTables();
      const finId = `FIN-${randomUUID().slice(0, 8).toUpperCase()}`;
      const section = type === "SHORT_TERM_LOAN_REPAYMENT" ? "CURRENT_LIABILITY" : "NON_CURRENT_LIABILITY";
      await db
        .prepare(
          `INSERT INTO FinancialEntry (id, entryType, section, title, amount, date, reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(finId, type, section, name, amount, expenseDate, `Reclassified from ${id}`, description);
      await db.prepare("DELETE FROM Expense WHERE id = ?").run(id);
      revalidateFinancialReports();
      return { success: true, routedToLoanLedger: true, id: finId };
    } catch (error) {
      return { error: "Failed to reclassify expense as loan repayment" };
    }
  }

  if (!category) {
    return { error: "Category is required" };
  }

  try {
    await db
      .prepare("UPDATE Expense SET name = ?, type = ?, category = ?, amount = ?, description = ?, date = ? WHERE id = ?")
      .run(name, type, category, amount, description, expenseDate, id);
    revalidateFinancialReports();
    return { success: true };
  } catch (error) {
    return { error: "Failed to update expense" };
  }
}

export async function reclassifyExpenseAsLoanRepaymentAction(
  expenseId: string,
  entryType: "LONG_TERM_LOAN_REPAYMENT" | "SHORT_TERM_LOAN_REPAYMENT" = "LONG_TERM_LOAN_REPAYMENT"
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { error: "Forbidden: Access denied" };
  }

  try {
    await ensureFinancialTables();
    const existing = (await db.prepare("SELECT * FROM Expense WHERE id = ?").get(expenseId)) as any;
    if (!existing) {
      return { error: "Expense record not found." };
    }

    const finId = `FIN-${randomUUID().slice(0, 8).toUpperCase()}`;
    const section = entryType === "SHORT_TERM_LOAN_REPAYMENT" ? "CURRENT_LIABILITY" : "NON_CURRENT_LIABILITY";

    await db
      .prepare(
        `INSERT INTO FinancialEntry (id, entryType, section, title, amount, date, reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finId,
        entryType,
        section,
        String(existing.name || "Loan Principal Repayment"),
        Number(existing.amount) || 0,
        existing.date || new Date().toISOString(),
        `Reclassified from ${expenseId}`,
        String(existing.description || "Moved from Expenses to IAS 7 Loan Repayment ledger")
      );

    await db.prepare("DELETE FROM Expense WHERE id = ?").run(expenseId);
    revalidateFinancialReports();
    return { success: true, id: finId };
  } catch (error: any) {
    return { error: "Failed to reclassify expense: " + (error?.message || "Unknown error") };
  }
}
