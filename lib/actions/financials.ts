"use server";

import db, { ensureFinancialTables, ensureProductColumns, ensureSalesAndOrderColumns } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import {
  generateFinancialStatements,
  FINANCIAL_ENTRY_TYPES,
  FinancialEntryRecord,
  FixedAssetRecord,
  FinancialSettingsRecord,
} from "@/lib/accounting-standards";

async function requireAdminOrManager() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return null;
  }
  return session;
}

export async function getFinancialStatementsAction(startDate?: string, endDate?: string) {
  try {
    await Promise.all([ensureFinancialTables(), ensureProductColumns(), ensureSalesAndOrderColumns()]);

    const [
      rawSales,
      rawExpenses,
      rawProducts,
      rawVariants,
      rawMaterials,
      rawProductionRuns,
      rawOrders,
      rawFixedAssets,
      rawEntries,
      rawSettings,
    ] = await Promise.all([
      db.prepare("SELECT * FROM Sale ORDER BY createdAt DESC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM Expense ORDER BY date DESC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM Product ORDER BY name ASC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM ProductVariant").all() as Promise<any[]>,
      db.prepare("SELECT * FROM RawMaterial ORDER BY date DESC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM ProductionRun ORDER BY productionDate DESC").all() as Promise<any[]>,
      db.prepare('SELECT * FROM "Order" ORDER BY createdAt DESC').all() as Promise<any[]>,
      db.prepare("SELECT * FROM FixedAsset ORDER BY acquisitionDate DESC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM FinancialEntry ORDER BY date DESC").all() as Promise<any[]>,
      db.prepare("SELECT * FROM FinancialSettings WHERE id = 'default'").get() as Promise<any>,
    ]);

    const products = rawProducts.map((p) => {
      const pVariants = rawVariants.filter((v) => v.productId === p.id).map((v) => ({ ...v }));
      const totalStock = pVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      const basePrice = pVariants.length > 0 ? Number(pVariants[0].price) || 0 : 0;
      const baseCost = pVariants.length > 0 ? Number(pVariants[0].costPrice) || 0 : 0;
      return { ...p, variants: pVariants, stock: totalStock, price: basePrice, costPrice: baseCost };
    });

    const fixedAssets: FixedAssetRecord[] = rawFixedAssets.map((a) => ({
      id: String(a.id),
      name: String(a.name),
      category: String(a.category),
      acquisitionDate: String(a.acquisitionDate),
      cost: Number(a.cost) || 0,
      residualValue: Number(a.residualValue) || 0,
      usefulLifeYears: Number(a.usefulLifeYears) || 5,
      depreciationMethod: String(a.depreciationMethod || "Straight-Line"),
      revaluationSurplus: Number(a.revaluationSurplus) || 0,
      disposalDate: a.disposalDate ? String(a.disposalDate) : null,
      disposalProceeds: Number(a.disposalProceeds) || 0,
      disposalPaymentStatus: a.disposalPaymentStatus ? String(a.disposalPaymentStatus) : "Cash",
      paymentStatus: String(a.paymentStatus || "Paid"),
      notes: a.notes ? String(a.notes) : "",
    }));

    const entries: FinancialEntryRecord[] = rawEntries.map((e) => ({
      id: String(e.id),
      entryType: e.entryType,
      section: String(e.section),
      title: String(e.title),
      amount: Number(e.amount) || 0,
      date: String(e.date),
      reference: e.reference ? String(e.reference) : "",
      notes: e.notes ? String(e.notes) : "",
    }));

    const settings: FinancialSettingsRecord = rawSettings
      ? {
          id: "default",
          companyLegalName: String(rawSettings.companyLegalName || "MLAZ LIMITED"),
          rcNumber: String(rawSettings.rcNumber || "RC-1849201"),
          tinNumber: String(rawSettings.tinNumber || "20491827-0001"),
          financialYearStartMonth: Number(rawSettings.financialYearStartMonth) || 1,
          taxRegime: (rawSettings.taxRegime as FinancialSettingsRecord["taxRegime"]) || "AUTO",
          enableTET: Number(rawSettings.enableTET ?? 1),
          enablePoliceLevy: Number(rawSettings.enablePoliceLevy ?? 0),
          vatRate: Number(rawSettings.vatRate ?? 7.5),
          preparedBy: String(rawSettings.preparedBy || "Financial Controller"),
          approvedBy: String(rawSettings.approvedBy || "Managing Director"),
        }
      : {
          id: "default",
          companyLegalName: "MLAZ LIMITED",
          rcNumber: "RC-1849201",
          tinNumber: "20491827-0001",
          financialYearStartMonth: 1,
          taxRegime: "AUTO",
          enableTET: 1,
          enablePoliceLevy: 0,
          vatRate: 7.5,
          preparedBy: "Financial Controller",
          approvedBy: "Managing Director",
        };

    const statements = generateFinancialStatements(
      {
        sales: rawSales.map((s) => ({ ...s })),
        expenses: rawExpenses.map((e) => ({ ...e })),
        products,
        rawMaterials: rawMaterials.map((m) => ({ ...m })),
        productionRuns: rawProductionRuns.map((r) => ({ ...r })),
        orders: rawOrders.map((o) => ({ ...o })),
        fixedAssets,
        entries,
        settings,
      },
      startDate,
      endDate
    );

    return {
      success: true,
      statements,
      fixedAssets,
      entries,
      settings,
    };
  } catch (error: any) {
    console.error("Financial statements error:", error);
    return { error: "Failed to compute financial statements: " + (error?.message || "Unknown error") };
  }
}

