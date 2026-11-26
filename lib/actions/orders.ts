"use server";

import db, { ensureSalesAndOrderColumns } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function normalizeOrderRow(o: any) {
  const netAmount = Number(o.totalAmount ?? o.amount) || 0;
  const vatAmount = Number(o.vatAmount) || 0;
  const totalInvoice = Math.round((netAmount + vatAmount) * 100) / 100;
  const amountPaid = Math.max(0, Number(o.amountPaid) || 0);
  const balanceDue = Math.max(0, Math.round((totalInvoice - amountPaid) * 100) / 100);
  const paymentStatus =
    balanceDue <= 0.01 && totalInvoice > 0
      ? "Paid"
      : amountPaid > 0
      ? "Partial"
      : o.paymentStatus || "Unpaid";

  return {
    ...o,
    orderType: o.orderType === "Wholesale" ? "Wholesale" : "Retail",
    totalAmount: netAmount,
    discount: Number(o.discount) || 0,
    vatAmount,
    totalInvoice,
    amountPaid,
    balanceDue,
    paymentStatus,
    quantity: Number(o.quantity) || 1,
    dueDate: o.dueDate || null,
    notes: o.notes || "",
  };
}

export async function getOrdersAction() {
  try {
    await ensureSalesAndOrderColumns();
    const ordersWithDetails = (await db
      .prepare(
        `
      SELECT o.id, o.customerId, c.name as customer, c.phone, c.type as customerType,
             o.orderType, o.productName, o.variantId, o.size, o.color, o.quantity,
             o.amount as totalAmount, o.discount, o.vatAmount, o.amountPaid, o.paymentStatus,
             o.paymentMethod, o.status as orderStatus, o.dueDate, o.notes, o.createdAt as date
      FROM "Order" o
      LEFT JOIN Customer c ON o.customerId = c.id
      ORDER BY o.createdAt DESC
    `
      )
      .all()) as any[];

    const formattedOrders = ordersWithDetails.map(normalizeOrderRow);
    return { success: true as const, orders: formattedOrders };
  } catch (error) {
    console.error("getOrdersAction error:", error);
    return { success: false as const, error: "Failed to fetch orders" };
  }
}

