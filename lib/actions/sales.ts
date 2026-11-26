"use server";

import db, { ensureSalesAndOrderColumns } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function normalizeSaleRow(r: any) {
  const amount = Number(r.amount) || 0;
  const vatAmount = Number(r.vatAmount) || 0;
  const totalInvoice = Math.round((amount + vatAmount) * 100) / 100;
  const amountPaid =
    r.amountPaid !== null && r.amountPaid !== undefined
      ? Math.max(0, Number(r.amountPaid) || 0)
      : r.status === "Pending"
      ? 0
      : totalInvoice;
  const balanceDue = Math.max(0, Math.round((totalInvoice - amountPaid) * 100) / 100);
  const paymentStatus =
    balanceDue <= 0.01 ? "Paid" : amountPaid > 0 ? "Partial" : r.paymentStatus || "Credit";

  return {
    ...r,
    saleType: r.saleType === "Wholesale" ? "Wholesale" : "Retail",
    amount,
    discount: Number(r.discount) || 0,
    vatAmount,
    totalInvoice,
    amountPaid,
    balanceDue,
    paymentStatus,
    costPrice: Number(r.costPrice) || 0,
    profit: Number(r.profit) || 0,
    quantity: Number(r.quantity) || 1,
    dueDate: r.dueDate || null,
    notes: r.notes || "",
  };
}

export async function getSalesAction() {
  try {
    await ensureSalesAndOrderColumns();
    const rawSales = (await db.prepare("SELECT * FROM Sale ORDER BY createdAt DESC").all()) as any[];
    const sales = rawSales.map(normalizeSaleRow);
    return { success: true as const, sales };
  } catch (error) {
    console.error("getSalesAction error:", error);
    return { success: false as const, error: "Failed to fetch sales" };
  }
}

export async function createSaleAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();

  const customerName = formData.get("customer")?.toString()?.trim() || "Walk-in Customer";
  const productName = formData.get("product")?.toString();
  const variantId = formData.get("variantId")?.toString();
  const size = formData.get("size")?.toString() || "";
  const color = formData.get("color")?.toString() || "";
  const quantity = Math.max(1, parseInt(formData.get("qty")?.toString() || "1", 10) || 1);
  const amount = parseFloat(formData.get("amount")?.toString() || "0") || 0;
  const discount = Math.max(0, parseFloat(formData.get("discount")?.toString() || "0") || 0);
  const vatAmount = Math.max(0, parseFloat(formData.get("vatAmount")?.toString() || "0") || 0);
  const saleType = formData.get("saleType")?.toString() === "Wholesale" ? "Wholesale" : "Retail";
  const requestedPaymentStatus = formData.get("paymentStatus")?.toString();
  const amountPaidInput = formData.get("amountPaid")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transfer";
  const status = formData.get("status")?.toString() || "Confirmed";
  const dateStr = formData.get("date")?.toString();
  const dueDateStr = formData.get("dueDate")?.toString();
  const notes = formData.get("notes")?.toString()?.trim() || "";
  const createdAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
  const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

  if (!customerName || !productName || amount <= 0 || !variantId) {
    return { success: false as const, error: "Missing required fields (customer, product variant, or amount)." };
  }

  // Check variant stock
  const variantRecord = (await db
    .prepare("SELECT id, stock, costPrice FROM ProductVariant WHERE id = ?")
    .get(variantId)) as any;
  if (!variantRecord) {
    return { success: false as const, error: "Product variant not found" };
  }
  if (Number(variantRecord.stock) < quantity) {
    return { success: false as const, error: `Low stock: Only ${variantRecord.stock} unit(s) available.` };
  }

  const saleId = `TX-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    const unitCost = Number(variantRecord.costPrice) || 0;
    const totalCostPrice = Math.round(unitCost * quantity * 100) / 100;
    // Net Revenue (IFRS 15.47: ex-VAT, net of trade discounts)
    const netRevenue = Math.max(0, Math.round((amount - discount) * 100) / 100);
    const totalInvoice = Math.round((netRevenue + vatAmount) * 100) / 100;
    const profit = Math.round((netRevenue - totalCostPrice) * 100) / 100;

    let resolvedAmountPaid = totalInvoice;
    if (requestedPaymentStatus === "Credit") {
      resolvedAmountPaid = 0;
    } else if (requestedPaymentStatus === "Partial") {
      const parsedPaid = parseFloat(amountPaidInput || "0") || 0;
      resolvedAmountPaid = Math.min(totalInvoice, Math.max(0, Math.round(parsedPaid * 100) / 100));
    } else if (requestedPaymentStatus === "Paid") {
      resolvedAmountPaid = totalInvoice;
    } else if (status === "Pending") {
      resolvedAmountPaid = 0;
    }

    const balanceDue = Math.max(0, Math.round((totalInvoice - resolvedAmountPaid) * 100) / 100);
    const resolvedPaymentStatus =
      balanceDue <= 0.01 ? "Paid" : resolvedAmountPaid > 0 ? "Partial" : "Credit";

    await db
      .prepare(
        `INSERT INTO Sale (
          id, userId, saleType, customerName, productName, variantId, size, color,
          quantity, amount, discount, vatAmount, amountPaid, paymentStatus,
          costPrice, profit, paymentMethod, status, dueDate, notes, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        saleId,
        session.id,
        saleType,
        customerName,
        productName,
        variantId,
        size,
        color,
        quantity,
        netRevenue,
        discount,
        vatAmount,
        resolvedAmountPaid,
        resolvedPaymentStatus,
        totalCostPrice,
        profit,
        paymentMethod,
        status,
        dueDate,
        notes,
        createdAt
      );

    // Deduct variant stock (IAS 2)
    await db.prepare("UPDATE ProductVariant SET stock = stock - ? WHERE id = ?").run(quantity, variantRecord.id);

    // Update or create customer (tagging Wholesale customers automatically)
    const customer = (await db.prepare("SELECT id, type FROM Customer WHERE name = ?").get(customerName)) as any;
    if (customer) {
      await db
        .prepare("UPDATE Customer SET totalSpent = COALESCE(totalSpent, 0) + ?, type = ? WHERE id = ?")
        .run(totalInvoice, saleType === "Wholesale" ? "Wholesale" : customer.type || "Retail", customer.id);
    } else {
      await db
        .prepare("INSERT INTO Customer (id, name, totalSpent, type) VALUES (?, ?, ?, ?)")
        .run(randomUUID(), customerName, totalInvoice, saleType);
    }

    revalidatePath("/", "layout");
    return { success: true as const, saleId };
  } catch (error: any) {
    console.error("createSaleAction error:", error);
    return { success: false as const, error: "Failed to create sale: " + (error?.message || "Unknown error") };
  }
}