export async function createFixedAssetAction(formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  await ensureFinancialTables();

  const name = formData.get("name")?.toString()?.trim();
  const category = formData.get("category")?.toString() || "Plant & Machinery";
  const acquisitionDateStr = formData.get("acquisitionDate")?.toString();
  const cost = parseFloat(formData.get("cost")?.toString() || "0");
  const residualValue = parseFloat(formData.get("residualValue")?.toString() || "0");
  const usefulLifeYears = parseFloat(formData.get("usefulLifeYears")?.toString() || "5");
  const depreciationMethod = formData.get("depreciationMethod")?.toString() || "Straight-Line";
  const revaluationSurplus = parseFloat(formData.get("revaluationSurplus")?.toString() || "0");
  const disposalDateStr = formData.get("disposalDate")?.toString();
  const disposalProceeds = parseFloat(formData.get("disposalProceeds")?.toString() || "0");
  const disposalPaymentStatus = formData.get("disposalPaymentStatus")?.toString() || "Cash";
  const paymentStatus = formData.get("paymentStatus")?.toString() || "Paid";
  const notes = formData.get("notes")?.toString() || "";

  if (!name || cost <= 0) {
    return { error: "Asset name and valid acquisition cost (> ₦0) are required." };
  }

  const acquisitionDate = acquisitionDateStr ? new Date(acquisitionDateStr).toISOString() : new Date().toISOString();
  const disposalDate = disposalDateStr ? new Date(disposalDateStr).toISOString() : null;
  const id = `AST-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db
      .prepare(
        `INSERT INTO FixedAsset (id, name, category, acquisitionDate, cost, residualValue, usefulLifeYears, depreciationMethod, revaluationSurplus, disposalDate, disposalProceeds, disposalPaymentStatus, paymentStatus, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        name,
        category,
        acquisitionDate,
        cost,
        residualValue,
        usefulLifeYears,
        depreciationMethod,
        revaluationSurplus,
        disposalDate,
        disposalProceeds,
        disposalPaymentStatus,
        paymentStatus,
        notes
      );

    revalidatePath("/fixed-assets");
    revalidatePath("/financial-statements");
    revalidatePath("/reports");
    return { success: true, id };
  } catch (error: any) {
    return { error: "Failed to record asset: " + error.message };
  }
}