export async function createOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();

  const customerName = formData.get("customer")?.toString()?.trim() || "Walk-in Customer";
  const orderType = formData.get("orderType")?.toString() === "Wholesale" ? "Wholesale" : "Retail";
  const amount = parseFloat(formData.get("amount")?.toString() || "0") || 0;
  const discount = Math.max(0, parseFloat(formData.get("discount")?.toString() || "0") || 0);
  const vatAmount = Math.max(0, parseFloat(formData.get("vatAmount")?.toString() || "0") || 0);
  const requestedPaymentStatus = formData.get("paymentStatus")?.toString() || "Unpaid";
  const amountPaidInput = parseFloat(formData.get("amountPaid")?.toString() || "0") || 0;
  const paymentMethod = formData.get("paymentMethod")?.toString() || "Transfer";
  const status = formData.get("status")?.toString() || "Pending";
  const dateStr = formData.get("date")?.toString();
  const dueDateStr = formData.get("dueDate")?.toString();
  const notes = formData.get("notes")?.toString()?.trim() || "";
  const createdAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
  const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

  const productName = formData.get("productName")?.toString() || "";
  const variantId = formData.get("variantId")?.toString() || "";
  const size = formData.get("size")?.toString() || "";
  const color = formData.get("color")?.toString() || "";
  const quantity = Math.max(1, parseInt(formData.get("qty")?.toString() || "1", 10) || 1);

  if (amount <= 0) {
    return { success: false as const, error: "Amount is required and must be greater than ₦0." };
  }

  // If immediately Confirmed or Delivered, check stock before accepting
  if ((status === "Confirmed" || status === "Delivered") && variantId) {
    const vRec = (await db.prepare("SELECT stock FROM ProductVariant WHERE id = ?").get(variantId)) as any;
    if (vRec && Number(vRec.stock) < quantity) {
      return {
        success: false as const,
        error: `Low stock: Only ${vRec.stock} unit(s) available for immediate fulfillment. Create as Pending/Processing instead.`,
      };
    }
  }

  const netAmount = Math.max(0, Math.round((amount - discount) * 100) / 100);
  const totalInvoice = Math.round((netAmount + vatAmount) * 100) / 100;

  let resolvedAmountPaid = 0;
  if (requestedPaymentStatus === "Paid") {
    resolvedAmountPaid = totalInvoice;
  } else if (requestedPaymentStatus === "Partial") {
    resolvedAmountPaid = Math.min(totalInvoice, Math.max(0, Math.round(amountPaidInput * 100) / 100));
  } else {
    resolvedAmountPaid = 0;
  }
  const balance = Math.max(0, Math.round((totalInvoice - resolvedAmountPaid) * 100) / 100);
  const resolvedPaymentStatus =
    balance <= 0.01 && totalInvoice > 0 ? "Paid" : resolvedAmountPaid > 0 ? "Partial" : "Unpaid";

  const cust = (await db.prepare("SELECT id, type FROM Customer WHERE name = ?").get(customerName)) as any;
  let finalCustId = cust?.id;

  if (!finalCustId) {
    finalCustId = randomUUID();
    await db
      .prepare("INSERT INTO Customer (id, name, type, totalSpent) VALUES (?, ?, ?, ?)")
      .run(finalCustId, customerName, orderType, 0);
  } else if (orderType === "Wholesale" && cust.type !== "Wholesale") {
    await db.prepare("UPDATE Customer SET type = 'Wholesale' WHERE id = ?").run(finalCustId);
  }

  const orderId = `${orderType === "Wholesale" ? "WHO" : "ORD"}-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db
      .prepare(
        `
      INSERT INTO "Order" (
        id, customerId, orderType, productName, variantId, size, color, quantity,
        amount, discount, vatAmount, amountPaid, paymentStatus, paymentMethod, status, dueDate, notes, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        orderId,
        finalCustId,
        orderType,
        productName,
        variantId,
        size,
        color,
        quantity,
        netAmount,
        discount,
        vatAmount,
        resolvedAmountPaid,
        resolvedPaymentStatus,
        paymentMethod,
        status,
        dueDate,
        notes,
        createdAt
      );

    if (status === "Confirmed" || status === "Delivered") {
      await processOrderToSale(orderId, session.id);
    }

    revalidatePath("/", "layout");
    return { success: true as const, orderId };
  } catch (error: any) {
    console.error("createOrderAction error:", error);
    return { success: false as const, error: "Failed to create order: " + error.message };
  }
}

export async function updateOrderPaymentAction(id: string, additionalAmount: number, paymentMethod?: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();

  if (!additionalAmount || additionalAmount <= 0) {
    return { success: false as const, error: "Deposit / payment amount must be greater than ₦0." };
  }

  try {
    const existing = (await db.prepare('SELECT * FROM "Order" WHERE id = ?').get(id)) as any;
    if (!existing) return { success: false as const, error: "Order not found" };

    const norm = normalizeOrderRow({ ...existing, totalAmount: existing.amount });
    const nextPaid = Math.min(norm.totalInvoice, Math.round((norm.amountPaid + additionalAmount) * 100) / 100);
    const balance = Math.max(0, Math.round((norm.totalInvoice - nextPaid) * 100) / 100);
    const nextPaymentStatus = balance <= 0.01 ? "Paid" : nextPaid > 0 ? "Partial" : "Unpaid";

    await db
      .prepare('UPDATE "Order" SET amountPaid = ?, paymentStatus = ?, paymentMethod = ? WHERE id = ?')
      .run(nextPaid, nextPaymentStatus, paymentMethod || existing.paymentMethod, id);

    // Keep linked Sale in sync if already fulfilled/converted
    const linkedSale = (await db.prepare('SELECT id FROM Sale WHERE id LIKE ? || "%"').get(`TX-${id}`)) as any;
    if (linkedSale) {
      const salePayStatus = nextPaymentStatus === "Unpaid" ? "Credit" : nextPaymentStatus;
      await db
        .prepare("UPDATE Sale SET amountPaid = ?, paymentStatus = ?, paymentMethod = ? WHERE id = ?")
        .run(nextPaid, salePayStatus, paymentMethod || existing.paymentMethod, linkedSale.id);
    }

    revalidatePath("/", "layout");
    return { success: true as const, amountPaid: nextPaid, balanceDue: balance, paymentStatus: nextPaymentStatus };
  } catch (error: any) {
    console.error("updateOrderPaymentAction error:", error);
    return { success: false as const, error: "Failed to update order payment: " + error.message };
  }
}

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  await ensureSalesAndOrderColumns();
  const status = formData.get("status")?.toString() || "Pending";

  try {
    const existingOrder = (await db.prepare('SELECT * FROM "Order" WHERE id = ?').get(id)) as any;
    if (!existingOrder) return { success: false as const, error: "Order not found" };

    const becomingFulfilled =
      existingOrder.status !== "Confirmed" &&
      existingOrder.status !== "Delivered" &&
      (status === "Confirmed" || status === "Delivered");

    if (becomingFulfilled && existingOrder.variantId) {
      const variantRecord = (await db
        .prepare("SELECT id, stock FROM ProductVariant WHERE id = ?")
        .get(existingOrder.variantId)) as any;
      if (variantRecord && Number(variantRecord.stock) < Number(existingOrder.quantity || 1)) {
        return {
          success: false as const,
          error: `Cannot mark as ${status}: Only ${variantRecord.stock} unit(s) in stock for ${existingOrder.productName}.`,
        };
      }
    }

    await db.prepare('UPDATE "Order" SET status = ? WHERE id = ?').run(status, id);

    if (becomingFulfilled) {
      await processOrderToSale(id, session.id);
    }

    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error: any) {
    console.error(error);
    return { success: false as const, error: "Failed to update order status: " + error.message };
  }
}

