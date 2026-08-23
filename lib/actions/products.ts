"use server";

import db from "@/lib/db";
import { randomUUID } from "crypto";

export async function getProductsAction() {
  try {
    const products = await db.prepare('SELECT * FROM Product ORDER BY name ASC').all() as any[];
    const variants = await db.prepare('SELECT * FROM ProductVariant').all() as any[];
    
    // Attach variants to products
    const productsWithVariants = products.map(p => {
      const pVariants = variants.filter(v => v.productId === p.id).map(v => ({...v}));
      // Compute total stock and base price for the parent product based on variants
      const totalStock = pVariants.reduce((sum, v) => sum + v.stock, 0);
      const basePrice = pVariants.length > 0 ? pVariants[0].price : 0;
      return { ...p, variants: pVariants, stock: totalStock, price: basePrice };
    });

    return { success: true, products: productsWithVariants };
  } catch (error) {
    return { error: "Failed to fetch products" };
  }
}

export async function getProductByIdAction(id: string) {
  try {
    const p = await db.prepare('SELECT * FROM Product WHERE id = ?').get(id) as any;
    if (!p) return { error: "Product not found" };
    
    const variants = await db.prepare('SELECT * FROM ProductVariant WHERE productId = ?').all(id) as any[];
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const basePrice = variants.length > 0 ? variants[0].price : 0;
    
    return { success: true, product: { ...p, variants: variants.map(v => ({...v})), stock: totalStock, price: basePrice } };
  } catch (error) {
    return { error: "Failed to fetch product" };
  }
}

export async function createProductAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const variantsJson = formData.get("variants")?.toString() || "[]";
  
  if (!name) {
    return { error: "Name is required" };
  }

  let variants = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    return { error: "Invalid variants data" };
  }

  const productId = randomUUID();

  try {
    await db.prepare('INSERT INTO Product (id, name) VALUES (?, ?)').run(productId, name);
    const insertVariant = await db.prepare('INSERT INTO ProductVariant (id, productId, size, color, price, costPrice, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const v of variants) {
      await insertVariant.run(randomUUID(), productId, v.size || '', v.color || '', parseFloat(v.price) || 0, parseFloat(v.costPrice) || 0, parseInt(v.stock) || 0, v.sku || '');
    }
    return { success: true, productId };
  } catch (error) {
    return { error: "Failed to create product" };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get("name")?.toString();
  const variantsJson = formData.get("variants")?.toString() || "[]";
  
  if (!name) {
    return { error: "Name is required" };
  }

  let variants = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    return { error: "Invalid variants data" };
  }

  try {
    await db.prepare('UPDATE Product SET name = ? WHERE id = ?').run(name, id);
    
    // Preserve existing stock
    const existingVariants = await db.prepare('SELECT id, size, color, stock FROM ProductVariant WHERE productId = ?').all(id) as any[];
    await db.prepare('DELETE FROM ProductVariant WHERE productId = ?').run(id);
    const insertVariant = await db.prepare('INSERT INTO ProductVariant (id, productId, size, color, price, costPrice, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const v of variants) {
      const existing = existingVariants.find(ev => ev.id === v.id || (ev.size === v.size && ev.color === v.color));
      const preservedStock = existing ? existing.stock : (parseInt(v.stock) || 0);
      const vId = v.id || randomUUID();
      await insertVariant.run(vId, id, v.size || '', v.color || '', parseFloat(v.price) || 0, parseFloat(v.costPrice) || 0, preservedStock, v.sku || '');
    }
    return { success: true };
  } catch (error) {
    return { error: "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await db.prepare('DELETE FROM Product WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete product" };
  }
}