export async function updateFixedAssetAction(id: string, formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  await ensureFinancialTables();

  const name = formData.get("name")?.toString()?.trim();
  const category = formData.get("category")?.toString() || "Plant & Machinery";
  const acquisitionDateStr = formData.get("acquisitionDate")?.toString();
  const cost = parseFloat(formData.get("cost")?.toString() || "0");
  const residualValue = parseFloat(formData.get("residualValue")?.toString() || "0");
  const usefulLifeYears = parseFloat(formData.get("usefulLifeYears")?.toString() || "5");
  const depreciationMethod = formData.get("depreciationMethod")?.toString() || "Straight-Line";
  const revaluationSurplus = parseFloat(formData.get("revaluationSurplus")?.toString() || "0");
  const disposalDateStr = formData.get("disposalDate")?.toString();
  const disposalProceeds = parseFloat(formData.get("disposalProceeds")?.toString() || "0");
  const disposalPaymentStatus = formData.get("disposalPaymentStatus")?.toString() || "Cash";
  const paymentStatus = formData.get("paymentStatus")?.toString() || "Paid";
  const notes = formData.get("notes")?.toString() || "";

  if (!name || cost <= 0) {
    return { error: "Asset name and valid acquisition cost are required." };
  }

  const acquisitionDate = acquisitionDateStr ? new Date(acquisitionDateStr).toISOString() : new Date().toISOString();
  const disposalDate = disposalDateStr ? new Date(disposalDateStr).toISOString() : null;

  try {
    await db
      .prepare(
        `UPDATE FixedAsset
         SET name = ?, category = ?, acquisitionDate = ?, cost = ?, residualValue = ?, usefulLifeYears = ?, depreciationMethod = ?, revaluationSurplus = ?, disposalDate = ?, disposalProceeds = ?, disposalPaymentStatus = ?, paymentStatus = ?, notes = ?
         WHERE id = ?`
      )
      .run(
        name,
        category,
        acquisitionDate,
        cost,
        residualValue,
        usefulLifeYears,
        depreciationMethod,
        revaluationSurplus,
        disposalDate,
        disposalProceeds,
        disposalPaymentStatus,
        paymentStatus,
        notes,
        id
      );

    revalidatePath("/fixed-assets");
    revalidatePath("/financial-statements");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update asset: " + error.message };
  }
}

export async function disposeFixedAssetAction(id: string, formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  await ensureFinancialTables();

  const disposalDateStr = formData.get("disposalDate")?.toString();
  const disposalProceeds = parseFloat(formData.get("disposalProceeds")?.toString() || "0");
  const disposalPaymentStatus = formData.get("disposalPaymentStatus")?.toString() || "Cash";
  const notes = formData.get("notes")?.toString();

  if (!disposalDateStr) {
    return { error: "Disposal date is required under IAS 16 derecognition rules." };
  }

  const existing = (await db.prepare("SELECT acquisitionDate, notes FROM FixedAsset WHERE id = ?").get(id)) as any;
  if (!existing) {
    return { error: "Fixed asset not found." };
  }

  const acqDate = new Date(existing.acquisitionDate);
  const dispDate = new Date(disposalDateStr);
  if (dispDate < acqDate) {
    return { error: "Disposal date cannot be earlier than the asset acquisition date." };
  }

  const updatedNotes = notes ? `${existing.notes ? existing.notes + " | " : ""}Disposal: ${notes}` : existing.notes || "";

  try {
    await db
      .prepare(
        `UPDATE FixedAsset
         SET disposalDate = ?, disposalProceeds = ?, disposalPaymentStatus = ?, notes = ?
         WHERE id = ?`
      )
      .run(dispDate.toISOString(), Math.max(0, disposalProceeds), disposalPaymentStatus, updatedNotes, id);

    revalidatePath("/fixed-assets");
    revalidatePath("/financial-statements");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to record asset disposal: " + error.message };
  }
}

export async function deleteFixedAssetAction(id: string) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  try {
    await ensureFinancialTables();
    await db.prepare("DELETE FROM FixedAsset WHERE id = ?").run(id);
    revalidatePath("/fixed-assets");
    revalidatePath("/financial-statements");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete asset: " + error.message };
  }
}

