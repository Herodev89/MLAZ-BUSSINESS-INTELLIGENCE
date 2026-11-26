"use server";

import db, { ensureProductColumns } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { BulkProductCostInput } from "@/lib/active-products-catalog";
import { seedActiveCatalogInDb } from "@/lib/catalog-seed";

function enrichProduct(p: any, allVariants: any[]) {
  const pVariants = allVariants
    .filter((v) => v.productId === p.id)
    .map((v) => ({
      ...v,
      price: Number(v.price) || 0,
      wholesalePrice: Number(v.wholesalePrice) || 0,
      costPrice: Number(v.costPrice) || 0,
      stock: Number(v.stock) || 0,
    }));
  const totalStock = pVariants.reduce((sum, v) => sum + v.stock, 0);
  const basePrice = pVariants.length > 0 ? pVariants[0].price : 0;
  const baseWholesalePrice = pVariants.length > 0 ? pVariants[0].wholesalePrice : 0;
  const totalCostUnits = pVariants.reduce((sum, v) => sum + v.costPrice * Math.max(0, v.stock), 0);
  const baseCostPrice =
    totalStock > 0
      ? Math.round((totalCostUnits / totalStock) * 100) / 100
      : pVariants.length > 0
      ? pVariants[0].costPrice
      : 0;

  return {
    ...p,
    sku: p.sku || p.id.slice(0, 8).toUpperCase(),
    category: p.category || "Footwear",
    brand: p.brand || "MLAZ",
    material: p.material || "",
    description: p.description || "",
    reorderLevel: Number(p.reorderLevel ?? 5),
    wholesaleMinQty: Number(p.wholesaleMinQty ?? 6),
    status: p.status || "Active",
    variants: pVariants,
    stock: totalStock,
    price: basePrice,
    sellingPrice: basePrice,
    wholesalePrice: baseWholesalePrice,
    costPrice: baseCostPrice,
  };
}