export async function deleteOrderAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false as const, error: "Unauthorized" };

  try {
    await db.prepare('DELETE FROM "Order" WHERE id = ?').run(id);
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    console.error(error);
    return { success: false as const, error: "Failed to delete order" };
  }
}

async function processOrderToSale(orderId: string, userId = "system") {
  const order = (await db
    .prepare(
      `
    SELECT o.*, c.name as customerName 
    FROM "Order" o 
    LEFT JOIN Customer c ON o.customerId = c.id 
    WHERE o.id = ?
  `
    )
    .get(orderId)) as any;

  if (!order || !order.variantId) return;

  const variantRecord = (await db
    .prepare("SELECT id, costPrice FROM ProductVariant WHERE id = ?")
    .get(order.variantId)) as any;
  if (!variantRecord) return;

  // Deduplication guard: Check if a sale for this order already exists
  const existingSale = await db.prepare('SELECT id FROM Sale WHERE id LIKE ? || "%"').get(`TX-${orderId}`);
  if (existingSale) return;

  const qty = Math.max(1, Number(order.quantity) || 1);
  const netAmount = Number(order.amount) || 0;
  const discount = Number(order.discount) || 0;
  const vatAmount = Number(order.vatAmount) || 0;
  const totalInvoice = Math.round((netAmount + vatAmount) * 100) / 100;
  const amountPaid = Math.min(totalInvoice, Math.max(0, Number(order.amountPaid) || 0));
  const balance = Math.max(0, Math.round((totalInvoice - amountPaid) * 100) / 100);
  const salePaymentStatus = balance <= 0.01 ? "Paid" : amountPaid > 0 ? "Partial" : "Credit";
  const saleType = order.orderType === "Wholesale" ? "Wholesale" : "Retail";

  const costPrice = Math.round((Number(variantRecord.costPrice) || 0) * qty * 100) / 100;
  const profit = Math.round((netAmount - costPrice) * 100) / 100;
  const saleId = `TX-${orderId}-${randomUUID().slice(0, 4).toUpperCase()}`;

  await db
    .prepare(
      `
    INSERT INTO Sale (
      id, userId, saleType, customerName, productName, variantId, size, color,
      quantity, amount, discount, vatAmount, amountPaid, paymentStatus,
      costPrice, profit, paymentMethod, status, dueDate, notes, createdAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .run(
      saleId,
      userId,
      saleType,
      order.customerName || "Walk-in Customer",
      order.productName,
      order.variantId,
      order.size || "",
      order.color || "",
      qty,
      netAmount,
      discount,
      vatAmount,
      amountPaid,
      salePaymentStatus,
      costPrice,
      profit,
      order.paymentMethod || "Transfer",
      "Confirmed",
      order.dueDate || null,
      order.notes || `Converted from Order ${orderId}`,
      order.createdAt
    );

  await db.prepare("UPDATE ProductVariant SET stock = stock - ? WHERE id = ?").run(qty, order.variantId);

  if (order.customerId) {
    await db
      .prepare("UPDATE Customer SET totalSpent = COALESCE(totalSpent, 0) + ? WHERE id = ?")
      .run(totalInvoice, order.customerId);
  }
}