export async function createFinancialEntryAction(formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  await ensureFinancialTables();

  const entryType = formData.get("entryType")?.toString() || "SHARE_CAPITAL";
  const title = formData.get("title")?.toString()?.trim();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const interestAmount = parseFloat(formData.get("interestAmount")?.toString() || "0");
  const dateStr = formData.get("date")?.toString();
  const reference = formData.get("reference")?.toString() || "";
  const notes = formData.get("notes")?.toString() || "";

  if (!title || amount <= 0) {
    return { error: "Description/title and positive amount (> ₦0) are required." };
  }

  const typeMeta = FINANCIAL_ENTRY_TYPES.find((t) => t.code === entryType);
  const section = typeMeta?.section || "EQUITY";
  const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
  const id = `FIN-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await db
      .prepare(
        `INSERT INTO FinancialEntry (id, entryType, section, title, amount, date, reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, entryType, section, title, amount, date, reference, notes);

    // If split loan repayment includes an interest portion, post it directly to Expense as Finance Cost (SOPL)
    if (
      interestAmount > 0 &&
      (entryType === "LONG_TERM_LOAN_REPAYMENT" || entryType === "SHORT_TERM_LOAN_REPAYMENT")
    ) {
      const expId = `EXP-${randomUUID().slice(0, 8).toUpperCase()}`;
      await db
        .prepare(
          `INSERT INTO Expense (id, name, type, category, amount, description, date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          expId,
          `Loan Interest: ${title}`,
          "Finance Cost",
          "Interest / Bank Charges",
          interestAmount,
          `Interest portion of ${id}${reference ? ` (Ref: ${reference})` : ""}`,
          date
        );
    }

    revalidatePath("/financial-statements");
    revalidatePath("/capital-funding");
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/profit-analysis");
    revalidatePath("/dashboard");
    return { success: true, id };
  } catch (error: any) {
    return { error: "Failed to record financial entry: " + error.message };
  }
}

export async function updateFinancialEntryAction(id: string, formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  await ensureFinancialTables();

  const entryType = formData.get("entryType")?.toString() || "SHARE_CAPITAL";
  const title = formData.get("title")?.toString()?.trim();
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const dateStr = formData.get("date")?.toString();
  const reference = formData.get("reference")?.toString() || "";
  const notes = formData.get("notes")?.toString() || "";

  if (!title || amount <= 0) {
    return { error: "Description/title and positive amount (> ₦0) are required." };
  }

  const typeMeta = FINANCIAL_ENTRY_TYPES.find((t) => t.code === entryType);
  const section = typeMeta?.section || "EQUITY";
  const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  try {
    await db
      .prepare(
        `UPDATE FinancialEntry
         SET entryType = ?, section = ?, title = ?, amount = ?, date = ?, reference = ?, notes = ?
         WHERE id = ?`
      )
      .run(entryType, section, title, amount, date, reference, notes, id);

    revalidatePath("/financial-statements");
    revalidatePath("/capital-funding");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update financial entry: " + error.message };
  }
}

export async function deleteFinancialEntryAction(id: string) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin or Store Manager access required" };

  try {
    await ensureFinancialTables();
    await db.prepare("DELETE FROM FinancialEntry WHERE id = ?").run(id);
    revalidatePath("/financial-statements");
    revalidatePath("/capital-funding");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete financial entry: " + error.message };
  }
}

export async function updateFinancialSettingsAction(formData: FormData) {
  const session = await requireAdminOrManager();
  if (!session) return { error: "Forbidden: Admin access required" };

  await ensureFinancialTables();

  const companyLegalName = formData.get("companyLegalName")?.toString()?.trim() || "MLAZ LIMITED";
  const rcNumber = formData.get("rcNumber")?.toString()?.trim() || "RC-1849201";
  const tinNumber = formData.get("tinNumber")?.toString()?.trim() || "20491827-0001";
  const financialYearStartMonth = parseInt(formData.get("financialYearStartMonth")?.toString() || "1", 10);
  const taxRegime = formData.get("taxRegime")?.toString() || "AUTO";
  const enableTET = formData.get("enableTET") === "true" || formData.get("enableTET") === "1" ? 1 : 0;
  const enablePoliceLevy = formData.get("enablePoliceLevy") === "true" || formData.get("enablePoliceLevy") === "1" ? 1 : 0;
  const vatRate = parseFloat(formData.get("vatRate")?.toString() || "7.5");
  const preparedBy = formData.get("preparedBy")?.toString()?.trim() || "Financial Controller";
  const approvedBy = formData.get("approvedBy")?.toString()?.trim() || "Managing Director";

  try {
    await db
      .prepare(
        `UPDATE FinancialSettings
         SET companyLegalName = ?, rcNumber = ?, tinNumber = ?, financialYearStartMonth = ?, taxRegime = ?, enableTET = ?, enablePoliceLevy = ?, vatRate = ?, preparedBy = ?, approvedBy = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = 'default'`
      )
      .run(
        companyLegalName,
        rcNumber,
        tinNumber,
        financialYearStartMonth,
        taxRegime,
        enableTET,
        enablePoliceLevy,
        vatRate,
        preparedBy,
        approvedBy
      );

    revalidatePath("/financial-statements");
    revalidatePath("/reports");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update statutory settings: " + error.message };
  }
}