export async function getProductsAction() {
  try {
    await ensureProductColumns();
    const products = (await db.prepare("SELECT * FROM Product ORDER BY name ASC").all()) as any[];
    const variants = (await db.prepare("SELECT * FROM ProductVariant").all()) as any[];

    const productsWithVariants = products.map((p) => enrichProduct(p, variants));
    return { success: true as const, products: productsWithVariants };
  } catch (error) {
    console.error("getProductsAction error:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function getProductByIdAction(id: string) {
  try {
    await ensureProductColumns();
    const p = (await db.prepare("SELECT * FROM Product WHERE id = ?").get(id)) as any;
    if (!p) return { success: false as const, error: "Product not found" };

    const variants = (await db.prepare("SELECT * FROM ProductVariant WHERE productId = ?").all(id)) as any[];
    return { success: true as const, product: enrichProduct(p, variants) };
  } catch (error) {
    console.error("getProductByIdAction error:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function createProductAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { success: false as const, error: "Forbidden: Admin or Store Manager access required" };
  }

  await ensureProductColumns();

  const name = formData.get("name")?.toString()?.trim();
  const sku = formData.get("sku")?.toString()?.trim() || "";
  const category = formData.get("category")?.toString()?.trim() || "Footwear";
  const brand = formData.get("brand")?.toString()?.trim() || "MLAZ";
  const material = formData.get("material")?.toString()?.trim() || "";
  const description = formData.get("description")?.toString()?.trim() || "";
  const reorderLevel = parseInt(formData.get("reorderLevel")?.toString() || "5", 10) || 5;
  const wholesaleMinQty = Math.max(1, parseInt(formData.get("wholesaleMinQty")?.toString() || "6", 10) || 6);
  const status = formData.get("status")?.toString() || "Active";
  const variantsJson = formData.get("variants")?.toString() || "[]";

  if (!name) {
    return { success: false as const, error: "Name is required" };
  }

  let variants: any[] = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    return { success: false as const, error: "Invalid variants data" };
  }

  const productId = randomUUID();
  const isAdmin = session.role === "ADMIN";

  try {
    await db
      .prepare(
        `INSERT INTO Product (id, name, sku, category, brand, material, description, reorderLevel, wholesaleMinQty, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(productId, name, sku, category, brand, material, description, reorderLevel, wholesaleMinQty, status);

    const insertVariant = await db.prepare(
      "INSERT INTO ProductVariant (id, productId, size, color, price, wholesalePrice, costPrice, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const v of variants) {
      const costPriceVal = isAdmin ? parseFloat(v.costPrice) || 0 : 0;
      await insertVariant.run(
        randomUUID(),
        productId,
        v.size || "",
        v.color || "",
        parseFloat(v.price) || 0,
        parseFloat(v.wholesalePrice) || 0,
        costPriceVal,
        parseInt(v.stock, 10) || 0,
        v.sku || sku || ""
      );
    }
    revalidatePath("/", "layout");
    return { success: true as const, productId };
  } catch (error) {
    console.error("createProductAction error:", error);
    return { success: false as const, error: "Failed to create product" };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STORE_MANAGER")) {
    return { success: false as const, error: "Forbidden: Admin or Store Manager access required" };
  }

  await ensureProductColumns();

  const existing = (await db.prepare("SELECT * FROM Product WHERE id = ?").get(id)) as any;
  if (!existing) return { success: false as const, error: "Product not found" };

  const existingVariants = (await db.prepare("SELECT * FROM ProductVariant WHERE productId = ?").all(id)) as any[];
  const existingCostMap = new Map<string, number>();
  const existingWholesaleMap = new Map<string, number>();
  for (const ev of existingVariants) {
    existingCostMap.set(String(ev.id), Number(ev.costPrice) || 0);
    existingWholesaleMap.set(String(ev.id), Number(ev.wholesalePrice) || 0);
  }

  const name = formData.get("name")?.toString()?.trim() || existing.name;
  const sku = formData.has("sku") ? formData.get("sku")?.toString()?.trim() || "" : existing.sku || "";
  const category = formData.has("category")
    ? formData.get("category")?.toString()?.trim() || "Footwear"
    : existing.category || "Footwear";
  const brand = formData.has("brand") ? formData.get("brand")?.toString()?.trim() || "MLAZ" : existing.brand || "MLAZ";
  const material = formData.has("material")
    ? formData.get("material")?.toString()?.trim() || ""
    : existing.material || "";
  const description = formData.has("description")
    ? formData.get("description")?.toString()?.trim() || ""
    : existing.description || "";
  const reorderLevel = formData.has("reorderLevel")
    ? parseInt(formData.get("reorderLevel")?.toString() || "5", 10) || 5
    : Number(existing.reorderLevel ?? 5);
  const wholesaleMinQty = formData.has("wholesaleMinQty")
    ? Math.max(1, parseInt(formData.get("wholesaleMinQty")?.toString() || "6", 10) || 6)
    : Number(existing.wholesaleMinQty ?? 6);
  const status = formData.get("status")?.toString() || existing.status || "Active";
  const variantsJson = formData.get("variants")?.toString() || "[]";

  if (!name) {
    return { success: false as const, error: "Name is required" };
  }

  let variants: any[] = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    return { success: false as const, error: "Invalid variants data" };
  }

  const isAdmin = session.role === "ADMIN";

  try {
    await db
      .prepare(
        `UPDATE Product
         SET name = ?, sku = ?, category = ?, brand = ?, material = ?, description = ?, reorderLevel = ?, wholesaleMinQty = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .run(name, sku, category, brand, material, description, reorderLevel, wholesaleMinQty, status, id);

    // Replace variants while safeguarding costPrice for non-admin edits
    await db.prepare("DELETE FROM ProductVariant WHERE productId = ?").run(id);
    const insertVariant = await db.prepare(
      "INSERT INTO ProductVariant (id, productId, size, color, price, wholesalePrice, costPrice, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const v of variants) {
      const vId = v.id && !v.id.toString().startsWith("new-") && !v.id.toString().startsWith("V-NEW-") ? v.id : randomUUID();
      const preservedCost = existingCostMap.get(String(vId)) ?? 0;
      const preservedWholesale = existingWholesaleMap.get(String(vId)) ?? 0;
      const costPriceVal = isAdmin ? parseFloat(v.costPrice) || 0 : preservedCost;
      const wholesalePriceVal = v.wholesalePrice !== undefined ? parseFloat(v.wholesalePrice) || 0 : preservedWholesale;
      await insertVariant.run(
        vId,
        id,
        v.size || "",
        v.color || "",
        parseFloat(v.price) || 0,
        wholesalePriceVal,
        costPriceVal,
        parseInt(v.stock, 10) || 0,
        v.sku || ""
      );
    }
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    console.error("updateProductAction error:", error);
    return { success: false as const, error: "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false as const, error: "Forbidden: Admin access required" };
  }

  try {
    await db.prepare("DELETE FROM Product WHERE id = ?").run(id);
    revalidatePath("/", "layout");
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: "Failed to delete product" };
  }
}

export async function bulkUpdateProductCostsAction(items: BulkProductCostInput[]) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false as const, error: "Forbidden: Only Administrators can update Cost of Sales and pricing." };
  }

  await ensureProductColumns();

  try {
    for (const item of items) {
      await db
        .prepare(
          `UPDATE Product
           SET category = ?, sku = ?, brand = ?, material = ?, reorderLevel = ?, wholesaleMinQty = ?, description = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .run(
          item.category || "Footwear",
          item.sku || "",
          item.brand || "MLAZ",
          item.material || "",
          Number(item.reorderLevel) || 5,
          Math.max(1, Number(item.wholesaleMinQty) || 6),
          item.description || "",
          item.status || "Active",
          item.id
        );

      await db
        .prepare("UPDATE ProductVariant SET costPrice = ?, price = ?, wholesalePrice = ?, updatedAt = CURRENT_TIMESTAMP WHERE productId = ?")
        .run(
          Math.max(0, Number(item.costPrice) || 0),
          Math.max(0, Number(item.price) || 0),
          Math.max(0, Number(item.wholesalePrice) || 0),
          item.id
        );
    }

    revalidatePath("/", "layout");
    return { success: true as const, updatedCount: items.length };
  } catch (error: any) {
    console.error("bulkUpdateProductCostsAction error:", error);
    return { success: false as const, error: "Failed to save product costs: " + (error?.message || "Unknown error") };
  }
}

export async function registerActiveProductsAction() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false as const, error: "Forbidden: Admin access required to register standard catalog." };
  }

  try {
    const result = await seedActiveCatalogInDb();
    revalidatePath("/", "layout");
    return { success: true as const, ...result };
  } catch (error: any) {
    console.error("registerActiveProductsAction error:", error);
    return { success: false as const, error: "Failed to register active products: " + (error?.message || "Unknown error") };
  }
}