export async function recordSalePaymentAction(id: string, additionalAmount: number, paymentMethod?: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();

  if (!additionalAmount || additionalAmount <= 0) {
    return { success: false as const, error: "Payment amount must be greater than ₦0." };
  }

  try {
    const existing = (await db.prepare("SELECT * FROM Sale WHERE id = ?").get(id)) as any;
    if (!existing) return { success: false as const, error: "Sale not found" };

    const norm = normalizeSaleRow(existing);
    const nextPaid = Math.min(norm.totalInvoice, Math.round((norm.amountPaid + additionalAmount) * 100) / 100);
    const balance = Math.max(0, Math.round((norm.totalInvoice - nextPaid) * 100) / 100);
    const nextPaymentStatus = balance <= 0.01 ? "Paid" : nextPaid > 0 ? "Partial" : "Credit";
    const nextStatus = nextPaymentStatus === "Paid" ? "Confirmed" : existing.status || "Confirmed";

    await db
      .prepare("UPDATE Sale SET amountPaid = ?, paymentStatus = ?, paymentMethod = ?, status = ? WHERE id = ?")
      .run(nextPaid, nextPaymentStatus, paymentMethod || existing.paymentMethod, nextStatus, id);

    revalidatePath("/", "layout");
    return { success: true as const, amountPaid: nextPaid, balanceDue: balance, paymentStatus: nextPaymentStatus };
  } catch (error: any) {
    console.error("recordSalePaymentAction error:", error);
    return { success: false as const, error: "Failed to record payment: " + (error?.message || "Unknown error") };
  }
}

export async function confirmSaleAction(id: string) {
  try {
    await ensureSalesAndOrderColumns();
    const existing = (await db.prepare("SELECT * FROM Sale WHERE id = ?").get(id)) as any;
    if (!existing) return { success: false as const, error: "Sale not found" };

    const totalInvoice = (Number(existing.amount) || 0) + (Number(existing.vatAmount) || 0);
    // Preserve Credit/Partial tracking if explicitly recorded as Credit, otherwise settle legacy Pending sale
    if (existing.paymentStatus === "Credit" || existing.paymentStatus === "Partial") {
      await db.prepare("UPDATE Sale SET status = 'Confirmed' WHERE id = ?").run(id);
    } else {
      await db
        .prepare("UPDATE Sale SET status = 'Confirmed', amountPaid = ?, paymentStatus = 'Paid' WHERE id = ?")
        .run(totalInvoice, id);
    }
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: "Failed to confirm sale" };
  }
}

export async function getSaleByIdAction(id: string) {
  try {
    await ensureSalesAndOrderColumns();
    const sale = (await db.prepare("SELECT * FROM Sale WHERE id = ?").get(id)) as any;
    if (!sale) return { success: false as const, error: "Sale not found" };
    return { success: true as const, sale: normalizeSaleRow(sale) };
  } catch (error) {
    return { success: false as const, error: "Failed to fetch sale" };
  }
}

export async function deleteSaleAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  try {
    await db.prepare("DELETE FROM Sale WHERE id = ?").run(id);
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: "Failed to delete sale" };
  }
}

export async function updateSaleAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();

  const customerName = formData.get("customer")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString();
  const status = formData.get("status")?.toString();
  const saleType = formData.get("saleType")?.toString();
  const dateStr = formData.get("date")?.toString();
  const dueDateStr = formData.get("dueDate")?.toString();
  const notes = formData.get("notes")?.toString();

  try {
    const existing = (await db.prepare("SELECT * FROM Sale WHERE id = ?").get(id)) as any;
    if (!existing) return { success: false as const, error: "Sale not found" };

    const newCustomer = customerName || existing.customerName;
    const newPayment = paymentMethod || existing.paymentMethod;
    const newStatus = status || existing.status;
    const newSaleType = saleType === "Wholesale" || saleType === "Retail" ? saleType : existing.saleType || "Retail";
    const newDate = dateStr ? new Date(dateStr).toISOString() : existing.createdAt;
    const newDueDate = dueDateStr !== undefined ? (dueDateStr ? new Date(dueDateStr).toISOString() : null) : existing.dueDate;
    const newNotes = notes !== undefined ? notes : existing.notes || "";

    await db
      .prepare(
        "UPDATE Sale SET customerName = ?, saleType = ?, paymentMethod = ?, status = ?, createdAt = ?, dueDate = ?, notes = ? WHERE id = ?"
      )
      .run(newCustomer, newSaleType, newPayment, newStatus, newDate, newDueDate, newNotes, id);

    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error: any) {
    console.error(error);
    return { success: false as const, error: "Failed to update sale: " + error.message };
  }
}